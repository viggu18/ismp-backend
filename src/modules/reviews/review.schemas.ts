import { ReviewTarget } from "@prisma/client";
import { z } from "zod";

export const createReviewSchema = z.object({
  reviewTarget: z.nativeEnum(ReviewTarget),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
  communicationRating: z.number().min(1).max(5).optional().nullable(),
  qualityRating: z.number().min(1).max(5).optional().nullable(),
  timelinessRating: z.number().min(1).max(5).optional().nullable(),
  paymentRating: z.number().min(1).max(5).optional().nullable(),
});
