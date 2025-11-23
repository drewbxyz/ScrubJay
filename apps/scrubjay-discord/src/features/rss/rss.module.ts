import { Module } from "@nestjs/common";
import { RssFetcher } from "./rss.fetcher";
import { RssRepository } from "./rss.repository";
import { RssService } from "./rss.service";
import { RssTransformer } from "./rss.transformer";

@Module({
  exports: [RssService],
  imports: [],
  providers: [RssFetcher, RssRepository, RssTransformer, RssService],
})
export class RssModule {}
