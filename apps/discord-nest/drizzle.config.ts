import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/core/drizzle/drizzle.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
