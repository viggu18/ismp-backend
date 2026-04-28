import { CampaignStatus } from "@prisma/client";
import { Request, Response } from "express";

import { getPagination } from "../../common/utils/pagination";
import { sendSuccess } from "../../common/utils/response";
import * as campaignService from "./campaign.service";

export const createCampaign = async (req: Request, res: Response) => {
  const campaign = await campaignService.createCampaign(req.currentUser!.userId, req.body);
  return sendSuccess(res, campaign, "Campaign created", 201);
};

export const listMyCampaigns = async (req: Request, res: Response) => {
  const campaigns = await campaignService.listMyCampaigns(
    req.currentUser!.userId,
    getPagination(req),
  );
  return sendSuccess(res, campaigns, "Campaigns fetched");
};

export const browseCampaigns = async (req: Request, res: Response) => {
  const campaigns = await campaignService.browseCampaigns(
    req.currentUser!.userId,
    req.currentUser!.role,
    req.query,
    getPagination(req),
  );
  return sendSuccess(res, campaigns, "Campaigns fetched");
};

export const getCampaignById = async (req: Request, res: Response) => {
  const { campaignId } = req.params as { campaignId: string };
  const campaign = await campaignService.getCampaignById(
    campaignId,
    req.currentUser!.userId,
    req.currentUser!.role,
  );
  return sendSuccess(res, campaign, "Campaign fetched");
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params as { campaignId: string };
  const campaign = await campaignService.updateCampaign(
    campaignId,
    req.currentUser!.userId,
    req.body,
  );
  return sendSuccess(res, campaign, "Campaign updated");
};

export const openCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params as { campaignId: string };
  const campaign = await campaignService.changeCampaignStatus(
    campaignId,
    req.currentUser!.userId,
    CampaignStatus.OPEN,
  );
  return sendSuccess(res, campaign, "Campaign opened");
};

export const closeCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params as { campaignId: string };
  const campaign = await campaignService.changeCampaignStatus(
    campaignId,
    req.currentUser!.userId,
    CampaignStatus.CLOSED,
  );
  return sendSuccess(res, campaign, "Campaign closed");
};

export const updateMetrics = async (req: Request, res: Response) => {
  const { campaignId } = req.params as { campaignId: string };
  const metrics = await campaignService.updateMetrics(
    campaignId,
    req.currentUser!.userId,
    req.body,
  );
  return sendSuccess(res, metrics, "Campaign metrics updated");
};
