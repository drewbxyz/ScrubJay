import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { deliveries } from "@/core/drizzle/drizzle.schema";
import { eq, and, sql } from "drizzle-orm";

type AlertKind = "ebird";

@Injectable()
export class DeliveriesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async isDelivered(alertKind: AlertKind, alertId: string, channelId: string) {
    const existing = await this.drizzle.db.query.deliveries.findFirst({
      where: and(
        eq(deliveries.alertId, alertId),
        eq(deliveries.kind, alertKind),
        eq(deliveries.channelId, channelId)
      ),
    });
    return !!existing;
  }

  async markDelivered(
    alertKind: AlertKind,
    alertId: string,
    channelId: string
  ) {
    try {
      return await this.drizzle.db
        .insert(deliveries)
        .values({
          kind: alertKind,
          alertId,
          channelId,
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
    }[]
  ) {
    const batchSize = 100;
    for (let i = 0; i < alerts.length; i += batchSize) {
      const batch = alerts.slice(i, i + batchSize).map((alert) => ({
        kind: alert.alertKind,
        alertId: alert.alertId,
        channelId: alert.channelId,
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
        sql`${deliveries.sentAt} < NOW() - make_interval(days => ${days})`
      );
  }
}
