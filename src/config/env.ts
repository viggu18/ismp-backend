import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  APP_BASE_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_ANON_KEY: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  port: parsedEnv.PORT,
  nodeEnv: parsedEnv.NODE_ENV,
  databaseUrl: parsedEnv.DATABASE_URL,
  directUrl: parsedEnv.DIRECT_URL,
  jwtSecret: parsedEnv.JWT_SECRET,
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  appBaseUrl: parsedEnv.APP_BASE_URL,
  supabaseUrl: parsedEnv.SUPABASE_URL,
  supabaseAnonKey: parsedEnv.SUPABASE_ANON_KEY,
  supabaseServiceKey: parsedEnv.SUPABASE_SERVICE_ROLE_KEY,
  razorpayKeyId: parsedEnv.RAZORPAY_KEY_ID,
  razorpayKeySecret: parsedEnv.RAZORPAY_KEY_SECRET,
} as const;
