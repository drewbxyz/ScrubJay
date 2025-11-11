import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { EBirdService } from "../ebird/ebird.service";

@Injectable()
export class EBirdIngestJob {
  private readonly logger = new Logger(EBirdIngestJob.name);

  private readonly states = ["US-NC", "US-CA"];

  constructor(private readonly ebird: EBirdService) {}

  @Cron("*/20 * * * *")
  async run() {
    this.logger.debug("Starting eBird ingestion job...");

    let total = 0;
    for (const state of this.states) {
      try {
        const inserted = await this.ebird.ingestRegion(state);
        total += inserted;
        this.logger.log(`State ${state}: ${inserted} alerts ingested`);
      } catch (err) {
        this.logger.error(`Failed to ingest ${state}: ${err}`);
      }
    }
  }
}
