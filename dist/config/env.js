"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const parseBooleanEnv = (value, defaultValue) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }
    if (typeof value === "boolean") {
        return value;
    }
    const normalizedValue = String(value).trim().toLowerCase();
    return ["1", "true", "yes", "on"].includes(normalizedValue);
};
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: zod_1.z.string().min(1),
    DIRECT_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_EXPIRES_IN: zod_1.z.string().min(1).default("7d"),
    APP_BASE_URL: zod_1.z.string().url().optional(),
    SUPABASE_URL: zod_1.z.string().optional().default(""),
    SUPABASE_ANON_KEY: zod_1.z.string().optional().default(""),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional().default(""),
    RAZORPAY_KEY_ID: zod_1.z.string().optional().default(""),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional().default(""),
    REQUEST_LOGGER_ENABLED: zod_1.z
        .union([zod_1.z.string(), zod_1.z.boolean()])
        .optional()
        .transform((value) => parseBooleanEnv(value, true)),
});
const parsedEnv = envSchema.parse(process.env);
exports.env = {
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
    requestLoggerEnabled: parsedEnv.NODE_ENV === "test" ? false : parsedEnv.REQUEST_LOGGER_ENABLED,
};
