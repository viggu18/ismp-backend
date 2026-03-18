import { NotificationType, Prisma } from "@prisma/client";

import { AppError } from "../../common/errors/app-error";
import prisma from "../../prisma/prisma.client";

export const createNotifications = async (
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  metadata?: Record<string, unknown>,
) => {
  const uniqueUserIds = [...new Set(userIds)];

  if (!uniqueUserIds.length) {
    return;
  }

  await prisma.notification.createMany({
    data: uniqueUserIds.map((userId) => ({
      userId,
      type,
      title,
      body,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    })),
  });
};

export const listNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};
