import { Injectable } from "@nestjs/common";
import type { DispatcherMap } from "./dispatcher.interface";
import { EBirdDispatcherService } from "./dispatchers/ebird-dispatcher.service";
import { RssDispatcherService } from "./dispatchers/rss-dispatcher.service";

@Injectable()
export class DispatcherService {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: used via bracket notation in getDispatcher
  private readonly dispatchers: Readonly<DispatcherMap>;

  constructor(
    ebirdDispatcher: EBirdDispatcherService,
    rssDispatcher: RssDispatcherService,
  ) {
    this.dispatchers = {
      ebird: ebirdDispatcher,
      rss: rssDispatcher,
    };
  }

  private getDispatcher<T extends keyof DispatcherMap>(
    type: T,
  ): DispatcherMap[T] {
    const dispatcher = this.dispatchers[type];
    if (!dispatcher) {
      throw new Error(`Unknown dispatcher type: ${type}`);
    }
    return dispatcher;
  }

  async dispatchSince<T extends keyof DispatcherMap>(
    type: T,
    since?: Date,
  ): Promise<void> {
    return this.getDispatcher(type).dispatchSince(since);
  }

  async getUndeliveredSinceDate<T extends keyof DispatcherMap>(
    type: T,
    since?: Date,
  ): Promise<Awaited<ReturnType<DispatcherMap[T]["getUndeliveredSinceDate"]>>> {
    return this.getDispatcher<T>(type).getUndeliveredSinceDate(
      since,
    ) as Promise<
      Awaited<ReturnType<DispatcherMap[T]["getUndeliveredSinceDate"]>>
    >;
  }
}
