import { Module } from "@nestjs/common";
import { DispatcherRepository } from "./dispatcher.repository";
import { DispatcherService } from "./dispatcher.service";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { DeliveriesModule } from "@/modules/deliveries/deliveries.module";
import { DiscordModule } from "@/modules/discord/discord.module";

@Module({
  imports: [DrizzleModule, DeliveriesModule, DiscordModule],
  providers: [DispatcherRepository, DispatcherService],
  exports: [DispatcherService],
})
export class DispatcherModule {}
