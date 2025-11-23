import { Injectable } from "@nestjs/common";
import { DiscoveryService, Reflector } from "@nestjs/core";
import { IS_REACTION_HANDLER } from "./reaction.decorator";
import { isReactionHandler } from "./reaction-handler.interface";

@Injectable()
export class ReactionExplorer {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  explore() {
    return this.discovery.getProviders().flatMap((wrapper) => {
      const instance = wrapper.instance;
      if (!instance) return [];

      const isReaction = this.reflector.get<boolean>(
        IS_REACTION_HANDLER,
        instance.constructor,
      );

      if (!isReaction) return [];
      if (!isReactionHandler(instance)) return [];

      return [instance];
    });
  }
}
