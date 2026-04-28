import { DisputeStatus } from "@prisma/client";
import { z } from "zod";

export const raiseDisputeSchema = z.object({
  offerId: z.string().uuid(),
  reason: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  evidenceUrls: z.array(z.string().url()).optional(),
});

export const resolveDisputeSchema = z.object({
  status: z.enum([DisputeStatus.RESOLVED_HIRER, DisputeStatus.RESOLVED_INFLUENCER]),
  resolution: z.string().min(10).max(1000),
});

export const disputeIdParamSchema = z.object({
  disputeId: z.string().uuid(),
});
