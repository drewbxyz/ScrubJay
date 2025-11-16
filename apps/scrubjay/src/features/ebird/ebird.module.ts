import { Module } from "@nestjs/common";
import { EBirdRepository } from "./ebird.repository";
import { EBirdFetcher } from "./ebird.fetcher";
import { EBirdTransformer } from "./ebird.transformer";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { EBirdService } from "./ebird.service";

@Module({
  imports: [DrizzleModule],
  providers: [EBirdFetcher, EBirdRepository, EBirdTransformer, EBirdService],
  exports: [EBirdService],
})
export class EBirdModule {}
