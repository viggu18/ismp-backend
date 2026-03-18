"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationIdParamSchema = exports.createApplicationSchema = void 0;
const zod_1 = require("zod");
exports.createApplicationSchema = zod_1.z.object({
    pitchNote: zod_1.z.string().max(1000).optional().nullable(),
    proposedRate: zod_1.z.number().positive().optional().nullable(),
});
exports.applicationIdParamSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid(),
});
