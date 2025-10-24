import { Injectable, Logger } from '@nestjs/common';
import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from 'discord.js';
import { GroupedObservation } from '../dispatch/types';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  async login(token: string): Promise<void> {
    try {
      await this.client.login(token);
      this.logger.log('Discord bot logged in successfully');
    } catch (error) {
      this.logger.error(`Failed to login to Discord: ${error}`);
      throw error;
    }
  }

  async sendObservationToChannel(
    channelId: string,
    observation: GroupedObservation
  ): Promise<string | null> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      
      if (!channel?.isTextBased() || !channel?.isSendable()) {
        this.logger.warn(`Channel ${channelId} is not a sendable text channel`);
        return null;
      }

      const embed = this.createObservationEmbed(observation);
      const message = await channel.send({ embeds: [embed] });
      
      this.logger.log(`Sent observation to channel ${channelId}: ${observation.species.commonName} at ${observation.location.name}`);
      return message.id;
    } catch (error) {
      this.logger.error(`Failed to send message to channel ${channelId}: ${error}`);
      throw error;
    }
  }

  async sendObservationsToChannel(
    channelId: string,
    observations: GroupedObservation[]
  ): Promise<string[]> {
    const messageIds: string[] = [];
    
    for (const observation of observations) {
      try {
        const messageId = await this.sendObservationToChannel(channelId, observation);
        if (messageId) {
          messageIds.push(messageId);
        }
      } catch (error) {
        this.logger.error(`Failed to send observation to channel ${channelId}: ${error}`);
        // Continue with other observations even if one fails
      }
    }

    return messageIds;
  }

  private createObservationEmbed(observation: GroupedObservation): EmbedBuilder {
    const locationText =
      'Reported at ' +
      (observation.location.isPrivate
        ? 'a private location'
        : `[${observation.location.name}](https://ebird.org/hotspot/${observation.location.id})`);

    const timestampString = this.convertTimezone(
      observation.reports.latestTimestamp,
      'America/Los_Angeles'
    ).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const embed = new EmbedBuilder()
      .setTitle(
        `${observation.species.commonName} - ${observation.location.county}`
      )
      .setURL(`https://ebird.org/checklist/${observation.reports.subId}`)
      .setDescription(`${locationText}\nLatest report: ${timestampString}`)
      .setColor(observation.reports.confirmedLastWeek ? 0x2ecc71 : 0xf1c40f);

    let reportText = `👥 ${observation.reports.count} new report(s); ${
      observation.reports.confirmedLastWeek
        ? 'confirmed at location in the last week'
        : 'unconfirmed at location in the last week'
    }`;

    const mediaTexts: string[] = [];
    if (observation.reports.media.photos > 0)
      mediaTexts.push(`📷 ${observation.reports.media.photos} photo(s)`);
    if (observation.reports.media.audio > 0)
      mediaTexts.push(`🔊 ${observation.reports.media.audio} audio`);
    if (observation.reports.media.video > 0)
      mediaTexts.push(`🎥 ${observation.reports.media.video} video(s)`);

    if (mediaTexts.length > 0) {
      reportText += `\n${mediaTexts.join(' • ')}`;
    }

    embed.addFields({ name: 'Details', value: reportText });

    return embed;
  }

  private convertTimezone(time: Date, timezone: string): Date {
    return new Date(time.toLocaleString('en-US', { timeZone: timezone }));
  }

  async isReady(): Promise<boolean> {
    return this.client.isReady();
  }

  async destroy(): Promise<void> {
    await this.client.destroy();
    this.logger.log('Discord client destroyed');
  }
}
