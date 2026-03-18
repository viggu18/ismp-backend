import { CampaignStatus, OfferStatus, PaymentStatus } from "@prisma/client";

import prisma from "../../prisma/prisma.client";

export const syncCampaignCompletionStatus = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      offers: {
        where: {
          status: OfferStatus.ACCEPTED,
        },
        include: {
          payment: true,
          contentSubmissions: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!campaign) {
    return null;
  }

  const acceptedOffers = campaign.offers;
  const hasAcceptedOffers = acceptedOffers.length > 0;
  const allAcceptedOffersCompleted =
    hasAcceptedOffers &&
    acceptedOffers.every((offer) => {
      const latestSubmission = offer.contentSubmissions[0];

      return (
        Boolean(latestSubmission?.publishedAt) &&
        Boolean(offer.payment) &&
        offer.payment?.status === PaymentStatus.RELEASED
      );
    });

  const nextStatus = allAcceptedOffersCompleted
    ? CampaignStatus.COMPLETED
    : campaign.status === CampaignStatus.COMPLETED
      ? CampaignStatus.OPEN
      : campaign.status;

  if (nextStatus !== campaign.status) {
    return prisma.campaign.update({
      where: { id: campaignId },
      data: { status: nextStatus },
    });
  }

  return campaign;
};
