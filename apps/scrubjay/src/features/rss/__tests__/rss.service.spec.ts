import { Test, type TestingModule } from "@nestjs/testing";
import type * as Parser from "rss-parser";
import { RssFetcher } from "../rss.fetcher";
import { RssRepository } from "../rss.repository";
import type { NormalizedRssItem } from "../rss.schema";
import { RssService } from "../rss.service";
import { RssTransformer } from "../rss.transformer";

describe("RssService", () => {
  let service: RssService;

  const fetcherMock = {
    fetchRssFeed: jest.fn(),
  };

  const transformerMock = {
    transformFeed: jest.fn(),
  };

  const repoMock = {
    upsertRssItem: jest.fn(),
  };

  const mockFeed: Parser.Output<Parser.Item> = {
    items: [
      {
        content: "<p>Content 1</p>",
        contentSnippet: "Snippet 1",
        guid: "guid-1",
        isoDate: "2024-01-01T10:00:00Z",
        link: "https://example.com/sighting-1",
        pubDate: "Mon, 01 Jan 2024 10:00:00 GMT",
        title: "Rare Bird Sighting",
      },
      {
        content: "<p>Content 2</p>",
        contentSnippet: "Snippet 2",
        guid: "guid-2",
        isoDate: "2024-01-02T10:00:00Z",
        link: "https://example.com/migration-1",
        pubDate: "Mon, 02 Jan 2024 10:00:00 GMT",
        title: "Migration Update",
      },
    ],
    title: "Birding News Feed",
  };

  const mockTransformedItems: NormalizedRssItem[] = [
    {
      contentHtml: "<p>Content 1</p>",
      description: "Snippet 1",
      id: "guid-1",
      link: "https://example.com/sighting-1",
      publishedAt: new Date("2024-01-01T10:00:00Z"),
      sourceId: "source-1",
      title: "Rare Bird Sighting",
    },
    {
      contentHtml: "<p>Content 2</p>",
      description: "Snippet 2",
      id: "guid-2",
      link: "https://example.com/migration-1",
      publishedAt: new Date("2024-01-02T10:00:00Z"),
      sourceId: "source-1",
      title: "Migration Update",
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RssService,
          useFactory: () =>
            new RssService(
              fetcherMock as unknown as RssFetcher,
              transformerMock as unknown as RssTransformer,
              repoMock as unknown as RssRepository,
            ),
        },
      ],
    }).compile();

    service = module.get<RssService>(RssService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns zero and skips transform when fetching RSS feed fails", async () => {
    fetcherMock.fetchRssFeed.mockRejectedValue(new Error("Network error"));

    const inserted = await service.ingestRssSource({
      id: "source-1",
      url: "https://example.com/feed.xml",
    });

    expect(inserted).toBe(0);
    expect(transformerMock.transformFeed).not.toHaveBeenCalled();
    expect(repoMock.upsertRssItem).not.toHaveBeenCalled();
  });

  it("ingests all transformed RSS items successfully", async () => {
    fetcherMock.fetchRssFeed.mockResolvedValue(mockFeed);
    transformerMock.transformFeed.mockReturnValue(mockTransformedItems);
    repoMock.upsertRssItem.mockResolvedValue(undefined);

    const inserted = await service.ingestRssSource({
      id: "source-1",
      url: "https://example.com/feed.xml",
    });

    expect(fetcherMock.fetchRssFeed).toHaveBeenCalledWith(
      "https://example.com/feed.xml",
    );
    expect(transformerMock.transformFeed).toHaveBeenCalledWith(
      mockFeed,
      "source-1",
    );
    expect(repoMock.upsertRssItem).toHaveBeenCalledTimes(2);
    expect(repoMock.upsertRssItem).toHaveBeenNthCalledWith(
      1,
      mockTransformedItems[0],
    );
    expect(repoMock.upsertRssItem).toHaveBeenNthCalledWith(
      2,
      mockTransformedItems[1],
    );
    expect(inserted).toBe(2);
  });

  it("handles URL objects correctly", async () => {
    const url = new URL("https://example.com/feed.xml");
    fetcherMock.fetchRssFeed.mockResolvedValue(mockFeed);
    transformerMock.transformFeed.mockReturnValue(mockTransformedItems);
    repoMock.upsertRssItem.mockResolvedValue(undefined);

    await service.ingestRssSource({
      id: "source-1",
      url,
    });

    expect(fetcherMock.fetchRssFeed).toHaveBeenCalledWith(url);
  });

  it("continues processing when individual item upsert fails", async () => {
    fetcherMock.fetchRssFeed.mockResolvedValue(mockFeed);
    transformerMock.transformFeed.mockReturnValue(mockTransformedItems);
    repoMock.upsertRssItem
      .mockRejectedValueOnce(new Error("Database error"))
      .mockResolvedValueOnce(undefined);

    const inserted = await service.ingestRssSource({
      id: "source-1",
      url: "https://example.com/feed.xml",
    });

    expect(repoMock.upsertRssItem).toHaveBeenCalledTimes(2);
    expect(inserted).toBe(1); // Only one successful insert
  });

  it("handles feeds with no items", async () => {
    const emptyFeed: Parser.Output<Parser.Item> = {
      items: [],
      title: "Empty Feed",
    };

    fetcherMock.fetchRssFeed.mockResolvedValue(emptyFeed);
    transformerMock.transformFeed.mockReturnValue([]);

    const inserted = await service.ingestRssSource({
      id: "source-1",
      url: "https://example.com/feed.xml",
    });

    expect(transformerMock.transformFeed).toHaveBeenCalledWith(
      emptyFeed,
      "source-1",
    );
    expect(repoMock.upsertRssItem).not.toHaveBeenCalled();
    expect(inserted).toBe(0);
  });

  it("handles partial failures gracefully", async () => {
    fetcherMock.fetchRssFeed.mockResolvedValue(mockFeed);
    transformerMock.transformFeed.mockReturnValue(mockTransformedItems);
    repoMock.upsertRssItem
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Constraint violation"))
      .mockResolvedValueOnce(undefined);

    // Add a third item to test multiple failures
    const feedWithThreeItems: Parser.Output<Parser.Item> = {
      ...mockFeed,
      items: [
        ...mockFeed.items,
        {
          guid: "guid-3",
          title: "Third Item",
        },
      ],
    };
    const threeTransformedItems: NormalizedRssItem[] = [
      ...mockTransformedItems,
      {
        contentHtml: null,
        description: null,
        id: "guid-3",
        link: null,
        publishedAt: null,
        sourceId: "source-1",
        title: "Third Item",
      },
    ];

    fetcherMock.fetchRssFeed.mockResolvedValue(feedWithThreeItems);
    transformerMock.transformFeed.mockReturnValue(threeTransformedItems);

    const inserted = await service.ingestRssSource({
      id: "source-1",
      url: "https://example.com/feed.xml",
    });

    expect(repoMock.upsertRssItem).toHaveBeenCalledTimes(3);
    expect(inserted).toBe(2); // Two successful, one failed
  });

  it("processes items in order", async () => {
    fetcherMock.fetchRssFeed.mockResolvedValue(mockFeed);
    transformerMock.transformFeed.mockReturnValue(mockTransformedItems);
    repoMock.upsertRssItem.mockResolvedValue(undefined);

    await service.ingestRssSource({
      id: "source-1",
      url: "https://example.com/feed.xml",
    });

    // Verify items are processed in sequence
    const callOrder = repoMock.upsertRssItem.mock.invocationCallOrder;
    expect(callOrder[0]).toBeLessThan(callOrder[1]);
  });
});
