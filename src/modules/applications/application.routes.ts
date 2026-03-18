import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as applicationController from "./application.controller";
import { applicationIdParamSchema, createApplicationSchema } from "./application.schemas";
import { campaignIdParamSchema } from "../campaigns/campaign.schemas";

const applicationRouter = Router();

applicationRouter.use(authenticate);
applicationRouter.post(
  "/campaigns/:campaignId/applications",
  requireRole(Role.INFLUENCER),
  validate({ params: campaignIdParamSchema, body: createApplicationSchema }),
  asyncHandler(applicationController.applyToCampaign),
);
applicationRouter.get(
  "/campaigns/:campaignId/applications",
  requireRole(Role.HIRER),
  validate({ params: campaignIdParamSchema }),
  asyncHandler(applicationController.listCampaignApplications),
);
applicationRouter.post(
  "/applications/:applicationId/shortlist",
  requireRole(Role.HIRER),
  validate({ params: applicationIdParamSchema }),
  asyncHandler(applicationController.shortlistApplication),
);
applicationRouter.post(
  "/applications/:applicationId/reject",
  requireRole(Role.HIRER),
  validate({ params: applicationIdParamSchema }),
  asyncHandler(applicationController.rejectApplication),
);

export default applicationRouter;
