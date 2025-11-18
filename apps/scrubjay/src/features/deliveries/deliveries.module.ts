import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { DeliveriesRepository } from "./deliveries.repository";
import { DeliveriesService } from "./deliveries.service";

@Module({
  exports: [DeliveriesService],
  imports: [DrizzleModule],
  providers: [DeliveriesRepository, DeliveriesService],
})
export class DeliveriesModule {}
