import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle.schema';
import { PG_CONNECTION } from './pg-connection';
import { DrizzleService } from './drizzle.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get('DATABASE_URL');
        if (!dbUrl) {
          throw new Error('DATABASE_URL is not set');
        }
        return drizzle(dbUrl, { schema });
      },
    },
    DrizzleService,
  ],
  exports: [DrizzleService],
})
export class DrizzleModule {}
