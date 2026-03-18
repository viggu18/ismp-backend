"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfluencerHistory = exports.getHirerCampaignArchive = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const getHirerCampaignArchive = async (userId, pagination) => {
    const hirer = await prisma_client_1.default.hirerProfile.findUnique({
        where: { userId },
    });
    if (!hirer) {
        throw new app_error_1.AppError("Complete your hirer profile to view archive", 409);
    }
    const [items, total] = await prisma_client_1.default.$transaction([
        prisma_client_1.default.campaign.findMany({
            where: {
                hirerId: hirer.id,
            },
            include: {
                applications: true,
                offers: {
                    include: {
                        payment: true,
                        contentSubmissions: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
            skip: pagination.skip,
            take: pagination.limit,
        }),
        prisma_client_1.default.campaign.count({
            where: {
                hirerId: hirer.id,
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
exports.getHirerCampaignArchive = getHirerCampaignArchive;
const getInfluencerHistory = async (userId, pagination) => {
    const influencer = await prisma_client_1.default.influencerProfile.findUnique({
        where: { userId },
    });
    if (!influencer) {
        throw new app_error_1.AppError("Complete your influencer profile to view history", 409);
    }
    const [items, total] = await prisma_client_1.default.$transaction([
        prisma_client_1.default.offer.findMany({
            where: {
                influencerProfileId: influencer.id,
            },
            include: {
                campaign: true,
                payment: true,
                contentSubmissions: true,
            },
            orderBy: { updatedAt: "desc" },
            skip: pagination.skip,
            take: pagination.limit,
        }),
        prisma_client_1.default.offer.count({
            where: {
                influencerProfileId: influencer.id,
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
exports.getInfluencerHistory = getInfluencerHistory;
