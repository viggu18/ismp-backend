"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignIdParamSchema = exports.campaignFilterSchema = exports.updateCampaignSchema = exports.createCampaignSchema = exports.campaignBaseSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const optionalDate = zod_1.z
    .union([zod_1.z.string().datetime(), zod_1.z.null(), zod_1.z.undefined()])
    .transform((value) => (value ? new Date(value) : undefined));
exports.campaignBaseSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().min(10).max(5000),
    platforms: zod_1.z.array(zod_1.z.nativeEnum(client_1.Platform)).min(1),
    contentTypes: zod_1.z.array(zod_1.z.nativeEnum(client_1.ContentType)).min(1),
    niche: zod_1.z.string().max(120).optional().nullable(),
    budgetMin: zod_1.z.number().nonnegative().optional().nullable(),
    budgetMax: zod_1.z.number().nonnegative().optional().nullable(),
    timeline: zod_1.z.string().max(120).optional().nullable(),
    startDate: optionalDate,
    deadlineDate: optionalDate,
    deliverablesCount: zod_1.z.number().int().positive().optional(),
    languages: zod_1.z.array(zod_1.z.string().min(1).max(60)).default([]),
    minFollowers: zod_1.z.number().int().nonnegative().optional().nullable(),
    targetCities: zod_1.z.array(zod_1.z.string().min(1).max(120)).default([]),
    targetGender: zod_1.z.string().max(30).optional().nullable(),
    visibility: zod_1.z.nativeEnum(client_1.CampaignVisibility).default(client_1.CampaignVisibility.PUBLIC),
    briefUrl: zod_1.z.string().url().optional().nullable(),
    briefText: zod_1.z.string().max(10000).optional().nullable(),
});
exports.createCampaignSchema = exports.campaignBaseSchema;
exports.updateCampaignSchema = exports.campaignBaseSchema.partial();
exports.campaignFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
    platform: zod_1.z.nativeEnum(client_1.Platform).optional(),
    contentType: zod_1.z.nativeEnum(client_1.ContentType).optional(),
    niche: zod_1.z.string().optional(),
    minBudget: zod_1.z.coerce.number().nonnegative().optional(),
    maxBudget: zod_1.z.coerce.number().nonnegative().optional(),
    language: zod_1.z.string().optional(),
    minFollowers: zod_1.z.coerce.number().int().nonnegative().optional(),
    city: zod_1.z.string().optional(),
    targetGender: zod_1.z.string().optional(),
    visibility: zod_1.z.nativeEnum(client_1.CampaignVisibility).optional(),
});
exports.campaignIdParamSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid(),
});
