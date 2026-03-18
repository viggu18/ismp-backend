"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectApplication = exports.shortlistApplication = exports.listCampaignApplications = exports.applyToCampaign = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const notification_service_1 = require("../notifications/notification.service");
const applyToCampaign = async (userId, campaignId, input) => {
    const user = await prisma_client_1.default.user.findUnique({
        where: { id: userId },
        include: {
            influencerProfile: true,
        },
    });
    if (!user?.influencerProfile) {
        throw new app_error_1.AppError("Complete your influencer profile before applying", 409);
    }
    const campaign = await prisma_client_1.default.campaign.findUnique({
        where: { id: campaignId },
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
    if (campaign.status !== client_1.CampaignStatus.OPEN) {
        throw new app_error_1.AppError("Only open campaigns can accept applications", 409);
    }
    if (campaign.visibility !== client_1.CampaignVisibility.PUBLIC) {
        throw new app_error_1.AppError("Private campaigns do not accept open applications", 403);
    }
    const application = await prisma_client_1.default.application.create({
        data: {
            campaignId,
            influencerProfileId: user.influencerProfile.id,
            pitchNote: input.pitchNote ?? null,
            proposedRate: input.proposedRate ?? null,
            status: client_1.ApplicationStatus.PENDING,
        },
        include: {
            influencerProfile: true,
            campaign: true,
        },
    });
    await (0, notification_service_1.createNotifications)([campaign.hirer.user.id], client_1.NotificationType.APPLICATION_RECEIVED, "New application received", `${user.influencerProfile.displayName} applied to ${campaign.title}`, { campaignId, applicationId: application.id });
    return application;
};
exports.applyToCampaign = applyToCampaign;
const listCampaignApplications = async (userId, campaignId) => {
    const campaign = await prisma_client_1.default.campaign.findFirst({
        where: {
            id: campaignId,
            hirer: {
                userId,
            },
        },
    });
    if (!campaign) {
        throw new app_error_1.AppError("Campaign not found", 404);
    }
    return prisma_client_1.default.application.findMany({
        where: { campaignId },
        include: {
            influencerProfile: {
                include: {
                    socialAccounts: true,
                    ratecards: true,
                },
            },
            offer: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.listCampaignApplications = listCampaignApplications;
const updateApplicationStatus = async (userId, applicationId, status) => {
    const application = await prisma_client_1.default.application.findFirst({
        where: {
            id: applicationId,
            campaign: {
                hirer: {
                    userId,
                },
            },
        },
        include: {
            campaign: true,
            influencerProfile: {
                include: {
                    user: true,
                },
            },
        },
    });
    if (!application) {
        throw new app_error_1.AppError("Application not found", 404);
    }
    const updatedApplication = await prisma_client_1.default.application.update({
        where: { id: applicationId },
        data: { status },
        include: {
            influencerProfile: true,
            campaign: true,
        },
    });
    await (0, notification_service_1.createNotifications)([application.influencerProfile.user.id], client_1.NotificationType.APPLICATION_RECEIVED, status === client_1.ApplicationStatus.SHORTLISTED
        ? "You have been shortlisted"
        : "Your application was updated", status === client_1.ApplicationStatus.SHORTLISTED
        ? `You have been shortlisted for ${application.campaign.title}`
        : `Your application for ${application.campaign.title} was declined`, { campaignId: application.campaignId, applicationId });
    return updatedApplication;
};
const shortlistApplication = async (userId, applicationId) => {
    return updateApplicationStatus(userId, applicationId, client_1.ApplicationStatus.SHORTLISTED);
};
exports.shortlistApplication = shortlistApplication;
const rejectApplication = async (userId, applicationId) => {
    return updateApplicationStatus(userId, applicationId, client_1.ApplicationStatus.REJECTED);
};
exports.rejectApplication = rejectApplication;
