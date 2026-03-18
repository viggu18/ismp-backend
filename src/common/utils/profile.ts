import { Role } from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../errors/app-error";

export const getCurrentUserOrThrow = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hirerProfile: true,
      influencerProfile: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const getHirerProfileOrThrow = async (userId: string) => {
  const user = await getCurrentUserOrThrow(userId);

  if (user.role !== Role.HIRER) {
    throw new AppError("This action is only available to hirers", 403);
  }

  return user.hirerProfile;
};

export const getInfluencerProfileOrThrow = async (userId: string) => {
  const user = await getCurrentUserOrThrow(userId);

  if (user.role !== Role.INFLUENCER) {
    throw new AppError("This action is only available to influencers", 403);
  }

  return user.influencerProfile;
};
