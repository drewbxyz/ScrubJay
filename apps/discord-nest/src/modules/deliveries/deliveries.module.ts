import { Module } from "@nestjs/common";
import { DeliveriesRepository } from "./deliveries.repository";
import { DeliveriesService } from "./deliveries.service";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";

@Module({
  imports: [DrizzleModule],
  providers: [DeliveriesRepository],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
