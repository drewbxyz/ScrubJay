import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { DeliveriesModule } from "../deliveries/deliveries.module";
import { DispatcherModule } from "../dispatcher/dispatcher.module";
import { EBirdModule } from "../ebird/ebird.module";
import { RssModule } from "../rss/rss.module";
import { SourcesModule } from "../sources/sources.module";
import { BootstrapService } from "./bootstrap.service";
import { DispatchJob } from "./dispatch.job";
import { EBirdIngestJob } from "./ebird-ingest.job";
import { RssIngestJob } from "./rss-ingest.job";

@Module({
  imports: [
    EBirdModule,
    ScheduleModule,
    DispatcherModule,
    DeliveriesModule,
    SourcesModule,
    RssModule,
  ],
  providers: [BootstrapService, EBirdIngestJob, DispatchJob, RssIngestJob],
})
export class JobsModule {}
