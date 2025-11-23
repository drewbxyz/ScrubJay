import { Test, type TestingModule } from "@nestjs/testing";
import * as Parser from "rss-parser";
import { RssFetcher } from "../rss.fetcher";

describe("RssFetcher", () => {
  let fetcher: RssFetcher;
  let parserMock: jest.Mocked<Parser>;

  beforeEach(async () => {
    const parseURLMock = jest.fn();
    parserMock = {
      parseURL: parseURLMock,
    } as unknown as jest.Mocked<Parser>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RssFetcher,
          useFactory: () => {
            const instance = new RssFetcher();
            Object.defineProperty(instance, "parser", {
              configurable: true,
              value: parserMock,
              writable: true,
            });
            return instance;
          },
        },
      ],
    }).compile();

    fetcher = module.get<RssFetcher>(RssFetcher);
    jest.clearAllMocks();
  });

  it("fetches and parses an RSS feed from a URL string", async () => {
    const mockFeed: Parser.Output<Parser.Item> = {
      description: "Latest birding observations",
      items: [
        {
          content: "<p>Content</p>",
          contentSnippet: "Content snippet",
          guid: "guid-1",
          isoDate: "2024-01-01T10:00:00Z",
          link: "https://example.com/sighting-1",
          pubDate: "Mon, 01 Jan 2024 10:00:00 GMT",
          title: "Rare Bird Sighting",
        },
      ],
      link: "https://example.com/feed",
      title: "Birding News Feed",
    };

    parserMock.parseURL.mockResolvedValue(mockFeed);

    const result = await fetcher.fetchRssFeed("https://example.com/feed.xml");

    expect(parserMock.parseURL).toHaveBeenCalledWith(
      "https://example.com/feed.xml",
    );
    expect(result).toEqual(mockFeed);
  });

  it("fetches and parses an RSS feed from a URL object", async () => {
    const mockFeed: Parser.Output<Parser.Item> = {
      items: [],
      title: "Nature Blog",
    };

    parserMock.parseURL.mockResolvedValue(mockFeed);

    const url = new URL("https://example.com/rss");
    const result = await fetcher.fetchRssFeed(url);

    expect(parserMock.parseURL).toHaveBeenCalledWith("https://example.com/rss");
    expect(result).toEqual(mockFeed);
  });

  it("handles feeds without titles gracefully", async () => {
    const mockFeed: Parser.Output<Parser.Item> = {
      items: [
        {
          link: "https://example.com/item",
          title: "Item without feed title",
        },
      ],
    };

    parserMock.parseURL.mockResolvedValue(mockFeed);

    const result = await fetcher.fetchRssFeed("https://example.com/feed.xml");

    expect(result).toEqual(mockFeed);
    expect(result.title).toBeUndefined();
  });

  it("propagates parsing errors", async () => {
    const error = new Error("Failed to parse RSS feed");
    parserMock.parseURL.mockRejectedValue(error);

    await expect(
      fetcher.fetchRssFeed("https://example.com/invalid-feed.xml"),
    ).rejects.toThrow("Failed to parse RSS feed");
  });

  it("handles network errors", async () => {
    const networkError = new Error("Network request failed");
    parserMock.parseURL.mockRejectedValue(networkError);

    await expect(
      fetcher.fetchRssFeed("https://example.com/feed.xml"),
    ).rejects.toThrow("Network request failed");
  });

  it("handles feeds with empty items array", async () => {
    const mockFeed: Parser.Output<Parser.Item> = {
      items: [],
      title: "Empty Feed",
    };

    parserMock.parseURL.mockResolvedValue(mockFeed);

    const result = await fetcher.fetchRssFeed("https://example.com/feed.xml");

    expect(result.items).toEqual([]);
    expect(result.title).toBe("Empty Feed");
  });
});
