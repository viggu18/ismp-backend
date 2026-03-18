import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as messageService from "./message.service";

export const listMessages = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const messages = await messageService.listMessages(req.currentUser!.userId, offerId);
  return sendSuccess(res, messages, "Messages fetched");
};

export const sendMessage = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const message = await messageService.sendMessage(
    req.currentUser!.userId,
    offerId,
    req.body,
  );
  return sendSuccess(res, message, "Message sent", 201);
};
