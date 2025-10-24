import { DatabaseModule } from "@/core/database/database.module";
import { Module } from "@nestjs/common";
import { EBirdIngestionService } from "./ebird/ebird.ingestion";

@Module({
  imports: [DatabaseModule],
  providers: [EBirdIngestionService],
  exports: [EBirdIngestionService],
})
export class IngestionModule {}