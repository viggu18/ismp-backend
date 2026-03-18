"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceRateCardsSchema = exports.replaceSocialAccountsSchema = exports.upsertInfluencerProfileSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.upsertInfluencerProfileSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(2).max(120),
    avatarUrl: zod_1.z.string().url().optional().nullable(),
    bio: zod_1.z.string().max(1000).optional().nullable(),
    city: zod_1.z.string().max(120).optional().nullable(),
    state: zod_1.z.string().max(120).optional().nullable(),
    languages: zod_1.z.array(zod_1.z.string().min(1).max(60)).min(1),
    niches: zod_1.z.array(zod_1.z.string().min(1).max(60)).min(1),
    gender: zod_1.z.string().max(30).optional().nullable(),
    isAvailable: zod_1.z.boolean().optional(),
});
exports.replaceSocialAccountsSchema = zod_1.z.object({
    socialAccounts: zod_1.z.array(zod_1.z.object({
        platform: zod_1.z.nativeEnum(client_1.Platform),
        handle: zod_1.z.string().min(1).max(120),
        profileUrl: zod_1.z.string().url().optional().nullable(),
        followerCount: zod_1.z.number().int().min(0).optional(),
        engagementRate: zod_1.z.number().min(0).max(100).optional().nullable(),
        isVerified: zod_1.z.boolean().optional(),
    })),
});
exports.replaceRateCardsSchema = zod_1.z.object({
    ratecards: zod_1.z.array(zod_1.z.object({
        platform: zod_1.z.nativeEnum(client_1.Platform),
        contentType: zod_1.z.nativeEnum(client_1.ContentType),
        priceInr: zod_1.z.number().positive(),
    })),
});
