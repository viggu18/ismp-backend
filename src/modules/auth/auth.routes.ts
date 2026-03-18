import { Router } from "express";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate } from "../../common/middleware/validate.middleware";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

const authRouter = Router();

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);
authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);
authRouter.get("/me", authenticate, asyncHandler(authController.getMe));

export default authRouter;
