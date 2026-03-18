import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as hirerService from "./hirer.service";

export const getMyProfile = async (req: Request, res: Response) => {
  const profile = await hirerService.getMyProfile(req.currentUser!.userId);
  return sendSuccess(res, profile, "Hirer profile fetched");
};

export const upsertMyProfile = async (req: Request, res: Response) => {
  const profile = await hirerService.upsertMyProfile(req.currentUser!.userId, req.body);
  return sendSuccess(res, profile, "Hirer profile saved");
};
