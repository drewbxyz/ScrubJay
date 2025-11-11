import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EBirdObservation } from "./ebird.schema";

@Injectable()
export class EBirdFetcher {
  private readonly logger = new Logger(EBirdFetcher.name);

  constructor(private readonly configService: ConfigService) {}

  async fetchRareObservations(regionCode: string): Promise<EBirdObservation[]> {
    const url = new URL(
      `/v2/data/obs/${regionCode}/recent/notable?back=7&detail=full`,
      process.env.EBIRD_BASE_URL
    );
    const response = await fetch(url.toString(), {
      headers: { "X-eBirdApiKey": this.configService.get("EBIRD_TOKEN")! },
    });
    if (!response.ok) {
      this.logger.warn(`Failed to fetch observations: ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data;
  }
}
