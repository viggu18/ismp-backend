import {
  ApplicationStatus,
  CampaignStatus,
  CampaignVisibility,
  ContentType,
  NotificationType,
  OfferStatus,
  PaymentStatus,
  Platform,
  ReviewTarget,
  Role,
} from "@prisma/client";

export const roleValues = Object.values(Role);
export const platformValues = Object.values(Platform);
export const contentTypeValues = Object.values(ContentType);
export const campaignStatusValues = Object.values(CampaignStatus);
export const campaignVisibilityValues = Object.values(CampaignVisibility);
export const applicationStatusValues = Object.values(ApplicationStatus);
export const offerStatusValues = Object.values(OfferStatus);
export const paymentStatusValues = Object.values(PaymentStatus);
export const reviewTargetValues = Object.values(ReviewTarget);
export const notificationTypeValues = Object.values(NotificationType);
