"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfluencerProfileOrThrow = exports.getHirerProfileOrThrow = exports.getCurrentUserOrThrow = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../errors/app-error");
const getCurrentUserOrThrow = async (userId) => {
    const user = await prisma_client_1.default.user.findUnique({
        where: { id: userId },
        include: {
            hirerProfile: true,
            influencerProfile: true,
        },
    });
    if (!user) {
        throw new app_error_1.AppError("User not found", 404);
    }
    return user;
};
exports.getCurrentUserOrThrow = getCurrentUserOrThrow;
const getHirerProfileOrThrow = async (userId) => {
    const user = await (0, exports.getCurrentUserOrThrow)(userId);
    if (user.role !== client_1.Role.HIRER) {
        throw new app_error_1.AppError("This action is only available to hirers", 403);
    }
    return user.hirerProfile;
};
exports.getHirerProfileOrThrow = getHirerProfileOrThrow;
const getInfluencerProfileOrThrow = async (userId) => {
    const user = await (0, exports.getCurrentUserOrThrow)(userId);
    if (user.role !== client_1.Role.INFLUENCER) {
        throw new app_error_1.AppError("This action is only available to influencers", 403);
    }
    return user.influencerProfile;
};
exports.getInfluencerProfileOrThrow = getInfluencerProfileOrThrow;
