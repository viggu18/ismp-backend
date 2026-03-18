import { NextFunction, Request, Response } from "express";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../errors/app-error";
import { verifyToken } from "../utils/jwt";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is required", 401));
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        hirerProfile: true,
        influencerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return next(new AppError("Authenticated user is no longer active", 401));
    }

    req.currentUser = {
      userId: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      isVerified: user.isVerified,
      hirerProfileId: user.hirerProfile?.id,
      influencerProfileId: user.influencerProfile?.id,
    };

    return next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired authentication token", 401, error),
    );
  }
};
