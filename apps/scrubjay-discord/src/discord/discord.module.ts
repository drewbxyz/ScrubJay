import { Module } from "@nestjs/common";
import { FiltersModule } from "@/features/filters/filters.module";
import { CommandsModule } from "./commands/commands.module";
import { DiscordHelper } from "./discord.helper";
import { ListenersModule } from "./listeners/listeners.module";
import { ReactionRouterModule } from "./reaction-router/reaction-router.module";

@Module({
  exports: [DiscordHelper],
  imports: [
    ReactionRouterModule,
    CommandsModule,
    ListenersModule,
    FiltersModule,
  ],
  providers: [DiscordHelper],
})
export class DiscordModule {}
