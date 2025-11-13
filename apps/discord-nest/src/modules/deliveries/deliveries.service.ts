import { Injectable, Logger } from "@nestjs/common";
import { DeliveriesRepository } from "./deliveries.repository";

@Injectable()
export class DeliveriesService {
  private readonly logger = new Logger(DeliveriesService.name);

  constructor(private readonly repo: DeliveriesRepository) {}

  async ensureNotDelivered(
    alertKind: "ebird",
    alertId: string,
    channelId: string
  ) {
    const delivered = await this.repo.isDelivered(
      alertKind,
      alertId,
      channelId
    );
    if (delivered) {
      // this.logger.debug(
      //   `Already delivered ${alertKind}:${alertId} to channel ${channelId}`
      // );
      return false;
    }
    return true;
  }

  async recordDelivery(alertKind: "ebird", alertId: string, channelId: string) {
    await this.repo.markDelivered(alertKind, alertId, channelId);
  }

  async recordDeliveries(
    alerts: { alertKind: "ebird"; alertId: string; channelId: string }[]
  ) {
    await this.repo.markDeliveredBulk(alerts);
  }
}
