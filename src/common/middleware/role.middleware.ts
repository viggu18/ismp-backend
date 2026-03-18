import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error";

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return next(new AppError("Authentication is required", 401));
    }

    if (!roles.includes(req.currentUser.role)) {
      return next(new AppError("You do not have permission for this action", 403));
    }

    return next();
  };
};
