import { Router } from "express";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate } from "../../common/middleware/validate.middleware";
import { offerIdParamSchema } from "../offers/offer.schemas";
import * as messageController from "./message.controller";
import { sendMessageSchema } from "./message.schemas";

const messageRouter = Router();

messageRouter.use(authenticate);
messageRouter.get(
  "/conversations/:offerId/messages",
  validate({ params: offerIdParamSchema }),
  asyncHandler(messageController.listMessages),
);
messageRouter.post(
  "/conversations/:offerId/messages",
  validate({ params: offerIdParamSchema, body: sendMessageSchema }),
  asyncHandler(messageController.sendMessage),
);

export default messageRouter;
