import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { EBirdFetcher } from "./ebird.fetcher";
import { EBirdRepository } from "./ebird.repository";
import { EBirdService } from "./ebird.service";
import { EBirdTransformer } from "./ebird.transformer";

@Module({
  exports: [EBirdService],
  imports: [DrizzleModule],
  providers: [EBirdFetcher, EBirdRepository, EBirdTransformer, EBirdService],
})
export class EBirdModule {}
