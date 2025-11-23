import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { SourcesRepository } from "./sources.repository";
import { SourcesService } from "./sources.service";

@Module({
  exports: [SourcesService],
  imports: [DrizzleModule],
  providers: [SourcesService, SourcesRepository],
})
export class SourcesModule {}
