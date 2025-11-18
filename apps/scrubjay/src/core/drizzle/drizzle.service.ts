import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./drizzle.schema";
import { PG_CONNECTION } from "./pg-connection";

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(PG_CONNECTION) readonly db: NodePgDatabase<typeof schema>
  ) {}
}
