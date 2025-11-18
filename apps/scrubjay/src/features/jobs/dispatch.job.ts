import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import type { DispatcherService } from "@/features/dispatcher/dispatcher.service";
import type { BootstrapService } from "./bootstrap.service";

@Injectable()
export class DispatchJob {
  private readonly logger = new Logger(DispatchJob.name);

  constructor(
    private readonly dispatcher: DispatcherService,
    private readonly bootstrapService: BootstrapService,
  ) {}

  @Cron("*/5 * * * *")
  async run() {
    // Wait for bootstrap to complete before running
    await this.bootstrapService.waitForBootstrap();

    const since = new Date(Date.now() - 15 * 60 * 1000);
    this.logger.debug(
      `Running dispatch job for alerts since ${since.toISOString()}`,
    );
    await this.dispatcher.dispatchEBirdSince(since);
  }
}
