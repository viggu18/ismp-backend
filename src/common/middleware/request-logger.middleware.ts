import { NextFunction, Request, Response } from "express";

import { env } from "../../config/env";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "authorization",
  "jwt",
  "secret",
  "apikey",
  "api_key",
  "servicekey",
  "service_role_key",
  "anonkey",
  "anon_key",
]);

const MAX_STRING_LENGTH = 500;

const sanitizeValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    if (value.length <= MAX_STRING_LENGTH) {
      return value;
    }

    return `${value.slice(0, MAX_STRING_LENGTH)}...<truncated>`;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (accumulator, [key, nestedValue]) => {
        const normalizedKey = key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        accumulator[key] = SENSITIVE_KEYS.has(normalizedKey)
          ? "<redacted>"
          : sanitizeValue(nestedValue);
        return accumulator;
      },
      {},
    );
  }

  return value;
};

const normalizePayload = (value: unknown) => sanitizeValue(value ?? {});

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (!env.requestLoggerEnabled) {
    next();
    return;
  }

  const startedAt = process.hrtime.bigint();
  const requestTimestamp = new Date().toISOString();
  const requestDetails = {
    timestamp: requestTimestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    params: normalizePayload(req.params),
    query: normalizePayload(req.query),
    body: normalizePayload(req.body),
  };

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const responseDetails = {
      ...requestDetails,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    };

    const logMethod = res.statusCode >= 500 ? console.error : console.log;
    logMethod("[request]", JSON.stringify(responseDetails));
  });

  next();
};
