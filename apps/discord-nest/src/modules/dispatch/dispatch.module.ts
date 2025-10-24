import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/core/drizzle/drizzle.module';
import { EBirdDispatchService } from './ebird/ebird.dispatch';
import { DiscordModule } from '../../core/discord/discord.module';

@Module({
  imports: [DrizzleModule, DiscordModule],
  providers: [EBirdDispatchService],
  exports: [EBirdDispatchService],
})
export class DispatchModule {}
