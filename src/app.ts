import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorMiddleware } from "./common/errors/error-middleware";
import { env } from "./config/env";
import { openApiJsonHandler, scalarDocsHandler } from "./docs/openapi";
import apiRouter from "./routes";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: env.nodeEnv === "development" ? false : undefined,
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "influencer-marketplace-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/openapi.json", openApiJsonHandler);
app.get("/docs", scalarDocsHandler);
app.use("/api", apiRouter);
app.use(errorMiddleware);

export default app;
