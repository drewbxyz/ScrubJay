import { Injectable, Logger } from "@nestjs/common";
import { Context, SlashCommand, SlashCommandContext } from "necord";

@Injectable()
export class UtilCommands {
  private readonly logger = new Logger(UtilCommands.name);

  @SlashCommand({
    description: "Responds with latency",
    name: "ping",
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    this.logger.debug("Received ping command.");
    const latency = Date.now() - interaction.createdTimestamp;

    try {
      if (latency < 0) {
        return interaction.reply({
          content: `Something weird happened... latency was ${latency}ms`,
        });
      }
      return interaction.reply({ content: `Pong! Latency: ${latency}ms` });
    } catch (err) {
      console.error(`Something went wrong responding to ping command: ${err}`);
    }
  }
}
