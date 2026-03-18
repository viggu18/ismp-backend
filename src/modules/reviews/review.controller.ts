import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as reviewService from "./review.service";

export const listOfferReviews = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const reviews = await reviewService.listOfferReviews(req.currentUser!.userId, offerId);
  return sendSuccess(res, reviews, "Reviews fetched");
};

export const createReview = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const review = await reviewService.createReview(
    req.currentUser!.userId,
    req.currentUser!.role,
    offerId,
    req.body,
  );
  return sendSuccess(res, review, "Review created", 201);
};
