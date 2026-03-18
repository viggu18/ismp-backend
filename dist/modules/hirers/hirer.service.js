"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertMyProfile = exports.getMyProfile = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const profile_1 = require("../../common/utils/profile");
const getMyProfile = async (userId) => {
    const user = await (0, profile_1.getCurrentUserOrThrow)(userId);
    if (user.role !== "HIRER") {
        throw new app_error_1.AppError("Only hirers can access this profile", 403);
    }
    return user.hirerProfile;
};
exports.getMyProfile = getMyProfile;
const upsertMyProfile = async (userId, input) => {
    const user = await (0, profile_1.getCurrentUserOrThrow)(userId);
    if (user.role !== "HIRER") {
        throw new app_error_1.AppError("Only hirers can manage this profile", 403);
    }
    return prisma_client_1.default.hirerProfile.upsert({
        where: { userId },
        create: {
            userId,
            ...input,
        },
        update: {
            ...input,
            isGstVerified: Boolean(input.gstNumber) ? undefined : false,
        },
    });
};
exports.upsertMyProfile = upsertMyProfile;
