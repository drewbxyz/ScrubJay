import type { MessageReaction, PartialUser, User } from "discord.js";

export type ReactionHandlerPayload = {
  reaction: MessageReaction;
  user: User | PartialUser;
};

export interface ReactionHandler {
  supports(emoji: string): boolean;
  execute(payload: ReactionHandlerPayload): Promise<void>;
}
