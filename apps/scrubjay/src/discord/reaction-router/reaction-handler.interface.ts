import type { MessageReaction, PartialUser, User } from "discord.js";

export interface ReactionHandlerPayload {
  reaction: MessageReaction;
  user: User | PartialUser;
}

export interface ReactionHandler {
  supports(emoji: string): boolean;
  execute(payload: ReactionHandlerPayload): Promise<void>;
}

export function isReactionHandler(value: unknown): value is ReactionHandler {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).supports === "function" &&
    typeof (value as Record<string, unknown>).execute === "function"
  );
}
