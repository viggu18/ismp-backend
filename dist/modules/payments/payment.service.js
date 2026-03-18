"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundEscrow = exports.releaseEscrow = exports.lockEscrow = exports.getPayment = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const campaign_progress_1 = require("../../common/utils/campaign-progress");
const workflow_1 = require("../../common/utils/workflow");
const payment_provider_1 = require("../../providers/payment.provider");
const notification_service_1 = require("../notifications/notification.service");
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
};
const ensurePaymentAccess = async (userId, offerId) => {
    const offer = await prisma_client_1.default.offer.findFirst({
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
        throw new app_error_1.AppError("Offer not found", 404);
    }
    return offer;
};
const getPayment = async (userId, offerId) => {
    const payment = await prisma_client_1.default.payment.findFirst({
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
        throw new app_error_1.AppError("Payment not found", 404);
    }
    return payment;
};
exports.getPayment = getPayment;
const lockEscrow = async (userId, offerId) => {
    const offer = await ensurePaymentAccess(userId, offerId);
    if (!offer.payment) {
        throw new app_error_1.AppError("A pending payment must exist before locking escrow", 409);
    }
    (0, workflow_1.ensurePaymentTransition)(offer.payment.status, client_1.PaymentStatus.IN_ESCROW);
    const result = await payment_provider_1.paymentProvider.createEscrow(offerId);
    return prisma_client_1.default.payment.update({
        where: { offerId },
        data: {
            status: result.status,
            escrowLockedAt: new Date(),
            razorpayOrderId: result.reference,
        },
        include: paymentInclude,
    });
};
exports.lockEscrow = lockEscrow;
const releaseEscrow = async (userId, offerId) => {
    const offer = await ensurePaymentAccess(userId, offerId);
    if (!offer.payment) {
        throw new app_error_1.AppError("Payment not found", 404);
    }
    const latestSubmission = offer.contentSubmissions[0];
    if (!latestSubmission?.publishedAt) {
        throw new app_error_1.AppError("Published content is required before releasing payment", 409);
    }
    (0, workflow_1.ensurePaymentTransition)(offer.payment.status, client_1.PaymentStatus.RELEASED);
    const result = await payment_provider_1.paymentProvider.releaseEscrow(offerId);
    const payment = await prisma_client_1.default.payment.update({
        where: { offerId },
        data: {
            status: result.status,
            releasedAt: new Date(),
            razorpayPaymentId: result.reference,
        },
        include: paymentInclude,
    });
    const influencer = await prisma_client_1.default.influencerProfile.findUniqueOrThrow({
        where: { id: offer.influencerProfileId },
        include: { user: true },
    });
    await (0, notification_service_1.createNotifications)([influencer.user.id], client_1.NotificationType.PAYMENT_RELEASED, "Payment released", `Payment has been released for ${offer.campaign.title}`, { offerId, paymentId: payment.id });
    await (0, campaign_progress_1.syncCampaignCompletionStatus)(offer.campaignId);
    return payment;
};
exports.releaseEscrow = releaseEscrow;
const refundEscrow = async (userId, offerId) => {
    const offer = await ensurePaymentAccess(userId, offerId);
    if (!offer.payment) {
        throw new app_error_1.AppError("Payment not found", 404);
    }
    (0, workflow_1.ensurePaymentTransition)(offer.payment.status, client_1.PaymentStatus.REFUNDED);
    const result = await payment_provider_1.paymentProvider.refundEscrow(offerId);
    return prisma_client_1.default.payment.update({
        where: { offerId },
        data: {
            status: result.status,
            razorpayPaymentId: result.reference,
        },
        include: paymentInclude,
    });
};
exports.refundEscrow = refundEscrow;
