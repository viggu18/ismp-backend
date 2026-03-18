import {
  ContentSubmissionStatus,
  NotificationType,
  OfferStatus,
  Prisma,
} from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { syncCampaignCompletionStatus } from "../../common/utils/campaign-progress";
import { ensureContentActionAllowed } from "../../common/utils/workflow";
import { createNotifications } from "../notifications/notification.service";

const offerInclude = {
  campaign: {
    include: {
      hirer: {
        include: {
          user: true,
        },
      },
    },
  },
  contentSubmissions: {
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.OfferInclude;

const ensureInfluencerOfferAccess = async (userId: string, offerId: string) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      influencerProfile: {
        userId,
      },
    },
    include: offerInclude,
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  return offer;
};

const ensureHirerSubmissionAccess = async (userId: string, submissionId: string) => {
  const submission = await prisma.contentSubmission.findFirst({
    where: {
      id: submissionId,
      offer: {
        campaign: {
          hirer: {
            userId,
          },
        },
      },
    },
    include: {
      offer: {
        include: {
          campaign: {
            include: {
              hirer: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new AppError("Content submission not found", 404);
  }

  return submission;
};

export const listSubmissions = async (userId: string, offerId: string) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      OR: [
        {
          influencerProfile: {
            userId,
          },
        },
        {
          campaign: {
            hirer: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      contentSubmissions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  return offer.contentSubmissions;
};

export const submitContent = async (
  userId: string,
  offerId: string,
  input: {
    submissionUrl: string;
    note?: string | null;
  },
) => {
  const offer = await ensureInfluencerOfferAccess(userId, offerId);

  if (offer.status !== OfferStatus.ACCEPTED) {
    throw new AppError("Content can only be submitted for accepted offers", 409);
  }

  const latestSubmission = offer.contentSubmissions[0];

  if (!latestSubmission) {
    const submission = await prisma.contentSubmission.create({
      data: {
        offerId,
        submissionUrl: input.submissionUrl,
        note: input.note ?? null,
        revisionNumber: 1,
      },
    });

    await createNotifications(
      [offer.campaign.hirer.user.id],
      NotificationType.CONTENT_SUBMITTED,
      "Content submitted",
      `A draft has been submitted for ${offer.campaign.title}`,
      { offerId, submissionId: submission.id },
    );

    return submission;
  }

  if (latestSubmission.status !== ContentSubmissionStatus.REVISION_REQUESTED) {
    throw new AppError("A revision must be requested before submitting another draft", 409);
  }

  const nextRevisionNumber = latestSubmission.revisionNumber + 1;

  if (nextRevisionNumber > offer.revisionLimit + 1) {
    throw new AppError("The revision limit for this offer has been reached", 409);
  }

  const submission = await prisma.contentSubmission.create({
    data: {
      offerId,
      submissionUrl: input.submissionUrl,
      note: input.note ?? null,
      revisionNumber: nextRevisionNumber,
    },
  });

  await createNotifications(
    [offer.campaign.hirer.user.id],
    NotificationType.CONTENT_SUBMITTED,
    "Revised content submitted",
    `A revised draft has been submitted for ${offer.campaign.title}`,
    { offerId, submissionId: submission.id },
  );

  return submission;
};

export const requestRevision = async (
  userId: string,
  submissionId: string,
  revisionNote: string,
) => {
  const submission = await ensureHirerSubmissionAccess(userId, submissionId);
  ensureContentActionAllowed(submission.status, "request-revision");

  if (submission.revisionNumber > submission.offer.revisionLimit) {
    throw new AppError("The revision limit has already been reached for this offer", 409);
  }

  const updatedSubmission = await prisma.contentSubmission.update({
    where: { id: submissionId },
    data: {
      status: ContentSubmissionStatus.REVISION_REQUESTED,
      revisionNote,
    },
  });

  const influencer = await prisma.influencerProfile.findUniqueOrThrow({
    where: { id: submission.offer.influencerProfileId },
    include: { user: true },
  });

  await createNotifications(
    [influencer.user.id],
    NotificationType.REVISION_REQUESTED,
    "Revision requested",
    `A revision was requested for ${submission.offer.campaign.title}`,
    { offerId: submission.offerId, submissionId },
  );

  return updatedSubmission;
};

export const approveSubmission = async (userId: string, submissionId: string) => {
  const submission = await ensureHirerSubmissionAccess(userId, submissionId);
  ensureContentActionAllowed(submission.status, "approve");

  const updatedSubmission = await prisma.contentSubmission.update({
    where: { id: submissionId },
    data: {
      status: ContentSubmissionStatus.APPROVED,
      approvedAt: new Date(),
    },
  });

  const influencer = await prisma.influencerProfile.findUniqueOrThrow({
    where: { id: submission.offer.influencerProfileId },
    include: { user: true },
  });

  await createNotifications(
    [influencer.user.id],
    NotificationType.CONTENT_APPROVED,
    "Content approved",
    `Your draft for ${submission.offer.campaign.title} was approved`,
    { offerId: submission.offerId, submissionId },
  );

  return updatedSubmission;
};

export const confirmPublish = async (
  userId: string,
  submissionId: string,
  publishedUrl: string,
) => {
  const submission = await prisma.contentSubmission.findFirst({
    where: {
      id: submissionId,
      offer: {
        influencerProfile: {
          userId,
        },
      },
    },
    include: {
      offer: {
        include: {
          campaign: {
            include: {
              hirer: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new AppError("Content submission not found", 404);
  }

  if (submission.status !== ContentSubmissionStatus.APPROVED) {
    throw new AppError("Only approved content can be marked as published", 409);
  }

  const updatedSubmission = await prisma.contentSubmission.update({
    where: { id: submissionId },
    data: {
      publishedUrl,
      publishedAt: new Date(),
    },
  });

  await syncCampaignCompletionStatus(submission.offer.campaignId);
  await createNotifications(
    [submission.offer.campaign.hirer.user.id],
    NotificationType.CONTENT_APPROVED,
    "Content published",
    `Published content is live for ${submission.offer.campaign.title}`,
    { offerId: submission.offerId, submissionId },
  );

  return updatedSubmission;
};
