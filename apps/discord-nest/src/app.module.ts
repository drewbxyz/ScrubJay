import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DrizzleModule } from './core/drizzle/drizzle.module';
import * as Joi from "joi";
import { ScheduleModule } from "@nestjs/schedule";
import { NecordModule } from "necord";
import { GatewayIntentBits } from "discord.js";
import { WorkflowsModule } from "./workflows/workflows.module";

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
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('DISCORD_TOKEN')!,
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
        ],
      }),
      inject: [ConfigService],
    }),
    WorkflowsModule,
  ],
  providers: [],
})
export class AppModule {}
