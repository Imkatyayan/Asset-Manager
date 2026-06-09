const USER_AGENT =
  "Mozilla/5.0 (compatible; PortfolioIQ/1.0; +https://github.com/portfolioiq)";

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1");
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function parseSource(title: string): string {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "Google News";
}

export async function fetchIndianNews(query: string, limit = 12): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-IN&gl=IN&ceid=IN:en`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 600 },
  });

  if (!res.ok) return [];

  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  return items.slice(0, limit).map((block) => {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");

    return {
      title,
      link,
      source: parseSource(title),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    };
  });
}

export function newsQueryForSymbol(symbol: string, name?: string): string {
  const base = name || symbol;
  return `${base} NSE BSE stock India`;
}

export const MARKET_NEWS_QUERY =
  "Indian stock market NSE BSE Nifty Sensex today";
