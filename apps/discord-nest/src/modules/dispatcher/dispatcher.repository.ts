import { DrizzleService } from "@/core/drizzle/drizzle.service";
import {
  channelEBirdSubscriptions,
  filteredSpecies,
  locations,
} from "@/core/drizzle/drizzle.schema";
import { Injectable } from "@nestjs/common";
import { and, eq, or } from "drizzle-orm";

@Injectable()
export class DispatcherRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async getMatchingChannelsForObservation(commonName: string, locId: string) {
    const loc = await this.drizzle.db.query.locations.findFirst({
      columns: {
        stateCode: true,
        countyCode: true,
      },
      where: eq(locations.id, locId),
    });

    if (!loc) return [];

    const subscriptions =
      await this.drizzle.db.query.channelEBirdSubscriptions.findMany({
        columns: { channelId: true },
        where: and(
          eq(channelEBirdSubscriptions.active, true),
          eq(channelEBirdSubscriptions.stateCode, loc.stateCode),
          or(
            eq(channelEBirdSubscriptions.countyCode, loc.countyCode),
            eq(channelEBirdSubscriptions.countyCode, "*")
          )
        ),
      });

    if (subscriptions.length === 0) return [];

    const filtered = await this.drizzle.db.query.filteredSpecies.findMany({
      columns: { channelId: true },
      where: eq(filteredSpecies.commonName, commonName),
    });

    const excluded = new Set(filtered.map((f) => f.channelId));

    return subscriptions
      .map((c) => c.channelId)
      .filter((id) => !excluded.has(id));
  }
}
