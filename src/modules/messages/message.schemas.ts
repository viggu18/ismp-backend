import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachmentUrl: z.string().url().optional().nullable(),
});
