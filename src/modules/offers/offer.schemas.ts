import { z } from "zod";

export const createOfferSchema = z
  .object({
    applicationId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    influencerProfileId: z.string().uuid().optional(),
    agreedRate: z.number().positive(),
    deliverables: z.string().min(3).max(500),
    contentDeadline: z.string().datetime(),
    paymentTerms: z.string().max(500).optional().nullable(),
    revisionLimit: z.number().int().min(0).max(10).optional(),
  })
  .refine(
    (value) =>
      Boolean(value.applicationId) ||
      (Boolean(value.campaignId) && Boolean(value.influencerProfileId)),
    {
      message: "Provide either applicationId or both campaignId and influencerProfileId",
      path: ["applicationId"],
    },
  );

export const reviseOfferSchema = z.object({
  agreedRate: z.number().positive().optional(),
  deliverables: z.string().min(3).max(500).optional(),
  contentDeadline: z.string().datetime().optional(),
  paymentTerms: z.string().max(500).optional().nullable(),
  revisionLimit: z.number().int().min(0).max(10).optional(),
});

export const counterOfferSchema = z.object({
  counterRate: z.number().positive(),
  counterNote: z.string().max(500).optional().nullable(),
});

export const offerIdParamSchema = z.object({
  offerId: z.string().uuid(),
});
