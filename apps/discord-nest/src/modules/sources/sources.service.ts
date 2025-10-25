import { SourceType, ebirdSources, sources } from "@/core/drizzle/drizzle.schema";
import { Injectable, Logger } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { EBirdSource, Source } from "./sources.schema";
import { DrizzleService } from "@/core/drizzle/drizzle.service";

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    private readonly drizzle: DrizzleService
  ) {}

  private async getActiveEBirdSources(): Promise<EBirdSource[]> {
    try {
    return await this.drizzle.db
      .select({
        id: sources.id,
        type: sources.type,
        fetchIntervalMin: sources.fetchIntervalMin,
        active: sources.active,
        createdAt: sources.createdAt,
        updatedAt: sources.updatedAt,
        config: {
          regionName: ebirdSources.regionName,
          regionCode: ebirdSources.regionCode,
        }
      })
      .from(sources)
      .innerJoin(ebirdSources, eq(sources.id, ebirdSources.sourceId))
      .where(and(eq(sources.type, "EBIRD"), eq(sources.active, true)));
    } catch (error) {
      this.logger.error(`Error getting active eBird sources: ${error}`);
      throw error;
    }
  }

  async getActiveSourcesByType(
    type: (typeof SourceType)[number]
  ): Promise<Source[]> {
    switch (type) {
      case "EBIRD":
        return this.getActiveEBirdSources();
      default:
        throw new Error(`Unsupported source type: ${type}`);
    }
  }
}
