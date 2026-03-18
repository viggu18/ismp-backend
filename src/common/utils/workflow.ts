import {
  ContentSubmissionStatus,
  OfferStatus,
  PaymentStatus,
} from "@prisma/client";

import { AppError } from "../errors/app-error";

export const ensureOfferTransition = (
  currentStatus: OfferStatus,
  nextStatus: OfferStatus,
) => {
  const allowedTransitions: Record<OfferStatus, OfferStatus[]> = {
    PENDING: [OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.COUNTERED, OfferStatus.EXPIRED],
    COUNTERED: [OfferStatus.PENDING, OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.EXPIRED],
    ACCEPTED: [],
    DECLINED: [],
    EXPIRED: [],
  };

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new AppError(
      `Cannot transition offer from ${currentStatus} to ${nextStatus}`,
      409,
    );
  }
};

export const ensurePaymentTransition = (
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus,
) => {
  const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    PENDING: [PaymentStatus.IN_ESCROW, PaymentStatus.REFUNDED],
    IN_ESCROW: [PaymentStatus.RELEASED, PaymentStatus.REFUNDED],
    RELEASED: [],
    REFUNDED: [],
    EXTERNAL: [PaymentStatus.RELEASED, PaymentStatus.REFUNDED],
  };

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new AppError(
      `Cannot transition payment from ${currentStatus} to ${nextStatus}`,
      409,
    );
  }
};

export const ensureContentActionAllowed = (
  currentStatus: ContentSubmissionStatus,
  action: "request-revision" | "approve",
) => {
  const allowedActions: Record<ContentSubmissionStatus, Array<"request-revision" | "approve">> = {
    SUBMITTED: ["request-revision", "approve"],
    REVISION_REQUESTED: [],
    APPROVED: [],
  };

  if (!allowedActions[currentStatus].includes(action)) {
    throw new AppError(
      `Cannot ${action} when content submission is ${currentStatus}`,
      409,
    );
  }
};
