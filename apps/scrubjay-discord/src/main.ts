import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Run migrations before starting the app
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const db = drizzle(process.env.DATABASE_URL);
  await migrate(db, {
    migrationsFolder: join(process.cwd(), "src", "drizzle"),
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
