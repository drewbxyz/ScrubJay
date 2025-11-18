import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { FiltersModule } from "@/features/filters/filters.module";
import { FiltersAddHandler } from "@/features/filters/handlers/filters-add.handler";
import { DiscordHelper } from "./discord.helper";
import { ReactionListener } from "./listeners/reaction.listener";
import {
  REACTION_HANDLERS,
  ReactionRouter,
} from "./reaction-router/reaction-router.service";

@Module({
  exports: [DiscordHelper],
  imports: [DrizzleModule, FiltersModule],
  providers: [
    DiscordHelper,
    ReactionRouter,
    {
      inject: [FiltersAddHandler],
      provide: REACTION_HANDLERS,
      useFactory: (filterAdd: FiltersAddHandler) => [filterAdd],
    },
    ReactionListener,
  ],
})
export class DiscordModule {}
