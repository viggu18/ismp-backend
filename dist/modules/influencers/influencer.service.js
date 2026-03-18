"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEarningsHistory = exports.replaceRateCards = exports.replaceSocialAccounts = exports.upsertMyProfile = exports.getMyProfile = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const profile_1 = require("../../common/utils/profile");
const ensureInfluencer = async (userId) => {
    const user = await (0, profile_1.getCurrentUserOrThrow)(userId);
    if (user.role !== "INFLUENCER") {
        throw new app_error_1.AppError("Only influencers can access this profile", 403);
    }
    return user;
};
const getMyProfile = async (userId) => {
    const user = await ensureInfluencer(userId);
    if (!user.influencerProfile) {
        return null;
    }
    return prisma_client_1.default.influencerProfile.findUnique({
        where: { id: user.influencerProfile.id },
        include: {
            socialAccounts: true,
            ratecards: true,
        },
    });
};
exports.getMyProfile = getMyProfile;
const upsertMyProfile = async (userId, input) => {
    await ensureInfluencer(userId);
    return prisma_client_1.default.influencerProfile.upsert({
        where: { userId },
        create: {
            userId,
            ...input,
        },
        update: {
            ...input,
        },
    });
};
exports.upsertMyProfile = upsertMyProfile;
const replaceSocialAccounts = async (userId, input) => {
    const user = await ensureInfluencer(userId);
    if (!user.influencerProfile) {
        throw new app_error_1.AppError("Complete your influencer profile before adding social accounts", 409);
    }
    return prisma_client_1.default.$transaction(async (tx) => {
        await tx.socialAccount.deleteMany({
            where: {
                influencerProfileId: user.influencerProfile.id,
            },
        });
        if (!input.socialAccounts.length) {
            return [];
        }
        await tx.socialAccount.createMany({
            data: input.socialAccounts.map((account) => ({
                influencerProfileId: user.influencerProfile.id,
                platform: account.platform,
                handle: account.handle,
                profileUrl: account.profileUrl,
                followerCount: account.followerCount ?? 0,
                engagementRate: account.engagementRate ?? null,
                isVerified: account.isVerified ?? false,
            })),
        });
        return tx.socialAccount.findMany({
            where: {
                influencerProfileId: user.influencerProfile.id,
            },
            orderBy: { platform: "asc" },
        });
    });
};
exports.replaceSocialAccounts = replaceSocialAccounts;
const replaceRateCards = async (userId, input) => {
    const user = await ensureInfluencer(userId);
    if (!user.influencerProfile) {
        throw new app_error_1.AppError("Complete your influencer profile before adding rate cards", 409);
    }
    return prisma_client_1.default.$transaction(async (tx) => {
        await tx.rateCard.deleteMany({
            where: {
                influencerProfileId: user.influencerProfile.id,
            },
        });
        if (!input.ratecards.length) {
            return [];
        }
        await tx.rateCard.createMany({
            data: input.ratecards.map((rateCard) => ({
                influencerProfileId: user.influencerProfile.id,
                platform: rateCard.platform,
                contentType: rateCard.contentType,
                priceInr: rateCard.priceInr,
            })),
        });
        return tx.rateCard.findMany({
            where: {
                influencerProfileId: user.influencerProfile.id,
            },
            orderBy: [{ platform: "asc" }, { contentType: "asc" }],
        });
    });
};
exports.replaceRateCards = replaceRateCards;
const getEarningsHistory = async (userId, pagination) => {
    const user = await ensureInfluencer(userId);
    if (!user.influencerProfile) {
        throw new app_error_1.AppError("Complete your influencer profile to view earnings", 409);
    }
    const [items, total] = await prisma_client_1.default.$transaction([
        prisma_client_1.default.payment.findMany({
            where: {
                offer: {
                    influencerProfileId: user.influencerProfile.id,
                },
            },
            include: {
                offer: {
                    include: {
                        campaign: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: pagination.skip,
            take: pagination.limit,
        }),
        prisma_client_1.default.payment.count({
            where: {
                offer: {
                    influencerProfileId: user.influencerProfile.id,
                },
            },
        }),
    ]);
    return {
        items,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.max(Math.ceil(total / pagination.limit), 1),
        },
    };
};
exports.getEarningsHistory = getEarningsHistory;
