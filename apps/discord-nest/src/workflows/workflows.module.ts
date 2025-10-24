import { Module } from "@nestjs/common";
import { EBirdWorkflow } from "./ebird/ebird.workflow";
import { DispatchModule } from "@/modules/dispatch/dispatch.module";
import { IngestionModule } from "@/modules/ingestion/ingestion.module";
import { SourcesModule } from "@/modules/sources/sources.module";

@Module({
  imports: [DispatchModule, IngestionModule, SourcesModule],
  providers: [EBirdWorkflow],
  exports: [EBirdWorkflow],
})
export class WorkflowsModule {}