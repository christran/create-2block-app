import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_APP_URL === "http://localhost:3000";
const databaseUrl = isDev ? process.env.DATABASE_URL_DEV : process.env.DATABASE_URL_PROD;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL_DEV or DATABASE_URL_PROD");
}
export const connection = postgres(databaseUrl, {
  // max_lifetime: 10, // Remove this line if you're deploying to Docker / VPS
  idle_timeout: 20, // Uncomment this line if you're deploying to Docker / VPS
});

export const db = drizzle(connection, { schema });