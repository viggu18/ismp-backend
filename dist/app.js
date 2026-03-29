"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("./common/errors/error-middleware");
const request_logger_middleware_1 = require("./common/middleware/request-logger.middleware");
const env_1 = require("./config/env");
const openapi_1 = require("./docs/openapi");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: env_1.env.nodeEnv === "development" ? false : undefined,
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(request_logger_middleware_1.requestLogger);
// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "influencer-marketplace-api",
        timestamp: new Date().toISOString(),
    });
});
app.get("/openapi.json", openapi_1.openApiJsonHandler);
app.get("/docs", openapi_1.scalarDocsHandler);
app.use("/api", routes_1.default);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
