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

export const createSavedSearch = async (req: Request, res: Response) => {
  const savedSearch = await hirerService.createSavedSearch(req.currentUser!.userId, req.body);
  return sendSuccess(res, savedSearch, "Saved search created", 201);
};

export const listSavedSearches = async (req: Request, res: Response) => {
  const searches = await hirerService.listSavedSearches(req.currentUser!.userId);
  return sendSuccess(res, searches, "Saved searches fetched");
};
