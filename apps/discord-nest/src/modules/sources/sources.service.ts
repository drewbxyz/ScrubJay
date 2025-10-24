import { DatabaseService } from "@/core/database/database.service";
import { sources, ebirdSources } from "@/core/database/schema";
import { eq, and } from "drizzle-orm";
import { Injectable, Logger } from "@nestjs/common";
import { 
    Source, 
    EBirdSourceData,
    SourceType,
} from "./sources.schema";

@Injectable()
export class SourcesService {

    private readonly logger = new Logger(SourcesService.name);

    constructor(private readonly db: DatabaseService) {}

    async findActiveByType(type: typeof SourceType[number]): Promise<Source[]> {
        const baseSources = await this.db.query.sources.findMany({
            where: and(eq(sources.type, type), eq(sources.active, true)),
        });

        return baseSources.map(baseSource => {

    }
}