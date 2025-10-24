import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { SourcesService } from "./sources.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [DrizzleModule],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}