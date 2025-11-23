import { Injectable, Logger } from "@nestjs/common";
import { SubscriptionsRepository } from "./subscriptions.repository";

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  constructor(private readonly repo: SubscriptionsRepository) {}

  private parseRegionCode(regionCode: string) {
    const parts = regionCode.split("-");
    if (parts.length === 2) {
      return {
        countyCode: "*",
        stateCode: regionCode,
      };
    } else if (parts.length === 3) {
      return {
        countyCode: regionCode,
        stateCode: `${parts[0]}-${parts[1]}`,
      };
    }
    throw new Error(`Invalid region code: ${regionCode}`);
  }

  async subscribeToEBird(channelId: string, regionCode: string) {
    let countyCode: string;
    let stateCode: string;
    try {
      const parsed = this.parseRegionCode(regionCode);
      countyCode = parsed.countyCode;
      stateCode = parsed.stateCode;
    } catch (err) {
      this.logger.error(`Invalid region code: ${regionCode}: ${err}`);
      return;
    }
    try {
      await this.repo.insertEBirdSubscription({
        channelId,
        countyCode,
        stateCode,
      });
    } catch (err) {
      this.logger.error(`Failed to subscribe to eBird: ${err}`);
      return;
    }
  }
}
