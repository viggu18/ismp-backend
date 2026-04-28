import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { getCurrentUserOrThrow } from "../../common/utils/profile";

type UpsertHirerProfileInput = {
  companyName: string;
  logoUrl?: string | null;
  industry?: string | null;
  website?: string | null;
  description?: string | null;
  gstNumber?: string | null;
  city?: string | null;
  state?: string | null;
};

export const getMyProfile = async (userId: string) => {
  const user = await getCurrentUserOrThrow(userId);

  if (user.role !== "HIRER") {
    throw new AppError("Only hirers can access this profile", 403);
  }

  return user.hirerProfile;
};

export const upsertMyProfile = async (
  userId: string,
  input: UpsertHirerProfileInput,
) => {
  const user = await getCurrentUserOrThrow(userId);

  if (user.role !== "HIRER") {
    throw new AppError("Only hirers can manage this profile", 403);
  }

  return prisma.hirerProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...input,
    },
    update: {
      ...input,
      isGstVerified: Boolean(input.gstNumber) ? undefined : false,
    },
  });
};

export const createSavedSearch = async (userId: string, input: { filterJson: any; alertEnabled?: boolean }) => {
  const user = await getCurrentUserOrThrow(userId);
  if (user.role !== "HIRER" || !user.hirerProfile) {
    throw new AppError("Hirer profile required", 403);
  }
  return prisma.savedSearch.create({
    data: {
      hirerProfileId: user.hirerProfile.id,
      filterJson: input.filterJson,
      alertEnabled: input.alertEnabled ?? true,
    },
  });
};

export const listSavedSearches = async (userId: string) => {
  const user = await getCurrentUserOrThrow(userId);
  if (user.role !== "HIRER" || !user.hirerProfile) {
    throw new AppError("Hirer profile required", 403);
  }
  return prisma.savedSearch.findMany({
    where: { hirerProfileId: user.hirerProfile.id },
    orderBy: { createdAt: "desc" },
  });
};
