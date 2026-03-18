"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeCampaignStatus = exports.updateCampaign = exports.getCampaignById = exports.browseCampaigns = exports.listMyCampaigns = exports.createCampaign = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const profile_1 = require("../../common/utils/profile");
const notification_service_1 = require("../notifications/notification.service");
const getHirerProfileId = async (userId) => {
    const user = await (0, profile_1.getCurrentUserOrThrow)(userId);
    if (user.role !== client_1.Role.HIRER || !user.hirerProfile) {
        throw new app_error_1.AppError("Complete your hirer profile before managing campaigns", 409);
    }
    return user.hirerProfile.id;
};
const baseCampaignInclude = {
    hirer: {
        include: {
            user: {
                select: {
                    id: true,
                    phone: true,
                    email: true,
                },
            },
        },
    },
    applications: true,
    offers: true,
};
const createCampaign = async (userId, input) => {
    const hirerId = await getHirerProfileId(userId);
    return prisma_client_1.default.campaign.create({
        data: {
            hirerId,
            title: input.title,
            description: input.description,
            platforms: input.platforms,
            contentTypes: input.contentTypes,
            niche: input.niche ?? null,
            budgetMin: input.budgetMin ?? null,
            budgetMax: input.budgetMax ?? null,
            timeline: input.timeline ?? null,
            startDate: input.startDate,
            deadlineDate: input.deadlineDate,
            deliverablesCount: input.deliverablesCount ?? 1,
            languages: input.languages ?? [],
            minFollowers: input.minFollowers ?? null,
            targetCities: input.targetCities ?? [],
            targetGender: input.targetGender ?? null,
            visibility: input.visibility ?? client_1.CampaignVisibility.PUBLIC,
            briefUrl: input.briefUrl ?? null,
            briefText: input.briefText ?? null,
        },
        include: baseCampaignInclude,
    });
};
exports.createCampaign = createCampaign;
const listMyCampaigns = async (userId, pagination) => {
    const hirerId = await getHirerProfileId(userId);
    const [items, total] = await prisma_client_1.default.$transaction([
        prisma_client_1.default.campaign.findMany({
            where: { hirerId },
            include: baseCampaignInclude,
            orderBy: { createdAt: "desc" },
            skip: pagination.skip,
            take: pagination.limit,
        }),
        prisma_client_1.default.campaign.count({ where: { hirerId } }),
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
exports.listMyCampaigns = listMyCampaigns;
const browseCampaigns = async (userId, role, filters, pagination) => {
    const user = await (0, profile_1.getCurrentUserOrThrow)(userId);
    const where = role === client_1.Role.HIRER
        ? {
            hirerId: user.hirerProfile?.id,
        }
        : {
            status: client_1.CampaignStatus.OPEN,
            OR: [
                { visibility: client_1.CampaignVisibility.PUBLIC },
                {
                    offers: {
                        some: {
                            influencerProfileId: user.influencerProfile?.id,
                        },
                    },
                },
            ],
        };
    if (filters.platform) {
        where.platforms = { has: filters.platform };
    }
    if (filters.contentType) {
        where.contentTypes = { has: filters.contentType };
    }
    if (filters.niche) {
        where.niche = { contains: filters.niche, mode: "insensitive" };
    }
    if (filters.minBudget) {
        where.budgetMax = { gte: filters.minBudget };
    }
    if (filters.maxBudget) {
        where.budgetMin = { lte: filters.maxBudget };
    }
    if (filters.language) {
        where.languages = { has: filters.language };
    }
    if (filters.minFollowers) {
        where.minFollowers = { lte: filters.minFollowers };
    }
    if (filters.city) {
        where.targetCities = { has: filters.city };
    }
    if (filters.targetGender) {
        where.targetGender = filters.targetGender;
    }
    if (filters.visibility && role === client_1.Role.HIRER) {
        where.visibility = filters.visibility;
    }
    const [items, total] = await prisma_client_1.default.$transaction([
        prisma_client_1.default.campaign.findMany({
            where,
            include: baseCampaignInclude,
            orderBy: { createdAt: "desc" },
            skip: pagination.skip,
            take: pagination.limit,
        }),
        prisma_client_1.default.campaign.count({ where }),
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
exports.browseCampaigns = browseCampaigns;
const getCampaignById = async (campaignId, userId, role) => {
    const user = await (0, profile_1.getCurrentUserOrThrow)(userId);
    const campaign = await prisma_client_1.default.campaign.findUnique({
        where: { id: campaignId },
        include: {
            ...baseCampaignInclude,
            offers: {
                include: {
                    conversation: true,
                    payment: true,
                },
            },
        },
    });
    if (!campaign) {
        throw new app_error_1.AppError("Campaign not found", 404);
    }
    const canAccess = role === client_1.Role.HIRER
        ? campaign.hirer.user.id === userId
        : campaign.visibility === client_1.CampaignVisibility.PUBLIC ||
            campaign.applications.some((application) => application.influencerProfileId === user.influencerProfile?.id) ||
            campaign.offers.some((offer) => offer.influencerProfileId === user.influencerProfile?.id);
    if (!canAccess) {
        throw new app_error_1.AppError("You do not have access to this campaign", 403);
    }
    return campaign;
};
exports.getCampaignById = getCampaignById;
const updateCampaign = async (campaignId, userId, input) => {
    const hirerId = await getHirerProfileId(userId);
    const campaign = await prisma_client_1.default.campaign.findFirst({
        where: {
            id: campaignId,
            hirerId,
        },
    });
    if (!campaign) {
        throw new app_error_1.AppError("Campaign not found", 404);
    }
    return prisma_client_1.default.campaign.update({
        where: { id: campaignId },
        data: {
            ...input,
        },
        include: baseCampaignInclude,
    });
};
exports.updateCampaign = updateCampaign;
const changeCampaignStatus = async (campaignId, userId, status) => {
    const hirerId = await getHirerProfileId(userId);
    const campaign = await prisma_client_1.default.campaign.findFirst({
        where: {
            id: campaignId,
            hirerId,
        },
        include: {
            applications: {
                include: {
                    influencerProfile: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });
    if (!campaign) {
        throw new app_error_1.AppError("Campaign not found", 404);
    }
    const updatedCampaign = await prisma_client_1.default.campaign.update({
        where: { id: campaignId },
        data: { status },
        include: baseCampaignInclude,
    });
    if (status === client_1.CampaignStatus.OPEN) {
        await (0, notification_service_1.createNotifications)(campaign.applications.map((application) => application.influencerProfile.user.id), client_1.NotificationType.CAMPAIGN_MATCH, "Campaign reopened", `${campaign.title} is open for applications again`, { campaignId: campaign.id });
    }
    return updatedCampaign;
};
exports.changeCampaignStatus = changeCampaignStatus;
