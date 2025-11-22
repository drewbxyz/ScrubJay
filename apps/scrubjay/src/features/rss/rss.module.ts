import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/core/drizzle/drizzle.module";
import { RssRepository } from "./rss.repository";
import { RssService } from "./rss.service";

@Module({
  exports: [RssService],
  imports: [DrizzleModule],
  providers: [RssService, RssRepository],
})
export class RssModule {}
