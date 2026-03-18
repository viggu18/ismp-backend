import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as offerController from "./offer.controller";
import {
  counterOfferSchema,
  createOfferSchema,
  offerIdParamSchema,
  reviseOfferSchema,
} from "./offer.schemas";

const offerRouter = Router();

offerRouter.use(authenticate);
offerRouter.get("/my", asyncHandler(offerController.listMyOffers));
offerRouter.get(
  "/:offerId",
  validate({ params: offerIdParamSchema }),
  asyncHandler(offerController.getOfferById),
);
offerRouter.post(
  "/",
  requireRole(Role.HIRER),
  validate({ body: createOfferSchema }),
  asyncHandler(offerController.createOffer),
);
offerRouter.post(
  "/:offerId/accept",
  requireRole(Role.INFLUENCER),
  validate({ params: offerIdParamSchema }),
  asyncHandler(offerController.acceptOffer),
);
offerRouter.post(
  "/:offerId/decline",
  requireRole(Role.INFLUENCER),
  validate({ params: offerIdParamSchema }),
  asyncHandler(offerController.declineOffer),
);
offerRouter.post(
  "/:offerId/counter",
  requireRole(Role.INFLUENCER),
  validate({ params: offerIdParamSchema, body: counterOfferSchema }),
  asyncHandler(offerController.counterOffer),
);
offerRouter.post(
  "/:offerId/revise",
  requireRole(Role.HIRER),
  validate({ params: offerIdParamSchema, body: reviseOfferSchema }),
  asyncHandler(offerController.reviseOffer),
);
offerRouter.post(
  "/:offerId/expire",
  requireRole(Role.HIRER),
  validate({ params: offerIdParamSchema }),
  asyncHandler(offerController.expireOffer),
);

export default offerRouter;
