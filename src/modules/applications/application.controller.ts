import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as applicationService from "./application.service";

export const applyToCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params as { campaignId: string };
  const application = await applicationService.applyToCampaign(
    req.currentUser!.userId,
    campaignId,
    req.body,
  );
  return sendSuccess(res, application, "Application submitted", 201);
};

export const listCampaignApplications = async (req: Request, res: Response) => {
  const { campaignId } = req.params as { campaignId: string };
  const applications = await applicationService.listCampaignApplications(
    req.currentUser!.userId,
    campaignId,
  );
  return sendSuccess(res, applications, "Applications fetched");
};

export const shortlistApplication = async (req: Request, res: Response) => {
  const { applicationId } = req.params as { applicationId: string };
  const application = await applicationService.shortlistApplication(
    req.currentUser!.userId,
    applicationId,
  );
  return sendSuccess(res, application, "Application shortlisted");
};

export const rejectApplication = async (req: Request, res: Response) => {
  const { applicationId } = req.params as { applicationId: string };
  const application = await applicationService.rejectApplication(
    req.currentUser!.userId,
    applicationId,
  );
  return sendSuccess(res, application, "Application rejected");
};
