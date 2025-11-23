import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./drizzle.schema";
import { DrizzleService } from "./drizzle.service";
import { PG_CONNECTION } from "./pg-connection";

@Module({
  exports: [DrizzleService],
  imports: [ConfigModule],
  providers: [
    {
      inject: [ConfigService],
      provide: PG_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get("DATABASE_URL");
        if (!dbUrl) {
          throw new Error("DATABASE_URL is not set");
        }
        return drizzle(dbUrl, { schema });
      },
    },
    DrizzleService,
  ],
})
export class DrizzleModule {}
