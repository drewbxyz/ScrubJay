import { Module } from "@nestjs/common";
import { EBirdRepository } from "./ebird.repository";
import { EBirdFetcher } from "./ebird.fetcher";
import { EBirdTransformer } from "./ebird.transformer";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";

@Module({
  imports: [DrizzleModule],
  providers: [EBirdFetcher, EBirdRepository, EBirdTransformer],
})
export class EBirdModule {}
