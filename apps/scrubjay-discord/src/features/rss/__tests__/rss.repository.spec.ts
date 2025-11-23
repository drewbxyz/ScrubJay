import { Test, type TestingModule } from "@nestjs/testing";
import { DrizzleService } from "@/core/drizzle/drizzle.service";
import { RssRepository } from "../rss.repository";
import type { NormalizedRssItem } from "../rss.schema";

describe("RssRepository", () => {
  let repository: RssRepository;

  const mockInsert = jest.fn();
  const mockValues = jest.fn();
  const mockOnConflictDoUpdate = jest.fn();

  const drizzleMock = {
    db: {
      insert: mockInsert,
    },
  } as unknown as DrizzleService;

  beforeEach(async () => {
    mockInsert.mockReturnValue({
      values: mockValues,
    });
    mockValues.mockReturnValue({
      onConflictDoUpdate: mockOnConflictDoUpdate,
    });
    mockOnConflictDoUpdate.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RssRepository,
          useFactory: () => new RssRepository(drizzleMock),
        },
      ],
    }).compile();

    repository = module.get<RssRepository>(RssRepository);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("upserts an RSS item successfully", async () => {
    const rssItem: NormalizedRssItem = {
      contentHtml: "<p>Content</p>",
      description: "Description",
      id: "item-1",
      link: "https://example.com/item",
      publishedAt: new Date("2024-01-01T10:00:00Z"),
      sourceId: "source-1",
      title: "Test Item",
    };

    await repository.upsertRssItem(rssItem);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockValues).toHaveBeenCalledWith(rssItem);
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith({
      set: {
        contentHtml: rssItem.contentHtml,
        description: rssItem.description,
        lastUpdated: expect.any(Date),
        link: rssItem.link,
        publishedAt: rssItem.publishedAt,
        sourceId: rssItem.sourceId,
        title: rssItem.title,
      },
      target: expect.any(Array),
    });
  });

  it("handles null fields correctly", async () => {
    const rssItem: NormalizedRssItem = {
      contentHtml: null,
      description: null,
      id: "item-2",
      link: null,
      publishedAt: null,
      sourceId: "source-1",
      title: null,
    };

    await repository.upsertRssItem(rssItem);

    expect(mockValues).toHaveBeenCalledWith(rssItem);
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith({
      set: {
        contentHtml: null,
        description: null,
        lastUpdated: expect.any(Date),
        link: null,
        publishedAt: null,
        sourceId: rssItem.sourceId,
        title: null,
      },
      target: expect.any(Array),
    });
  });

  it("sets lastUpdated to current date on conflict", async () => {
    const rssItem: NormalizedRssItem = {
      contentHtml: null,
      description: null,
      id: "item-3",
      link: null,
      publishedAt: null,
      sourceId: "source-1",
      title: "Updated Title",
    };

    const beforeDate = new Date();
    await repository.upsertRssItem(rssItem);
    const afterDate = new Date();

    const conflictUpdate = mockOnConflictDoUpdate.mock.calls[0][0];
    const lastUpdated = conflictUpdate.set.lastUpdated as Date;

    expect(lastUpdated).toBeInstanceOf(Date);
    expect(lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
    expect(lastUpdated.getTime()).toBeLessThanOrEqual(afterDate.getTime());
  });
});
