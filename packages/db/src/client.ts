import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables");
}

export const connection = postgres(process.env.DATABASE_URL, {
  // max_lifetime: 10, // Remove this line if you're deploying to Docker / VPS
  idle_timeout: 20, // Uncomment this line if you're deploying to Docker / VPS
});

export const db = drizzle(connection, { schema });