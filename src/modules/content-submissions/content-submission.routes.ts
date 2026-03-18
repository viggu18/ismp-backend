import { Router } from "express";
import { Role } from "@prisma/client";

import { authenticate } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { offerIdParamSchema } from "../offers/offer.schemas";
import * as contentSubmissionController from "./content-submission.controller";
import {
  publishConfirmationSchema,
  requestRevisionSchema,
  submissionIdParamSchema,
  submitContentSchema,
} from "./content-submission.schemas";

const contentSubmissionRouter = Router();

contentSubmissionRouter.use(authenticate);
contentSubmissionRouter.get(
  "/offers/:offerId/content-submissions",
  validate({ params: offerIdParamSchema }),
  asyncHandler(contentSubmissionController.listSubmissions),
);
contentSubmissionRouter.post(
  "/offers/:offerId/content-submissions",
  requireRole(Role.INFLUENCER),
  validate({ params: offerIdParamSchema, body: submitContentSchema }),
  asyncHandler(contentSubmissionController.submitContent),
);
contentSubmissionRouter.post(
  "/content-submissions/:submissionId/request-revision",
  requireRole(Role.HIRER),
  validate({ params: submissionIdParamSchema, body: requestRevisionSchema }),
  asyncHandler(contentSubmissionController.requestRevision),
);
contentSubmissionRouter.post(
  "/content-submissions/:submissionId/approve",
  requireRole(Role.HIRER),
  validate({ params: submissionIdParamSchema }),
  asyncHandler(contentSubmissionController.approveSubmission),
);
contentSubmissionRouter.post(
  "/content-submissions/:submissionId/publish",
  requireRole(Role.INFLUENCER),
  validate({ params: submissionIdParamSchema, body: publishConfirmationSchema }),
  asyncHandler(contentSubmissionController.confirmPublish),
);

export default contentSubmissionRouter;
