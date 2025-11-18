import { Injectable } from "@nestjs/common";
import { FiltersRepository } from "./filters.repository";

@Injectable()
export class FiltersService {
  constructor(private readonly repo: FiltersRepository) {}

  async isChannelFilterable(channelId: string) {
    return this.repo.isChannelFilterable(channelId);
  }

  async addFilter(channelId: string, commonName: string) {
    return this.repo.addChannelFilter(channelId, commonName);
  }
}
