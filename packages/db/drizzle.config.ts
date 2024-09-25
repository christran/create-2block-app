import type { Config } from "drizzle-kit";
// import { DATABASE_PREFIX } from "@/lib/constants";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing POSTGRES_URL");
}

const nonPoolingUrl = process.env.DATABASE_URL.replace(":6543", ":5432");

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: nonPoolingUrl,
  },
  // tablesFilter: [`${DATABASE_PREFIX}_*`],
} satisfies Config;
