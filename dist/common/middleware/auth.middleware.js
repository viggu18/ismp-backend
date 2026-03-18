"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../errors/app-error");
const jwt_1 = require("../utils/jwt");
const authenticate = async (req, _res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return next(new app_error_1.AppError("Authentication token is required", 401));
    }
    const token = authorization.replace("Bearer ", "").trim();
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        const user = await prisma_client_1.default.user.findUnique({
            where: { id: payload.userId },
            include: {
                hirerProfile: true,
                influencerProfile: true,
            },
        });
        if (!user || !user.isActive) {
            return next(new app_error_1.AppError("Authenticated user is no longer active", 401));
        }
        req.currentUser = {
            userId: user.id,
            role: user.role,
            phone: user.phone,
            email: user.email,
            isVerified: user.isVerified,
            hirerProfileId: user.hirerProfile?.id,
            influencerProfileId: user.influencerProfile?.id,
        };
        return next();
    }
    catch (error) {
        return next(new app_error_1.AppError("Invalid or expired authentication token", 401, error));
    }
};
exports.authenticate = authenticate;
