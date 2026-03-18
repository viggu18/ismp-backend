import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { offerIdParamSchema } from "../offers/offer.schemas";
import * as paymentController from "./payment.controller";

const paymentRouter = Router();

paymentRouter.use(authenticate);
paymentRouter.get(
  "/offers/:offerId/payment",
  validate({ params: offerIdParamSchema }),
  asyncHandler(paymentController.getPayment),
);
paymentRouter.post(
  "/offers/:offerId/payment/escrow",
  requireRole(Role.HIRER),
  validate({ params: offerIdParamSchema }),
  asyncHandler(paymentController.lockEscrow),
);
paymentRouter.post(
  "/offers/:offerId/payment/release",
  requireRole(Role.HIRER),
  validate({ params: offerIdParamSchema }),
  asyncHandler(paymentController.releaseEscrow),
);
paymentRouter.post(
  "/offers/:offerId/payment/refund",
  requireRole(Role.HIRER),
  validate({ params: offerIdParamSchema }),
  asyncHandler(paymentController.refundEscrow),
);

export default paymentRouter;
