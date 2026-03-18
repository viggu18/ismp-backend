import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as hirerController from "./hirer.controller";
import { upsertHirerProfileSchema } from "./hirer.schemas";

const hirerRouter = Router();

hirerRouter.use(authenticate, requireRole(Role.HIRER));
hirerRouter.get("/me/profile", asyncHandler(hirerController.getMyProfile));
hirerRouter.put(
  "/me/profile",
  validate({ body: upsertHirerProfileSchema }),
  asyncHandler(hirerController.upsertMyProfile),
);

export default hirerRouter;
