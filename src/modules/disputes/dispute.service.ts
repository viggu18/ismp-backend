import { DisputeStatus } from "@prisma/client";
import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";

export const raiseDispute = async (
  userId: string,
  input: {
    offerId: string;
    reason: string;
    description: string;
    evidenceUrls?: string[];
  },
) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: input.offerId,
      OR: [
        { influencerProfile: { userId } },
        { campaign: { hirer: { userId } } },
      ],
    },
  });

  if (!offer) {
    throw new AppError("Offer not found or unauthorized", 404);
  }

  const existingDispute = await prisma.dispute.findUnique({
    where: { offerId: input.offerId },
  });

  if (existingDispute) {
    throw new AppError("A dispute already exists for this offer", 409);
  }

  return prisma.dispute.create({
    data: {
      offerId: input.offerId,
      reason: input.reason,
      description: input.description,
      evidenceUrls: input.evidenceUrls || [],
    },
  });
};

export const getDispute = async (userId: string, disputeId: string) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      offer: {
        include: {
          campaign: { include: { hirer: { include: { user: true } } } },
          influencerProfile: { include: { user: true } },
        },
      },
    },
  });

  if (!dispute) {
    throw new AppError("Dispute not found", 404);
  }

  const isHirer = dispute.offer.campaign.hirer.user.id === userId;
  const isInfluencer = dispute.offer.influencerProfile.user.id === userId;

  if (!isHirer && !isInfluencer) {
    throw new AppError("Unauthorized access to dispute", 403);
  }

  return dispute;
};

export const resolveDispute = async (
  disputeId: string,
  input: {
    status: DisputeStatus;
    resolution: string;
  },
) => {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new AppError("Dispute not found", 404);

  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: input.status,
      resolution: input.resolution,
      resolvedAt: new Date(),
    },
  });
};
