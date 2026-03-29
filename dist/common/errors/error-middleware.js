"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const app_error_1 = require("./app-error");
const response_1 = require("../utils/response");
const errorMiddleware = (error, _req, res, _next) => {
    if (error instanceof app_error_1.AppError) {
        return (0, response_1.sendError)(res, error.message, error.statusCode, error.details);
    }
    if (error instanceof zod_1.ZodError) {
        return (0, response_1.sendError)(res, error.message || "Validation failed", 422, error.flatten());
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return (0, response_1.sendError)(res, "A unique field already exists", 409, error.meta);
        }
        if (error.code === "P2025") {
            return (0, response_1.sendError)(res, "Requested record was not found", 404, error.meta);
        }
    }
    if (error instanceof Error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
    return (0, response_1.sendError)(res, "Unexpected server error", 500, error);
};
exports.errorMiddleware = errorMiddleware;
