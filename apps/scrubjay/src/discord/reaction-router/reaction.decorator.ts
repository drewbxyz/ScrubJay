import { SetMetadata } from "@nestjs/common";

export const IS_REACTION_HANDLER = Symbol("IS_REACTION_HANDLER");

export function Reaction() {
  return SetMetadata(IS_REACTION_HANDLER, true);
}
