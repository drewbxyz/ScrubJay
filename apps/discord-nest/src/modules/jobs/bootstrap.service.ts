import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EBirdService } from "@/modules/ebird/ebird.service";
import { DispatcherRepository } from "@/modules/dispatcher/dispatcher.repository";
import { DeliveriesService } from "@/modules/deliveries/deliveries.service";

/**
 * Populates DB on startup without triggering any Discord messages.
 */
@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  private readonly states = ["US-NC", "US-CA"];
  private readonly initDate = new Date();

  constructor(
    private readonly ebirdService: EBirdService,
    private readonly dispatcherRepo: DispatcherRepository,
    private readonly deliveries: DeliveriesService
  ) {}

  async onModuleInit() {
    this.logger.log("Running startup population job...");

    for (const state of this.states) {
      try {
        const count = await this.ebirdService.ingestRegion(state);
        this.logger.log(`Populated ${count} observations for ${state}`);
      } catch (err) {
        this.logger.error(`Population failed for ${state}: ${err}`);
      }
    }

    await this.markExistingEBirdObservationsAsDelivered();
    this.logger.log("Startup population complete.");
  }

  /**
   * For every observation currently in DB, mark as delivered
   * for all matching channels (no Discord messages sent).
   */
  private async markExistingEBirdObservationsAsDelivered() {
    this.logger.log("Marking existing eBird observations as delivered...");
    const observations =
      await this.ebirdService.getObservationsSinceCreatedDate(this.initDate);

    let marked = 0;

    for (const obs of observations) {
      const alertId = `${obs.speciesCode}:${obs.subId}`;
      const channels =
        await this.dispatcherRepo.getMatchingChannelsForObservation(
          obs.comName,
          obs.locId
        );
      for (const ch of channels) {
        await this.deliveries.recordDelivery("ebird", alertId, ch);
        marked++;
      }
    }

    this.logger.log(`Marked ${marked} deliveries as sent (bootstrap mode).`);
  }
}
