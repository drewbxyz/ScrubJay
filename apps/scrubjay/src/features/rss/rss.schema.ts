export interface NormalizedRssItem {
  id: string;
  title: string | null;
  link: string | null;
  description: string | null;
  publishedAt: Date | null;
  contentHtml: string | null;
  sourceId: string;
}

export interface NormalizedRssFeed {
  title: string | undefined;
  items: NormalizedRssItem[];
}
