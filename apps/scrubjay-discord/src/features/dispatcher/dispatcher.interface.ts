import type { EBirdDispatcherService } from "./dispatchers/ebird-dispatcher.service";
import type { RssDispatcherService } from "./dispatchers/rss-dispatcher.service";

export interface Dispatcher<T extends unknown[]> {
  dispatchSince(since?: Date): Promise<void>;
  getUndeliveredSinceDate(since?: Date): Promise<T>;
}

export type DispatcherType = "ebird" | "rss";

export type DispatcherMap = {
  ebird: EBirdDispatcherService;
  rss: RssDispatcherService;
};
