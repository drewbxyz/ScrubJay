import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { GatewayIntentBits, Partials } from "discord.js";
import * as Joi from "joi";
import { NecordModule } from "necord";
import { JobsModule } from "@/features/jobs/jobs.module";
import { DrizzleModule } from "./core/drizzle/drizzle.module";
import { DiscordModule } from "./discord/discord.module";

const configSchema = Joi.object({
  DEVELOPMENT_SERVER: Joi.string().optional(),
  DISCORD_CLIENT_ID: Joi.string().required(),
  DISCORD_TOKEN: Joi.string().required(),
  EBIRD_BASE_URL: Joi.string().optional().default("https://api.ebird.org/"),
  EBIRD_TOKEN: Joi.string().required(),
});

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
    }),
    DrizzleModule,
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        development: configService.get("DEVELOPMENT_SERVER_ID") && [
          configService.get("DEVELOPMENT_SERVER_ID"),
        ],
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildMessageReactions,
        ],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        token: configService.getOrThrow<string>("DISCORD_TOKEN"),
      }),
    }),
    DiscordModule,
    JobsModule,
  ],
  providers: [],
})
export class AppModule {}
