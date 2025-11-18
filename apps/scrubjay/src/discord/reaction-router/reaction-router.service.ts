import { Inject, Injectable } from "@nestjs/common";
import type { ReactionHandler, ReactionHandlerPayload } from "./reaction-handler";

export const REACTION_HANDLERS = Symbol("REACTION_HANDLERS");

@Injectable()
export class ReactionRouter {
  constructor(
    @Inject(REACTION_HANDLERS)
    private readonly handlers: ReactionHandler[]
  ) {}

  async handle(payload: ReactionHandlerPayload) {
    const emojiName = payload.reaction.emoji.name;
    if (!emojiName) return;
    for (const handler of this.handlers) {
      if (handler.supports(emojiName)) {
        return handler.execute(payload);
      }
    }
  }
}
