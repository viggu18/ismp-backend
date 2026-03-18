import { Router } from "express";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate } from "../../common/middleware/validate.middleware";
import { offerIdParamSchema } from "../offers/offer.schemas";
import * as reviewController from "./review.controller";
import { createReviewSchema } from "./review.schemas";

const reviewRouter = Router();

reviewRouter.use(authenticate);
reviewRouter.get(
  "/offers/:offerId/reviews",
  validate({ params: offerIdParamSchema }),
  asyncHandler(reviewController.listOfferReviews),
);
reviewRouter.post(
  "/offers/:offerId/reviews",
  validate({ params: offerIdParamSchema, body: createReviewSchema }),
  asyncHandler(reviewController.createReview),
);

export default reviewRouter;
