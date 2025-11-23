import { Injectable, OnModuleInit } from "@nestjs/common";
import { ReactionExplorer } from "./reaction-explorer.service";
import type {
  ReactionHandler,
  ReactionHandlerPayload,
} from "./reaction-handler.interface";

@Injectable()
export class ReactionRouter implements OnModuleInit {
  private handlers: ReactionHandler[] = [];

  constructor(private readonly explorer: ReactionExplorer) {}

  onModuleInit(): void {
    this.handlers = this.explorer.explore();
  }

  async route(payload: ReactionHandlerPayload) {
    const emojiName = payload.reaction.emoji.name;
    if (!emojiName) return;
    for (const entry of this.handlers) {
      if (entry.supports(emojiName)) {
        return entry.execute(payload);
      }
    }
  }
}
