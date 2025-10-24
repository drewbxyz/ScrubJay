import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from './core/drizzle/drizzle.module';
import * as Joi from "joi";
import { ScheduleModule } from "@nestjs/schedule";
import { DiscordModule } from "@/core/discord/discord.module";

const configSchema = Joi.object({
  DISCORD_TOKEN: Joi.string().required(),
  DISCORD_CLIENT_ID: Joi.string().required(),
  EBIRD_TOKEN: Joi.string().required(),
  EBIRD_BASE_URL: Joi.string().optional().default("https://api.ebird.org/"),
});

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
    }),
    DrizzleModule,
    DiscordModule,
  ],
  providers: [],
})
export class AppModule {}
