"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.listNotifications = exports.createNotifications = void 0;
const app_error_1 = require("../../common/errors/app-error");
const prisma_client_1 = __importDefault(require("../../prisma/prisma.client"));
const createNotifications = async (userIds, type, title, body, metadata) => {
    const uniqueUserIds = [...new Set(userIds)];
    if (!uniqueUserIds.length) {
        return;
    }
    await prisma_client_1.default.notification.createMany({
        data: uniqueUserIds.map((userId) => ({
            userId,
            type,
            title,
            body,
            metadata: metadata,
        })),
    });
};
exports.createNotifications = createNotifications;
const listNotifications = async (userId) => {
    return prisma_client_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
exports.listNotifications = listNotifications;
const markNotificationRead = async (userId, notificationId) => {
    const notification = await prisma_client_1.default.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });
    if (!notification) {
        throw new app_error_1.AppError("Notification not found", 404);
    }
    return prisma_client_1.default.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
};
exports.markNotificationRead = markNotificationRead;
