import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { RssFetcher } from "./rss.fetcher";
import { RssRepository } from "./rss.repository";
import { RssService } from "./rss.service";
import { RssTransformer } from "./rss.transformer";

@Module({
  exports: [RssService],
  imports: [DrizzleModule],
  providers: [RssFetcher, RssRepository, RssTransformer, RssService],
})
export class RssModule {}
