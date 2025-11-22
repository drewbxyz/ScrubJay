import crypto from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import * as Parser from "rss-parser";
import { RssRepository } from "./rss.repository";
import { NormalizedRssFeed, NormalizedRssItem } from "./rss.schema";

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);
  private readonly parser = new Parser();

  constructor(private readonly repo: RssRepository) {}

  private getStableId(item: Parser.Item): string {
    if (item.guid) return item.guid;
    if (item.link) return item.link;

    const composite = [
      item.title ?? "",
      item.pubDate ?? "",
      item.link ?? "",
    ].join("::");

    return crypto.createHash("sha1").update(composite).digest("hex");
  }

  private normalize(item: Parser.Item, sourceId: string): NormalizedRssItem {
    return {
      contentHtml: item.content ?? null,
      description: item.contentSnippet ?? null,
      id: this.getStableId(item),
      link: item.link ?? null,
      publishedAt: item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
          ? new Date(item.pubDate)
          : null,
      sourceId,
      title: item.title ?? null,
    };
  }

  private async parseRssSource({
    id,
    url,
  }: {
    id: string;
    url: string | URL;
  }): Promise<NormalizedRssFeed> {
    const parsedFeed = await this.parser.parseURL(url.toString());
    return {
      items: parsedFeed.items.map((i) => this.normalize(i, id)),
      title: parsedFeed.title || "",
    };
  }

  async ingestRssSource(rssSource: { id: string; url: string | URL }) {
    const parsedFeed = await this.parseRssSource(rssSource);

    let insertedCount = 0;
    for (const parsedItem of parsedFeed.items) {
      try {
        await this.repo.upsertRssItem(parsedItem);
        insertedCount++;
      } catch (err) {
        this.logger.error(`Could not upsert RSS Item: ${err}`);
      }
    }
    return insertedCount;
  }
}
