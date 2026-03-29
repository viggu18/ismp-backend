import { Role } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  role: z.nativeEnum(Role),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(8).max(128),
});
