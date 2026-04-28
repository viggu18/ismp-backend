import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as disputeService from "./dispute.service";

export const raiseDispute = async (req: Request, res: Response) => {
  const dispute = await disputeService.raiseDispute(
    req.currentUser!.userId,
    req.body,
  );
  return sendSuccess(res, dispute, "Dispute raised successfully", 201);
};

export const getDispute = async (req: Request, res: Response) => {
  const { disputeId } = req.params as { disputeId: string };
  const dispute = await disputeService.getDispute(
    req.currentUser!.userId,
    disputeId,
  );
  return sendSuccess(res, dispute, "Dispute details fetched");
};

export const resolveDispute = async (req: Request, res: Response) => {
  const { disputeId } = req.params as { disputeId: string };
  const dispute = await disputeService.resolveDispute(
    disputeId,
    req.body,
  );
  return sendSuccess(res, dispute, "Dispute resolved");
};
