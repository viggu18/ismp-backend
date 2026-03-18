"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = exports.listOfferReviews = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const reviewInclude = {
    hirerProfile: true,
    influencerProfile: true,
};
const recalculateRatings = async (input) => {
    if (input.target === client_1.ReviewTarget.HIRER && input.hirerProfileId) {
        const aggregate = await prisma_client_1.default.review.aggregate({
            where: { hirerProfileId: input.hirerProfileId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await prisma_client_1.default.hirerProfile.update({
            where: { id: input.hirerProfileId },
            data: {
                averageRating: aggregate._avg.rating ?? null,
                totalReviews: aggregate._count.rating,
            },
        });
    }
    if (input.target === client_1.ReviewTarget.INFLUENCER && input.influencerProfileId) {
        const aggregate = await prisma_client_1.default.review.aggregate({
            where: { influencerProfileId: input.influencerProfileId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await prisma_client_1.default.influencerProfile.update({
            where: { id: input.influencerProfileId },
            data: {
                averageRating: aggregate._avg.rating ?? null,
                totalReviews: aggregate._count.rating,
            },
        });
    }
};
const listOfferReviews = async (userId, offerId) => {
    const offer = await prisma_client_1.default.offer.findFirst({
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
        throw new app_error_1.AppError("Offer not found", 404);
    }
    return prisma_client_1.default.review.findMany({
        where: { offerId },
        include: reviewInclude,
        orderBy: { createdAt: "desc" },
    });
};
exports.listOfferReviews = listOfferReviews;
const createReview = async (userId, role, offerId, input) => {
    const offer = await prisma_client_1.default.offer.findFirst({
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
        throw new app_error_1.AppError("Offer not found", 404);
    }
    if (!offer.payment || offer.payment.status !== client_1.PaymentStatus.RELEASED) {
        throw new app_error_1.AppError("Reviews can only be left after payment is released", 409);
    }
    if (!offer.contentSubmissions[0]?.publishedAt) {
        throw new app_error_1.AppError("Reviews can only be left after content is published", 409);
    }
    if (role === client_1.Role.HIRER && input.reviewTarget !== client_1.ReviewTarget.INFLUENCER) {
        throw new app_error_1.AppError("Hirers can only review influencers", 422);
    }
    if (role === client_1.Role.INFLUENCER && input.reviewTarget !== client_1.ReviewTarget.HIRER) {
        throw new app_error_1.AppError("Influencers can only review hirers", 422);
    }
    const review = await prisma_client_1.default.review.create({
        data: {
            offerId,
            reviewTarget: input.reviewTarget,
            hirerProfileId: input.reviewTarget === client_1.ReviewTarget.HIRER ? offer.campaign.hirerId : null,
            influencerProfileId: input.reviewTarget === client_1.ReviewTarget.INFLUENCER ? offer.influencerProfileId : null,
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
exports.createReview = createReview;
