import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { Injectable, Logger } from "@nestjs/common";
import { EBirdSource } from "../../sources/sources.schema";
import {
  ebirdObservationSchema,
  type EBirdObservation,
  type EBirdObservationWithMediaCounts,
} from "./ebird.schema";
import { observations, locations } from "@/core/drizzle/drizzle.schema";
import { sql } from "drizzle-orm";
import { ConfigService } from "@nestjs/config";

const queryParams = new URLSearchParams({
  detail: "full",
  back: "7",
});


@Injectable()
export class EBirdIngestionService {
  private readonly logger = new Logger(EBirdIngestionService.name);
  constructor(private readonly drizzle: DrizzleService, private readonly configService: ConfigService) {}

  private async fetchObservations(regionCode: string) {
    const url = new URL(
      `/v2/data/obs/${regionCode}/recent/notable?${queryParams.toString()}`,
      process.env.EBIRD_BASE_URL
    );
    const response = await fetch(url.toString(), { headers: { 'X-eBirdApiKey': this.configService.get('EBIRD_TOKEN')! } });
    if (!response.ok) {
      throw new Error(`Failed to fetch observations: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.length) {
      return [];
    }
    return data.filter((observation: unknown) => {
      if (ebirdObservationSchema.safeParse(observation).success) {
        return true;
      }
      this.logger.error(`Invalid observation: ${JSON.stringify(observation)}`);
      return false;
    });
  }

  private groupObservationsForInsert(
    observations: EBirdObservation[]
  ): EBirdObservationWithMediaCounts[] {
    const grouped = observations.reduce((acc, obs) => {
      const key = `${obs.speciesCode}-${obs.subId}`;
      if (!acc.has(key)) {
        acc.set(key, {
          ...obs,
          photos: 0,
          audio: 0,
          video: 0,
        });
      }
      const entry = acc.get(key)!;
      if (obs.evidence === "P") entry.photos++;
      if (obs.evidence === "A") entry.audio++;
      if (obs.evidence === "V") entry.video++;
      return acc;
    }, new Map<string, EBirdObservationWithMediaCounts>());

    return Array.from(grouped.values());
  }

  private async upsertLocations(observations: EBirdObservation[]) {
    const locationsToUpsert = observations.map((observation) => ({
      id: observation.locId,
      county: observation.subnational2Name,
      countyCode: observation.subnational2Code,
      state: observation.subnational1Name,
      stateCode: observation.subnational1Code,
      name: observation.locName,
      lat: observation.lat,
      lng: observation.lng,
      isPrivate: observation.locationPrivate,
      lastUpdated: new Date(),
    }));

    const batchSize = 100;
    for (let i = 0; i < locationsToUpsert.length; i += batchSize) {
      const batch = locationsToUpsert.slice(i, i + batchSize);
      await this.drizzle.db
        .insert(locations)
        .values(batch)
        .onConflictDoUpdate({
          target: [locations.id],
          set: {
            county: sql`excluded.county`,
            countyCode: sql`excluded.county_code`,
            state: sql`excluded.state`,
            stateCode: sql`excluded.state_code`,
            name: sql`excluded.name`,
            lat: sql`excluded.lat`,
            lng: sql`excluded.lng`,
            isPrivate: sql`excluded.is_private`,
            lastUpdated: sql`excluded.last_updated`,
          },
        });
    }
  }

  private async upsertObservations(
    observationsToUpsert: EBirdObservationWithMediaCounts[]
  ) {
    const obsToUpsert = observationsToUpsert.map((observation) => ({
      speciesCode: observation.speciesCode,
      subId: observation.subId,
      comName: observation.comName,
      sciName: observation.sciName,
      locId: observation.locId,
      obsDt: new Date(observation.obsDt),
      howMany: observation.howMany ?? 1,
      obsValid: observation.obsValid,
      obsReviewed: observation.obsReviewed,
      presenceNoted: observation.presenceNoted,
      photoCount: observation.photos,
      audioCount: observation.audio,
      videoCount: observation.video,
      hasComments: observation.hasComments,
    }))
    const batchSize = 100;
    for (let i = 0; i < obsToUpsert.length; i += batchSize) {
      const batch = obsToUpsert.slice(i, i + batchSize);
      await this.drizzle.db
        .insert(observations)
        .values(batch)
        .onConflictDoUpdate({
          target: [observations.subId, observations.speciesCode],
          set: {
            comName: sql`excluded.common_name`,
            sciName: sql`excluded.scientific_name`,
            locId: sql`excluded.location_id`,
            obsDt: sql`excluded.observation_date`,
            howMany: sql`excluded.how_many`,
            obsValid: sql`excluded.observation_valid`,
            obsReviewed: sql`excluded.observation_reviewed`,
            presenceNoted: sql`excluded.presence_noted`,
            photoCount: sql`excluded.photo_count`,
            audioCount: sql`excluded.audio_count`,
            videoCount: sql`excluded.video_count`,
            hasComments: sql`excluded.has_comments`,
            lastUpdated: sql`excluded.last_updated`,
          },
        });
    }
  }

  async ingest(source: EBirdSource) {
    try {
      const rawObservations = await this.fetchObservations(
        source.config.regionCode
      );

      await this.upsertLocations(rawObservations);

      const groupedObservations =
        this.groupObservationsForInsert(rawObservations);

      await this.upsertObservations(groupedObservations);
      
    } catch (error) {
      this.logger.error(
        `Error ingesting eBird data for source ${source.id}: ${error}`
      );
      throw error;
    }
  }
}
