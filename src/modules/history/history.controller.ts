import { Request, Response } from "express";

import { getPagination } from "../../common/utils/pagination";
import { sendSuccess } from "../../common/utils/response";
import * as historyService from "./history.service";

export const getHirerCampaignArchive = async (req: Request, res: Response) => {
  const archive = await historyService.getHirerCampaignArchive(
    req.currentUser!.userId,
    getPagination(req),
  );
  return sendSuccess(res, archive, "Hirer history fetched");
};

export const getInfluencerHistory = async (req: Request, res: Response) => {
  const history = await historyService.getInfluencerHistory(
    req.currentUser!.userId,
    getPagination(req),
  );
  return sendSuccess(res, history, "Influencer history fetched");
};
