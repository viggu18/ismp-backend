import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { getPagination } from "../../common/utils/pagination";

export const getHirerCampaignArchive = async (
  userId: string,
  pagination: ReturnType<typeof getPagination>,
) => {
  const hirer = await prisma.hirerProfile.findUnique({
    where: { userId },
  });

  if (!hirer) {
    throw new AppError("Complete your hirer profile to view archive", 409);
  }

  const [items, total] = await prisma.$transaction([
    prisma.campaign.findMany({
      where: {
        hirerId: hirer.id,
      },
      include: {
        applications: true,
        offers: {
          include: {
            payment: true,
            contentSubmissions: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.campaign.count({
      where: {
        hirerId: hirer.id,
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

export const getInfluencerHistory = async (
  userId: string,
  pagination: ReturnType<typeof getPagination>,
) => {
  const influencer = await prisma.influencerProfile.findUnique({
    where: { userId },
  });

  if (!influencer) {
    throw new AppError("Complete your influencer profile to view history", 409);
  }

  const [items, total] = await prisma.$transaction([
    prisma.offer.findMany({
      where: {
        influencerProfileId: influencer.id,
      },
      include: {
        campaign: true,
        payment: true,
        contentSubmissions: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.offer.count({
      where: {
        influencerProfileId: influencer.id,
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
