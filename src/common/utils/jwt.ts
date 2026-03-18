import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "../../config/env";
import { AuthenticatedUser } from "../types/auth";

type JwtPayload = Pick<AuthenticatedUser, "userId" | "role">;

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
