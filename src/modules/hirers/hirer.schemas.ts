import { z } from "zod";

export const upsertHirerProfileSchema = z.object({
  companyName: z.string().min(2).max(120),
  logoUrl: z.string().url().optional().nullable(),
  industry: z.string().max(120).optional().nullable(),
  website: z.string().url().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  gstNumber: z.string().max(50).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(120).optional().nullable(),
});

export const createSavedSearchSchema = z.object({
  filterJson: z.record(z.string(), z.any()),
  alertEnabled: z.boolean().optional(),
});
