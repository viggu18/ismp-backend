"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCampaignCompletionStatus = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const syncCampaignCompletionStatus = async (campaignId) => {
    const campaign = await prisma_client_1.default.campaign.findUnique({
        where: { id: campaignId },
        include: {
            offers: {
                where: {
                    status: client_1.OfferStatus.ACCEPTED,
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
    const allAcceptedOffersCompleted = hasAcceptedOffers &&
        acceptedOffers.every((offer) => {
            const latestSubmission = offer.contentSubmissions[0];
            return (Boolean(latestSubmission?.publishedAt) &&
                Boolean(offer.payment) &&
                offer.payment?.status === client_1.PaymentStatus.RELEASED);
        });
    const nextStatus = allAcceptedOffersCompleted
        ? client_1.CampaignStatus.COMPLETED
        : campaign.status === client_1.CampaignStatus.COMPLETED
            ? client_1.CampaignStatus.OPEN
            : campaign.status;
    if (nextStatus !== campaign.status) {
        return prisma_client_1.default.campaign.update({
            where: { id: campaignId },
            data: { status: nextStatus },
        });
    }
    return campaign;
};
exports.syncCampaignCompletionStatus = syncCampaignCompletionStatus;
