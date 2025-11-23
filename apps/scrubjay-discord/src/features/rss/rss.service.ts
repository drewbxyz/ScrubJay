import { Injectable, Logger } from "@nestjs/common";
import type * as Parser from "rss-parser";
import { RssFetcher } from "./rss.fetcher";
import { RssRepository } from "./rss.repository";
import { RssTransformer } from "./rss.transformer";

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);

  constructor(
    private readonly fetcher: RssFetcher,
    private readonly transformer: RssTransformer,
    private readonly repo: RssRepository,
  ) {}

  async ingestRssSource(rssSource: {
    id: string;
    name: string;
    url: string | URL;
  }) {
    let rawFeed: Parser.Output<Parser.Item>;
    try {
      rawFeed = await this.fetcher.fetchRssFeed(rssSource.url);
      this.logger.log(
        `Fetched ${rawFeed.items.length} items from RSS source ${rssSource.name}`,
      );
    } catch (err) {
      this.logger.error(`Error fetching RSS feed: ${err}`);
      return 0;
    }

    const transformedItems = this.transformer.transformFeed(
      rawFeed,
      rssSource.id,
    );

    let insertedCount = 0;
    for (const item of transformedItems) {
      try {
        await this.repo.upsertRssItem(item);
        insertedCount++;
      } catch (err) {
        this.logger.error(`Could not upsert RSS Item: ${err}`);
      }
    }

    return insertedCount;
  }
}
