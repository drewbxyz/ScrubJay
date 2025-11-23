import { Injectable } from "@nestjs/common";
import { MessageFlags, PermissionsBitField } from "discord.js";
import {
  Context,
  Options,
  SlashCommand,
  type SlashCommandContext,
} from "necord";
import { SubscriptionsService } from "@/features/subscriptions/subscriptions.service";
import { SubscribeEBirdCommandDto } from "./commands.dto";

@Injectable()
export class SubscriptionCommands {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @SlashCommand({
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    description: "Subscribe to eBird observations for a region",
    name: "sub-ebird",
  })
  public async onSubscribeEBird(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: SubscribeEBirdCommandDto,
  ) {
    const { region } = options;
    try {
      await this.subscriptionsService.subscribeToEBird(
        interaction.channelId,
        region,
      );
      return interaction.reply({
        content: `Subscribed to eBird observations for ${region}.`,
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      return interaction.reply({
        content: `Failed to subscribe to eBird: ${error}`,
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}
