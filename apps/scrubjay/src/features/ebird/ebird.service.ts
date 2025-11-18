import { Injectable, Logger } from "@nestjs/common";
import { EBirdFetcher } from "./ebird.fetcher";
import { EBirdTransformer } from "./ebird.transformer";
import { EBirdRepository } from "./ebird.repository";
import type { TransformedEBirdObservation } from "./ebird.schema";

@Injectable()
export class EBirdService {
  private readonly logger = new Logger(EBirdService.name);

  constructor(
    private readonly fetcher: EBirdFetcher,
    private readonly transformer: EBirdTransformer,
    private readonly repo: EBirdRepository
  ) {}

  async ingestRegion(regionCode: string) {
    const rawObservations =
      await this.fetcher.fetchRareObservations(regionCode);
    this.logger.log(
      `Fetched ${rawObservations.length} records from ${regionCode}`
    );

    const transformedObservations =
      this.transformer.transformObservations(rawObservations);

    let insertedCount = 0;
    for (const obs of transformedObservations) {
      try {
        await this.ingestObservation(obs);
        insertedCount++;
      } catch (err) {
        this.logger.warn(
          `Failed to insert observation: ${obs.speciesCode}:${obs.subId}`
        );
      }
    }

    return insertedCount;
  }

  async ingestObservation(observation: TransformedEBirdObservation) {
    const location = this.transformer.extractLocation(observation);
    await this.repo.upsertLocation(location);
    await this.repo.upsertObservation(observation);
  }

  async getObservationsSinceCreatedDate(since: Date) {
    return this.repo.getAlertsCreatedSinceDate(since);
  }
}
