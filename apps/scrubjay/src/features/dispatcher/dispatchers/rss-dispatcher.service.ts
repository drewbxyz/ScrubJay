import { Injectable, Logger } from "@nestjs/common";
import { EmbedBuilder } from "discord.js";
import { DiscordHelper } from "@/discord/discord.helper";
import { DeliveriesService } from "../../deliveries/deliveries.service";
import type { Dispatcher } from "../dispatcher.interface";
import { DispatcherRepository } from "../dispatcher.repository";
import type { DispatchableRssItem } from "../dispatcher.schema";

@Injectable()
export class RssDispatcherService implements Dispatcher<DispatchableRssItem[]> {
  private readonly logger = new Logger(RssDispatcherService.name);

  constructor(
    private readonly repo: DispatcherRepository,
    private readonly deliveries: DeliveriesService,
    private readonly discord: DiscordHelper,
  ) {}

  async getUndeliveredSinceDate(since?: Date) {
    return this.repo.getUndeliveredRssItemsSinceDate(since);
  }

  private async sendRssAlert(channelId: string, rssItem: DispatchableRssItem) {
    const embed = new EmbedBuilder().setColor(0x3498db);

    if (rssItem.sourceName) {
      embed.setTitle(rssItem.sourceName);
    }

    if (rssItem.title) {
      embed.setDescription(rssItem.title);
    }

    if (rssItem.link) {
      embed.setURL(rssItem.link);
    }

    if (rssItem.description) {
      let description = rssItem.description;
      if (description.length > 2000) {
        description = `${description.substring(0, 2000)}...`;
        if (rssItem.link) {
          description += `\n\n[Read more](${rssItem.link})`;
        }
      } else {
        description = description.substring(0, 2000);
      }
      embed.addFields({ name: "Description", value: description });
    }

    if (rssItem.publishedAt) {
      embed.setTimestamp(rssItem.publishedAt);
    }

    try {
      await this.discord.sendEmbedToChannel(channelId, embed);
    } catch (err) {
      this.logger.error(`Failed to send RSS embed to channel: ${err}`);
    }
  }

  async dispatchSince(since?: Date) {
    const sinceDate = since ?? new Date(Date.now() - 15 * 60 * 1000);
    const unsentRssItems =
      await this.repo.getUndeliveredRssItemsSinceDate(sinceDate);

    if (unsentRssItems.length === 0) {
      this.logger.debug(`No new RSS deliveries since ${sinceDate}`);
      return;
    }

    this.logger.debug(
      `Found ${unsentRssItems.length} new channel-RSS item pairs`,
    );

    const deliveryValues: {
      alertKind: "rss";
      alertId: string;
      channelId: string;
    }[] = [];

    for (const rssItem of unsentRssItems) {
      await this.sendRssAlert(rssItem.channelId, rssItem);

      deliveryValues.push({
        alertId: rssItem.id,
        alertKind: "rss",
        channelId: rssItem.channelId,
      });
    }

    await this.deliveries.recordDeliveries(deliveryValues);

    this.logger.log(`Marked ${deliveryValues.length} RSS items as delivered`);
  }
}
