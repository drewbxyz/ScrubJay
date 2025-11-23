import { Injectable } from "@nestjs/common";
import { ActivityType, Events } from "discord.js";
import { Context, ContextOf, On } from "necord";

@Injectable()
export class LifecycleListenerService {
  @On(Events.ClientReady)
  async onClientReady(@Context() [client]: ContextOf<Events.ClientReady>) {
    client.user.setActivity("looking for birds...", {
      type: ActivityType.Custom,
    });
  }
}
