import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as influencerController from "./influencer.controller";
import {
  replaceRateCardsSchema,
  replaceSocialAccountsSchema,
  upsertInfluencerProfileSchema,
} from "./influencer.schemas";

const influencerRouter = Router();

influencerRouter.use(authenticate, requireRole(Role.INFLUENCER));
influencerRouter.get("/me/profile", asyncHandler(influencerController.getMyProfile));
influencerRouter.put(
  "/me/profile",
  validate({ body: upsertInfluencerProfileSchema }),
  asyncHandler(influencerController.upsertMyProfile),
);
influencerRouter.put(
  "/me/social-accounts",
  validate({ body: replaceSocialAccountsSchema }),
  asyncHandler(influencerController.replaceSocialAccounts),
);
influencerRouter.put(
  "/me/ratecards",
  validate({ body: replaceRateCardsSchema }),
  asyncHandler(influencerController.replaceRateCards),
);
influencerRouter.get(
  "/me/earnings-history",
  asyncHandler(influencerController.getEarningsHistory),
);

export default influencerRouter;
