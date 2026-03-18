"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const app_error_1 = require("../errors/app-error");
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.currentUser) {
            return next(new app_error_1.AppError("Authentication is required", 401));
        }
        if (!roles.includes(req.currentUser.role)) {
            return next(new app_error_1.AppError("You do not have permission for this action", 403));
        }
        return next();
    };
};
exports.requireRole = requireRole;
