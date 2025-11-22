import express from "express";
import { generateRssFeed } from "../services/rss-generator";

export interface RssFeedConfig {
  id: string;
  title: string;
  description: string;
  link: string;
  baseUrl: string;
}

const FEED_CONFIGS: RssFeedConfig[] = [
  {
    baseUrl: "http://localhost:8080",
    description: "A mock RSS feed for birding news and updates",
    id: "birding-news",
    link: "https://example.com/birding-news",
    title: "Mock Birding News",
  },
];

export function createRssRoutes() {
  const router = express.Router();

  // List available RSS feeds
  router.get("/rss", (_req, res) => {
    res.json({
      feeds: FEED_CONFIGS.map((config) => ({
        description: config.description,
        id: config.id,
        title: config.title,
        url: `${config.baseUrl}/rss/${config.id}`,
      })),
    });
  });

  // Get specific RSS feed
  router.get("/rss/:feedId", (req, res) => {
    const { feedId } = req.params;
    const config = FEED_CONFIGS.find((f) => f.id === feedId);

    if (!config) {
      return res.status(404).json({ error: "RSS feed not found" });
    }

    const rssXml = generateRssFeed(config);
    res.set("Content-Type", "application/rss+xml");
    res.send(rssXml);
  });

  return router;
}
