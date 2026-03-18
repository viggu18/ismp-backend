import { Router } from "express";
import { z } from "zod";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate } from "../../common/middleware/validate.middleware";
import * as notificationController from "./notification.controller";

const notificationRouter = Router();
const notificationIdParamSchema = z.object({
  notificationId: z.string().uuid(),
});

notificationRouter.use(authenticate);
notificationRouter.get("/", asyncHandler(notificationController.listNotifications));
notificationRouter.post(
  "/:notificationId/read",
  validate({ params: notificationIdParamSchema }),
  asyncHandler(notificationController.markNotificationRead),
);

export default notificationRouter;
