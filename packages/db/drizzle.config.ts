import type { Config } from "drizzle-kit";

const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_APP_URL === "http://localhost:3000";
const databaseUrl = isDev ? process.env.DATABASE_URL_DEV : process.env.DATABASE_URL_PROD;

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
} satisfies Config;
