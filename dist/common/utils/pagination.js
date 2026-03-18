"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = void 0;
const getPagination = (req) => {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);
    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};
exports.getPagination = getPagination;
