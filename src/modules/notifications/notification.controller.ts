import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as notificationService from "./notification.service";

export const listNotifications = async (req: Request, res: Response) => {
  const notifications = await notificationService.listNotifications(req.currentUser!.userId);
  return sendSuccess(res, notifications, "Notifications fetched");
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const { notificationId } = req.params as { notificationId: string };
  const notification = await notificationService.markNotificationRead(
    req.currentUser!.userId,
    notificationId,
  );
  return sendSuccess(res, notification, "Notification marked as read");
};
