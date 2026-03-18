import { NotificationType, PaymentStatus, Prisma } from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { syncCampaignCompletionStatus } from "../../common/utils/campaign-progress";
import { ensurePaymentTransition } from "../../common/utils/workflow";
import { paymentProvider } from "../../providers/payment.provider";
import { createNotifications } from "../notifications/notification.service";

const paymentInclude = {
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
} satisfies Prisma.PaymentInclude;

const ensurePaymentAccess = async (userId: string, offerId: string) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      campaign: {
        hirer: {
          userId,
        },
      },
    },
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
      payment: true,
      contentSubmissions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  return offer;
};

export const getPayment = async (userId: string, offerId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      offerId,
      OR: [
        {
          offer: {
            campaign: {
              hirer: {
                userId,
              },
            },
          },
        },
        {
          offer: {
            influencerProfile: {
              userId,
            },
          },
        },
      ],
    },
    include: paymentInclude,
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  return payment;
};

export const lockEscrow = async (userId: string, offerId: string) => {
  const offer = await ensurePaymentAccess(userId, offerId);

  if (!offer.payment) {
    throw new AppError("A pending payment must exist before locking escrow", 409);
  }

  ensurePaymentTransition(offer.payment.status, PaymentStatus.IN_ESCROW);
  const result = await paymentProvider.createEscrow(offerId);

  return prisma.payment.update({
    where: { offerId },
    data: {
      status: result.status,
      escrowLockedAt: new Date(),
      razorpayOrderId: result.reference,
    },
    include: paymentInclude,
  });
};

export const releaseEscrow = async (userId: string, offerId: string) => {
  const offer = await ensurePaymentAccess(userId, offerId);

  if (!offer.payment) {
    throw new AppError("Payment not found", 404);
  }

  const latestSubmission = offer.contentSubmissions[0];

  if (!latestSubmission?.publishedAt) {
    throw new AppError("Published content is required before releasing payment", 409);
  }

  ensurePaymentTransition(offer.payment.status, PaymentStatus.RELEASED);
  const result = await paymentProvider.releaseEscrow(offerId);

  const payment = await prisma.payment.update({
    where: { offerId },
    data: {
      status: result.status,
      releasedAt: new Date(),
      razorpayPaymentId: result.reference,
    },
    include: paymentInclude,
  });

  const influencer = await prisma.influencerProfile.findUniqueOrThrow({
    where: { id: offer.influencerProfileId },
    include: { user: true },
  });

  await createNotifications(
    [influencer.user.id],
    NotificationType.PAYMENT_RELEASED,
    "Payment released",
    `Payment has been released for ${offer.campaign.title}`,
    { offerId, paymentId: payment.id },
  );

  await syncCampaignCompletionStatus(offer.campaignId);

  return payment;
};

export const refundEscrow = async (userId: string, offerId: string) => {
  const offer = await ensurePaymentAccess(userId, offerId);

  if (!offer.payment) {
    throw new AppError("Payment not found", 404);
  }

  ensurePaymentTransition(offer.payment.status, PaymentStatus.REFUNDED);
  const result = await paymentProvider.refundEscrow(offerId);

  return prisma.payment.update({
    where: { offerId },
    data: {
      status: result.status,
      razorpayPaymentId: result.reference,
    },
    include: paymentInclude,
  });
};
