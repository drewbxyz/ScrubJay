import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EBirdService } from "@/modules/ebird/ebird.service";
import { DispatcherService } from "@/modules/dispatcher/dispatcher.service";
import { DeliveriesService } from "@/modules/deliveries/deliveries.service";
import { SourcesService } from "@/modules/sources/sources.service";

/**
 * Populates DB on startup without triggering any Discord messages.
 * Also coordinates with scheduled jobs to ensure bootstrap completes first.
 */
@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  private readonly initDate = new Date();
  private bootstrapComplete = false;
  private bootstrapPromise: Promise<void> | null = null;

  constructor(
    private readonly ebirdService: EBirdService,
    private readonly dispatcherService: DispatcherService,
    private readonly deliveries: DeliveriesService,
    private readonly sources: SourcesService
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
              "Bootstrap did not complete within timeout, rejecting attempt"
            );
          }
          reject();
        },
        5 * 60 * 1000
      );
    });

    return this.bootstrapPromise;
  }

  async onModuleInit() {
    this.logger.log("Running startup population job...");

    const regions = await this.sources.getEBirdSources();

    try {
      for (const region of regions) {
        try {
          const count = await this.ebirdService.ingestRegion(region);
          this.logger.log(`Populated ${count} observations for ${region}`);
        } catch (err) {
          this.logger.error(`Population failed for ${region}: ${err}`);
        }
      }

      await this.markExistingEBirdObservationsAsDelivered();
      this.logger.log("Startup population complete.");
    } finally {
      // Always mark bootstrap as complete, even if there were errors
      this.bootstrapComplete = true;
    }
  }

  /**
   * For every observation currently in DB, mark as delivered
   * for all matching channels (no Discord messages sent).
   */
  private async markExistingEBirdObservationsAsDelivered() {
    this.logger.log("Marking existing eBird observations as delivered...");
    const observations =
      await this.dispatcherService.getUndeliveredObservationsSinceDate(
        this.initDate
      );

    const deliveryValues: {
      alertKind: "ebird";
      alertId: string;
      channelId: string;
    }[] = [];

    for (const obs of observations) {
      deliveryValues.push({
        alertKind: "ebird",
        alertId: `${obs.speciesCode}:${obs.subId}`,
        channelId: obs.channelId,
      });
    }

    await this.deliveries.recordDeliveries(deliveryValues);

    this.logger.log(
      `Marked ${deliveryValues.length} deliveries as sent (bootstrap mode).`
    );
  }
}
