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
        req.query = query.parse(req.query) as Request["query"];
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
