"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({
        connectionString: env_1.env.databaseUrl,
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
exports.default = prisma;
