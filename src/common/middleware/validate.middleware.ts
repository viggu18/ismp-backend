import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

type ValidationShape = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validate =
  ({ body, params, query }: ValidationShape) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }

      if (params) {
        req.params = params.parse(req.params) as Request["params"];
      }

      if (query) {
        const parsed = query.parse(req.query) as Request["query"];
        // req.query is a getter-only on IncomingMessage — mutate in-place
        Object.keys(req.query).forEach(k => delete (req.query as Record<string, unknown>)[k]);
        Object.assign(req.query, parsed);
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
