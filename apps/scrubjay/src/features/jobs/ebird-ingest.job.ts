import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import type { EBirdService } from "@/features/ebird/ebird.service";
import type { SourcesService } from "@/features/sources/sources.service";
import type { BootstrapService } from "./bootstrap.service";

@Injectable()
export class EBirdIngestJob {
  private readonly logger = new Logger(EBirdIngestJob.name);

  constructor(
    private readonly ebird: EBirdService,
    private readonly bootstrapService: BootstrapService,
    private readonly sourcesService: SourcesService,
  ) {}

  @Cron("*/15 * * * *")
  async run() {
    // Wait for bootstrap to complete before running
    await this.bootstrapService.waitForBootstrap();

    this.logger.debug("Starting eBird ingestion job...");

    const regions = await this.sourcesService.getEBirdSources();

    let total = 0;
    for (const region of regions) {
      try {
        const inserted = await this.ebird.ingestRegion(region);
        total += inserted;
        this.logger.log(`Region ${region}: ${inserted} alerts ingested`);
      } catch (err) {
        this.logger.error(`Failed to ingest ${region}: ${err}`);
      }
    }
  }
}
