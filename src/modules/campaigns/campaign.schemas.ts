import { CampaignVisibility, ContentType, Platform } from "@prisma/client";
import { z } from "zod";

const optionalDate = z
  .union([z.string().datetime(), z.null(), z.undefined()])
  .transform((value) => (value ? new Date(value) : undefined));

export const campaignBaseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  platforms: z.array(z.nativeEnum(Platform)).min(1),
  contentTypes: z.array(z.nativeEnum(ContentType)).min(1),
  niche: z.string().max(120).optional().nullable(),
  budgetMin: z.number().nonnegative().optional().nullable(),
  budgetMax: z.number().nonnegative().optional().nullable(),
  timeline: z.string().max(120).optional().nullable(),
  startDate: optionalDate,
  deadlineDate: optionalDate,
  deliverablesCount: z.number().int().positive().optional(),
  languages: z.array(z.string().min(1).max(60)).default([]),
  minFollowers: z.number().int().nonnegative().optional().nullable(),
  targetCities: z.array(z.string().min(1).max(120)).default([]),
  targetGender: z.string().max(30).optional().nullable(),
  visibility: z.nativeEnum(CampaignVisibility).default(CampaignVisibility.PUBLIC),
  briefUrl: z.string().url().optional().nullable(),
  briefText: z.string().max(10000).optional().nullable(),
});

export const createCampaignSchema = campaignBaseSchema;

export const updateCampaignSchema = campaignBaseSchema.partial();

export const campaignFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  platform: z.nativeEnum(Platform).optional(),
  contentType: z.nativeEnum(ContentType).optional(),
  niche: z.string().optional(),
  minBudget: z.coerce.number().nonnegative().optional(),
  maxBudget: z.coerce.number().nonnegative().optional(),
  language: z.string().optional(),
  minFollowers: z.coerce.number().int().nonnegative().optional(),
  city: z.string().optional(),
  targetGender: z.string().optional(),
  visibility: z.nativeEnum(CampaignVisibility).optional(),
});

export const campaignIdParamSchema = z.object({
  campaignId: z.string().uuid(),
});

export const updateMetricsSchema = z.object({
  views: z.number().int().nonnegative().optional(),
  likes: z.number().int().nonnegative().optional(),
  comments: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
  reach: z.number().int().nonnegative().optional(),
  saves: z.number().int().nonnegative().optional(),
  utmClicks: z.number().int().nonnegative().optional(),
});
