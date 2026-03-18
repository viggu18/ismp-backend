import { ContentType, Platform } from "@prisma/client";
import { z } from "zod";

export const upsertInfluencerProfileSchema = z.object({
  displayName: z.string().min(2).max(120),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(120).optional().nullable(),
  languages: z.array(z.string().min(1).max(60)).min(1),
  niches: z.array(z.string().min(1).max(60)).min(1),
  gender: z.string().max(30).optional().nullable(),
  isAvailable: z.boolean().optional(),
});

export const replaceSocialAccountsSchema = z.object({
  socialAccounts: z.array(
    z.object({
      platform: z.nativeEnum(Platform),
      handle: z.string().min(1).max(120),
      profileUrl: z.string().url().optional().nullable(),
      followerCount: z.number().int().min(0).optional(),
      engagementRate: z.number().min(0).max(100).optional().nullable(),
      isVerified: z.boolean().optional(),
    }),
  ),
});

export const replaceRateCardsSchema = z.object({
  ratecards: z.array(
    z.object({
      platform: z.nativeEnum(Platform),
      contentType: z.nativeEnum(ContentType),
      priceInr: z.number().positive(),
    }),
  ),
});
