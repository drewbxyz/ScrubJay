import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { Injectable, Logger } from "@nestjs/common";
import { and, eq, exists, gte, not, or, sql } from "drizzle-orm";
import {
  observations,
  locations,
  channelEBirdSubscriptions,
  filteredSpecies,
  deliveries,
} from "@/core/drizzle/drizzle.schema";
import { DiscordService } from "../../../core/discord/discord.service";
import { GroupedObservation } from "../types";

@Injectable()
export class EBirdDispatchService {
  private readonly logger = new Logger(EBirdDispatchService.name);
  constructor(
    private readonly db: DrizzleService,
    private readonly discordService: DiscordService
  ) {}

  async dispatch(): Promise<Map<string, GroupedObservation[]>> {
    try {
      // Get recent observations that haven't been delivered yet
      const recentObservationsWithChannels = await this.db
        .select({
          channelId: channelEBirdSubscriptions.channelId,
          speciesCode: observations.speciesCode,
          subId: observations.subId,
          comName: observations.comName,
          county: locations.county,
          locId: observations.locId,
          locName: locations.name,
          isPrivate: locations.isPrivate,
          latestDate: sql<number>`max(${observations.obsDt})`,
          howMany: sql<number>`max(${observations.howMany})`,
          photoCount: sql<number>`coalesce(sum(${observations.photoCount}), 0)`,
          audioCount: sql<number>`coalesce(sum(${observations.audioCount}), 0)`,
          videoCount: sql<number>`coalesce(sum(${observations.videoCount}), 0)`,
          reports: sql<number>`count(*)`,
        })
        .from(observations)
        .innerJoin(locations, eq(observations.locId, locations.id))
        .innerJoin(
          channelEBirdSubscriptions,
          and(
            eq(channelEBirdSubscriptions.stateCode, locations.stateCode),
            or(
              sql`${channelEBirdSubscriptions.countyCode} IS NULL`,
              eq(channelEBirdSubscriptions.countyCode, locations.countyCode)
            ),
            eq(channelEBirdSubscriptions.active, true)
          )
        )
        .where(
          and(
            not(
              exists(
                this.db
                  .select()
                  .from(deliveries)
                  .where(
                    and(
                      eq(deliveries.kind, 'EBIRD'),
                      eq(deliveries.itemKey, sql`${observations.speciesCode} || '-' || ${observations.subId}`),
                      eq(deliveries.channelId, channelEBirdSubscriptions.channelId)
                    )
                  )
              )
            ),
            not(
              exists(
                this.db
                  .select()
                  .from(filteredSpecies)
                  .where(
                    and(
                      eq(filteredSpecies.channelId, channelEBirdSubscriptions.channelId),
                      eq(filteredSpecies.commonName, observations.comName)
                    )
                  )
              )
            )
          )
        )
        .groupBy(
          channelEBirdSubscriptions.channelId,
          observations.speciesCode,
          observations.locId
        );

      // Get confirmed species from last week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const confirmedSpecies = await this.db
        .select({
          speciesCode: observations.speciesCode,
          locId: observations.locId,
        })
        .from(observations)
        .where(
          and(
            gte(observations.obsDt, oneWeekAgo),
            eq(observations.obsReviewed, true),
            eq(observations.obsValid, true)
          )
        )
        .groupBy(observations.speciesCode, observations.locId);

      const confirmedSet = new Set(
        confirmedSpecies.map((obs) => `${obs.speciesCode}-${obs.locId}`)
      );

      // Group observations by channel
      const observationsByChannel = recentObservationsWithChannels.reduce(
        (acc, obs) => {
          if (!acc.has(obs.channelId)) {
            acc.set(obs.channelId, []);
          }
          acc.get(obs.channelId)!.push({
            species: {
              code: obs.speciesCode,
              commonName: obs.comName,
            },
            location: {
              id: obs.locId,
              name: obs.locName,
              county: obs.county,
              isPrivate: obs.isPrivate,
            },
            reports: {
              subId: obs.subId,
              count: obs.reports,
              maxCount: obs.howMany,
              latestTimestamp: new Date(obs.latestDate),
              media: {
                photos: obs.photoCount,
                audio: obs.audioCount,
                video: obs.videoCount,
              },
              confirmedLastWeek: confirmedSet.has(
                `${obs.speciesCode}-${obs.locId}`
              ),
            },
          });
          return acc;
        },
        new Map<string, GroupedObservation[]>()
      );

      return observationsByChannel;
    } catch (error) {
      this.logger.error(
        `Error dispatching eBird data: ${error}`
      );
      throw error;
    }
  }

  async recordDeliveries(
    channelId: string,
    observations: GroupedObservation[]
  ): Promise<void> {
    try {
      const deliveryRecords = observations.map((obs) => ({
        kind: 'EBIRD' as const,
        itemKey: `${obs.species.code}-${obs.reports.subId}`,
        channelId,
      }));

      if (deliveryRecords.length > 0) {
        await this.db
          .insert(deliveries)
          .values(deliveryRecords)
          .onConflictDoNothing();
      }
    } catch (error) {
      this.logger.error(
        `Error recording deliveries for channel ${channelId}: ${error}`
      );
      throw error;
    }
  }

  async dispatchAndSend(): Promise<void> {
    try {
      // Check if Discord service is ready
      if (!(await this.discordService.isReady())) {
        this.logger.warn('Discord service is not ready, skipping dispatch');
        return;
      }

      // Get all observations that need to be dispatched
      const observationsByChannel = await this.dispatch();

      if (observationsByChannel.size === 0) {
        this.logger.log('No observations to dispatch');
        return;
      }

      this.logger.log(`Dispatching observations to ${observationsByChannel.size} channels`);

      // Send observations to each channel
      for (const [channelId, observations] of observationsByChannel) {
        try {
          this.logger.log(`Sending ${observations.length} observations to channel ${channelId}`);
          
          // Send all observations to the channel
          await this.discordService.sendObservationsToChannel(channelId, observations);
          
          // Record successful deliveries
          await this.recordDeliveries(channelId, observations);
          
          this.logger.log(`Successfully dispatched ${observations.length} observations to channel ${channelId}`);
        } catch (error) {
          this.logger.error(`Failed to dispatch to channel ${channelId}: ${error}`);
          // Continue with other channels even if one fails
        }
      }

      this.logger.log('Dispatch completed');
    } catch (error) {
      this.logger.error(`Error in dispatch and send: ${error}`);
      throw error;
    }
  }
}
