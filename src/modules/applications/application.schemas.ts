import { z } from "zod";

export const createApplicationSchema = z.object({
  pitchNote: z.string().max(1000).optional().nullable(),
  proposedRate: z.number().positive().optional().nullable(),
});

export const applicationIdParamSchema = z.object({
  applicationId: z.string().uuid(),
});
