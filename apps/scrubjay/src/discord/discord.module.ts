import { Module } from "@nestjs/common";
import { DiscordHelper } from "./discord.helper";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { FiltersModule } from "@/features/filters/filters.module";
import {
  REACTION_HANDLERS,
  ReactionRouter,
} from "./reaction-router/reaction-router.service";
import { FiltersAddHandler } from "@/features/filters/handlers/filters-add.handler";

@Module({
  imports: [DrizzleModule, FiltersModule],
  providers: [
    DiscordHelper,
    ReactionRouter,
    {
      provide: REACTION_HANDLERS,
      useFactory: (filterAdd: FiltersAddHandler) => [filterAdd],
      inject: [FiltersAddHandler],
    },
  ],
  exports: [DiscordHelper],
})
export class DiscordModule {}
