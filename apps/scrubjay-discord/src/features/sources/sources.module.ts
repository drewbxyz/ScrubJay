import { Module } from "@nestjs/common";
import { SourcesRepository } from "./sources.repository";
import { SourcesService } from "./sources.service";

@Module({
  exports: [SourcesService],
  imports: [],
  providers: [SourcesService, SourcesRepository],
})
export class SourcesModule {}
