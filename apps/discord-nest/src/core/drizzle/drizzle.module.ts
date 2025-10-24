import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

@Module({
  exports: [DrizzleService],
  providers: [DrizzleService],
})
export class DrizzleModule {}
