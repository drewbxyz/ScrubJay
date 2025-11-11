import { Test, TestingModule } from "@nestjs/testing";
import { EBirdFetcher } from "../ebird.fetcher";
import { ConfigService } from "@nestjs/config";

describe("EBirdFetcher", () => {
  let fetcher: EBirdFetcher;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EBirdFetcher, ConfigService],
    }).compile();
    fetcher = module.get<EBirdFetcher>(EBirdFetcher);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(fetcher).toBeDefined();
  });
});
