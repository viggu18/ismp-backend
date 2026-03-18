import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { getCurrentUserOrThrow } from "../../common/utils/profile";
import { getPagination } from "../../common/utils/pagination";

type UpsertInfluencerProfileInput = {
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  languages: string[];
  niches: string[];
  gender?: string | null;
  isAvailable?: boolean;
};

type ReplaceSocialAccountsInput = {
  socialAccounts: Array<{
    platform: "INSTAGRAM" | "YOUTUBE" | "JOSH" | "MOJ" | "SHARECHAT";
    handle: string;
    profileUrl?: string | null;
    followerCount?: number;
    engagementRate?: number | null;
    isVerified?: boolean;
  }>;
};

type ReplaceRateCardsInput = {
  ratecards: Array<{
    platform: "INSTAGRAM" | "YOUTUBE" | "JOSH" | "MOJ" | "SHARECHAT";
    contentType:
      | "REEL"
      | "STATIC_POST"
      | "STORY"
      | "YOUTUBE_VIDEO"
      | "SHORT"
      | "PODCAST";
    priceInr: number;
  }>;
};

const ensureInfluencer = async (userId: string) => {
  const user = await getCurrentUserOrThrow(userId);

  if (user.role !== "INFLUENCER") {
    throw new AppError("Only influencers can access this profile", 403);
  }

  return user;
};

export const getMyProfile = async (userId: string) => {
  const user = await ensureInfluencer(userId);

  if (!user.influencerProfile) {
    return null;
  }

  return prisma.influencerProfile.findUnique({
    where: { id: user.influencerProfile.id },
    include: {
      socialAccounts: true,
      ratecards: true,
    },
  });
};

export const upsertMyProfile = async (
  userId: string,
  input: UpsertInfluencerProfileInput,
) => {
  await ensureInfluencer(userId);

  return prisma.influencerProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...input,
    },
    update: {
      ...input,
    },
  });
};

export const replaceSocialAccounts = async (
  userId: string,
  input: ReplaceSocialAccountsInput,
) => {
  const user = await ensureInfluencer(userId);

  if (!user.influencerProfile) {
    throw new AppError("Complete your influencer profile before adding social accounts", 409);
  }

  return prisma.$transaction(async (tx) => {
    await tx.socialAccount.deleteMany({
      where: {
        influencerProfileId: user.influencerProfile!.id,
      },
    });

    if (!input.socialAccounts.length) {
      return [];
    }

    await tx.socialAccount.createMany({
      data: input.socialAccounts.map((account) => ({
        influencerProfileId: user.influencerProfile!.id,
        platform: account.platform,
        handle: account.handle,
        profileUrl: account.profileUrl,
        followerCount: account.followerCount ?? 0,
        engagementRate: account.engagementRate ?? null,
        isVerified: account.isVerified ?? false,
      })),
    });

    return tx.socialAccount.findMany({
      where: {
        influencerProfileId: user.influencerProfile!.id,
      },
      orderBy: { platform: "asc" },
    });
  });
};

export const replaceRateCards = async (
  userId: string,
  input: ReplaceRateCardsInput,
) => {
  const user = await ensureInfluencer(userId);

  if (!user.influencerProfile) {
    throw new AppError("Complete your influencer profile before adding rate cards", 409);
  }

  return prisma.$transaction(async (tx) => {
    await tx.rateCard.deleteMany({
      where: {
        influencerProfileId: user.influencerProfile!.id,
      },
    });

    if (!input.ratecards.length) {
      return [];
    }

    await tx.rateCard.createMany({
      data: input.ratecards.map((rateCard) => ({
        influencerProfileId: user.influencerProfile!.id,
        platform: rateCard.platform,
        contentType: rateCard.contentType,
        priceInr: rateCard.priceInr,
      })),
    });

    return tx.rateCard.findMany({
      where: {
        influencerProfileId: user.influencerProfile!.id,
      },
      orderBy: [{ platform: "asc" }, { contentType: "asc" }],
    });
  });
};

export const getEarningsHistory = async (
  userId: string,
  pagination: ReturnType<typeof getPagination>,
) => {
  const user = await ensureInfluencer(userId);

  if (!user.influencerProfile) {
    throw new AppError("Complete your influencer profile to view earnings", 409);
  }

  const [items, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: {
        offer: {
          influencerProfileId: user.influencerProfile.id,
        },
      },
      include: {
        offer: {
          include: {
            campaign: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.payment.count({
      where: {
        offer: {
          influencerProfileId: user.influencerProfile.id,
        },
      },
    }),
  ]);

  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.max(Math.ceil(total / pagination.limit), 1),
    },
  };
};
