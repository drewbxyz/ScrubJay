import { Module } from "@nestjs/common";
import { DiscordModule } from "@/discord/discord.module";
import { DeliveriesModule } from "@/features/deliveries/deliveries.module";
import { DispatcherRepository } from "./dispatcher.repository";
import { DispatcherService } from "./dispatcher.service";
import { EBirdDispatcherService } from "./dispatchers/ebird-dispatcher.service";
import { RssDispatcherService } from "./dispatchers/rss-dispatcher.service";

@Module({
  exports: [DispatcherService],
  imports: [DeliveriesModule, DiscordModule],
  providers: [
    DispatcherRepository,
    EBirdDispatcherService,
    RssDispatcherService,
    DispatcherService,
  ],
})
export class DispatcherModule {}
