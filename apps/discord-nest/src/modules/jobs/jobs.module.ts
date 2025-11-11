import { Module } from "@nestjs/common";
import { EBirdModule } from "../ebird/ebird.module";
import { ScheduleModule } from "@nestjs/schedule";
import { DispatcherModule } from "../dispatcher/dispatcher.module";
import { DeliveriesModule } from "../deliveries/deliveries.module";
import { BootstrapService } from "./bootstrap.service";
import { EBirdIngestJob } from "./ebird-ingest.job";
import { DispatchJob } from "./dispatch.job";

@Module({
  imports: [EBirdModule, ScheduleModule, DispatcherModule, DeliveriesModule],
  providers: [BootstrapService, EBirdIngestJob, DispatchJob],
})
export class JobsModule {}
