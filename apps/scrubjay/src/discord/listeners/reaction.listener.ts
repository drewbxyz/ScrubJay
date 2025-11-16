import { Injectable, Logger } from "@nestjs/common";
import { type Client, Events, PartialMessage } from "discord.js";
import { Context, type ContextOf, On } from "necord";
import { ReactionRouter } from "../reaction-router/reaction-router.service";

@Injectable()
export class ReactionListener {
  private readonly logger = new Logger(ReactionListener.name);
  constructor(private readonly reactionRouter: ReactionRouter) {}

  @On(Events.MessageReactionAdd)
  async onReactionAdd(
    @Context() [reaction, user]: ContextOf<Events.MessageReactionAdd>
  ) {
    if (user.bot) return; // ignore any bot

    if (reaction.partial) {
      try {
        reaction = await reaction.fetch();
      } catch (error) {
        this.logger.error(`Something went wrong when fetching the reaction.`);
        return;
      }
    }

    try {
      await this.reactionRouter.handle({
        reaction,
        user,
      });
    } catch (err) {
      this.logger.error(`Could not h`);
    }
  }
}
