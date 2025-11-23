import { BIRDING_ARTICLES } from "../data/birding-articles";
import type { RssFeedConfig } from "../routes/rss.routes";

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  pubDateObj: Date;
  guid: string;
  content?: string;
}

const feedStore = new Map<string, RssItem[]>();

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRfc822Date(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = days[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");

  return `${day}, ${date.getUTCDate()} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;
}

function getRandomArticle(): (typeof BIRDING_ARTICLES)[number] {
  const randomIndex = Math.floor(Math.random() * BIRDING_ARTICLES.length);
  const article = BIRDING_ARTICLES[randomIndex];
  if (!article) {
    throw new Error("Failed to get random article");
  }
  return article;
}

function generateInitialItems(feedId: string, now: Date): RssItem[] {
  const items: RssItem[] = [];
  for (let i = 0; i < 20; i++) {
    const article = getRandomArticle();
    const pubDateObj = new Date(now);
    pubDateObj.setDate(pubDateObj.getDate() - i);

    const guid = `article-${feedId}-${pubDateObj.getTime()}`;
    const link = `https://example.com/articles/${guid}`;

    const newItem: RssItem = {
      content: article.content,
      description: article.description,
      guid,
      link,
      pubDate: formatRfc822Date(pubDateObj),
      pubDateObj,
      title: article.title,
    };

    items.push(newItem);
  }
  return items;
}

export function generateRssFeed(config: RssFeedConfig): string {
  const feedId = config.id;
  const now = new Date();
  const lastBuildDate = formatRfc822Date(now);

  let items = feedStore.get(feedId) ?? generateInitialItems(feedId, now);

  for (let i = 0; i < 2; i++) {
    const article = getRandomArticle();
    const pubDateObj = new Date(now);
    pubDateObj.setMilliseconds(pubDateObj.getMilliseconds() + i);

    const guid = `article-${feedId}-${pubDateObj.getTime()}`;
    const link = `https://example.com/articles/${guid}`;

    const newItem: RssItem = {
      content: article.content,
      description: article.description,
      guid,
      link,
      pubDate: formatRfc822Date(pubDateObj),
      pubDateObj,
      title: article.title,
    };

    items.push(newItem);
  }

  items.sort((a, b) => b.pubDateObj.getTime() - a.pubDateObj.getTime());
  items = items.slice(0, 20);

  feedStore.set(feedId, items);

  const itemsXml = items
    .map((item) => {
      const contentXml = item.content
        ? `<content:encoded><![CDATA[${item.content}]]></content:encoded>`
        : "";

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      ${contentXml}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.link)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Mock API RSS Generator</generator>
${itemsXml}
  </channel>
</rss>`;
}
