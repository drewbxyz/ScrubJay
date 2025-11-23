import { Module } from "@nestjs/common";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  exports: [SubscriptionsService],
  imports: [],
  providers: [SubscriptionsService, SubscriptionsRepository],
})
export class SubscriptionsModule {}
