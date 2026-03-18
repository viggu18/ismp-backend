import {
  ApplicationStatus,
  CampaignStatus,
  CampaignVisibility,
  NotificationType,
} from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { createNotifications } from "../notifications/notification.service";

type CreateApplicationInput = {
  pitchNote?: string | null;
  proposedRate?: number | null;
};

export const applyToCampaign = async (
  userId: string,
  campaignId: string,
  input: CreateApplicationInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      influencerProfile: true,
    },
  });

  if (!user?.influencerProfile) {
    throw new AppError("Complete your influencer profile before applying", 409);
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      hirer: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (campaign.status !== CampaignStatus.OPEN) {
    throw new AppError("Only open campaigns can accept applications", 409);
  }

  if (campaign.visibility !== CampaignVisibility.PUBLIC) {
    throw new AppError("Private campaigns do not accept open applications", 403);
  }

  const application = await prisma.application.create({
    data: {
      campaignId,
      influencerProfileId: user.influencerProfile.id,
      pitchNote: input.pitchNote ?? null,
      proposedRate: input.proposedRate ?? null,
      status: ApplicationStatus.PENDING,
    },
    include: {
      influencerProfile: true,
      campaign: true,
    },
  });

  await createNotifications(
    [campaign.hirer.user.id],
    NotificationType.APPLICATION_RECEIVED,
    "New application received",
    `${user.influencerProfile.displayName} applied to ${campaign.title}`,
    { campaignId, applicationId: application.id },
  );

  return application;
};

export const listCampaignApplications = async (userId: string, campaignId: string) => {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      hirer: {
        userId,
      },
    },
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  return prisma.application.findMany({
    where: { campaignId },
    include: {
      influencerProfile: {
        include: {
          socialAccounts: true,
          ratecards: true,
        },
      },
      offer: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateApplicationStatus = async (
  userId: string,
  applicationId: string,
  status: ApplicationStatus,
) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      campaign: {
        hirer: {
          userId,
        },
      },
    },
    include: {
      campaign: true,
      influencerProfile: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
    include: {
      influencerProfile: true,
      campaign: true,
    },
  });

  await createNotifications(
    [application.influencerProfile.user.id],
    NotificationType.APPLICATION_RECEIVED,
    status === ApplicationStatus.SHORTLISTED
      ? "You have been shortlisted"
      : "Your application was updated",
    status === ApplicationStatus.SHORTLISTED
      ? `You have been shortlisted for ${application.campaign.title}`
      : `Your application for ${application.campaign.title} was declined`,
    { campaignId: application.campaignId, applicationId },
  );

  return updatedApplication;
};

export const shortlistApplication = async (userId: string, applicationId: string) => {
  return updateApplicationStatus(userId, applicationId, ApplicationStatus.SHORTLISTED);
};

export const rejectApplication = async (userId: string, applicationId: string) => {
  return updateApplicationStatus(userId, applicationId, ApplicationStatus.REJECTED);
};
