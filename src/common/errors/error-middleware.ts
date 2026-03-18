import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "./app-error";
import { sendError } from "../utils/response";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    return sendError(res, "Validation failed", 422, error.flatten());
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return sendError(res, "A unique field already exists", 409, error.meta);
    }

    if (error.code === "P2025") {
      return sendError(res, "Requested record was not found", 404, error.meta);
    }
  }

  if (error instanceof Error) {
    return sendError(res, error.message, 500);
  }

  return sendError(res, "Unexpected server error", 500, error);
};
