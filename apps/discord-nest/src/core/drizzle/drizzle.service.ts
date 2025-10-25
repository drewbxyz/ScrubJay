import { Inject, Injectable} from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./drizzle.schema";
import { PG_CONNECTION } from "./pg-connection";

@Injectable()
export class DrizzleService {
    constructor(
        @Inject(PG_CONNECTION) readonly db: NodePgDatabase<typeof schema>
    ) {}
}