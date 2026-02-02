import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.LIFECYCLE_EMAILS_SERVICE_DATABASE_URL;

if (!connectionString) {
  throw new Error("LIFECYCLE_EMAILS_SERVICE_DATABASE_URL is not set");
}

export const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });
