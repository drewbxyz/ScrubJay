import { Injectable } from '@nestjs/common';
import * as schema from './drizzle.schema';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DrizzleService {
  private readonly db : NodePgDatabase<typeof schema>;

  constructor(configService: ConfigService) {
    const dbUrl = configService.get('DATABASE_URL');
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    this.db = drizzle(dbUrl, { schema });
  }
  
  get query() {
    return this.db.query;
  }

  get select() {
    return this.db.select;
  }

  get insert() {
    return this.db.insert;
  }

  get update() {
    return this.db.update;
  }

  get delete() {
    return this.db.delete;
  }

  get transaction() {
    return this.db.transaction;
  }
}
