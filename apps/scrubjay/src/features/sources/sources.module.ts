import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { Module } from "@nestjs/common";
import { SourcesService } from "./sources.service";
import { SourcesRepository } from "./sources.repository";

@Module({
  imports: [DrizzleModule],
  providers: [SourcesService, SourcesRepository],
  exports: [SourcesService],
})
export class SourcesModule {}
