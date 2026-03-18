import { z } from "zod";

export const submitContentSchema = z.object({
  submissionUrl: z.string().url(),
  note: z.string().max(1000).optional().nullable(),
});

export const requestRevisionSchema = z.object({
  revisionNote: z.string().min(1).max(1000),
});

export const publishConfirmationSchema = z.object({
  publishedUrl: z.string().url(),
});

export const submissionIdParamSchema = z.object({
  submissionId: z.string().uuid(),
});
