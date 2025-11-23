import * as crypto from "node:crypto";
import { Injectable } from "@nestjs/common";
import * as Parser from "rss-parser";
import type { NormalizedRssItem } from "./rss.schema";

@Injectable()
export class RssTransformer {
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

  transformItem(item: Parser.Item, sourceId: string): NormalizedRssItem {
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

  transformFeed(
    feed: Parser.Output<Parser.Item>,
    sourceId: string,
  ): NormalizedRssItem[] {
    return feed.items.map((item) => this.transformItem(item, sourceId));
  }
}
