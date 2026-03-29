"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scalarDocsHandler = exports.openApiJsonHandler = exports.getOpenApiDocument = void 0;
const express_api_reference_1 = require("@scalar/express-api-reference");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const env_1 = require("../config/env");
const application_schemas_1 = require("../modules/applications/application.schemas");
const auth_schemas_1 = require("../modules/auth/auth.schemas");
const campaign_schemas_1 = require("../modules/campaigns/campaign.schemas");
const content_submission_schemas_1 = require("../modules/content-submissions/content-submission.schemas");
const hirer_schemas_1 = require("../modules/hirers/hirer.schemas");
const influencer_schemas_1 = require("../modules/influencers/influencer.schemas");
const message_schemas_1 = require("../modules/messages/message.schemas");
const offer_schemas_1 = require("../modules/offers/offer.schemas");
const review_schemas_1 = require("../modules/reviews/review.schemas");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
const registry = new zod_to_openapi_1.OpenAPIRegistry();
const docsOptionalDateSchema = zod_1.z.string().datetime().nullable().optional();
const createCampaignDocsSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().min(10).max(5000),
    platforms: zod_1.z.array(zod_1.z.string()).min(1),
    contentTypes: zod_1.z.array(zod_1.z.string()).min(1),
    niche: zod_1.z.string().max(120).optional().nullable(),
    budgetMin: zod_1.z.number().nonnegative().optional().nullable(),
    budgetMax: zod_1.z.number().nonnegative().optional().nullable(),
    timeline: zod_1.z.string().max(120).optional().nullable(),
    startDate: docsOptionalDateSchema,
    deadlineDate: docsOptionalDateSchema,
    deliverablesCount: zod_1.z.number().int().positive().optional(),
    languages: zod_1.z.array(zod_1.z.string().min(1).max(60)).default([]),
    minFollowers: zod_1.z.number().int().nonnegative().optional().nullable(),
    targetCities: zod_1.z.array(zod_1.z.string().min(1).max(120)).default([]),
    targetGender: zod_1.z.string().max(30).optional().nullable(),
    visibility: zod_1.z.string().optional(),
    briefUrl: zod_1.z.string().url().optional().nullable(),
    briefText: zod_1.z.string().max(10000).optional().nullable(),
});
const updateCampaignDocsSchema = createCampaignDocsSchema.partial();
const campaignFilterDocsSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional(),
    platform: zod_1.z.string().optional(),
    contentType: zod_1.z.string().optional(),
    niche: zod_1.z.string().optional(),
    minBudget: zod_1.z.number().nonnegative().optional(),
    maxBudget: zod_1.z.number().nonnegative().optional(),
    language: zod_1.z.string().optional(),
    minFollowers: zod_1.z.number().int().nonnegative().optional(),
    city: zod_1.z.string().optional(),
    targetGender: zod_1.z.string().optional(),
    visibility: zod_1.z.string().optional(),
});
const anyObjectSchema = registry.register("AnyObject", zod_1.z.object({}).passthrough());
const paginationSchema = registry.register("Pagination", zod_1.z.object({
    page: zod_1.z.number().int().positive().openapi({ example: 1 }),
    limit: zod_1.z.number().int().positive().openapi({ example: 10 }),
    total: zod_1.z.number().int().nonnegative().openapi({ example: 1 }),
    pages: zod_1.z.number().int().positive().openapi({ example: 1 }),
}));
const errorEnvelopeSchema = registry.register("ErrorEnvelope", zod_1.z.object({
    success: zod_1.z.literal(false),
    message: zod_1.z.string(),
    errors: anyObjectSchema.nullable(),
}));
const validationErrorDetailsSchema = registry.register("ValidationErrorDetails", zod_1.z.object({
    formErrors: zod_1.z.array(zod_1.z.string()),
    fieldErrors: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())),
}));
const authUserSchema = registry.register("AuthUser", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    role: zod_1.z.nativeEnum(client_1.Role),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email().nullable(),
    isVerified: zod_1.z.boolean(),
    profileId: zod_1.z.string().uuid().nullable(),
    profileCompleted: zod_1.z.boolean(),
}));
const authResponseDataSchema = registry.register("AuthResponseData", zod_1.z.object({
    token: zod_1.z.string(),
    user: authUserSchema,
}));
const currentUserDataSchema = registry.register("CurrentUserData", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    role: zod_1.z.nativeEnum(client_1.Role),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email().nullable(),
    isVerified: zod_1.z.boolean(),
    profileId: zod_1.z.string().uuid().nullable(),
    profileCompleted: zod_1.z.boolean(),
    hirerProfile: anyObjectSchema.nullable(),
    influencerProfile: anyObjectSchema.nullable(),
}));
const hirerProfileSchema = registry.register("HirerProfile", zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    companyName: zod_1.z.string(),
    logoUrl: zod_1.z.string().nullable().optional(),
    industry: zod_1.z.string().nullable().optional(),
    website: zod_1.z.string().nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    gstNumber: zod_1.z.string().nullable().optional(),
    city: zod_1.z.string().nullable().optional(),
    state: zod_1.z.string().nullable().optional(),
}));
const socialAccountSchema = registry.register("SocialAccount", zod_1.z.object({
    platform: zod_1.z.string(),
    handle: zod_1.z.string(),
    profileUrl: zod_1.z.string().nullable().optional(),
    followerCount: zod_1.z.number().int(),
    engagementRate: zod_1.z.number().nullable().optional(),
    isVerified: zod_1.z.boolean(),
}));
const rateCardSchema = registry.register("RateCard", zod_1.z.object({
    platform: zod_1.z.string(),
    contentType: zod_1.z.string(),
    priceInr: zod_1.z.number(),
}));
const influencerProfileSchema = registry.register("InfluencerProfile", zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    displayName: zod_1.z.string(),
    avatarUrl: zod_1.z.string().nullable().optional(),
    bio: zod_1.z.string().nullable().optional(),
    city: zod_1.z.string().nullable().optional(),
    state: zod_1.z.string().nullable().optional(),
    languages: zod_1.z.array(zod_1.z.string()),
    niches: zod_1.z.array(zod_1.z.string()),
    gender: zod_1.z.string().nullable().optional(),
    isAvailable: zod_1.z.boolean().optional(),
    socialAccounts: zod_1.z.array(socialAccountSchema).optional(),
    ratecards: zod_1.z.array(rateCardSchema).optional(),
}));
const campaignSchema = registry.register("Campaign", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    platforms: zod_1.z.array(zod_1.z.string()),
    contentTypes: zod_1.z.array(zod_1.z.string()),
    niche: zod_1.z.string().nullable(),
    budgetMin: zod_1.z.number().nullable(),
    budgetMax: zod_1.z.number().nullable(),
    timeline: zod_1.z.string().nullable(),
    deliverablesCount: zod_1.z.number().int(),
    languages: zod_1.z.array(zod_1.z.string()),
    minFollowers: zod_1.z.number().nullable(),
    targetCities: zod_1.z.array(zod_1.z.string()),
    targetGender: zod_1.z.string().nullable(),
    visibility: zod_1.z.string(),
    status: zod_1.z.string(),
    briefUrl: zod_1.z.string().nullable(),
    briefText: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string().datetime().optional(),
    updatedAt: zod_1.z.string().datetime().optional(),
}));
const paginatedCampaignsSchema = registry.register("PaginatedCampaigns", zod_1.z.object({
    items: zod_1.z.array(campaignSchema),
    pagination: paginationSchema,
}));
const applicationSchema = registry.register("Application", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    campaignId: zod_1.z.string().uuid(),
    influencerProfileId: zod_1.z.string().uuid(),
    pitchNote: zod_1.z.string().nullable(),
    proposedRate: zod_1.z.number().nullable(),
    status: zod_1.z.string(),
}));
const offerSchema = registry.register("Offer", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    campaignId: zod_1.z.string().uuid(),
    applicationId: zod_1.z.string().uuid().nullable(),
    influencerProfileId: zod_1.z.string().uuid(),
    agreedRate: zod_1.z.number(),
    deliverables: zod_1.z.string(),
    contentDeadline: zod_1.z.string().datetime(),
    paymentTerms: zod_1.z.string().nullable(),
    revisionLimit: zod_1.z.number().int(),
    status: zod_1.z.string(),
    counterRate: zod_1.z.number().nullable().optional(),
    counterNote: zod_1.z.string().nullable().optional(),
}));
const contentSubmissionSchema = registry.register("ContentSubmission", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    offerId: zod_1.z.string().uuid(),
    submissionUrl: zod_1.z.string().url(),
    note: zod_1.z.string().nullable(),
    revisionNumber: zod_1.z.number().int(),
    status: zod_1.z.string(),
    revisionNote: zod_1.z.string().nullable(),
    publishedUrl: zod_1.z.string().nullable(),
}));
const paymentSchema = registry.register("Payment", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    offerId: zod_1.z.string().uuid(),
    amountInr: zod_1.z.number(),
    platformFeeInr: zod_1.z.number(),
    influencerPayout: zod_1.z.number(),
    status: zod_1.z.string(),
    razorpayOrderId: zod_1.z.string().nullable().optional(),
    razorpayPaymentId: zod_1.z.string().nullable().optional(),
}));
const reviewSchema = registry.register("Review", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    offerId: zod_1.z.string().uuid(),
    reviewTarget: zod_1.z.nativeEnum(client_1.ReviewTarget),
    rating: zod_1.z.number(),
    comment: zod_1.z.string().nullable(),
    communicationRating: zod_1.z.number().nullable().optional(),
    qualityRating: zod_1.z.number().nullable().optional(),
    timelinessRating: zod_1.z.number().nullable().optional(),
    paymentRating: zod_1.z.number().nullable().optional(),
}));
const notificationSchema = registry.register("Notification", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: zod_1.z.string(),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    isRead: zod_1.z.boolean(),
    metadata: anyObjectSchema.nullable().optional(),
    createdAt: zod_1.z.string().datetime().optional(),
}));
const messageSchema = registry.register("Message", zod_1.z.object({
    id: zod_1.z.string().uuid(),
    conversationId: zod_1.z.string().uuid().optional(),
    senderId: zod_1.z.string().uuid().optional(),
    content: zod_1.z.string(),
    attachmentUrl: zod_1.z.string().nullable().optional(),
    isRead: zod_1.z.boolean().optional(),
    createdAt: zod_1.z.string().datetime().optional(),
}));
const historyCampaignSchema = registry.register("HistoryCampaign", zod_1.z.object({
    items: zod_1.z.array(campaignSchema),
    pagination: paginationSchema,
}));
const historyOfferSchema = registry.register("HistoryOffer", zod_1.z.object({
    items: zod_1.z.array(offerSchema),
    pagination: paginationSchema,
}));
const healthSchema = registry.register("HealthResponse", zod_1.z.object({
    status: zod_1.z.literal("ok"),
    service: zod_1.z.string(),
    timestamp: zod_1.z.string().datetime(),
}));
registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});
const paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional(),
});
const notificationIdParamSchema = zod_1.z.object({
    notificationId: zod_1.z.string().uuid(),
});
const authExample = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
    user: {
        id: "9fc4d9f1-0e77-47e8-ae2a-4d42d9be9800",
        role: "HIRER",
        phone: "9876543210",
        email: "brand@example.com",
        isVerified: true,
        profileId: null,
        profileCompleted: false,
    },
};
const currentUserExample = {
    id: "9fc4d9f1-0e77-47e8-ae2a-4d42d9be9800",
    role: "HIRER",
    phone: "9876543210",
    email: "brand@example.com",
    isVerified: true,
    profileId: "0b6d1e76-e825-44ea-b3f5-27d65c7000f4",
    profileCompleted: true,
    hirerProfile: {
        id: "0b6d1e76-e825-44ea-b3f5-27d65c7000f4",
        companyName: "Nova Brands",
    },
    influencerProfile: null,
};
const hirerProfileExample = {
    id: "0b6d1e76-e825-44ea-b3f5-27d65c7000f4",
    companyName: "Nova Brands",
    logoUrl: "https://cdn.example.com/logo.png",
    industry: "Fashion",
    website: "https://novabrands.example.com",
    description: "Performance-focused influencer campaigns",
    gstNumber: "29ABCDE1234F1Z5",
    city: "Bengaluru",
    state: "Karnataka",
};
const influencerProfileExample = {
    id: "ca90cd41-5a24-49b1-b1d5-2f5d5b30c528",
    displayName: "Aanya Creates",
    avatarUrl: "https://cdn.example.com/aanya.png",
    bio: "Beauty and lifestyle creator",
    city: "Mumbai",
    state: "Maharashtra",
    languages: ["English", "Hindi"],
    niches: ["Beauty", "Lifestyle"],
    gender: "Female",
    isAvailable: true,
    socialAccounts: [
        {
            platform: "INSTAGRAM",
            handle: "@aanyacreates",
            profileUrl: "https://instagram.com/aanyacreates",
            followerCount: 250000,
            engagementRate: 4.5,
            isVerified: false,
        },
    ],
    ratecards: [
        {
            platform: "INSTAGRAM",
            contentType: "REEL",
            priceInr: 25000,
        },
    ],
};
const campaignExample = {
    id: "59fba90a-f9e0-4ea2-9b90-b7a6cb7e0f6c",
    title: "Summer Glow Campaign",
    description: "Looking for beauty creators for a reel + story package.",
    platforms: ["INSTAGRAM"],
    contentTypes: ["REEL", "STORY"],
    niche: "Beauty",
    budgetMin: 15000,
    budgetMax: 40000,
    timeline: "2 weeks",
    deliverablesCount: 2,
    languages: ["English", "Hindi"],
    minFollowers: 50000,
    targetCities: ["Mumbai", "Delhi"],
    targetGender: "Female",
    visibility: "PUBLIC",
    status: "OPEN",
    briefUrl: "https://cdn.example.com/briefs/summer-glow.pdf",
    briefText: "UGC-focused campaign for beauty creators",
};
const paginatedCampaignExample = {
    items: [campaignExample],
    pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
    },
};
const applicationExample = {
    id: "c2292bdc-e8c0-4427-b624-a63195c17d9a",
    campaignId: campaignExample.id,
    influencerProfileId: influencerProfileExample.id,
    pitchNote: "I can deliver this within five days.",
    proposedRate: 22000,
    status: "PENDING",
};
const offerExample = {
    id: "89ffb40e-89e0-4624-bdb1-2dfb3a516ebe",
    campaignId: campaignExample.id,
    applicationId: applicationExample.id,
    influencerProfileId: influencerProfileExample.id,
    agreedRate: 25000,
    deliverables: "1 Reel + 2 Stories",
    contentDeadline: "2026-04-15T12:00:00.000Z",
    paymentTerms: "Release after publish confirmation",
    revisionLimit: 2,
    status: "PENDING",
    counterRate: null,
    counterNote: null,
};
const contentSubmissionExample = {
    id: "62696d82-e8cb-4530-9d9f-1f62d65f5a97",
    offerId: offerExample.id,
    submissionUrl: "https://drive.example.com/file/draft-1",
    note: "Draft 1 for review",
    revisionNumber: 1,
    status: "SUBMITTED",
    revisionNote: null,
    publishedUrl: null,
};
const paymentExample = {
    id: "d4dfb03c-9144-4d79-acc3-c14e0bc69b79",
    offerId: offerExample.id,
    amountInr: 25000,
    platformFeeInr: 2500,
    influencerPayout: 22500,
    status: "IN_ESCROW",
    razorpayOrderId: "escrow:89ffb40e-89e0-4624-bdb1-2dfb3a516ebe:123456",
    razorpayPaymentId: null,
};
const reviewExample = {
    id: "3521dc5f-8d6d-4a85-9fea-fe1ee5398610",
    offerId: offerExample.id,
    reviewTarget: "INFLUENCER",
    rating: 4.8,
    comment: "Smooth collaboration and good turnaround.",
    communicationRating: 5,
    qualityRating: 5,
    timelinessRating: 4,
    paymentRating: null,
};
const notificationExample = {
    id: "3c3649cf-63d6-4862-8858-9d77f18bb095",
    type: "OFFER_SENT",
    title: "New offer received",
    body: "Summer Glow Campaign has sent you an offer",
    isRead: false,
    metadata: {
        offerId: offerExample.id,
    },
    createdAt: "2026-03-19T08:30:00.000Z",
};
const messageExample = {
    id: "252e8912-5503-4fd5-9986-4f9855db4a40",
    conversationId: "5db4ae6e-9030-4f81-8f36-1454f4235a7d",
    senderId: currentUserExample.id,
    content: "Can you share the first draft by Friday?",
    attachmentUrl: null,
    isRead: false,
    createdAt: "2026-03-19T08:35:00.000Z",
};
const historyCampaignExample = {
    items: [campaignExample],
    pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
    },
};
const historyOfferExample = {
    items: [offerExample],
    pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
    },
};
const validationErrorExample = {
    success: false,
    message: "Validation failed",
    errors: {
        formErrors: [],
        fieldErrors: {
            password: ["Too small: expected string to have >=8 characters"],
        },
    },
};
const unauthorizedExample = {
    success: false,
    message: "Authentication token is required",
    errors: null,
};
const forbiddenExample = {
    success: false,
    message: "You do not have permission for this action",
    errors: null,
};
const notFoundExample = {
    success: false,
    message: "Requested record was not found",
    errors: null,
};
const conflictExample = {
    success: false,
    message: "A unique field already exists",
    errors: {
        target: ["phone"],
    },
};
const serverErrorExample = {
    success: false,
    message: "Unexpected server error",
    errors: null,
};
const successEnvelope = (dataSchema = anyObjectSchema) => zod_1.z.object({
    success: zod_1.z.literal(true),
    message: zod_1.z.string(),
    data: dataSchema,
});
const errorResponses = {
    "401": {
        description: "Authentication error",
        content: {
            "application/json": {
                schema: errorEnvelopeSchema,
                example: unauthorizedExample,
            },
        },
    },
    "403": {
        description: "Authorization error",
        content: {
            "application/json": {
                schema: errorEnvelopeSchema,
                example: forbiddenExample,
            },
        },
    },
    "404": {
        description: "Resource not found",
        content: {
            "application/json": {
                schema: errorEnvelopeSchema,
                example: notFoundExample,
            },
        },
    },
    "409": {
        description: "Conflict response",
        content: {
            "application/json": {
                schema: errorEnvelopeSchema,
                example: conflictExample,
            },
        },
    },
    "422": {
        description: "Validation error",
        content: {
            "application/json": {
                schema: errorEnvelopeSchema.extend({
                    errors: validationErrorDetailsSchema,
                }),
                example: validationErrorExample,
            },
        },
    },
    "500": {
        description: "Unexpected server error",
        content: {
            "application/json": {
                schema: errorEnvelopeSchema,
                example: serverErrorExample,
            },
        },
    },
};
const jsonBody = (schema, required = true) => ({
    required,
    content: {
        "application/json": {
            schema,
        },
    },
});
const registerApiPath = (config) => {
    const successStatusCode = String(config.success.statusCode ?? 200);
    registry.registerPath({
        method: config.method,
        path: config.path,
        tags: config.tags,
        summary: config.summary,
        description: config.description,
        security: config.auth ? [{ BearerAuth: [] }] : undefined,
        request: config.request,
        responses: {
            [successStatusCode]: {
                description: config.success.description,
                content: {
                    "application/json": {
                        schema: successEnvelope(config.success.schema ?? anyObjectSchema),
                        example: {
                            success: true,
                            message: config.success.message,
                            data: config.success.example,
                        },
                    },
                },
            },
            ...Object.fromEntries((config.errors ?? []).map((statusCode) => [
                statusCode,
                errorResponses[statusCode],
            ])),
        },
    });
};
registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["System"],
    summary: "Health check",
    responses: {
        "200": {
            description: "Service health",
            content: {
                "application/json": {
                    schema: healthSchema,
                    example: {
                        status: "ok",
                        service: "influencer-marketplace-api",
                        timestamp: "2026-03-19T08:30:00.000Z",
                    },
                },
            },
        },
    },
});
const apiDocs = [
    {
        method: "post",
        path: "/api/auth/register",
        tags: ["Auth"],
        summary: "Register a user",
        request: { body: jsonBody(auth_schemas_1.registerSchema) },
        success: {
            statusCode: 201,
            description: "Registration response",
            message: "Registration successful",
            schema: authResponseDataSchema,
            example: authExample,
        },
        errors: ["409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/auth/login",
        tags: ["Auth"],
        summary: "Log in with phone or email",
        request: { body: jsonBody(auth_schemas_1.loginSchema) },
        success: {
            description: "Login response",
            message: "Login successful",
            schema: authResponseDataSchema,
            example: authExample,
        },
        errors: ["401", "403", "422", "500"],
    },
    {
        method: "get",
        path: "/api/auth/me",
        tags: ["Auth"],
        summary: "Get current user",
        auth: true,
        success: {
            description: "Current user details",
            message: "Current user fetched",
            schema: currentUserDataSchema,
            example: currentUserExample,
        },
        errors: ["401", "404", "500"],
    },
    {
        method: "get",
        path: "/api/hirers/me/profile",
        tags: ["Hirers"],
        summary: "Get hirer profile",
        auth: true,
        success: {
            description: "Hirer profile",
            message: "Hirer profile fetched",
            schema: hirerProfileSchema.nullable(),
            example: hirerProfileExample,
        },
        errors: ["401", "403", "500"],
    },
    {
        method: "put",
        path: "/api/hirers/me/profile",
        tags: ["Hirers"],
        summary: "Create or update hirer profile",
        auth: true,
        request: { body: jsonBody(hirer_schemas_1.upsertHirerProfileSchema) },
        success: {
            description: "Saved hirer profile",
            message: "Hirer profile saved",
            schema: hirerProfileSchema,
            example: hirerProfileExample,
        },
        errors: ["401", "403", "422", "500"],
    },
    {
        method: "get",
        path: "/api/influencers/me/profile",
        tags: ["Influencers"],
        summary: "Get influencer profile",
        auth: true,
        success: {
            description: "Influencer profile",
            message: "Influencer profile fetched",
            schema: influencerProfileSchema.nullable(),
            example: influencerProfileExample,
        },
        errors: ["401", "403", "500"],
    },
    {
        method: "put",
        path: "/api/influencers/me/profile",
        tags: ["Influencers"],
        summary: "Create or update influencer profile",
        auth: true,
        request: { body: jsonBody(influencer_schemas_1.upsertInfluencerProfileSchema) },
        success: {
            description: "Saved influencer profile",
            message: "Influencer profile saved",
            schema: influencerProfileSchema,
            example: influencerProfileExample,
        },
        errors: ["401", "403", "422", "500"],
    },
    {
        method: "put",
        path: "/api/influencers/me/social-accounts",
        tags: ["Influencers"],
        summary: "Replace social accounts",
        auth: true,
        request: { body: jsonBody(influencer_schemas_1.replaceSocialAccountsSchema) },
        success: {
            description: "Saved social accounts",
            message: "Social accounts saved",
            schema: zod_1.z.array(socialAccountSchema),
            example: influencerProfileExample.socialAccounts,
        },
        errors: ["401", "403", "409", "422", "500"],
    },
    {
        method: "put",
        path: "/api/influencers/me/ratecards",
        tags: ["Influencers"],
        summary: "Replace rate cards",
        auth: true,
        request: { body: jsonBody(influencer_schemas_1.replaceRateCardsSchema) },
        success: {
            description: "Saved rate cards",
            message: "Rate cards saved",
            schema: zod_1.z.array(rateCardSchema),
            example: influencerProfileExample.ratecards,
        },
        errors: ["401", "403", "409", "422", "500"],
    },
    {
        method: "get",
        path: "/api/influencers/me/earnings-history",
        tags: ["Influencers"],
        summary: "Get influencer earnings history",
        auth: true,
        request: { query: paginationQuerySchema },
        success: {
            description: "Paginated earnings history",
            message: "Earnings history fetched",
            schema: historyOfferSchema,
            example: historyOfferExample,
        },
        errors: ["401", "403", "409", "500"],
    },
    {
        method: "get",
        path: "/api/campaigns",
        tags: ["Campaigns"],
        summary: "Browse campaigns",
        auth: true,
        request: { query: campaignFilterDocsSchema },
        success: {
            description: "Paginated campaigns",
            message: "Campaigns fetched",
            schema: paginatedCampaignsSchema,
            example: paginatedCampaignExample,
        },
        errors: ["401", "500"],
    },
    {
        method: "get",
        path: "/api/campaigns/my",
        tags: ["Campaigns"],
        summary: "List campaigns created by the current hirer",
        auth: true,
        success: {
            description: "Paginated hirer campaigns",
            message: "Campaigns fetched",
            schema: paginatedCampaignsSchema,
            example: paginatedCampaignExample,
        },
        errors: ["401", "403", "409", "500"],
    },
    {
        method: "get",
        path: "/api/campaigns/{campaignId}",
        tags: ["Campaigns"],
        summary: "Get a campaign by id",
        auth: true,
        request: { params: campaign_schemas_1.campaignIdParamSchema },
        success: {
            description: "Campaign details",
            message: "Campaign fetched",
            schema: campaignSchema,
            example: campaignExample,
        },
        errors: ["401", "403", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/campaigns",
        tags: ["Campaigns"],
        summary: "Create a campaign",
        auth: true,
        request: { body: jsonBody(createCampaignDocsSchema) },
        success: {
            statusCode: 201,
            description: "Created campaign",
            message: "Campaign created",
            schema: campaignSchema,
            example: campaignExample,
        },
        errors: ["401", "403", "409", "422", "500"],
    },
    {
        method: "patch",
        path: "/api/campaigns/{campaignId}",
        tags: ["Campaigns"],
        summary: "Update a campaign",
        auth: true,
        request: {
            params: campaign_schemas_1.campaignIdParamSchema,
            body: jsonBody(updateCampaignDocsSchema),
        },
        success: {
            description: "Updated campaign",
            message: "Campaign updated",
            schema: campaignSchema,
            example: campaignExample,
        },
        errors: ["401", "403", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/campaigns/{campaignId}/open",
        tags: ["Campaigns"],
        summary: "Open a campaign",
        auth: true,
        request: { params: campaign_schemas_1.campaignIdParamSchema },
        success: {
            description: "Opened campaign",
            message: "Campaign opened",
            schema: campaignSchema,
            example: {
                ...campaignExample,
                status: "OPEN",
            },
        },
        errors: ["401", "403", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/campaigns/{campaignId}/close",
        tags: ["Campaigns"],
        summary: "Close a campaign",
        auth: true,
        request: { params: campaign_schemas_1.campaignIdParamSchema },
        success: {
            description: "Closed campaign",
            message: "Campaign closed",
            schema: campaignSchema,
            example: {
                ...campaignExample,
                status: "CLOSED",
            },
        },
        errors: ["401", "403", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/campaigns/{campaignId}/applications",
        tags: ["Applications"],
        summary: "Apply to a campaign",
        auth: true,
        request: {
            params: campaign_schemas_1.campaignIdParamSchema,
            body: jsonBody(application_schemas_1.createApplicationSchema),
        },
        success: {
            statusCode: 201,
            description: "Created application",
            message: "Application submitted",
            schema: applicationSchema,
            example: applicationExample,
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "get",
        path: "/api/campaigns/{campaignId}/applications",
        tags: ["Applications"],
        summary: "List campaign applications",
        auth: true,
        request: { params: campaign_schemas_1.campaignIdParamSchema },
        success: {
            description: "Campaign applications",
            message: "Applications fetched",
            schema: zod_1.z.array(applicationSchema),
            example: [applicationExample],
        },
        errors: ["401", "403", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/applications/{applicationId}/shortlist",
        tags: ["Applications"],
        summary: "Shortlist an application",
        auth: true,
        request: { params: application_schemas_1.applicationIdParamSchema },
        success: {
            description: "Shortlisted application",
            message: "Application shortlisted",
            schema: applicationSchema,
            example: {
                ...applicationExample,
                status: "SHORTLISTED",
            },
        },
        errors: ["401", "403", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/applications/{applicationId}/reject",
        tags: ["Applications"],
        summary: "Reject an application",
        auth: true,
        request: { params: application_schemas_1.applicationIdParamSchema },
        success: {
            description: "Rejected application",
            message: "Application rejected",
            schema: applicationSchema,
            example: {
                ...applicationExample,
                status: "REJECTED",
            },
        },
        errors: ["401", "403", "404", "422", "500"],
    },
    {
        method: "get",
        path: "/api/offers/my",
        tags: ["Offers"],
        summary: "List offers for the current user",
        auth: true,
        success: {
            description: "Offers list",
            message: "Offers fetched",
            schema: zod_1.z.array(offerSchema),
            example: [offerExample],
        },
        errors: ["401", "500"],
    },
    {
        method: "get",
        path: "/api/offers/{offerId}",
        tags: ["Offers"],
        summary: "Get an offer by id",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Offer details",
            message: "Offer fetched",
            schema: offerSchema,
            example: offerExample,
        },
        errors: ["401", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers",
        tags: ["Offers"],
        summary: "Create an offer",
        auth: true,
        request: { body: jsonBody(offer_schemas_1.createOfferSchema) },
        success: {
            statusCode: 201,
            description: "Created offer",
            message: "Offer created",
            schema: offerSchema,
            example: offerExample,
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/accept",
        tags: ["Offers"],
        summary: "Accept an offer",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Accepted offer",
            message: "Offer accepted",
            schema: offerSchema,
            example: {
                ...offerExample,
                status: "ACCEPTED",
            },
        },
        errors: ["401", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/decline",
        tags: ["Offers"],
        summary: "Decline an offer",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Declined offer",
            message: "Offer declined",
            schema: offerSchema,
            example: {
                ...offerExample,
                status: "DECLINED",
            },
        },
        errors: ["401", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/counter",
        tags: ["Offers"],
        summary: "Counter an offer",
        auth: true,
        request: {
            params: offer_schemas_1.offerIdParamSchema,
            body: jsonBody(offer_schemas_1.counterOfferSchema),
        },
        success: {
            description: "Countered offer",
            message: "Offer countered",
            schema: offerSchema,
            example: {
                ...offerExample,
                status: "COUNTERED",
                counterRate: 28000,
                counterNote: "Can do this at 28k with 2 revisions.",
            },
        },
        errors: ["401", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/revise",
        tags: ["Offers"],
        summary: "Revise an offer after a counter",
        auth: true,
        request: {
            params: offer_schemas_1.offerIdParamSchema,
            body: jsonBody(offer_schemas_1.reviseOfferSchema),
        },
        success: {
            description: "Revised offer",
            message: "Offer revised",
            schema: offerSchema,
            example: offerExample,
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/expire",
        tags: ["Offers"],
        summary: "Expire an offer",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Expired offer",
            message: "Offer expired",
            schema: offerSchema,
            example: {
                ...offerExample,
                status: "EXPIRED",
            },
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "get",
        path: "/api/conversations/{offerId}/messages",
        tags: ["Messages"],
        summary: "List conversation messages for an offer",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Conversation messages",
            message: "Messages fetched",
            schema: zod_1.z.array(messageSchema),
            example: [messageExample],
        },
        errors: ["401", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/conversations/{offerId}/messages",
        tags: ["Messages"],
        summary: "Send a conversation message",
        auth: true,
        request: {
            params: offer_schemas_1.offerIdParamSchema,
            body: jsonBody(message_schemas_1.sendMessageSchema),
        },
        success: {
            statusCode: 201,
            description: "Created message",
            message: "Message sent",
            schema: messageSchema,
            example: messageExample,
        },
        errors: ["401", "404", "422", "500"],
    },
    {
        method: "get",
        path: "/api/offers/{offerId}/content-submissions",
        tags: ["Content"],
        summary: "List content submissions for an offer",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Content submissions",
            message: "Content submissions fetched",
            schema: zod_1.z.array(contentSubmissionSchema),
            example: [contentSubmissionExample],
        },
        errors: ["401", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/content-submissions",
        tags: ["Content"],
        summary: "Submit content for an offer",
        auth: true,
        request: {
            params: offer_schemas_1.offerIdParamSchema,
            body: jsonBody(content_submission_schemas_1.submitContentSchema),
        },
        success: {
            statusCode: 201,
            description: "Created content submission",
            message: "Content submitted",
            schema: contentSubmissionSchema,
            example: contentSubmissionExample,
        },
        errors: ["401", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/content-submissions/{submissionId}/request-revision",
        tags: ["Content"],
        summary: "Request a revision",
        auth: true,
        request: {
            params: content_submission_schemas_1.submissionIdParamSchema,
            body: jsonBody(content_submission_schemas_1.requestRevisionSchema),
        },
        success: {
            description: "Revision requested",
            message: "Revision requested",
            schema: contentSubmissionSchema,
            example: {
                ...contentSubmissionExample,
                status: "REVISION_REQUESTED",
                revisionNote: "Please tighten the opening hook.",
            },
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/content-submissions/{submissionId}/approve",
        tags: ["Content"],
        summary: "Approve a submission",
        auth: true,
        request: { params: content_submission_schemas_1.submissionIdParamSchema },
        success: {
            description: "Approved content submission",
            message: "Content approved",
            schema: contentSubmissionSchema,
            example: {
                ...contentSubmissionExample,
                status: "APPROVED",
            },
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/content-submissions/{submissionId}/publish",
        tags: ["Content"],
        summary: "Confirm published content",
        auth: true,
        request: {
            params: content_submission_schemas_1.submissionIdParamSchema,
            body: jsonBody(content_submission_schemas_1.publishConfirmationSchema),
        },
        success: {
            description: "Publish confirmation",
            message: "Publish confirmation recorded",
            schema: contentSubmissionSchema,
            example: {
                ...contentSubmissionExample,
                status: "APPROVED",
                publishedUrl: "https://instagram.com/p/example-post",
            },
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "get",
        path: "/api/offers/{offerId}/payment",
        tags: ["Payments"],
        summary: "Get payment details for an offer",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Payment details",
            message: "Payment fetched",
            schema: paymentSchema,
            example: paymentExample,
        },
        errors: ["401", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/payment/escrow",
        tags: ["Payments"],
        summary: "Move payment into escrow",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Escrow-locked payment",
            message: "Payment moved to escrow",
            schema: paymentSchema,
            example: paymentExample,
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/payment/release",
        tags: ["Payments"],
        summary: "Release a payment",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Released payment",
            message: "Payment released",
            schema: paymentSchema,
            example: {
                ...paymentExample,
                status: "RELEASED",
            },
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/payment/refund",
        tags: ["Payments"],
        summary: "Refund a payment",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Refunded payment",
            message: "Payment refunded",
            schema: paymentSchema,
            example: {
                ...paymentExample,
                status: "REFUNDED",
            },
        },
        errors: ["401", "403", "404", "409", "422", "500"],
    },
    {
        method: "get",
        path: "/api/offers/{offerId}/reviews",
        tags: ["Reviews"],
        summary: "List reviews for an offer",
        auth: true,
        request: { params: offer_schemas_1.offerIdParamSchema },
        success: {
            description: "Offer reviews",
            message: "Reviews fetched",
            schema: zod_1.z.array(reviewSchema),
            example: [reviewExample],
        },
        errors: ["401", "404", "422", "500"],
    },
    {
        method: "post",
        path: "/api/offers/{offerId}/reviews",
        tags: ["Reviews"],
        summary: "Create a review for an offer",
        auth: true,
        request: {
            params: offer_schemas_1.offerIdParamSchema,
            body: jsonBody(review_schemas_1.createReviewSchema),
        },
        success: {
            statusCode: 201,
            description: "Created review",
            message: "Review created",
            schema: reviewSchema,
            example: reviewExample,
        },
        errors: ["401", "404", "409", "422", "500"],
    },
    {
        method: "get",
        path: "/api/notifications",
        tags: ["Notifications"],
        summary: "List notifications",
        auth: true,
        success: {
            description: "Notification list",
            message: "Notifications fetched",
            schema: zod_1.z.array(notificationSchema),
            example: [notificationExample],
        },
        errors: ["401", "500"],
    },
    {
        method: "post",
        path: "/api/notifications/{notificationId}/read",
        tags: ["Notifications"],
        summary: "Mark a notification as read",
        auth: true,
        request: { params: notificationIdParamSchema },
        success: {
            description: "Updated notification",
            message: "Notification marked as read",
            schema: notificationSchema,
            example: {
                ...notificationExample,
                isRead: true,
            },
        },
        errors: ["401", "404", "422", "500"],
    },
    {
        method: "get",
        path: "/api/history/hirer/campaigns",
        tags: ["History"],
        summary: "Get hirer campaign archive",
        auth: true,
        request: { query: paginationQuerySchema },
        success: {
            description: "Campaign archive",
            message: "Hirer history fetched",
            schema: historyCampaignSchema,
            example: historyCampaignExample,
        },
        errors: ["401", "403", "409", "500"],
    },
    {
        method: "get",
        path: "/api/history/influencer/earnings",
        tags: ["History"],
        summary: "Get influencer earnings history",
        auth: true,
        request: { query: paginationQuerySchema },
        success: {
            description: "Influencer history",
            message: "Influencer history fetched",
            schema: historyOfferSchema,
            example: historyOfferExample,
        },
        errors: ["401", "403", "409", "500"],
    },
];
apiDocs.forEach(registerApiPath);
const getOpenApiDocument = () => {
    const generator = new zod_to_openapi_1.OpenApiGeneratorV31(registry.definitions, {
        sortComponents: "alphabetically",
    });
    return generator.generateDocument({
        openapi: "3.1.0",
        info: {
            title: "Influencer Marketplace API",
            version: "1.0.0",
            description: "Code-first OpenAPI documentation for the influencer marketplace backend.",
        },
        servers: [
            {
                url: env_1.env.appBaseUrl ?? `http://localhost:${env_1.env.port}`,
                description: env_1.env.appBaseUrl
                    ? "Configured application URL"
                    : "Local development",
            },
        ],
    });
};
exports.getOpenApiDocument = getOpenApiDocument;
const openApiJsonHandler = (_req, res) => {
    res.json((0, exports.getOpenApiDocument)());
};
exports.openApiJsonHandler = openApiJsonHandler;
exports.scalarDocsHandler = (0, express_api_reference_1.apiReference)({
    pageTitle: "Influencer Marketplace API Docs",
    title: "Influencer Marketplace API",
    url: "/openapi.json",
    agent: {
        disabled: true,
    },
});
