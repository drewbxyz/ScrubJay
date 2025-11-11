import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DispatcherService } from "@/modules/dispatcher/dispatcher.service";

@Injectable()
export class DispatchJob {
  private readonly logger = new Logger(DispatchJob.name);

  constructor(private readonly dispatcher: DispatcherService) {}

  @Cron("*/20 * * * *")
  async run() {
    const since = new Date(Date.now() - 15 * 60 * 1000);
    this.logger.debug(
      `Running dispatch job for alerts since ${since.toISOString()}`
    );
    await this.dispatcher.dispatchNewEBirdAlerts(since);
  }
}
