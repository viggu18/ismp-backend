import { Request, Response } from "express";

import { getPagination } from "../../common/utils/pagination";
import { sendSuccess } from "../../common/utils/response";
import * as influencerService from "./influencer.service";

export const getMyProfile = async (req: Request, res: Response) => {
  const profile = await influencerService.getMyProfile(req.currentUser!.userId);
  return sendSuccess(res, profile, "Influencer profile fetched");
};

export const upsertMyProfile = async (req: Request, res: Response) => {
  const profile = await influencerService.upsertMyProfile(req.currentUser!.userId, req.body);
  return sendSuccess(res, profile, "Influencer profile saved");
};

export const replaceSocialAccounts = async (req: Request, res: Response) => {
  const socialAccounts = await influencerService.replaceSocialAccounts(
    req.currentUser!.userId,
    req.body,
  );
  return sendSuccess(res, socialAccounts, "Social accounts saved");
};

export const replaceRateCards = async (req: Request, res: Response) => {
  const rateCards = await influencerService.replaceRateCards(req.currentUser!.userId, req.body);
  return sendSuccess(res, rateCards, "Rate cards saved");
};

export const getEarningsHistory = async (req: Request, res: Response) => {
  const history = await influencerService.getEarningsHistory(
    req.currentUser!.userId,
    getPagination(req),
  );
  return sendSuccess(res, history, "Earnings history fetched");
};
