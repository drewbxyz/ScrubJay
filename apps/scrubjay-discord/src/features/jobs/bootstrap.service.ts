import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { DeliveriesService } from "@/features/deliveries/deliveries.service";
import type { DispatcherMap } from "@/features/dispatcher/dispatcher.interface";
import { DispatcherService } from "@/features/dispatcher/dispatcher.service";
import { EBirdService } from "@/features/ebird/ebird.service";
import { SourcesService } from "@/features/sources/sources.service";
import { RssService } from "../rss/rss.service";

/**
 * Populates DB on startup without triggering any Discord messages.
 * Also coordinates with scheduled jobs to ensure bootstrap completes first.
 */
@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  private bootstrapComplete = false;
  private bootstrapPromise: Promise<void> | null = null;

  constructor(
    private readonly ebirdService: EBirdService,
    private readonly rssService: RssService,
    private readonly dispatcherService: DispatcherService,
    private readonly deliveries: DeliveriesService,
    private readonly sources: SourcesService,
  ) {}

  /**
   * Wait for bootstrap to complete. Jobs should call this before running.
   */
  async waitForBootstrap(): Promise<void> {
    if (this.bootstrapComplete) {
      return;
    }

    if (this.bootstrapPromise) {
      return this.bootstrapPromise;
    }

    // Wait up to 5 minutes for bootstrap to complete
    this.bootstrapPromise = new Promise<void>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.bootstrapComplete) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(
        () => {
          clearInterval(checkInterval);
          if (!this.bootstrapComplete) {
            this.logger.warn(
              "Bootstrap did not complete within timeout, rejecting attempt",
            );
          }
          reject();
        },
        5 * 60 * 1000,
      );
    });

    return this.bootstrapPromise;
  }

  async onModuleInit() {
    this.logger.log("Running startup population job...");

    const regions = await this.sources.getEBirdSources();
    const rssSources = await this.sources.getRssSources();

    try {
      await this.ingestSources(
        regions,
        (region) => this.ebirdService.ingestRegion(region),
        (region) => region,
      );

      await this.markExistingAsDelivered("ebird", (obs) => ({
        alertId: `${obs.speciesCode}:${obs.subId}`,
        channelId: obs.channelId,
      }));

      await this.ingestSources(
        rssSources,
        (source) => this.rssService.ingestRssSource(source),
        (source) => source.name,
      );

      await this.markExistingAsDelivered("rss", (item) => ({
        alertId: item.id,
        channelId: item.channelId,
      }));

      this.logger.log("Startup population complete.");
    } finally {
      // Always mark bootstrap as complete, even if there were errors
      this.bootstrapComplete = true;
    }
  }

  /**
   * Generic helper to ingest sources with error handling.
   */
  private async ingestSources<T>(
    sources: T[],
    ingestFn: (source: T) => Promise<number>,
    getName: (source: T) => string,
  ): Promise<void> {
    for (const source of sources) {
      try {
        const count = await ingestFn(source);
        this.logger.log(
          `Populated ${count} observations for ${getName(source)}`,
        );
      } catch (err) {
        this.logger.error(`Population failed for ${getName(source)}: ${err}`);
      }
    }
  }

  /**
   * For every item currently in DB, mark as delivered
   * for all matching channels (no Discord messages sent).
   */
  private async markExistingAsDelivered<T extends keyof DispatcherMap>(
    alertKind: T,
    extractDeliveryInfo: (
      item: Awaited<
        ReturnType<DispatcherMap[T]["getUndeliveredSinceDate"]>
      >[number],
    ) => { alertId: string; channelId: string },
  ): Promise<void> {
    const kindLabel =
      alertKind === "ebird" ? "eBird observations" : "RSS items";
    this.logger.log(`Marking existing ${kindLabel} as delivered...`);

    const items =
      await this.dispatcherService.getUndeliveredSinceDate(alertKind);

    type ItemType = Awaited<
      ReturnType<DispatcherMap[T]["getUndeliveredSinceDate"]>
    >[number];

    const deliveryValues: {
      alertKind: T;
      alertId: string;
      channelId: string;
    }[] = items.map((item: ItemType) => ({
      ...extractDeliveryInfo(item),
      alertKind,
    }));

    await this.deliveries.recordDeliveries(deliveryValues);

    this.logger.log(
      `Marked ${deliveryValues.length} deliveries as sent (bootstrap mode).`,
    );
  }
}
