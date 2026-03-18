"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerIdParamSchema = exports.counterOfferSchema = exports.reviseOfferSchema = exports.createOfferSchema = void 0;
const zod_1 = require("zod");
exports.createOfferSchema = zod_1.z
    .object({
    applicationId: zod_1.z.string().uuid().optional(),
    campaignId: zod_1.z.string().uuid().optional(),
    influencerProfileId: zod_1.z.string().uuid().optional(),
    agreedRate: zod_1.z.number().positive(),
    deliverables: zod_1.z.string().min(3).max(500),
    contentDeadline: zod_1.z.string().datetime(),
    paymentTerms: zod_1.z.string().max(500).optional().nullable(),
    revisionLimit: zod_1.z.number().int().min(0).max(10).optional(),
})
    .refine((value) => Boolean(value.applicationId) ||
    (Boolean(value.campaignId) && Boolean(value.influencerProfileId)), {
    message: "Provide either applicationId or both campaignId and influencerProfileId",
    path: ["applicationId"],
});
exports.reviseOfferSchema = zod_1.z.object({
    agreedRate: zod_1.z.number().positive().optional(),
    deliverables: zod_1.z.string().min(3).max(500).optional(),
    contentDeadline: zod_1.z.string().datetime().optional(),
    paymentTerms: zod_1.z.string().max(500).optional().nullable(),
    revisionLimit: zod_1.z.number().int().min(0).max(10).optional(),
});
exports.counterOfferSchema = zod_1.z.object({
    counterRate: zod_1.z.number().positive(),
    counterNote: zod_1.z.string().max(500).optional().nullable(),
});
exports.offerIdParamSchema = zod_1.z.object({
    offerId: zod_1.z.string().uuid(),
});
