import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.LIFECYCLE_EMAILS_SERVICE_DATABASE_URL!,
  },
});
