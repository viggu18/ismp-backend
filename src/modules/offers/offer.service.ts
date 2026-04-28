import {
  ApplicationStatus,
  NotificationType,
  OfferStatus,
  PaymentStatus,
  Prisma,
  Role,
} from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { ensureOfferTransition } from "../../common/utils/workflow";
import { createNotifications } from "../notifications/notification.service";

type CreateOfferInput = {
  applicationId?: string;
  campaignId?: string;
  influencerProfileId?: string;
  agreedRate: number;
  deliverables: string;
  contentDeadline: string;
  paymentTerms?: string | null;
  revisionLimit?: number;
};

type ReviseOfferInput = {
  agreedRate?: number;
  deliverables?: string;
  contentDeadline?: string;
  paymentTerms?: string | null;
  revisionLimit?: number;
};

type CounterOfferInput = {
  counterRate: number;
  counterNote?: string | null;
};

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
  application: true,
  conversation: {
    include: {
      messages: true,
    },
  },
  payment: true,
  contentSubmissions: {
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.OfferInclude;

const ensureHirerOwnsCampaign = async (userId: string, campaignId: string) => {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      hirer: {
        userId,
      },
    },
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

  return campaign;
};

const ensureInfluencerOwnsOffer = async (userId: string, offerId: string) => {
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

const ensureHirerOwnsOffer = async (userId: string, offerId: string) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      campaign: {
        hirer: {
          userId,
        },
      },
    },
    include: offerInclude,
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  return offer;
};

const ensureOfferAccess = async (userId: string, role: Role, offerId: string) => {
  if (role === Role.HIRER) {
    return ensureHirerOwnsOffer(userId, offerId);
  }

  return ensureInfluencerOwnsOffer(userId, offerId);
};

const createPendingPaymentIfMissing = async (offerId: string, agreedRate: number) => {
  const platformFeeInr = Number((agreedRate * 0.1).toFixed(2));
  const influencerPayout = Number((agreedRate - platformFeeInr).toFixed(2));

  return prisma.payment.upsert({
    where: { offerId },
    update: {
      amountInr: agreedRate,
      platformFeeInr,
      influencerPayout,
      status: PaymentStatus.PENDING,
    },
    create: {
      offerId,
      amountInr: agreedRate,
      platformFeeInr,
      influencerPayout,
      status: PaymentStatus.PENDING,
    },
  });
};

export const createOffer = async (userId: string, input: CreateOfferInput) => {
  let campaignId = input.campaignId;
  let influencerProfileId = input.influencerProfileId;
  let applicationId = input.applicationId;

  if (applicationId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        campaign: {
          include: {
            hirer: true,
          },
        },
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    await ensureHirerOwnsCampaign(userId, application.campaignId);
    campaignId = application.campaignId;
    influencerProfileId = application.influencerProfileId;
  }

  if (!campaignId || !influencerProfileId) {
    throw new AppError("A campaign and influencer are required to create an offer", 422);
  }

  const campaign = await ensureHirerOwnsCampaign(userId, campaignId);
  const influencerProfile = await prisma.influencerProfile.findUnique({
    where: { id: influencerProfileId },
    include: {
      user: true,
    },
  });

  if (!influencerProfile) {
    throw new AppError("Influencer profile not found", 404);
  }

  const existingOffer = await prisma.offer.findFirst({
    where: {
      campaignId,
      influencerProfileId,
      status: {
        in: [OfferStatus.PENDING, OfferStatus.COUNTERED, OfferStatus.ACCEPTED],
      },
    },
  });

  if (existingOffer) {
    throw new AppError("There is already an active offer for this influencer on the campaign", 409);
  }

  const offer = await prisma.$transaction(async (tx) => {
    const createdOffer = await tx.offer.create({
      data: {
        campaignId,
        applicationId,
        influencerProfileId,
        agreedRate: input.agreedRate,
        deliverables: input.deliverables,
        contentDeadline: new Date(input.contentDeadline),
        paymentTerms: input.paymentTerms ?? null,
        revisionLimit: input.revisionLimit ?? 2,
      },
      include: offerInclude,
    });

    await tx.conversation.create({
      data: {
        offerId: createdOffer.id,
      },
    });

    if (applicationId) {
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.OFFERED,
        },
      });
    }

    return tx.offer.findUniqueOrThrow({
      where: { id: createdOffer.id },
      include: offerInclude,
    });
  });

  await createNotifications(
    [influencerProfile.user.id],
    NotificationType.OFFER_SENT,
    "New offer received",
    `${campaign.title} has sent you an offer`,
    { offerId: offer.id, campaignId },
  );

  return offer;
};

