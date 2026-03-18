import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "../config/env";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.databaseUrl,
  }),
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export default prisma;
