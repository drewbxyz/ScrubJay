import { Test, type TestingModule } from "@nestjs/testing";
import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { RssFetcher } from "../rss.fetcher";
import { RssRepository } from "../rss.repository";
import { RssService } from "../rss.service";
import { RssTransformer } from "../rss.transformer";

describe("RssModule", () => {
  let module: TestingModule;

  const mockDrizzleService = {
    db: {
      insert: jest.fn(),
    },
  } as unknown as DrizzleService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      exports: [RssService],
      providers: [
        RssFetcher,
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
        RssRepository,
        RssTransformer,
        RssService,
      ],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should provide RssFetcher", () => {
    const fetcher = module.get<RssFetcher>(RssFetcher);
    expect(fetcher).toBeDefined();
    expect(fetcher).toBeInstanceOf(RssFetcher);
  });

  it("should provide RssRepository", () => {
    const repository = module.get<RssRepository>(RssRepository);
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(RssRepository);
  });

  it("should provide RssTransformer", () => {
    const transformer = module.get<RssTransformer>(RssTransformer);
    expect(transformer).toBeDefined();
    expect(transformer).toBeInstanceOf(RssTransformer);
  });

  it("should provide RssService", () => {
    const service = module.get<RssService>(RssService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(RssService);
  });

  it("should export RssService", () => {
    const exportedService = module.get<RssService>(RssService, {
      strict: false,
    });
    expect(exportedService).toBeDefined();
  });
});
