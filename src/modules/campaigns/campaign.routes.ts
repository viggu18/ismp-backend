import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as campaignController from "./campaign.controller";
import {
  campaignFilterSchema,
  campaignIdParamSchema,
  createCampaignSchema,
  updateCampaignSchema,
  updateMetricsSchema,
} from "./campaign.schemas";

const campaignRouter = Router();

campaignRouter.use(authenticate);
campaignRouter.get(
  "/",
  validate({ query: campaignFilterSchema }),
  asyncHandler(campaignController.browseCampaigns),
);
campaignRouter.get("/my", requireRole(Role.HIRER), asyncHandler(campaignController.listMyCampaigns));
campaignRouter.get(
  "/:campaignId",
  validate({ params: campaignIdParamSchema }),
  asyncHandler(campaignController.getCampaignById),
);
campaignRouter.post(
  "/",
  requireRole(Role.HIRER),
  validate({ body: createCampaignSchema }),
  asyncHandler(campaignController.createCampaign),
);
campaignRouter.patch(
  "/:campaignId",
  requireRole(Role.HIRER),
  validate({ params: campaignIdParamSchema, body: updateCampaignSchema }),
  asyncHandler(campaignController.updateCampaign),
);
campaignRouter.post(
  "/:campaignId/open",
  requireRole(Role.HIRER),
  validate({ params: campaignIdParamSchema }),
  asyncHandler(campaignController.openCampaign),
);
campaignRouter.post(
  "/:campaignId/close",
  requireRole(Role.HIRER),
  validate({ params: campaignIdParamSchema }),
  asyncHandler(campaignController.closeCampaign),
);

campaignRouter.patch(
  "/:campaignId/metrics",
  requireRole(Role.HIRER),
  validate({ params: campaignIdParamSchema, body: updateMetricsSchema }),
  asyncHandler(campaignController.updateMetrics),
);

export default campaignRouter;
