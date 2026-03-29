import { Role } from "@prisma/client";

import prisma from "../../prisma/prisma.client";
import { AppError } from "../../common/errors/app-error";
import { signToken } from "../../common/utils/jwt";
import { comparePassword, hashPassword } from "../../common/utils/password";
import { verificationProvider } from "../../providers/verification.provider";

type RegisterInput = {
  role: Role;
  phone: string;
  email?: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const getProfileSummary = (user: {
  role: Role;
  hirerProfile: { id: string } | null;
  influencerProfile: { id: string } | null;
}) => {
  const profile =
    user.role === Role.HIRER ? user.hirerProfile : user.influencerProfile;

  return {
    profileId: profile?.id ?? null,
    profileCompleted: Boolean(profile),
  };
};

const formatAuthResponse = (user: {
  id: string;
  role: Role;
  phone: string;
  email: string | null;
  isVerified: boolean;
  hirerProfile: { id: string } | null;
  influencerProfile: { id: string } | null;
}) => {
  return {
    token: signToken({
      userId: user.id,
      role: user.role,
    }),
    user: {
      id: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      isVerified: user.isVerified,
      ...getProfileSummary(user),
    },
  };
};

export const register = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: input.phone },
        ...(input.email ? [{ email: input.email }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new AppError("A user with that phone or email already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);
  const phoneVerification = await verificationProvider.verifyPhone(input.phone);
  const emailVerification = input.email
    ? await verificationProvider.verifyEmail(input.email)
    : null;

  const user = await prisma.user.create({
    data: {
      role: input.role,
      phone: input.phone,
      email: input.email,
      passwordHash,
      isVerified:
        phoneVerification.isVerified && (emailVerification?.isVerified ?? true),
    },
    include: {
      hirerProfile: true,
      influencerProfile: true,
    },
  });

  return formatAuthResponse(user);
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ phone: input.email }, { email: input.email }],
    },
    include: {
      hirerProfile: true,
      influencerProfile: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account is inactive", 403);
  }

  return formatAuthResponse(user);
};

export const getMe = async (userId: string) => {
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

  return {
    id: user.id,
    role: user.role,
    phone: user.phone,
    email: user.email,
    isVerified: user.isVerified,
    hirerProfile: user.hirerProfile,
    influencerProfile: user.influencerProfile,
    ...getProfileSummary(user),
  };
};
