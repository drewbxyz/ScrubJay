import { Injectable } from '@nestjs/common';
import * as schema from './schema';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private readonly db : NodePgDatabase<typeof schema>;

  constructor(configService: ConfigService) {
    this.db = drizzle(configService.get('DATABASE_URL'), { schema });
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
