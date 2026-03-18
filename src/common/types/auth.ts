import { Role } from "@prisma/client";

export type AuthenticatedUser = {
  userId: string;
  role: Role;
  phone: string;
  email: string | null;
  isVerified: boolean;
  hirerProfileId?: string;
  influencerProfileId?: string;
};
