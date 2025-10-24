import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { EBirdDispatchService } from './ebird/ebird.dispatch';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [DatabaseModule, DiscordModule],
  providers: [EBirdDispatchService],
  exports: [EBirdDispatchService],
})
export class DispatchModule {}
