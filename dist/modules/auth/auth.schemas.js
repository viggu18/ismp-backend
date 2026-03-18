"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(client_1.Role),
    phone: zod_1.z.string().min(10).max(20),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(8).max(128),
});
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(3),
    password: zod_1.z.string().min(8).max(128),
});
