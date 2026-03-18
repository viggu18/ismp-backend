"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionIdParamSchema = exports.publishConfirmationSchema = exports.requestRevisionSchema = exports.submitContentSchema = void 0;
const zod_1 = require("zod");
exports.submitContentSchema = zod_1.z.object({
    submissionUrl: zod_1.z.string().url(),
    note: zod_1.z.string().max(1000).optional().nullable(),
});
exports.requestRevisionSchema = zod_1.z.object({
    revisionNote: zod_1.z.string().min(1).max(1000),
});
exports.publishConfirmationSchema = zod_1.z.object({
    publishedUrl: zod_1.z.string().url(),
});
exports.submissionIdParamSchema = zod_1.z.object({
    submissionId: zod_1.z.string().uuid(),
});
