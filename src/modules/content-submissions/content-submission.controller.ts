import { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response";
import * as contentSubmissionService from "./content-submission.service";

export const listSubmissions = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const submissions = await contentSubmissionService.listSubmissions(
    req.currentUser!.userId,
    offerId,
  );
  return sendSuccess(res, submissions, "Content submissions fetched");
};

export const submitContent = async (req: Request, res: Response) => {
  const { offerId } = req.params as { offerId: string };
  const submission = await contentSubmissionService.submitContent(
    req.currentUser!.userId,
    offerId,
    req.body,
  );
  return sendSuccess(res, submission, "Content submitted", 201);
};

export const requestRevision = async (req: Request, res: Response) => {
  const { submissionId } = req.params as { submissionId: string };
  const submission = await contentSubmissionService.requestRevision(
    req.currentUser!.userId,
    submissionId,
    req.body.revisionNote,
  );
  return sendSuccess(res, submission, "Revision requested");
};

export const approveSubmission = async (req: Request, res: Response) => {
  const { submissionId } = req.params as { submissionId: string };
  const submission = await contentSubmissionService.approveSubmission(
    req.currentUser!.userId,
    submissionId,
  );
  return sendSuccess(res, submission, "Content approved");
};

export const confirmPublish = async (req: Request, res: Response) => {
  const { submissionId } = req.params as { submissionId: string };
  const submission = await contentSubmissionService.confirmPublish(
    req.currentUser!.userId,
    submissionId,
    req.body,
  );
  return sendSuccess(res, submission, "Publish confirmation and proof recorded");
};
