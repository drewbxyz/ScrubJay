import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/core/drizzle/drizzle.module';
import { EBirdDispatchService } from './ebird/ebird.dispatch';

@Module({
  imports: [DrizzleModule],
  providers: [EBirdDispatchService],
  exports: [EBirdDispatchService],
})
export class DispatchModule {}
