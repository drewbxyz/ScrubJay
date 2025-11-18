import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { DiscordModule } from "@/discord/discord.module";
import { DeliveriesModule } from "@/features/deliveries/deliveries.module";
import { DispatcherRepository } from "./dispatcher.repository";
import { DispatcherService } from "./dispatcher.service";

@Module({
  exports: [DispatcherService],
  imports: [DrizzleModule, DeliveriesModule, DiscordModule],
  providers: [DispatcherRepository, DispatcherService],
})
export class DispatcherModule {}
