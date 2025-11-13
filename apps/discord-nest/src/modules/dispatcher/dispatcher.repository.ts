import { DrizzleService } from "@/core/drizzle/drizzle.service";
import {
  channelEBirdSubscriptions,
  deliveries,
  filteredSpecies,
  locations,
  observations,
} from "@/core/drizzle/drizzle.schema";
import { Injectable } from "@nestjs/common";
import { and, eq, gt, or, sql, isNull } from "drizzle-orm";

@Injectable()
export class DispatcherRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async getUndeliveredObservationsSinceDate(since: Date) {
    return this.drizzle.db
      .select({
        channelId: channelEBirdSubscriptions.channelId,

        speciesCode: observations.speciesCode,
        subId: observations.subId,
        locId: observations.locId,
        comName: observations.comName,
        sciName: observations.sciName,
        obsDt: observations.obsDt,
        howMany: observations.howMany,
        createdAt: observations.createdAt,
        photoCount: observations.photoCount,
        audioCount: observations.audioCount,
        videoCount: observations.videoCount,

        county: locations.county,
        state: locations.state,
        locationName: locations.name,
        isPrivate: locations.isPrivate,
      })
      .from(observations)
      .innerJoin(locations, eq(locations.id, observations.locId))
      .innerJoin(
        channelEBirdSubscriptions,
        and(
          eq(channelEBirdSubscriptions.active, true),
          eq(channelEBirdSubscriptions.stateCode, locations.stateCode),
          or(
            eq(channelEBirdSubscriptions.countyCode, locations),
            eq(channelEBirdSubscriptions.countyCode, "*")
          )
        )
      )
      .leftJoin(
        filteredSpecies,
        and(
          eq(filteredSpecies.channelId, channelEBirdSubscriptions.channelId),
          eq(filteredSpecies.commonName, observations.comName)
        )
      )
      .leftJoin(
        deliveries,
        and(
          eq(deliveries.kind, "ebird"),
          eq(
            deliveries.alertId,
            sql`${observations.speciesCode} || ':' || ${observations.subId}`
          ),
          eq(deliveries.channelId, channelEBirdSubscriptions.channelId)
        )
      )
      .where(
        and(
          gt(observations.createdAt, since),
          isNull(filteredSpecies.channelId),
          isNull(deliveries.alertId)
        )
      );
  }
}
