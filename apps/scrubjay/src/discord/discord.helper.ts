import { Injectable, Logger } from "@nestjs/common";
import type { Client, EmbedBuilder } from "discord.js";

@Injectable()
export class DiscordHelper {
  private readonly logger = new Logger(DiscordHelper.name);

  constructor(private readonly client: Client) {}

  /**
   * Send embeds to a Discord channel
   */
  async sendEmbedsToChannel(
    channelId: string,
    embeds: EmbedBuilder[],
  ): Promise<boolean> {
    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased() || !channel.isSendable()) {
        this.logger.error(
          `Channel ${channelId} not found or not a text channel or not sendable by the bot`,
        );
        return false;
      }

      // Send embeds in batches (Discord has a limit of 10 embeds per message)
      const batchSize = 10;
      for (let i = 0; i < embeds.length; i += batchSize) {
        const batch = embeds.slice(i, i + batchSize);
        await channel.send({ embeds: batch });
        this.logger.log(`Sent ${batch.length} embeds to channel ${channelId}`);
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error sending embeds to channel ${channelId}: ${error}`,
      );
      return false;
    }
  }

  /**
   * Send a single embed to a Discord channel
   */
  async sendEmbedToChannel(
    channelId: string,
    embed: EmbedBuilder,
  ): Promise<boolean> {
    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased() || !channel.isSendable()) {
        this.logger.error(
          `Channel ${channelId} not found or not a text channel or not sendable by the bot`,
        );
        return false;
      }

      await channel.send({ embeds: [embed] });
      this.logger.log(`Sent embed to channel ${channelId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending embed to channel ${channelId}: ${error}`,
      );
      return false;
    }
  }

  /**
   * Send a text message to a Discord channel
   */
  async sendMessageToChannel(
    channelId: string,
    message: string,
  ): Promise<boolean> {
    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased() || !channel.isSendable()) {
        this.logger.error(
          `Channel ${channelId} not found or not a text channel or not sendable`,
        );
        return false;
      }

      await channel.send(message);
      this.logger.log(`Sent message to channel ${channelId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending message to channel ${channelId}: ${error}`,
      );
      return false;
    }
  }

  /**
   * Get a Discord channel by ID
   */
  async getChannel(channelId: string) {
    try {
      return await this.client.channels.fetch(channelId);
    } catch (error) {
      this.logger.error(`Error fetching channel ${channelId}: ${error}`);
      return null;
    }
  }
}
