import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { ReactionExplorer } from "./reaction-explorer.service";
import { ReactionRouter } from "./reaction-router.service";

@Module({
  exports: [ReactionRouter],
  imports: [DiscoveryModule],
  providers: [ReactionRouter, ReactionExplorer],
})
export class ReactionRouterModule {}
