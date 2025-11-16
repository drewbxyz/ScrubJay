import {
  channelEBirdSubscriptions,
  filteredSpecies,
} from "@/core/drizzle/drizzle.schema";
import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { Injectable, Logger } from "@nestjs/common";
import { Events } from "discord.js";
import { eq } from "drizzle-orm";
import { On, Context, ContextOf } from "necord";

@Injectable()
export class DiscordListeners {
  private readonly logger = new Logger(DiscordListeners.name);

  constructor(private readonly drizzle: DrizzleService) {}

  @On(Events.MessageReactionAdd)
  public async onMessageReactionAdd(
    @Context() [reaction, user]: ContextOf<Events.MessageReactionAdd>
  ) {
    if (user.bot) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        this.logger.error(`Error fetching reaction: ${err}`);
        return;
      }
    }

    if (reaction.emoji.name !== "👎" || !reaction.count) return;
    if (reaction.count < 3) {
      this.logger.debug(
        `Received vote to remove, but total count is under threshold`
      );
      return;
    }

    try {
      const channel =
        await this.drizzle.db.query.channelEBirdSubscriptions.findFirst({
          where: eq(
            channelEBirdSubscriptions.channelId,
            reaction.message.channelId
          ),
        });
      if (!channel) return;

      if (reaction.message.embeds.length > 0) {
        const embed = reaction.message.embeds[0];
        if (!embed) return;
        const embedTitle = embed.title;
        if (!embedTitle) return;
        const speciesCommonName = embedTitle.split(" - ")[0];
        if (!speciesCommonName) return;

        await this.drizzle.db.insert(filteredSpecies).values({
          channelId: reaction.message.channelId,
          commonName: speciesCommonName,
        });
        this.logger.log(
          `Filter added: ${speciesCommonName} - ${reaction.message.channelId}`
        );
      } else {
        this.logger.debug(
          `Message received in channel with reaction, but message did not contain embed`
        );
      }
    } catch (err) {
      this.logger.error(`Error handling reaction: `, err);
    }
  }
}
