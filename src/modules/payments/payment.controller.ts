import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as paymentService from "./payment.service";

export const getPayment = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const payment = await paymentService.getPayment(req.currentUser!.userId, offerId);
  return sendSuccess(res, payment, "Payment fetched");
};

export const lockEscrow = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const payment = await paymentService.lockEscrow(req.currentUser!.userId, offerId);
  return sendSuccess(res, payment, "Payment moved to escrow");
};

export const releaseEscrow = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const payment = await paymentService.releaseEscrow(req.currentUser!.userId, offerId);
  return sendSuccess(res, payment, "Payment released");
};

export const refundEscrow = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const payment = await paymentService.refundEscrow(req.currentUser!.userId, offerId);
  return sendSuccess(res, payment, "Payment refunded");
};
