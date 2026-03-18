import { Request } from "express";

export const getPagination = (req: Request) => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
