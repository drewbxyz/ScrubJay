import { DatabaseModule } from "@/core/database/database.module";
import { SourcesService } from "./sources.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [DatabaseModule],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}