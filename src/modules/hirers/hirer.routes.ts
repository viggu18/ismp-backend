import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as hirerController from "./hirer.controller";
import { createSavedSearchSchema, upsertHirerProfileSchema } from "./hirer.schemas";

const hirerRouter = Router();

hirerRouter.use(authenticate, requireRole(Role.HIRER));
hirerRouter.get("/me/profile", asyncHandler(hirerController.getMyProfile));
hirerRouter.put(
  "/me/profile",
  validate({ body: upsertHirerProfileSchema }),
  asyncHandler(hirerController.upsertMyProfile),
);

hirerRouter.post(
  "/me/saved-searches",
  validate({ body: createSavedSearchSchema }),
  asyncHandler(hirerController.createSavedSearch),
);

hirerRouter.get("/me/saved-searches", asyncHandler(hirerController.listSavedSearches));

export default hirerRouter;
