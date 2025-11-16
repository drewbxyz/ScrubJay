import { Injectable, Logger } from "@nestjs/common";
import { DispatcherRepository } from "./dispatcher.repository";
import { DeliveriesService } from "../deliveries/deliveries.service";
import { DiscordHelper } from "@/discord/discord.helper";
import { DispatchableObservation } from "./dispatcher.schema";
import { EmbedBuilder } from "discord.js";

@Injectable()
export class DispatcherService {
  private readonly logger = new Logger(DispatcherService.name);

  constructor(
    private readonly repo: DispatcherRepository,
    private readonly deliveries: DeliveriesService,
    private readonly discord: DiscordHelper
  ) {}

  private generateSpeciesLocationId(speciesCode: string, locId: string) {
    return `${speciesCode}:${locId}`;
  }

  private groupObservations(ungroupedObservations: DispatchableObservation[]) {
    const channels = new Map<
      string,
      Map<string, Map<string, DispatchableObservation[]>>
    >();

    for (const obs of ungroupedObservations) {
      if (!channels.has(obs.channelId)) {
        channels.set(obs.channelId, new Map());
      }

      const speciesMap = channels.get(obs.channelId)!;

      if (!speciesMap.has(obs.speciesCode)) {
        speciesMap.set(obs.speciesCode, new Map());
      }

      const locMap = speciesMap.get(obs.speciesCode)!;

      if (!locMap.has(obs.locId)) {
        locMap.set(obs.locId, []);
      }

      locMap.get(obs.locId)!.push(obs);
    }

    return channels;
  }

  private getAggregatedObservationStats(
    groupedObservations: DispatchableObservation[]
  ) {
    return groupedObservations.reduce(
      (acc, obs) => {
        acc.totalReports += 1;
        acc.totalPhotos += obs.photoCount ?? 0;
        acc.totalVideos += obs.videoCount ?? 0;
        acc.totalAudio += obs.audioCount ?? 0;
        acc.howMany = Math.max(acc.howMany, obs.howMany);
        acc.latestReport =
          !acc.latestReport || obs.obsDt > acc.latestReport
            ? obs.obsDt
            : acc.latestReport;
        return acc;
      },
      {
        totalReports: 0,
        totalPhotos: 0,
        totalVideos: 0,
        totalAudio: 0,
        howMany: 0,
        latestReport: groupedObservations[0]?.obsDt,
      }
    );
  }

  private async sendGroupedEBirdAlert(
    channelId: string,
    observations: DispatchableObservation[],
    confirmed: boolean
  ) {
    if (observations.length === 0) return;

    const aggregatedStats = this.getAggregatedObservationStats(observations);

    const locationText = `Reported at ${
      observations[0].isPrivate
        ? "a private location"
        : `[${observations[0].locationName}](https://ebird.org/hotspot/${observations[0].locId})`
    }`;

    const embed = new EmbedBuilder()
      .setTitle(`${observations[0].comName} - ${observations[0].county}`)
      .setURL(`https://ebird.org/checklist/${observations[0].subId}`)
      .setDescription(
        `${locationText}\nLatest report: ${aggregatedStats.latestReport.toLocaleString(
          "en-US",
          {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        )}`
      )
      .setColor(confirmed ? 0x2ecc71 : 0xf1c40f);

    let reportText = `👥 ${aggregatedStats.totalReports} new report(s); ${
      confirmed
        ? "confirmed at location in the last week"
        : "unconfirmed at location in the last week"
    }`;

    const mediaTexts: string[] = [];
    if (aggregatedStats.totalPhotos > 0)
      mediaTexts.push(`📷 ${aggregatedStats.totalPhotos} photo(s)`);
    if (aggregatedStats.totalAudio > 0)
      mediaTexts.push(`🔊 ${aggregatedStats.totalAudio} audio`);
    if (aggregatedStats.totalVideos > 0)
      mediaTexts.push(`🎥 ${aggregatedStats.totalVideos} video(s)`);

    if (mediaTexts.length > 0) {
      reportText += `\n${mediaTexts.join(" • ")}`;
    }

    embed.addFields({ name: "Details", value: reportText });

    try {
      await this.discord.sendEmbedToChannel(channelId, embed);
    } catch (err) {
      this.logger.error("Failed to send embed to channel.");
    }
  }

  async getUndeliveredObservationsSinceDate(since?: Date) {
    return this.repo.getUndeliveredObservationsSinceDate(since);
  }

  async dispatchEBirdSince(since: Date) {
    const unsentObservations =
      await this.repo.getUndeliveredObservationsSinceDate(since);

    if (unsentObservations.length === 0) {
      this.logger.debug(`No new deliveries since ${since}`);
      return;
    }

    const confirmedInLastWeek = new Set(
      (
        await this.repo.getConfirmedSinceDate(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // seven days ago
        )
      ).map((o) => this.generateSpeciesLocationId(o.speciesCode, o.locId))
    );

    this.logger.debug(
      `Found ${unsentObservations.length} new channel-observation pairs`
    );

    const grouped = this.groupObservations(unsentObservations);

    const deliveryValues: {
      alertKind: "ebird";
      alertId: string;
      channelId: string;
    }[] = [];

    for (const [channelId, speciesMap] of grouped) {
      for (const [species, locMap] of speciesMap) {
        for (const [location, obsList] of locMap) {
          const isConfirmedInLastWeek = confirmedInLastWeek.has(
            this.generateSpeciesLocationId(species, location)
          );

          await this.sendGroupedEBirdAlert(
            channelId,
            obsList,
            isConfirmedInLastWeek
          );

          for (const obs of obsList) {
            deliveryValues.push({
              alertKind: "ebird",
              channelId,
              alertId: `${obs.speciesCode}:${obs.subId}`,
            });
          }
        }
      }
    }

    await this.deliveries.recordDeliveries(deliveryValues);

    this.logger.log(
      `Marked ${deliveryValues.length} / ${unsentObservations.length} as delivered (${Math.round((100 * deliveryValues.length) / unsentObservations.length)}%)`
    );
  }
}
