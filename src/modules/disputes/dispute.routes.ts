import { Router } from "express";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate } from "../../common/middleware/validate.middleware";
import * as disputeController from "./dispute.controller";
import {
  disputeIdParamSchema,
  raiseDisputeSchema,
  resolveDisputeSchema,
} from "./dispute.schemas";

const disputeRouter = Router();

disputeRouter.use(authenticate);

disputeRouter.post(
  "/",
  validate({ body: raiseDisputeSchema }),
  asyncHandler(disputeController.raiseDispute),
);

disputeRouter.get(
  "/:disputeId",
  validate({ params: disputeIdParamSchema }),
  asyncHandler(disputeController.getDispute),
);

// In a real app, this would use requireRole(Role.ADMIN)
disputeRouter.patch(
  "/:disputeId/resolve",
  validate({ params: disputeIdParamSchema, body: resolveDisputeSchema }),
  asyncHandler(disputeController.resolveDispute),
);

export default disputeRouter;
