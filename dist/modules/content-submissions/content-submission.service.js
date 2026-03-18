"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPublish = exports.approveSubmission = exports.requestRevision = exports.submitContent = exports.listSubmissions = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const campaign_progress_1 = require("../../common/utils/campaign-progress");
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
    contentSubmissions: {
        orderBy: { createdAt: "desc" },
    },
};
const ensureInfluencerOfferAccess = async (userId, offerId) => {
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
const ensureHirerSubmissionAccess = async (userId, submissionId) => {
    const submission = await prisma_client_1.default.contentSubmission.findFirst({
        where: {
            id: submissionId,
            offer: {
                campaign: {
                    hirer: {
                        userId,
                    },
                },
            },
        },
        include: {
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
        },
    });
    if (!submission) {
        throw new app_error_1.AppError("Content submission not found", 404);
    }
    return submission;
};
const listSubmissions = async (userId, offerId) => {
    const offer = await prisma_client_1.default.offer.findFirst({
        where: {
            id: offerId,
            OR: [
                {
                    influencerProfile: {
                        userId,
                    },
                },
                {
                    campaign: {
                        hirer: {
                            userId,
                        },
                    },
                },
            ],
        },
        include: {
            contentSubmissions: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!offer) {
        throw new app_error_1.AppError("Offer not found", 404);
    }
    return offer.contentSubmissions;
};
exports.listSubmissions = listSubmissions;
const submitContent = async (userId, offerId, input) => {
    const offer = await ensureInfluencerOfferAccess(userId, offerId);
    if (offer.status !== client_1.OfferStatus.ACCEPTED) {
        throw new app_error_1.AppError("Content can only be submitted for accepted offers", 409);
    }
    const latestSubmission = offer.contentSubmissions[0];
    if (!latestSubmission) {
        const submission = await prisma_client_1.default.contentSubmission.create({
            data: {
                offerId,
                submissionUrl: input.submissionUrl,
                note: input.note ?? null,
                revisionNumber: 1,
            },
        });
        await (0, notification_service_1.createNotifications)([offer.campaign.hirer.user.id], client_1.NotificationType.CONTENT_SUBMITTED, "Content submitted", `A draft has been submitted for ${offer.campaign.title}`, { offerId, submissionId: submission.id });
        return submission;
    }
    if (latestSubmission.status !== client_1.ContentSubmissionStatus.REVISION_REQUESTED) {
        throw new app_error_1.AppError("A revision must be requested before submitting another draft", 409);
    }
    const nextRevisionNumber = latestSubmission.revisionNumber + 1;
    if (nextRevisionNumber > offer.revisionLimit + 1) {
        throw new app_error_1.AppError("The revision limit for this offer has been reached", 409);
    }
    const submission = await prisma_client_1.default.contentSubmission.create({
        data: {
            offerId,
            submissionUrl: input.submissionUrl,
            note: input.note ?? null,
            revisionNumber: nextRevisionNumber,
        },
    });
    await (0, notification_service_1.createNotifications)([offer.campaign.hirer.user.id], client_1.NotificationType.CONTENT_SUBMITTED, "Revised content submitted", `A revised draft has been submitted for ${offer.campaign.title}`, { offerId, submissionId: submission.id });
    return submission;
};
exports.submitContent = submitContent;
const requestRevision = async (userId, submissionId, revisionNote) => {
    const submission = await ensureHirerSubmissionAccess(userId, submissionId);
    (0, workflow_1.ensureContentActionAllowed)(submission.status, "request-revision");
    if (submission.revisionNumber > submission.offer.revisionLimit) {
        throw new app_error_1.AppError("The revision limit has already been reached for this offer", 409);
    }
    const updatedSubmission = await prisma_client_1.default.contentSubmission.update({
        where: { id: submissionId },
        data: {
            status: client_1.ContentSubmissionStatus.REVISION_REQUESTED,
            revisionNote,
        },
    });
    const influencer = await prisma_client_1.default.influencerProfile.findUniqueOrThrow({
        where: { id: submission.offer.influencerProfileId },
        include: { user: true },
    });
    await (0, notification_service_1.createNotifications)([influencer.user.id], client_1.NotificationType.REVISION_REQUESTED, "Revision requested", `A revision was requested for ${submission.offer.campaign.title}`, { offerId: submission.offerId, submissionId });
    return updatedSubmission;
};
exports.requestRevision = requestRevision;
const approveSubmission = async (userId, submissionId) => {
    const submission = await ensureHirerSubmissionAccess(userId, submissionId);
    (0, workflow_1.ensureContentActionAllowed)(submission.status, "approve");
    const updatedSubmission = await prisma_client_1.default.contentSubmission.update({
        where: { id: submissionId },
        data: {
            status: client_1.ContentSubmissionStatus.APPROVED,
            approvedAt: new Date(),
        },
    });
    const influencer = await prisma_client_1.default.influencerProfile.findUniqueOrThrow({
        where: { id: submission.offer.influencerProfileId },
        include: { user: true },
    });
    await (0, notification_service_1.createNotifications)([influencer.user.id], client_1.NotificationType.CONTENT_APPROVED, "Content approved", `Your draft for ${submission.offer.campaign.title} was approved`, { offerId: submission.offerId, submissionId });
    return updatedSubmission;
};
exports.approveSubmission = approveSubmission;
const confirmPublish = async (userId, submissionId, publishedUrl) => {
    const submission = await prisma_client_1.default.contentSubmission.findFirst({
        where: {
            id: submissionId,
            offer: {
                influencerProfile: {
                    userId,
                },
            },
        },
        include: {
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
        },
    });
    if (!submission) {
        throw new app_error_1.AppError("Content submission not found", 404);
    }
    if (submission.status !== client_1.ContentSubmissionStatus.APPROVED) {
        throw new app_error_1.AppError("Only approved content can be marked as published", 409);
    }
    const updatedSubmission = await prisma_client_1.default.contentSubmission.update({
        where: { id: submissionId },
        data: {
            publishedUrl,
            publishedAt: new Date(),
        },
    });
    await (0, campaign_progress_1.syncCampaignCompletionStatus)(submission.offer.campaignId);
    await (0, notification_service_1.createNotifications)([submission.offer.campaign.hirer.user.id], client_1.NotificationType.CONTENT_APPROVED, "Content published", `Published content is live for ${submission.offer.campaign.title}`, { offerId: submission.offerId, submissionId });
    return updatedSubmission;
};
exports.confirmPublish = confirmPublish;
