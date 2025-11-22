import { Injectable } from "@nestjs/common";
import { rssItems } from "@/core/drizzle/drizzle.schema";
import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { NormalizedRssItem } from "./rss.schema";

@Injectable()
export class RssRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async upsertRssItem(rssItem: NormalizedRssItem) {
    await this.drizzle.db
      .insert(rssItems)
      .values(rssItem)
      .onConflictDoUpdate({
        set: {
          contentHtml: rssItem.contentHtml,
          description: rssItem.description,
          lastUpdated: new Date(),
          link: rssItem.link,
          publishedAt: rssItem.publishedAt,
          sourceId: rssItem.sourceId,
          title: rssItem.title,
        },
        target: [rssItems.id],
      });
  }
}
