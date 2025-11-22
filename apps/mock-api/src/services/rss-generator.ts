import type { RssFeedConfig } from "../routes/rss.routes";

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  content?: string;
}

const BIRDING_ARTICLES = [
  {
    content:
      "<p>In an exciting development for California birders, a California Condor was observed yesterday in Yosemite Valley. The sighting was confirmed by multiple experienced birders and represents a significant milestone in the species' recovery efforts.</p><p>The California Condor (Gymnogyps californianus) is one of North America's most endangered birds, with conservation efforts bringing the population from just 22 individuals in 1982 to over 500 today.</p>",
    description:
      "Birders report an incredible sighting of a California Condor soaring over Yosemite Valley. This endangered species continues to make a remarkable recovery.",
    title: "Rare California Condor Spotted in Yosemite Valley",
  },
  {
    content:
      "<p>Spring migration is officially underway! Birders across California are reporting the first arrivals of neotropical migrants, including several warbler species.</p><p>Hotspots like Golden Gate Park and Point Reyes are seeing increased activity as birders flock to catch glimpses of these colorful visitors.</p>",
    description:
      "The first wave of spring migrants has arrived, with Yellow Warblers and Wilson's Warblers being reported across the state.",
    title: "Spring Migration Begins: Warblers Arrive in California",
  },
  {
    content:
      "<p>A group of dedicated local birders has discovered a new hotspot that's proving to be excellent for shorebird diversity. The location, which remains partially undisclosed to protect sensitive habitat, has already yielded sightings of 15+ shorebird species in a single day.</p>",
    description:
      "Local birders have identified a new productive location for shorebird watching along the Monterey Bay coastline.",
    title: "New Birding Hotspot Discovered in Monterey Bay",
  },
  {
    content:
      "<p>Congratulations to Sarah Martinez, who has completed an incredible Big Year in San Francisco County! Her dedication to early morning birding sessions and extensive travel throughout the county has paid off with a record-breaking 287 species.</p><p>The previous record of 275 species was set in 2019 by Michael Chen.</p>",
    description:
      "Sarah Martinez has set a new county record with 287 species spotted in a single year, breaking the previous record of 275.",
    title: "Big Year Challenge: Local Birder Sets New Record",
  },
  {
    content:
      "<p>Conservation efforts for the threatened Western Snowy Plover are showing positive results. Protected nesting areas established along California's coastline have contributed to a 15% increase in breeding pairs compared to last year.</p><p>Beach closures and habitat restoration projects have created safer nesting conditions for these delicate shorebirds.</p>",
    description:
      "Protected nesting areas along the California coast have resulted in a 15% increase in Snowy Plover breeding pairs this season.",
    title: "Conservation Success: Snowy Plover Nesting Pairs Increase",
  },
  {
    content:
      "<p>A rare Taiga Bean-Goose (Anser fabalis) has been confirmed in the Central Valley, representing only the third state record. The bird was first spotted by a local farmer who recognized it as unusual among the typical Canada Geese.</p><p>Birders are reminded to respect private property and follow ethical birding guidelines when attempting to view this rarity.</p>",
    description:
      "A rare Taiga Bean-Goose has been observed in the Central Valley, attracting birders from across the state.",
    title: "Rare Bird Alert: Taiga Bean-Goose in Central Valley",
  },
  {
    content:
      "<p>Last weekend's pelagic trip was a huge success! Participants enjoyed excellent conditions and multiple species of pelagic birds, including Black-footed Albatross, Sooty Shearwater, and Pink-footed Shearwater.</p><p>The trip also produced a rare sighting of a Laysan Albatross, which is uncommon in California waters.</p>",
    description:
      "A recent pelagic birding trip off the coast of Monterey Bay yielded excellent views of Black-footed Albatross and multiple shearwater species.",
    title: "Pelagic Trip Report: Albatrosses and Shearwaters",
  },
  {
    content:
      "<p>Urban birding in San Francisco continues to surprise and delight. Multiple pairs of Peregrine Falcons are nesting on downtown buildings, while Red-tailed Hawks have established territories in Golden Gate Park.</p><p>These urban raptors are thriving thanks to abundant prey populations and reduced human disturbance during nesting season.</p>",
    description:
      "Peregrine Falcons and Red-tailed Hawks are successfully nesting in urban San Francisco, demonstrating the adaptability of these species.",
    title: "Urban Birding: Raptors Thriving in San Francisco",
  },
];

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

function generateRssItems(count: number = 10): RssItem[] {
  const items: RssItem[] = [];
  const now = new Date();

  // Use articles in rotation, but vary the dates
  for (let i = 0; i < count; i++) {
    const articleIndex = i % BIRDING_ARTICLES.length;
    const article = BIRDING_ARTICLES[articleIndex];

    // Generate dates going back in time, with some randomness
    const daysAgo = i * 2 + Math.floor(Math.random() * 3);
    const pubDate = new Date(now);
    pubDate.setDate(pubDate.getDate() - daysAgo);
    pubDate.setHours(Math.floor(Math.random() * 24));
    pubDate.setMinutes(Math.floor(Math.random() * 60));

    const guid = `article-${articleIndex}-${pubDate.getTime()}`;
    const link = `https://example.com/articles/${guid}`;

    items.push({
      content: article?.content,
      description: article?.description ?? "",
      guid,
      link,
      pubDate: formatRfc822Date(pubDate),
      title: article?.title ?? "",
    });
  }

  return items;
}

export function generateRssFeed(config: RssFeedConfig): string {
  const items = generateRssItems(10);
  const now = new Date();
  const lastBuildDate = formatRfc822Date(now);

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
