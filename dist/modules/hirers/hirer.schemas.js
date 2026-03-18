"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertHirerProfileSchema = void 0;
const zod_1 = require("zod");
exports.upsertHirerProfileSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2).max(120),
    logoUrl: zod_1.z.string().url().optional().nullable(),
    industry: zod_1.z.string().max(120).optional().nullable(),
    website: zod_1.z.string().url().optional().nullable(),
    description: zod_1.z.string().max(1000).optional().nullable(),
    gstNumber: zod_1.z.string().max(50).optional().nullable(),
    city: zod_1.z.string().max(120).optional().nullable(),
    state: zod_1.z.string().max(120).optional().nullable(),
});
