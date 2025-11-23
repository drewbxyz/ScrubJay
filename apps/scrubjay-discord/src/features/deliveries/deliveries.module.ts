import { Module } from "@nestjs/common";
import { DeliveriesRepository } from "./deliveries.repository";
import { DeliveriesService } from "./deliveries.service";

@Module({
  exports: [DeliveriesService],
  imports: [],
  providers: [DeliveriesRepository, DeliveriesService],
})
export class DeliveriesModule {}
