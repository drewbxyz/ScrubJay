import { Module } from "@nestjs/common";
import { ReactionRouterModule } from "../reaction-router/reaction-router.module";
import { LifecycleListenerService } from "./lifecycle-listener.service";
import { ReactionListenerService } from "./reaction-listener.service";

@Module({
  imports: [ReactionRouterModule],
  providers: [ReactionListenerService, LifecycleListenerService],
})
export class ListenersModule {}
