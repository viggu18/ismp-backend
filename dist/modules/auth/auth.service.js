"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const app_error_1 = require("../../common/errors/app-error");
const jwt_1 = require("../../common/utils/jwt");
const password_1 = require("../../common/utils/password");
const verification_provider_1 = require("../../providers/verification.provider");
const getProfileSummary = (user) => {
    const profile = user.role === client_1.Role.HIRER ? user.hirerProfile : user.influencerProfile;
    return {
        profileId: profile?.id ?? null,
        profileCompleted: Boolean(profile),
    };
};
const formatAuthResponse = (user) => {
    return {
        token: (0, jwt_1.signToken)({
            userId: user.id,
            role: user.role,
        }),
        user: {
            id: user.id,
            role: user.role,
            phone: user.phone,
            email: user.email,
            isVerified: user.isVerified,
            ...getProfileSummary(user),
        },
    };
};
const register = async (input) => {
    const existingUser = await prisma_client_1.default.user.findFirst({
        where: {
            OR: [
                { phone: input.phone },
                ...(input.email ? [{ email: input.email }] : []),
            ],
        },
    });
    if (existingUser) {
        throw new app_error_1.AppError("A user with that phone or email already exists", 409);
    }
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const phoneVerification = await verification_provider_1.verificationProvider.verifyPhone(input.phone);
    const emailVerification = input.email
        ? await verification_provider_1.verificationProvider.verifyEmail(input.email)
        : null;
    const user = await prisma_client_1.default.user.create({
        data: {
            role: input.role,
            phone: input.phone,
            email: input.email,
            passwordHash,
            isVerified: phoneVerification.isVerified && (emailVerification?.isVerified ?? true),
        },
        include: {
            hirerProfile: true,
            influencerProfile: true,
        },
    });
    return formatAuthResponse(user);
};
exports.register = register;
const login = async (input) => {
    const user = await prisma_client_1.default.user.findFirst({
        where: {
            OR: [{ phone: input.identifier }, { email: input.identifier }],
        },
        include: {
            hirerProfile: true,
            influencerProfile: true,
        },
    });
    if (!user || !user.passwordHash) {
        throw new app_error_1.AppError("Invalid credentials", 401);
    }
    const isPasswordValid = await (0, password_1.comparePassword)(input.password, user.passwordHash);
    if (!isPasswordValid) {
        throw new app_error_1.AppError("Invalid credentials", 401);
    }
    if (!user.isActive) {
        throw new app_error_1.AppError("This account is inactive", 403);
    }
    return formatAuthResponse(user);
};
exports.login = login;
const getMe = async (userId) => {
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
    return {
        id: user.id,
        role: user.role,
        phone: user.phone,
        email: user.email,
        isVerified: user.isVerified,
        hirerProfile: user.hirerProfile,
        influencerProfile: user.influencerProfile,
        ...getProfileSummary(user),
    };
};
exports.getMe = getMe;
