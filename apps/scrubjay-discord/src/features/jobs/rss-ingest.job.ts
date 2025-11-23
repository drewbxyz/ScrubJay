import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { RssService } from "@/features/rss/rss.service";
import { SourcesService } from "@/features/sources/sources.service";
import { BootstrapService } from "./bootstrap.service";

@Injectable()
export class RssIngestJob {
  private readonly logger = new Logger(RssIngestJob.name);

  constructor(
    private readonly rss: RssService,
    private readonly bootstrapService: BootstrapService,
    private readonly sourcesService: SourcesService,
  ) {}

  @Cron("*/5 * * * *")
  async run() {
    // Wait for bootstrap to complete before running
    await this.bootstrapService.waitForBootstrap();

    this.logger.debug("Starting RSS ingestion job...");

    const rssSources = await this.sourcesService.getRssSources();

    for (const source of rssSources) {
      try {
        const inserted = await this.rss.ingestRssSource(source);
        this.logger.log(`RSS ${source.name}: ${inserted} alerts ingested`);
      } catch (err) {
        this.logger.error(`Failed to ingest ${source.name}: ${err}`);
      }
    }
  }
}
