import type { DispatcherRepository } from "./dispatcher.repository";

export type DispatchableObservation = Awaited<
  ReturnType<DispatcherRepository["getUndeliveredObservationsSinceDate"]>
>[number];

export type DispatchableRssItem = Awaited<
  ReturnType<DispatcherRepository["getUndeliveredRssItemsSinceDate"]>
>[number];
