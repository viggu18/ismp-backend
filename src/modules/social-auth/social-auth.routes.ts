import { Router } from "express";
import { initiateAuth, handleCallback } from "./social-auth.controller";

const socialAuthRouter = Router();

socialAuthRouter.get("/:platform", initiateAuth);
socialAuthRouter.get("/:platform/callback", handleCallback);

export default socialAuthRouter;
