import { Injectable, Logger } from "@nestjs/common";
import { DispatcherRepository } from "./dispatcher.repository";
import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { gt } from "drizzle-orm";
import { observations } from "@/core/drizzle/drizzle.schema";
import { TransformedEBirdObservation } from "../ebird/ebird.schema";
import { DeliveriesService } from "../deliveries/deliveries.service";

@Injectable()
export class DispatcherService {
  private readonly logger = new Logger(DispatcherService.name);

  constructor(
    private readonly repo: DispatcherRepository,
    private readonly drizzle: DrizzleService,
    private readonly deliveries: DeliveriesService
  ) {}

  async dispatchNewEBirdAlerts(since: Date) {
    const recentObs = await this.drizzle.db.query.observations.findMany({
      columns: {
        speciesCode: true,
        subId: true,
        locId: true,
        comName: true,
        sciName: true,
        obsDt: true,
        howMany: true,
        photoCount: true,
        videoCount: true,
        audioCount: true,
      },
      where: gt(observations.createdAt, since),
    });

    if (recentObs.length === 0) {
      this.logger.log("No new observations");
      return;
    }

    this.logger.log(
      `Found ${recentObs.length} new observations since ${since.toISOString()}`
    );

    for (const obs of recentObs) {
      await this.dispatchEBirdObservation(obs);
    }
  }

  async dispatchEBirdObservation(
    obs: Pick<
      TransformedEBirdObservation,
      | "speciesCode"
      | "subId"
      | "locId"
      | "comName"
      | "sciName"
      | "howMany"
      | "photoCount"
      | "audioCount"
      | "videoCount"
    > & { obsDt: Date }
  ) {
    const alertId = `${obs.speciesCode}:${obs.subId}`;
    const channelIds = await this.repo.getMatchingChannelsForObservation(
      obs.comName,
      obs.locId
    );
    if (channelIds.length === 0) return;

    for (const channelId of channelIds) {
      const notYetSent = await this.deliveries.ensureNotDelivered(
        "ebird",
        alertId,
        channelId
      );
      if (!notYetSent) continue;

      try {
        this.logger.log("send to discord in the future here...");
        await this.deliveries.recordDelivery("ebird", alertId, channelId);
      } catch (err) {
        this.logger.error(
          `Failed to send ${alertId} to ${channelId}: ${alertId}`
        );
      }
    }
  }
}
