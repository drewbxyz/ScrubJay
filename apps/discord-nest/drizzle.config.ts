import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/core/drizzle/drizzle.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
