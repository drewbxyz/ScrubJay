import { Injectable, Logger } from "@nestjs/common";
import * as Parser from "rss-parser";

@Injectable()
export class RssFetcher {
  private readonly logger = new Logger(RssFetcher.name);
  private readonly parser = new Parser();

  /**
   * Fetches and parses an RSS feed from a URL
   *
   * @param url - The URL of the RSS feed to fetch
   * @returns The parsed RSS feed with normalized items
   *
   * @throws error if the RSS feed cannot be parsed
   */
  async fetchRssFeed(url: string | URL): Promise<Parser.Output<Parser.Item>> {
    const parsedFeed = await this.parser.parseURL(url.toString());
    this.logger.log(`Fetched RSS feed: ${parsedFeed.title || "Untitled"}`);
    return parsedFeed;
  }
}
