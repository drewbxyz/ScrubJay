import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: "postgresql",
  out: "./src/drizzle",
  schema: "./src/core/drizzle/drizzle.schema.ts",
});
