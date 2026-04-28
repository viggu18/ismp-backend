import {
  CampaignStatus,
  CampaignVisibility,
  ContentType,
  NotificationType,
  Prisma,
  Platform,
  Role,
} from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { getPagination } from "../../common/utils/pagination";
import { getCurrentUserOrThrow } from "../../common/utils/profile";
import { createNotifications } from "../notifications/notification.service";

type CampaignInput = {
  title?: string;
  description?: string;
  platforms?: Prisma.CampaignCreateInput["platforms"];
  contentTypes?: Prisma.CampaignCreateInput["contentTypes"];
  niche?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline?: string | null;
  startDate?: Date;
  deadlineDate?: Date;
  deliverablesCount?: number;
  languages?: string[];
  minFollowers?: number | null;
  targetCities?: string[];
  targetGender?: string | null;
  visibility?: CampaignVisibility;
  briefUrl?: string | null;
  briefText?: string | null;
};

type CampaignFilterInput = {
  platform?: Platform;
  contentType?: ContentType;
  niche?: string;
  minBudget?: number;
  maxBudget?: number;
  language?: string;
  minFollowers?: number;
  city?: string;
  targetGender?: string;
  visibility?: CampaignVisibility;
};

const getHirerProfileId = async (userId: string) => {
  const user = await getCurrentUserOrThrow(userId);

  if (user.role !== Role.HIRER || !user.hirerProfile) {
    throw new AppError("Complete your hirer profile before managing campaigns", 409);
  }

  return user.hirerProfile.id;
};

const baseCampaignInclude = {
  hirer: {
    include: {
      user: {
        select: {
          id: true,
          phone: true,
          email: true,
        },
      },
    },
  },
  applications: true,
  offers: true,
} satisfies Prisma.CampaignInclude;

export const createCampaign = async (userId: string, input: Required<CampaignInput>) => {
  const hirerId = await getHirerProfileId(userId);

  return prisma.campaign.create({
    data: {
      hirerId,
      title: input.title,
      description: input.description,
      platforms: input.platforms,
      contentTypes: input.contentTypes,
      niche: input.niche ?? null,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      timeline: input.timeline ?? null,
      startDate: input.startDate,
      deadlineDate: input.deadlineDate,
      deliverablesCount: input.deliverablesCount ?? 1,
      languages: input.languages ?? [],
      minFollowers: input.minFollowers ?? null,
      targetCities: input.targetCities ?? [],
      targetGender: input.targetGender ?? null,
      visibility: input.visibility ?? CampaignVisibility.PUBLIC,
      briefUrl: input.briefUrl ?? null,
      briefText: input.briefText ?? null,
    },
    include: baseCampaignInclude,
  });
};

export const listMyCampaigns = async (
  userId: string,
  pagination: ReturnType<typeof getPagination>,
) => {
  const hirerId = await getHirerProfileId(userId);

  const [items, total] = await prisma.$transaction([
    prisma.campaign.findMany({
      where: { hirerId },
      include: baseCampaignInclude,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.campaign.count({ where: { hirerId } }),
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

export const browseCampaigns = async (
  userId: string,
  role: Role,
  filters: CampaignFilterInput,
  pagination: ReturnType<typeof getPagination>,
) => {
  const user = await getCurrentUserOrThrow(userId);

  const where: Prisma.CampaignWhereInput =
    role === Role.HIRER
      ? {
          hirerId: user.hirerProfile?.id,
        }
      : {
          status: CampaignStatus.OPEN,
          OR: [
            { visibility: CampaignVisibility.PUBLIC },
            {
              offers: {
                some: {
                  influencerProfileId: user.influencerProfile?.id,
                },
              },
            },
          ],
        };

  if (filters.platform) {
    where.platforms = { has: filters.platform };
  }

  if (filters.contentType) {
    where.contentTypes = { has: filters.contentType };
  }

  if (filters.niche) {
    where.niche = { contains: filters.niche, mode: "insensitive" };
  }

  if (filters.minBudget) {
    where.budgetMax = { gte: filters.minBudget };
  }

  if (filters.maxBudget) {
    where.budgetMin = { lte: filters.maxBudget };
  }

  if (filters.language) {
    where.languages = { has: filters.language };
  }

  if (filters.minFollowers) {
    where.minFollowers = { lte: filters.minFollowers };
  }

  if (filters.city) {
    where.targetCities = { has: filters.city };
  }

  if (filters.targetGender) {
    where.targetGender = filters.targetGender;
  }

  if (filters.visibility && role === Role.HIRER) {
    where.visibility = filters.visibility;
  }

  const [items, total] = await prisma.$transaction([
    prisma.campaign.findMany({
      where,
      include: baseCampaignInclude,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.campaign.count({ where }),
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

export const getCampaignById = async (
  campaignId: string,
  userId: string,
  role: Role,
) => {
  const user = await getCurrentUserOrThrow(userId);
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      ...baseCampaignInclude,
      offers: {
        include: {
          conversation: true,
          payment: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  const canAccess =
    role === Role.HIRER
      ? campaign.hirer.user.id === userId
      : campaign.visibility === CampaignVisibility.PUBLIC ||
        campaign.applications.some(
          (application) => application.influencerProfileId === user.influencerProfile?.id,
        ) ||
        campaign.offers.some(
          (offer) => offer.influencerProfileId === user.influencerProfile?.id,
        );

  if (!canAccess) {
    throw new AppError("You do not have access to this campaign", 403);
  }

  return campaign;
};

export const updateCampaign = async (
  campaignId: string,
  userId: string,
  input: CampaignInput,
) => {
  const hirerId = await getHirerProfileId(userId);

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      hirerId,
    },
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      ...input,
    },
    include: baseCampaignInclude,
  });
};

export const changeCampaignStatus = async (
  campaignId: string,
  userId: string,
  status: CampaignStatus,
) => {
  const hirerId = await getHirerProfileId(userId);
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      hirerId,
    },
    include: {
      applications: {
        include: {
          influencerProfile: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status },
    include: baseCampaignInclude,
  });

  if (status === CampaignStatus.OPEN) {
    await createNotifications(
      campaign.applications.map((application) => application.influencerProfile.user.id),
      NotificationType.CAMPAIGN_MATCH,
      "Campaign reopened",
      `${campaign.title} is open for applications again`,
      { campaignId: campaign.id },
    );
  }

  return updatedCampaign;
};

type CampaignMetricsInput = {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  saves?: number;
  utmClicks?: number;
};

export const updateMetrics = async (
  campaignId: string,
  userId: string,
  input: CampaignMetricsInput,
) => {
  const hirerId = await getHirerProfileId(userId);

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      hirerId,
    },
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  return prisma.campaignMetrics.upsert({
    where: { campaignId },
    create: {
      campaignId,
      ...input,
    },
    update: {
      views: input.views !== undefined ? { increment: input.views } : undefined,
      likes: input.likes !== undefined ? { increment: input.likes } : undefined,
      comments: input.comments !== undefined ? { increment: input.comments } : undefined,
      shares: input.shares !== undefined ? { increment: input.shares } : undefined,
      reach: input.reach !== undefined ? { increment: input.reach } : undefined,
      saves: input.saves !== undefined ? { increment: input.saves } : undefined,
      utmClicks: input.utmClicks !== undefined ? { increment: input.utmClicks } : undefined,
    },
  });
};
