"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireOffer = exports.reviseOffer = exports.counterOffer = exports.declineOffer = exports.acceptOffer = exports.getOfferById = exports.listMyOffers = exports.createOffer = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const workflow_1 = require("../../common/utils/workflow");
const notification_service_1 = require("../notifications/notification.service");
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
};
const ensureHirerOwnsCampaign = async (userId, campaignId) => {
    const campaign = await prisma_client_1.default.campaign.findFirst({
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
        throw new app_error_1.AppError("Campaign not found", 404);
    }
    return campaign;
};
const ensureInfluencerOwnsOffer = async (userId, offerId) => {
    const offer = await prisma_client_1.default.offer.findFirst({
        where: {
            id: offerId,
            influencerProfile: {
                userId,
            },
        },
        include: offerInclude,
    });
    if (!offer) {
        throw new app_error_1.AppError("Offer not found", 404);
    }
    return offer;
};
const ensureHirerOwnsOffer = async (userId, offerId) => {
    const offer = await prisma_client_1.default.offer.findFirst({
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
        throw new app_error_1.AppError("Offer not found", 404);
    }
    return offer;
};
const ensureOfferAccess = async (userId, role, offerId) => {
    if (role === client_1.Role.HIRER) {
        return ensureHirerOwnsOffer(userId, offerId);
    }
    return ensureInfluencerOwnsOffer(userId, offerId);
};
const createPendingPaymentIfMissing = async (offerId, agreedRate) => {
    const platformFeeInr = Number((agreedRate * 0.1).toFixed(2));
    const influencerPayout = Number((agreedRate - platformFeeInr).toFixed(2));
    return prisma_client_1.default.payment.upsert({
        where: { offerId },
        update: {
            amountInr: agreedRate,
            platformFeeInr,
            influencerPayout,
            status: client_1.PaymentStatus.PENDING,
        },
        create: {
            offerId,
            amountInr: agreedRate,
            platformFeeInr,
            influencerPayout,
            status: client_1.PaymentStatus.PENDING,
        },
    });
};
const createOffer = async (userId, input) => {
    let campaignId = input.campaignId;
    let influencerProfileId = input.influencerProfileId;
    let applicationId = input.applicationId;
    if (applicationId) {
        const application = await prisma_client_1.default.application.findUnique({
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
            throw new app_error_1.AppError("Application not found", 404);
        }
        await ensureHirerOwnsCampaign(userId, application.campaignId);
        campaignId = application.campaignId;
        influencerProfileId = application.influencerProfileId;
    }
    if (!campaignId || !influencerProfileId) {
        throw new app_error_1.AppError("A campaign and influencer are required to create an offer", 422);
    }
    const campaign = await ensureHirerOwnsCampaign(userId, campaignId);
    const influencerProfile = await prisma_client_1.default.influencerProfile.findUnique({
        where: { id: influencerProfileId },
        include: {
            user: true,
        },
    });
    if (!influencerProfile) {
        throw new app_error_1.AppError("Influencer profile not found", 404);
    }
    const existingOffer = await prisma_client_1.default.offer.findFirst({
        where: {
            campaignId,
            influencerProfileId,
            status: {
                in: [client_1.OfferStatus.PENDING, client_1.OfferStatus.COUNTERED, client_1.OfferStatus.ACCEPTED],
            },
        },
    });
    if (existingOffer) {
        throw new app_error_1.AppError("There is already an active offer for this influencer on the campaign", 409);
    }
    const offer = await prisma_client_1.default.$transaction(async (tx) => {
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
                    status: client_1.ApplicationStatus.OFFERED,
                },
            });
        }
        return tx.offer.findUniqueOrThrow({
            where: { id: createdOffer.id },
            include: offerInclude,
        });
    });
    await (0, notification_service_1.createNotifications)([influencerProfile.user.id], client_1.NotificationType.OFFER_SENT, "New offer received", `${campaign.title} has sent you an offer`, { offerId: offer.id, campaignId });
    return offer;
};
exports.createOffer = createOffer;
const listMyOffers = async (userId, role) => {
    return prisma_client_1.default.offer.findMany({
        where: role === client_1.Role.HIRER
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
exports.listMyOffers = listMyOffers;
const getOfferById = async (userId, role, offerId) => {
    return ensureOfferAccess(userId, role, offerId);
};
exports.getOfferById = getOfferById;
const acceptOffer = async (userId, offerId) => {
    const offer = await ensureInfluencerOwnsOffer(userId, offerId);
    (0, workflow_1.ensureOfferTransition)(offer.status, client_1.OfferStatus.ACCEPTED);
    const updatedOffer = await prisma_client_1.default.$transaction(async (tx) => {
        const acceptedOffer = await tx.offer.update({
            where: { id: offerId },
            data: {
                status: client_1.OfferStatus.ACCEPTED,
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
                    status: client_1.ApplicationStatus.HIRED,
                },
            });
        }
        await createPendingPaymentIfMissing(offerId, acceptedOffer.agreedRate);
        return acceptedOffer;
    });
    await (0, notification_service_1.createNotifications)([offer.campaign.hirer.user.id], client_1.NotificationType.OFFER_ACCEPTED, "Offer accepted", `Your offer for ${offer.campaign.title} was accepted`, { offerId, campaignId: offer.campaignId });
    return prisma_client_1.default.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: offerInclude,
    });
};
exports.acceptOffer = acceptOffer;
const declineOffer = async (userId, offerId) => {
    const offer = await ensureInfluencerOwnsOffer(userId, offerId);
    (0, workflow_1.ensureOfferTransition)(offer.status, client_1.OfferStatus.DECLINED);
    const updatedOffer = await prisma_client_1.default.offer.update({
        where: { id: offerId },
        data: {
            status: client_1.OfferStatus.DECLINED,
            declinedAt: new Date(),
        },
        include: offerInclude,
    });
    await (0, notification_service_1.createNotifications)([offer.campaign.hirer.user.id], client_1.NotificationType.OFFER_DECLINED, "Offer declined", `Your offer for ${offer.campaign.title} was declined`, { offerId, campaignId: offer.campaignId });
    return updatedOffer;
};
exports.declineOffer = declineOffer;
const counterOffer = async (userId, offerId, input) => {
    const offer = await ensureInfluencerOwnsOffer(userId, offerId);
    (0, workflow_1.ensureOfferTransition)(offer.status, client_1.OfferStatus.COUNTERED);
    const updatedOffer = await prisma_client_1.default.offer.update({
        where: { id: offerId },
        data: {
            status: client_1.OfferStatus.COUNTERED,
            counterRate: input.counterRate,
            counterNote: input.counterNote ?? null,
        },
        include: offerInclude,
    });
    await (0, notification_service_1.createNotifications)([offer.campaign.hirer.user.id], client_1.NotificationType.OFFER_COUNTERED, "Offer countered", `The influencer countered your offer for ${offer.campaign.title}`, { offerId, campaignId: offer.campaignId });
    return updatedOffer;
};
exports.counterOffer = counterOffer;
const reviseOffer = async (userId, offerId, input) => {
    const offer = await ensureHirerOwnsOffer(userId, offerId);
    (0, workflow_1.ensureOfferTransition)(offer.status, client_1.OfferStatus.PENDING);
    const updatedOffer = await prisma_client_1.default.offer.update({
        where: { id: offerId },
        data: {
            agreedRate: input.agreedRate ?? offer.agreedRate,
            deliverables: input.deliverables ?? offer.deliverables,
            contentDeadline: input.contentDeadline
                ? new Date(input.contentDeadline)
                : offer.contentDeadline,
            paymentTerms: input.paymentTerms !== undefined ? input.paymentTerms : offer.paymentTerms,
            revisionLimit: input.revisionLimit ?? offer.revisionLimit,
            status: client_1.OfferStatus.PENDING,
            counterRate: null,
            counterNote: null,
        },
        include: offerInclude,
    });
    const influencer = await prisma_client_1.default.influencerProfile.findUniqueOrThrow({
        where: { id: offer.influencerProfileId },
        include: { user: true },
    });
    await (0, notification_service_1.createNotifications)([influencer.user.id], client_1.NotificationType.OFFER_SENT, "Offer revised", `A revised offer is waiting for you on ${offer.campaign.title}`, { offerId, campaignId: offer.campaignId });
    return updatedOffer;
};
exports.reviseOffer = reviseOffer;
const expireOffer = async (userId, offerId) => {
    const offer = await ensureHirerOwnsOffer(userId, offerId);
    (0, workflow_1.ensureOfferTransition)(offer.status, client_1.OfferStatus.EXPIRED);
    const updatedOffer = await prisma_client_1.default.offer.update({
        where: { id: offerId },
        data: {
            status: client_1.OfferStatus.EXPIRED,
        },
        include: offerInclude,
    });
    const influencer = await prisma_client_1.default.influencerProfile.findUniqueOrThrow({
        where: { id: offer.influencerProfileId },
        include: { user: true },
    });
    await (0, notification_service_1.createNotifications)([influencer.user.id], client_1.NotificationType.OFFER_DECLINED, "Offer expired", `An offer on ${offer.campaign.title} has expired`, { offerId, campaignId: offer.campaignId });
    return updatedOffer;
};
exports.expireOffer = expireOffer;