export const listMyOffers = async (userId: string, role: Role) => {
  return prisma.offer.findMany({
    where:
      role === Role.HIRER
        ? {
          campaign: {
            hirer: {
              userId,
            },
          },
        }
        : {
          influencerProfile: {
            userId,
          },
        },
    include: offerInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getOfferById = async (userId: string, role: Role, offerId: string) => {
  return ensureOfferAccess(userId, role, offerId);
};

export const acceptOffer = async (userId: string, offerId: string) => {
  const offer = await ensureInfluencerOwnsOffer(userId, offerId);
  ensureOfferTransition(offer.status, OfferStatus.ACCEPTED);

  const updatedOffer = await prisma.$transaction(async (tx) => {
    const acceptedOffer = await tx.offer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.ACCEPTED,
        acceptedAt: new Date(),
        counterRate: null,
        counterNote: null,
      },
      include: offerInclude,
    });

    if (acceptedOffer.applicationId) {
      await tx.application.update({
        where: { id: acceptedOffer.applicationId },
        data: {
          status: ApplicationStatus.HIRED,
        },
      });
    }

    await tx.contractSnapshot.create({
      data: {
        offerId,
        termsJson: {
          agreedRate: acceptedOffer.agreedRate,
          deliverables: acceptedOffer.deliverables,
          contentDeadline: acceptedOffer.contentDeadline,
          paymentTerms: acceptedOffer.paymentTerms,
          revisionLimit: acceptedOffer.revisionLimit,
        },
      },
    });

    await createPendingPaymentIfMissing(offerId, acceptedOffer.agreedRate);

    return acceptedOffer;
  });

  await createNotifications(
    [offer.campaign.hirer.user.id],
    NotificationType.OFFER_ACCEPTED,
    "Offer accepted",
    `Your offer for ${offer.campaign.title} was accepted`,
    { offerId, campaignId: offer.campaignId },
  );

  return prisma.offer.findUniqueOrThrow({
    where: { id: offerId },
    include: offerInclude,
  });
};

export const declineOffer = async (userId: string, offerId: string) => {
  const offer = await ensureInfluencerOwnsOffer(userId, offerId);
  ensureOfferTransition(offer.status, OfferStatus.DECLINED);

  const updatedOffer = await prisma.offer.update({
    where: { id: offerId },
    data: {
      status: OfferStatus.DECLINED,
      declinedAt: new Date(),
    },
    include: offerInclude,
  });

  await createNotifications(
    [offer.campaign.hirer.user.id],
    NotificationType.OFFER_DECLINED,
    "Offer declined",
    `Your offer for ${offer.campaign.title} was declined`,
    { offerId, campaignId: offer.campaignId },
  );

  return updatedOffer;
};

export const counterOffer = async (
  userId: string,
  offerId: string,
  input: CounterOfferInput,
) => {
  const offer = await ensureInfluencerOwnsOffer(userId, offerId);
  ensureOfferTransition(offer.status, OfferStatus.COUNTERED);

  const updatedOffer = await prisma.offer.update({
    where: { id: offerId },
    data: {
      status: OfferStatus.COUNTERED,
      counterRate: input.counterRate,
      counterNote: input.counterNote ?? null,
    },
    include: offerInclude,
  });

  await createNotifications(
    [offer.campaign.hirer.user.id],
    NotificationType.OFFER_COUNTERED,
    "Offer countered",
    `The influencer countered your offer for ${offer.campaign.title}`,
    { offerId, campaignId: offer.campaignId },
  );

  return updatedOffer;
};

export const reviseOffer = async (
  userId: string,
  offerId: string,
  input: ReviseOfferInput,
) => {
  const offer = await ensureHirerOwnsOffer(userId, offerId);
  ensureOfferTransition(offer.status, OfferStatus.PENDING);

  const updatedOffer = await prisma.offer.update({
    where: { id: offerId },
    data: {
      agreedRate: input.agreedRate ?? offer.agreedRate,
      deliverables: input.deliverables ?? offer.deliverables,
      contentDeadline: input.contentDeadline
        ? new Date(input.contentDeadline)
        : offer.contentDeadline,
      paymentTerms:
        input.paymentTerms !== undefined ? input.paymentTerms : offer.paymentTerms,
      revisionLimit: input.revisionLimit ?? offer.revisionLimit,
      status: OfferStatus.PENDING,
      counterRate: null,
      counterNote: null,
    },
    include: offerInclude,
  });

  const influencer = await prisma.influencerProfile.findUniqueOrThrow({
    where: { id: offer.influencerProfileId },
    include: { user: true },
  });

  await createNotifications(
    [influencer.user.id],
    NotificationType.OFFER_SENT,
    "Offer revised",
    `A revised offer is waiting for you on ${offer.campaign.title}`,
    { offerId, campaignId: offer.campaignId },
  );

  return updatedOffer;
};

export const expireOffer = async (userId: string, offerId: string) => {
  const offer = await ensureHirerOwnsOffer(userId, offerId);
  ensureOfferTransition(offer.status, OfferStatus.EXPIRED);

  const updatedOffer = await prisma.offer.update({
    where: { id: offerId },
    data: {
      status: OfferStatus.EXPIRED,
    },
    include: offerInclude,
  });

  const influencer = await prisma.influencerProfile.findUniqueOrThrow({
    where: { id: offer.influencerProfileId },
    include: { user: true },
  });

  await createNotifications(
    [influencer.user.id],
    NotificationType.OFFER_DECLINED,
    "Offer expired",
    `An offer on ${offer.campaign.title} has expired`,
    { offerId, campaignId: offer.campaignId },
  );

  return updatedOffer;
};
