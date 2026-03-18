import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as offerService from "./offer.service";

export const createOffer = async (req: Request, res: Response) => {
  const offer = await offerService.createOffer(req.currentUser!.userId, req.body);
  return sendSuccess(res, offer, "Offer created", 201);
};

export const listMyOffers = async (req: Request, res: Response) => {
  const offers = await offerService.listMyOffers(req.currentUser!.userId, req.currentUser!.role);
  return sendSuccess(res, offers, "Offers fetched");
};

export const getOfferById = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const offer = await offerService.getOfferById(
    req.currentUser!.userId,
    req.currentUser!.role,
    offerId,
  );
  return sendSuccess(res, offer, "Offer fetched");
};

export const acceptOffer = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const offer = await offerService.acceptOffer(req.currentUser!.userId, offerId);
  return sendSuccess(res, offer, "Offer accepted");
};

export const declineOffer = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const offer = await offerService.declineOffer(req.currentUser!.userId, offerId);
  return sendSuccess(res, offer, "Offer declined");
};

export const counterOffer = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const offer = await offerService.counterOffer(
    req.currentUser!.userId,
    offerId,
    req.body,
  );
  return sendSuccess(res, offer, "Offer countered");
};

export const reviseOffer = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const offer = await offerService.reviseOffer(
    req.currentUser!.userId,
    offerId,
    req.body,
  );
  return sendSuccess(res, offer, "Offer revised");
};

export const expireOffer = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const offer = await offerService.expireOffer(req.currentUser!.userId, offerId);
  return sendSuccess(res, offer, "Offer expired");
};
