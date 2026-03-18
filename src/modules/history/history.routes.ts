import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import * as historyController from "./history.controller";

const historyRouter = Router();

historyRouter.use(authenticate);
historyRouter.get(
  "/hirer/campaigns",
  requireRole(Role.HIRER),
  asyncHandler(historyController.getHirerCampaignArchive),
);
historyRouter.get(
  "/influencer/earnings",
  requireRole(Role.INFLUENCER),
  asyncHandler(historyController.getInfluencerHistory),
);

export default historyRouter;
