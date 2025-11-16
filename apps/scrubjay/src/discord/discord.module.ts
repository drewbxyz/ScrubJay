import { Module } from "@nestjs/common";
import { DiscordHelper } from "./discord.helper";
import { DiscordListeners } from "./discord.listeners";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";

@Module({
  imports: [DrizzleModule],
  providers: [DiscordHelper, DiscordListeners],
  exports: [DiscordHelper],
})
export class DiscordModule {}
