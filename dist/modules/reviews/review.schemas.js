"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    reviewTarget: zod_1.z.nativeEnum(client_1.ReviewTarget),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional().nullable(),
    communicationRating: zod_1.z.number().min(1).max(5).optional().nullable(),
    qualityRating: zod_1.z.number().min(1).max(5).optional().nullable(),
    timelinessRating: zod_1.z.number().min(1).max(5).optional().nullable(),
    paymentRating: zod_1.z.number().min(1).max(5).optional().nullable(),
});
