import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.NODE_ENV === "production" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL_DEV or DATABASE_URL_PROD");
}
export const connection = postgres(databaseUrl, {
  // max_lifetime: 10, // Remove this line if you're deploying to Docker / VPS
  idle_timeout: 20, // Uncomment this line if you're deploying to Docker / VPS
});

export const db = drizzle(connection, { schema });