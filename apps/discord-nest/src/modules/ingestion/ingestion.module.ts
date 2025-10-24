import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { Module } from "@nestjs/common";
import { EBirdIngestionService } from "./ebird/ebird.ingestion";

@Module({
  imports: [DrizzleModule],
  providers: [EBirdIngestionService],
  exports: [EBirdIngestionService],
})
export class IngestionModule {}