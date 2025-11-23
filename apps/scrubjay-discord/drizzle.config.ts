import { defineConfig } from "drizzle-kit";
import { z } from "zod";

export default defineConfig({
  dbCredentials: {
    url: z.string().parse(process.env.DATABASE_URL),
  },
  dialect: "postgresql",
  out: "./src/drizzle",
  schema: "./src/core/drizzle/drizzle.schema.ts",
});
