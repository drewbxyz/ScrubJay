import { Injectable, Logger } from "@nestjs/common";
import {
  ReactionHandler,
  ReactionHandlerPayload,
} from "@/discord/reaction-router/reaction-handler";
import { FiltersService } from "../filters.service";

@Injectable()
export class FiltersAddHandler implements ReactionHandler {
  private readonly logger = new Logger(FiltersAddHandler.name);
  constructor(private readonly filters: FiltersService) {}

  supports(emoji: string): boolean {
    return emoji === "👎";
  }

  private extractSpeciesNameFromTitle(title: string) {
    return title.split(" - ")[0];
  }

  async execute({ reaction }: ReactionHandlerPayload): Promise<void> {
    if (reaction.count < 3) {
      this.logger.debug("Filter vote added, but count is below threshold");
    }

    const message = reaction.message;

    const channelSub = await this.filters.isChannelFilterable(
      message.channelId,
    );

    if (!channelSub) return;

    const embed = message.embeds[0];
    if (!embed || !embed.title) return;

    const speciesCommonName = this.extractSpeciesNameFromTitle(embed.title);
    if (!speciesCommonName) return;

    try {
      await this.filters.addFilter(message.channelId, speciesCommonName);
    } catch (err) {
      this.logger.error(
        `Could not insert filter into database (${message.channelId}:${speciesCommonName}): ${err}`,
      );
      return;
    }

    this.logger.log(
      `Filter added: ${speciesCommonName} - ${message.channelId}`,
    );
  }
}
