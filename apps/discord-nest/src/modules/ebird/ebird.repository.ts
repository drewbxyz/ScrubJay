import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { locations, observations } from "@/core/drizzle/drizzle.schema";
import type {
  EBirdLocation,
  TransformedEBirdObservation,
} from "./ebird.schema";
import { gt } from "drizzle-orm";

@Injectable()
export class EBirdRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async upsertLocation(data: EBirdLocation) {
    return this.drizzle.db
      .insert(locations)
      .values({
        id: data.locId,
        name: data.locName,
        county: data.subnational2Name,
        countyCode: data.subnational2Code,
        state: data.subnational1Name,
        stateCode: data.subnational1Code,
        lat: data.lat,
        lng: data.lng,
        isPrivate: data.locationPrivate,
      })
      .onConflictDoUpdate({
        target: [locations.id],
        set: {
          ...data,
          lastUpdated: new Date(),
        },
      })
      .returning();
  }

  async upsertObservation(data: TransformedEBirdObservation) {
    return this.drizzle.db
      .insert(observations)
      .values({
        speciesCode: data.speciesCode,
        subId: data.subId,
        comName: data.comName,
        sciName: data.sciName,
        locId: data.locId,
        obsDt: new Date(data.obsDt),
        howMany: data.howMany ?? 0,
        obsValid: data.obsValid,
        obsReviewed: data.obsReviewed,
        presenceNoted: data.presenceNoted,
        photoCount: data.photoCount,
        audioCount: data.audioCount,
        videoCount: data.videoCount,
        hasComments: data.hasComments,
      })
      .onConflictDoUpdate({
        target: [observations.speciesCode, observations.subId],
        set: {
          ...data,
          obsDt: new Date(data.obsDt),
          lastUpdated: new Date(),
        },
      })
      .returning();
  }

  async getAlertsCreatedSinceDate(since: Date) {
    return this.drizzle.db.query.observations.findMany({
      where: gt(observations.createdAt, since),
    });
  }
}
