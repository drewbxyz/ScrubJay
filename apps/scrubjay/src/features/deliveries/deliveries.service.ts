import { Injectable } from "@nestjs/common";
import { DeliveriesRepository } from "./deliveries.repository";

@Injectable()
export class DeliveriesService {
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
