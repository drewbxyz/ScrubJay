import { Injectable } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";
import { deliveries } from "@/core/drizzle/drizzle.schema";
import type { DrizzleService } from "@/core/drizzle/drizzle.service";

type AlertKind = "ebird";

@Injectable()
export class DeliveriesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async isDelivered(alertKind: AlertKind, alertId: string, channelId: string) {
    const existing = await this.drizzle.db.query.deliveries.findFirst({
      where: and(
        eq(deliveries.alertId, alertId),
        eq(deliveries.kind, alertKind),
        eq(deliveries.channelId, channelId),
      ),
    });
    return !!existing;
  }

  async markDelivered(
    alertKind: AlertKind,
    alertId: string,
    channelId: string,
  ) {
    try {
      return await this.drizzle.db
        .insert(deliveries)
        .values({
          alertId,
          channelId,
          kind: alertKind,
        })
        .onConflictDoNothing();
    } catch (err) {
      // Ignore on unique constaint violation
    }
  }

  async markDeliveredBulk(
    alerts: {
      alertKind: AlertKind;
      alertId: string;
      channelId: string;
    }[],
  ) {
    const batchSize = 100;
    for (let i = 0; i < alerts.length; i += batchSize) {
      const batch = alerts.slice(i, i + batchSize).map((alert) => ({
        alertId: alert.alertId,
        channelId: alert.channelId,
        kind: alert.alertKind,
      }));
      await this.drizzle.db
        .insert(deliveries)
        .values(batch)
        .onConflictDoNothing();
    }
  }

  async getDeliveriesForChannel(channelId: string) {
    return this.drizzle.db
      .select()
      .from(deliveries)
      .where(eq(deliveries.channelId, channelId));
  }

  async cleanUpOlderThanDays(days: number) {
    await this.drizzle.db
      .delete(deliveries)
      .where(
        sql`${deliveries.sentAt} < NOW() - make_interval(days => ${days})`,
      );
  }
}
