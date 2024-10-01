import type { Config } from "drizzle-kit";
// import { DATABASE_PREFIX } from "@2block/shared/shared-constants";

const databaseUrl = process.env.NODE_ENV === "production" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL_DEV or DATABASE_URL_PROD");
}

const nonPoolingUrl = databaseUrl.replace(":6543", ":5432");

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: nonPoolingUrl,
  },
  // tablesFilter: [`${DATABASE_PREFIX}_*`],
} satisfies Config;
