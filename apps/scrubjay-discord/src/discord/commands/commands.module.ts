import { Module } from "@nestjs/common";
import { FiltersModule } from "@/features/filters/filters.module";
import { SubscriptionsModule } from "@/features/subscriptions/subscriptions.module";
import { SubscriptionCommands } from "./subscription-commands.service";
import { UtilCommands } from "./util-commands.service";

@Module({
  imports: [FiltersModule, SubscriptionsModule],
  providers: [UtilCommands, SubscriptionCommands],
})
export class CommandsModule {}
