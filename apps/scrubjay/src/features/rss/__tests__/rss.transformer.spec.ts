import * as Parser from "rss-parser";
import { RssTransformer } from "../rss.transformer";

describe("RssTransformer", () => {
  const transformer = new RssTransformer();

  describe("transformItem", () => {
    it("transforms an RSS item with all fields present", () => {
      const item: Parser.Item = {
        content: "<p>Full HTML content here</p>",
        contentSnippet: "Plain text snippet",
        guid: "unique-guid-123",
        isoDate: "2024-01-01T10:00:00Z",
        link: "https://example.com/sighting-123",
        pubDate: "Mon, 01 Jan 2024 10:00:00 GMT",
        title: "Rare Bird Sighting in Central Park",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result).toEqual({
        contentHtml: "<p>Full HTML content here</p>",
        description: "Plain text snippet",
        id: "unique-guid-123",
        link: "https://example.com/sighting-123",
        publishedAt: new Date("2024-01-01T10:00:00Z"),
        sourceId: "source-1",
        title: "Rare Bird Sighting in Central Park",
      });
    });

    it("uses guid as id when available", () => {
      const item: Parser.Item = {
        guid: "preferred-guid",
        link: "https://example.com/item",
        title: "Test Item",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result.id).toBe("preferred-guid");
    });

    it("falls back to link as id when guid is not available", () => {
      const item: Parser.Item = {
        link: "https://example.com/fallback-link",
        title: "Test Item",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result.id).toBe("https://example.com/fallback-link");
    });

    it("generates a stable SHA1 hash when neither guid nor link is available", () => {
      const item: Parser.Item = {
        pubDate: "Mon, 01 Jan 2024 10:00:00 GMT",
        title: "Item without guid or link",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result.id).toMatch(/^[a-f0-9]{40}$/); // SHA1 hash is 40 hex characters
      expect(result.id.length).toBe(40);
    });

    it("generates the same hash for identical items", () => {
      const item: Parser.Item = {
        link: "",
        pubDate: "Mon, 01 Jan 2024 10:00:00 GMT",
        title: "Same Item",
      };

      const result1 = transformer.transformItem(item, "source-1");
      const result2 = transformer.transformItem(item, "source-1");

      expect(result1.id).toBe(result2.id);
    });

    it("handles items with only isoDate", () => {
      const item: Parser.Item = {
        guid: "iso-item",
        isoDate: "2024-01-15T14:30:00Z",
        title: "ISO Date Item",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result.publishedAt).toEqual(new Date("2024-01-15T14:30:00Z"));
    });

    it("handles items with only pubDate (no isoDate)", () => {
      const item: Parser.Item = {
        guid: "pub-item",
        pubDate: "Mon, 15 Jan 2024 14:30:00 GMT",
        title: "Pub Date Item",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result.publishedAt).toEqual(
        new Date("Mon, 15 Jan 2024 14:30:00 GMT"),
      );
    });

    it("prefers isoDate over pubDate when both are present", () => {
      const item: Parser.Item = {
        guid: "both-dates",
        isoDate: "2024-01-15T14:30:00Z",
        pubDate: "Mon, 15 Jan 2024 14:30:00 GMT",
        title: "Both Dates Item",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result.publishedAt).toEqual(new Date("2024-01-15T14:30:00Z"));
    });

    it("handles null/undefined fields gracefully", () => {
      const item: Parser.Item = {
        guid: "minimal-item",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result).toEqual({
        contentHtml: null,
        description: null,
        id: "minimal-item",
        link: null,
        publishedAt: null,
        sourceId: "source-1",
        title: null,
      });
    });

    it("handles empty string fields", () => {
      const item: Parser.Item = {
        content: "",
        contentSnippet: "",
        guid: "empty-fields",
        link: "",
        title: "",
      };

      const result = transformer.transformItem(item, "source-1");

      expect(result.title).toBe("");
      expect(result.link).toBe("");
      expect(result.contentHtml).toBe("");
      expect(result.description).toBe("");
    });

    it("assigns the correct sourceId", () => {
      const item: Parser.Item = {
        guid: "test-1",
        title: "Test",
      };

      const result1 = transformer.transformItem(item, "source-a");
      const result2 = transformer.transformItem(item, "source-b");

      expect(result1.sourceId).toBe("source-a");
      expect(result2.sourceId).toBe("source-b");
    });
  });

  describe("transformFeed", () => {
    it("transforms all items in a feed", () => {
      const feed: Parser.Output<Parser.Item> = {
        items: [
          {
            guid: "item-1",
            link: "https://example.com/1",
            title: "Item 1",
          },
          {
            guid: "item-2",
            link: "https://example.com/2",
            title: "Item 2",
          },
          {
            guid: "item-3",
            link: "https://example.com/3",
            title: "Item 3",
          },
        ],
        title: "Birding Feed",
      };

      const result = transformer.transformFeed(feed, "source-1");

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("item-1");
      expect(result[1].id).toBe("item-2");
      expect(result[2].id).toBe("item-3");
      result.forEach((item) => {
        expect(item.sourceId).toBe("source-1");
      });
    });

    it("handles empty feeds", () => {
      const feed: Parser.Output<Parser.Item> = {
        items: [],
        title: "Empty Feed",
      };

      const result = transformer.transformFeed(feed, "source-1");

      expect(result).toEqual([]);
    });

    it("transforms items with mixed field availability", () => {
      const feed: Parser.Output<Parser.Item> = {
        items: [
          {
            content: "<p>Content</p>",
            contentSnippet: "Snippet",
            guid: "full",
            isoDate: "2024-01-01T10:00:00Z",
            link: "https://example.com/full",
            title: "Full Item",
          },
          {
            guid: "minimal",
            title: "Minimal Item",
          },
          {
            link: "https://example.com/link-only",
            title: "Link Only",
          },
        ],
        title: "Mixed Feed",
      };

      const result = transformer.transformFeed(feed, "source-1");

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("full");
      expect(result[1].id).toBe("minimal");
      expect(result[2].id).toBe("https://example.com/link-only");
    });
  });
});
