import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, result, "Registration successful", 201);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, "Login successful");
};

export const getMe = async (req: Request, res: Response) => {
  const result = await authService.getMe(req.currentUser!.userId);
  return sendSuccess(res, result, "Current user fetched");
};
