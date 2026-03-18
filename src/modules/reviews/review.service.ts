import { PaymentStatus, Prisma, ReviewTarget, Role } from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";

type CreateReviewInput = {
  reviewTarget: ReviewTarget;
  rating: number;
  comment?: string | null;
  communicationRating?: number | null;
  qualityRating?: number | null;
  timelinessRating?: number | null;
  paymentRating?: number | null;
};

const reviewInclude = {
  hirerProfile: true,
  influencerProfile: true,
} satisfies Prisma.ReviewInclude;

const recalculateRatings = async (input: {
  target: ReviewTarget;
  hirerProfileId?: string;
  influencerProfileId?: string;
}) => {
  if (input.target === ReviewTarget.HIRER && input.hirerProfileId) {
    const aggregate = await prisma.review.aggregate({
      where: { hirerProfileId: input.hirerProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.hirerProfile.update({
      where: { id: input.hirerProfileId },
      data: {
        averageRating: aggregate._avg.rating ?? null,
        totalReviews: aggregate._count.rating,
      },
    });
  }

  if (input.target === ReviewTarget.INFLUENCER && input.influencerProfileId) {
    const aggregate = await prisma.review.aggregate({
      where: { influencerProfileId: input.influencerProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.influencerProfile.update({
      where: { id: input.influencerProfileId },
      data: {
        averageRating: aggregate._avg.rating ?? null,
        totalReviews: aggregate._count.rating,
      },
    });
  }
};

export const listOfferReviews = async (userId: string, offerId: string) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      OR: [
        {
          campaign: {
            hirer: {
              userId,
            },
          },
        },
        {
          influencerProfile: {
            userId,
          },
        },
      ],
    },
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  return prisma.review.findMany({
    where: { offerId },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const createReview = async (
  userId: string,
  role: Role,
  offerId: string,
  input: CreateReviewInput,
) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      OR: [
        {
          campaign: {
            hirer: {
              userId,
            },
          },
        },
        {
          influencerProfile: {
            userId,
          },
        },
      ],
    },
    include: {
      campaign: true,
      payment: true,
      contentSubmissions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  if (!offer.payment || offer.payment.status !== PaymentStatus.RELEASED) {
    throw new AppError("Reviews can only be left after payment is released", 409);
  }

  if (!offer.contentSubmissions[0]?.publishedAt) {
    throw new AppError("Reviews can only be left after content is published", 409);
  }

  if (role === Role.HIRER && input.reviewTarget !== ReviewTarget.INFLUENCER) {
    throw new AppError("Hirers can only review influencers", 422);
  }

  if (role === Role.INFLUENCER && input.reviewTarget !== ReviewTarget.HIRER) {
    throw new AppError("Influencers can only review hirers", 422);
  }

  const review = await prisma.review.create({
    data: {
      offerId,
      reviewTarget: input.reviewTarget,
      hirerProfileId:
        input.reviewTarget === ReviewTarget.HIRER ? offer.campaign.hirerId : null,
      influencerProfileId:
        input.reviewTarget === ReviewTarget.INFLUENCER ? offer.influencerProfileId : null,
      rating: input.rating,
      comment: input.comment ?? null,
      communicationRating: input.communicationRating ?? null,
      qualityRating: input.qualityRating ?? null,
      timelinessRating: input.timelinessRating ?? null,
      paymentRating: input.paymentRating ?? null,
    },
    include: reviewInclude,
  });

  await recalculateRatings({
    target: input.reviewTarget,
    hirerProfileId: review.hirerProfileId ?? undefined,
    influencerProfileId: review.influencerProfileId ?? undefined,
  });

  return review;
};
