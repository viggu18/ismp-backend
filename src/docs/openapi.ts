import { apiReference } from "@scalar/express-api-reference";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  RouteConfig,
  ZodRequestBody,
} from "@asteasolutions/zod-to-openapi";
import { Role, ReviewTarget } from "@prisma/client";
import { RequestHandler } from "express";
import { z, ZodTypeAny } from "zod";

import { env } from "../config/env";
import {
  applicationIdParamSchema,
  createApplicationSchema,
} from "../modules/applications/application.schemas";
import { loginSchema, registerSchema } from "../modules/auth/auth.schemas";
import { campaignIdParamSchema } from "../modules/campaigns/campaign.schemas";
import {
  publishConfirmationSchema,
  requestRevisionSchema,
  submissionIdParamSchema,
  submitContentSchema,
} from "../modules/content-submissions/content-submission.schemas";
import { upsertHirerProfileSchema } from "../modules/hirers/hirer.schemas";
import {
  replaceRateCardsSchema,
  replaceSocialAccountsSchema,
  upsertInfluencerProfileSchema,
} from "../modules/influencers/influencer.schemas";
import { sendMessageSchema } from "../modules/messages/message.schemas";
import {
  counterOfferSchema,
  createOfferSchema,
  offerIdParamSchema,
  reviseOfferSchema,
} from "../modules/offers/offer.schemas";
import { createReviewSchema } from "../modules/reviews/review.schemas";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const docsOptionalDateSchema = z.string().datetime().nullable().optional();
const createCampaignDocsSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  platforms: z.array(z.string()).min(1),
  contentTypes: z.array(z.string()).min(1),
  niche: z.string().max(120).optional().nullable(),
  budgetMin: z.number().nonnegative().optional().nullable(),
  budgetMax: z.number().nonnegative().optional().nullable(),
  timeline: z.string().max(120).optional().nullable(),
  startDate: docsOptionalDateSchema,
  deadlineDate: docsOptionalDateSchema,
  deliverablesCount: z.number().int().positive().optional(),
  languages: z.array(z.string().min(1).max(60)).default([]),
  minFollowers: z.number().int().nonnegative().optional().nullable(),
  targetCities: z.array(z.string().min(1).max(120)).default([]),
  targetGender: z.string().max(30).optional().nullable(),
  visibility: z.string().optional(),
  briefUrl: z.string().url().optional().nullable(),
  briefText: z.string().max(10000).optional().nullable(),
});
const updateCampaignDocsSchema = createCampaignDocsSchema.partial();
const campaignFilterDocsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  platform: z.string().optional(),
  contentType: z.string().optional(),
  niche: z.string().optional(),
  minBudget: z.number().nonnegative().optional(),
  maxBudget: z.number().nonnegative().optional(),
  language: z.string().optional(),
  minFollowers: z.number().int().nonnegative().optional(),
  city: z.string().optional(),
  targetGender: z.string().optional(),
  visibility: z.string().optional(),
});
const anyObjectSchema = registry.register(
  "AnyObject",
  z.object({}).passthrough(),
);
const paginationSchema = registry.register(
  "Pagination",
  z.object({
    page: z.number().int().positive().openapi({ example: 1 }),
    limit: z.number().int().positive().openapi({ example: 10 }),
    total: z.number().int().nonnegative().openapi({ example: 1 }),
    pages: z.number().int().positive().openapi({ example: 1 }),
  }),
);
const errorEnvelopeSchema = registry.register(
  "ErrorEnvelope",
  z.object({
    success: z.literal(false),
    message: z.string(),
    errors: anyObjectSchema.nullable(),
  }),
);
const validationErrorDetailsSchema = registry.register(
  "ValidationErrorDetails",
  z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.string(), z.array(z.string())),
  }),
);
const authUserSchema = registry.register(
  "AuthUser",
  z.object({
    id: z.string().uuid(),
    role: z.nativeEnum(Role),
    phone: z.string(),
    email: z.string().email().nullable(),
    isVerified: z.boolean(),
    profileId: z.string().uuid().nullable(),
    profileCompleted: z.boolean(),
  }),
);
const authResponseDataSchema = registry.register(
  "AuthResponseData",
  z.object({
    token: z.string(),
    user: authUserSchema,
  }),
);
const currentUserDataSchema = registry.register(
  "CurrentUserData",
  z.object({
    id: z.string().uuid(),
    role: z.nativeEnum(Role),
    phone: z.string(),
    email: z.string().email().nullable(),
    isVerified: z.boolean(),
    profileId: z.string().uuid().nullable(),
    profileCompleted: z.boolean(),
    hirerProfile: anyObjectSchema.nullable(),
    influencerProfile: anyObjectSchema.nullable(),
  }),
);
const hirerProfileSchema = registry.register(
  "HirerProfile",
  z.object({
    id: z.string().uuid().optional(),
    companyName: z.string(),
    logoUrl: z.string().nullable().optional(),
    industry: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    gstNumber: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
  }),
);
const socialAccountSchema = registry.register(
  "SocialAccount",
  z.object({
    platform: z.string(),
    handle: z.string(),
    profileUrl: z.string().nullable().optional(),
    followerCount: z.number().int(),
    engagementRate: z.number().nullable().optional(),
    isVerified: z.boolean(),
  }),
);
const rateCardSchema = registry.register(
  "RateCard",
  z.object({
    platform: z.string(),
    contentType: z.string(),
    priceInr: z.number(),
  }),
);
const influencerProfileSchema = registry.register(
  "InfluencerProfile",
  z.object({
    id: z.string().uuid().optional(),
    displayName: z.string(),
    avatarUrl: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    languages: z.array(z.string()),
    niches: z.array(z.string()),
    gender: z.string().nullable().optional(),
    isAvailable: z.boolean().optional(),
    socialAccounts: z.array(socialAccountSchema).optional(),
    ratecards: z.array(rateCardSchema).optional(),
  }),
);
const campaignSchema = registry.register(
  "Campaign",
  z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    platforms: z.array(z.string()),
    contentTypes: z.array(z.string()),
    niche: z.string().nullable(),
    budgetMin: z.number().nullable(),
    budgetMax: z.number().nullable(),
    timeline: z.string().nullable(),
    deliverablesCount: z.number().int(),
    languages: z.array(z.string()),
    minFollowers: z.number().nullable(),
    targetCities: z.array(z.string()),
    targetGender: z.string().nullable(),
    visibility: z.string(),
    status: z.string(),
    briefUrl: z.string().nullable(),
    briefText: z.string().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  }),
);
const paginatedCampaignsSchema = registry.register(
  "PaginatedCampaigns",
  z.object({
    items: z.array(campaignSchema),
    pagination: paginationSchema,
  }),
);
const applicationSchema = registry.register(
  "Application",
  z.object({
    id: z.string().uuid(),
    campaignId: z.string().uuid(),
    influencerProfileId: z.string().uuid(),
    pitchNote: z.string().nullable(),
    proposedRate: z.number().nullable(),
    status: z.string(),
  }),
);
const offerSchema = registry.register(
  "Offer",
  z.object({
    id: z.string().uuid(),
    campaignId: z.string().uuid(),
    applicationId: z.string().uuid().nullable(),
    influencerProfileId: z.string().uuid(),
    agreedRate: z.number(),
    deliverables: z.string(),
    contentDeadline: z.string().datetime(),
    paymentTerms: z.string().nullable(),
    revisionLimit: z.number().int(),
    status: z.string(),
    counterRate: z.number().nullable().optional(),
    counterNote: z.string().nullable().optional(),
  }),
);
const contentSubmissionSchema = registry.register(
  "ContentSubmission",
  z.object({
    id: z.string().uuid(),
    offerId: z.string().uuid(),
    submissionUrl: z.string().url(),
    note: z.string().nullable(),
    revisionNumber: z.number().int(),
    status: z.string(),
    revisionNote: z.string().nullable(),
    publishedUrl: z.string().nullable(),
  }),
);
const paymentSchema = registry.register(
  "Payment",
  z.object({
    id: z.string().uuid(),
    offerId: z.string().uuid(),
    amountInr: z.number(),
    platformFeeInr: z.number(),
    influencerPayout: z.number(),
    status: z.string(),
    razorpayOrderId: z.string().nullable().optional(),
    razorpayPaymentId: z.string().nullable().optional(),
  }),
);
const reviewSchema = registry.register(
  "Review",
  z.object({
    id: z.string().uuid(),
    offerId: z.string().uuid(),
    reviewTarget: z.nativeEnum(ReviewTarget),
    rating: z.number(),
    comment: z.string().nullable(),
    communicationRating: z.number().nullable().optional(),
    qualityRating: z.number().nullable().optional(),
    timelinessRating: z.number().nullable().optional(),
    paymentRating: z.number().nullable().optional(),
  }),
);
const notificationSchema = registry.register(
  "Notification",
  z.object({
    id: z.string().uuid(),
    type: z.string(),
    title: z.string(),
    body: z.string(),
    isRead: z.boolean(),
    metadata: anyObjectSchema.nullable().optional(),
    createdAt: z.string().datetime().optional(),
  }),
);
const messageSchema = registry.register(
  "Message",
  z.object({
    id: z.string().uuid(),
    conversationId: z.string().uuid().optional(),
    senderId: z.string().uuid().optional(),
    content: z.string(),
    attachmentUrl: z.string().nullable().optional(),
    isRead: z.boolean().optional(),
    createdAt: z.string().datetime().optional(),
  }),
);
const historyCampaignSchema = registry.register(
  "HistoryCampaign",
  z.object({
    items: z.array(campaignSchema),
    pagination: paginationSchema,
  }),
);
const historyOfferSchema = registry.register(
  "HistoryOffer",
  z.object({
    items: z.array(offerSchema),
    pagination: paginationSchema,
  }),
);
const healthSchema = registry.register(
  "HealthResponse",
  z.object({
    status: z.literal("ok"),
    service: z.string(),
    timestamp: z.string().datetime(),
  }),
);

registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const paginationQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});
const notificationIdParamSchema = z.object({
  notificationId: z.string().uuid(),
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

type ErrorResponseKey = "401" | "403" | "404" | "409" | "422" | "500";

type ApiDocConfig = {
  method: RouteConfig["method"];
  path: string;
  tags: string[];
  summary: string;
  description?: string;
  request?: RouteConfig["request"];
  success: {
    statusCode?: 200 | 201;
    description: string;
    message: string;
    schema?: ZodTypeAny;
    example: unknown;
  };
  errors?: ErrorResponseKey[];
  auth?: boolean;
};

const successEnvelope = (dataSchema: ZodTypeAny = anyObjectSchema) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });

const errorResponses: Record<
  ErrorResponseKey,
  RouteConfig["responses"][string]
> = {
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

const jsonBody = (schema: ZodTypeAny, required = true): ZodRequestBody => ({
  required,
  content: {
    "application/json": {
      schema,
    },
  },
});

const registerApiPath = (config: ApiDocConfig) => {
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
      ...Object.fromEntries(
        (config.errors ?? []).map((statusCode) => [
          statusCode,
          errorResponses[statusCode],
        ]),
      ),
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
    request: { body: jsonBody(registerSchema) },
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
    request: { body: jsonBody(loginSchema) },
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
    request: { body: jsonBody(upsertHirerProfileSchema) },
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
    request: { body: jsonBody(upsertInfluencerProfileSchema) },
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
    request: { body: jsonBody(replaceSocialAccountsSchema) },
    success: {
      description: "Saved social accounts",
      message: "Social accounts saved",
      schema: z.array(socialAccountSchema),
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
    request: { body: jsonBody(replaceRateCardsSchema) },
    success: {
      description: "Saved rate cards",
      message: "Rate cards saved",
      schema: z.array(rateCardSchema),
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
    request: { params: campaignIdParamSchema },
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
      params: campaignIdParamSchema,
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
    request: { params: campaignIdParamSchema },
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
    request: { params: campaignIdParamSchema },
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
      params: campaignIdParamSchema,
      body: jsonBody(createApplicationSchema),
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
    request: { params: campaignIdParamSchema },
    success: {
      description: "Campaign applications",
      message: "Applications fetched",
      schema: z.array(applicationSchema),
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
    request: { params: applicationIdParamSchema },
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
    request: { params: applicationIdParamSchema },
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
      schema: z.array(offerSchema),
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
    request: { params: offerIdParamSchema },
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
    request: { body: jsonBody(createOfferSchema) },
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
    request: { params: offerIdParamSchema },
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
    request: { params: offerIdParamSchema },
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
      params: offerIdParamSchema,
      body: jsonBody(counterOfferSchema),
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
      params: offerIdParamSchema,
      body: jsonBody(reviseOfferSchema),
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
    request: { params: offerIdParamSchema },
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
    request: { params: offerIdParamSchema },
    success: {
      description: "Conversation messages",
      message: "Messages fetched",
      schema: z.array(messageSchema),
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
      params: offerIdParamSchema,
      body: jsonBody(sendMessageSchema),
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
    request: { params: offerIdParamSchema },
    success: {
      description: "Content submissions",
      message: "Content submissions fetched",
      schema: z.array(contentSubmissionSchema),
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
      params: offerIdParamSchema,
      body: jsonBody(submitContentSchema),
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
      params: submissionIdParamSchema,
      body: jsonBody(requestRevisionSchema),
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
    request: { params: submissionIdParamSchema },
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
      params: submissionIdParamSchema,
      body: jsonBody(publishConfirmationSchema),
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
    request: { params: offerIdParamSchema },
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
    request: { params: offerIdParamSchema },
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
    request: { params: offerIdParamSchema },
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
    request: { params: offerIdParamSchema },
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
    request: { params: offerIdParamSchema },
    success: {
      description: "Offer reviews",
      message: "Reviews fetched",
      schema: z.array(reviewSchema),
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
      params: offerIdParamSchema,
      body: jsonBody(createReviewSchema),
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
      schema: z.array(notificationSchema),
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
] satisfies ApiDocConfig[];

apiDocs.forEach(registerApiPath);

export const getOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV31(registry.definitions, {
    sortComponents: "alphabetically",
  });

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Influencer Marketplace API",
      version: "1.0.0",
      description:
        "Code-first OpenAPI documentation for the influencer marketplace backend.",
    },
    servers: [
      {
        url: env.appBaseUrl ?? `http://localhost:${env.port}`,
        description: env.appBaseUrl
          ? "Configured application URL"
          : "Local development",
      },
    ],
  });
};

export const openApiJsonHandler: RequestHandler = (_req, res) => {
  res.json(getOpenApiDocument());
};

export const scalarDocsHandler = apiReference({
  pageTitle: "Influencer Marketplace API Docs",
  title: "Influencer Marketplace API",
  url: "/openapi.json",
  agent: {
    disabled: true,
  },
});
