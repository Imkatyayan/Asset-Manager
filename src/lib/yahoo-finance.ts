import { deriveTrend, rsi, sma } from "./technical-indicators";
import { guessSector, normalizeSector, resolveSector } from "./sector-utils";

const USER_AGENT =
  "Mozilla/5.0 (compatible; PortfolioIQ/1.0; +https://github.com/portfolioiq)";

export interface YahooQuote {
  symbol: string;
  yahooSymbol: string;
  name: string;
  price: number;
  previousClose: number;
  changePercent: number;
  currency: string;
}

export interface SearchResult {
  symbol: string;
  yahooSymbol: string;
  name: string;
  type: string;
  exchange: string;
  sector?: string;
}

export interface ChartPoint {
  date: string;
  close: number;
  volume: number;
}

export interface QuoteIndicators {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  trend: "bullish" | "neutral" | "bearish";
}

export interface QuoteDetail {
  symbol: string;
  yahooSymbol: string;
  name: string;
  type: string;
  exchange: string;
  sector?: string;
  industry?: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  periodReturn: number | null;
  chartRange: ChartRange;
  indicators: QuoteIndicators;
  chart: ChartPoint[];
  updatedAt: string;
}

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const quoteCache = new Map<string, CacheEntry<YahooQuote>>();
const detailCache = new Map<string, CacheEntry<QuoteDetail>>();
const yearReturnCache = new Map<string, CacheEntry<number>>();
const searchCache = new Map<string, CacheEntry<SearchResult[]>>();

const QUOTE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DETAIL_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function isFresh<T>(
  entry: CacheEntry<T> | undefined,
  ttlMs: number = QUOTE_CACHE_TTL_MS
): entry is CacheEntry<T> {
  return !!entry && Date.now() - entry.fetchedAt < ttlMs;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function toYahooSymbol(symbol: string): string {
  const trimmed = symbol.trim().toUpperCase();
  if (trimmed.startsWith("^")) return trimmed;
  if (/\.(NS|BO)$/i.test(trimmed)) return trimmed;
  return `${trimmed.replace(/\.(NSE|BSE)$/i, "")}.NS`;
}

export function isIndianSymbol(symbol: string): boolean {
  return (
    symbol.startsWith("^") ||
    symbol.endsWith(".NS") ||
    symbol.endsWith(".BO") ||
    symbol.endsWith(".NSE") ||
    symbol.endsWith(".BSE")
  );
}

async function yahooFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
    ...init,
  });
}

const CHUNK_SIZE = 8;

async function fetchQuotesChunk(yahooSymbols: string[]): Promise<YahooQuote[]> {
  if (yahooSymbols.length === 0) return [];

  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(
    yahooSymbols.join(",")
  )}&range=1d&interval=5m`;

  const res = await yahooFetch(url);
  if (!res.ok) throw new Error(`Yahoo Finance spark API error: ${res.status}`);

  const json = (await res.json()) as {
    spark?: { result?: Array<{ symbol: string; response?: Array<{ meta: SparkMeta }> }> };
  };

  const fetched: YahooQuote[] = [];
  for (const item of json.spark?.result ?? []) {
    const meta = item.response?.[0]?.meta;
    if (!meta?.regularMarketPrice) continue;

    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
    const changePercent =
      previousClose > 0
        ? ((meta.regularMarketPrice - previousClose) / previousClose) * 100
        : 0;

    const quote: YahooQuote = {
      symbol: meta.symbol.replace(/\.(NS|BO)$/i, "").replace(/^\^/, ""),
      yahooSymbol: meta.symbol,
      name: meta.longName || meta.shortName || meta.symbol,
      price: meta.regularMarketPrice,
      previousClose,
      changePercent: round2(changePercent),
      currency: meta.currency || "INR",
    };

    quoteCache.set(meta.symbol, { data: quote, fetchedAt: Date.now() });
    fetched.push(quote);
  }

  return fetched;
}

interface SparkMeta {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  currency?: string;
}

interface ChartMeta {
  symbol: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketVolume?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export async function fetchQuotes(yahooSymbols: string[]): Promise<YahooQuote[]> {
  const unique = [...new Set(yahooSymbols)];
  const cached: YahooQuote[] = [];
  const missing: string[] = [];

  for (const sym of unique) {
    const entry = quoteCache.get(sym);
    if (isFresh(entry, QUOTE_CACHE_TTL_MS)) cached.push(entry.data);
    else missing.push(sym);
  }

  if (missing.length === 0) return cached;

  const fetched: YahooQuote[] = [];

  for (let i = 0; i < missing.length; i += CHUNK_SIZE) {
    const chunk = missing.slice(i, i + CHUNK_SIZE);
    try {
      fetched.push(...(await fetchQuotesChunk(chunk)));
    } catch {
      // Retry each symbol individually when batch fails
      for (const sym of chunk) {
        try {
          fetched.push(...(await fetchQuotesChunk([sym])));
        } catch {
          // skip — caller handles missing quotes
        }
      }
    }
  }

  return [...cached, ...fetched];
}

export async function searchSymbols(query: string, limit = 12): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const cacheKey = `${query.trim().toLowerCase()}:${limit}`;
  const entry = searchCache.get(cacheKey);
  if (isFresh(entry, DETAIL_CACHE_TTL_MS)) return entry.data;

  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    query
  )}&quotesCount=${limit * 2}&newsCount=0`;

  const res = await yahooFetch(url, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    quotes?: Array<{
      symbol: string;
      shortname?: string;
      longname?: string;
      quoteType?: string;
      exchange?: string;
      sector?: string;
    }>;
  };

  const results = (json.quotes ?? [])
    .filter((q) => isIndianSymbol(q.symbol))
    .slice(0, limit)
    .map((q) => {
      const parsedSymbol = q.symbol.replace(/\.(NS|BO)$/i, "").replace(/^\^/, "");
      const parsedName = q.longname || q.shortname || q.symbol;
      return {
        symbol: parsedSymbol,
        yahooSymbol: q.symbol,
        name: parsedName,
        type: q.quoteType || "EQUITY",
        exchange: q.exchange || "NSE",
        sector: resolveSector(parsedName, parsedSymbol, q.sector),
      };
    });

  searchCache.set(cacheKey, { data: results, fetchedAt: Date.now() });
  return results;
}

export type ChartRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y" | "max";

const CHART_RANGE_CONFIG: Record<ChartRange, { range: string; interval: string }> = {
  "1d":  { range: "1d",  interval: "5m"  },
  "5d":  { range: "5d",  interval: "15m" },
  "1mo": { range: "1mo", interval: "1d"  },
  "3mo": { range: "3mo", interval: "1d"  },
  "6mo": { range: "6mo", interval: "1d"  },
  "1y":  { range: "1y",  interval: "1wk" },
  "5y":  { range: "5y",  interval: "1mo" },
  "max": { range: "max", interval: "3mo" },
};

export const CHART_RANGE_LABELS: Record<ChartRange, string> = {
  "1d":  "1D",
  "5d":  "5D",
  "1mo": "1M",
  "3mo": "3M",
  "6mo": "6M",
  "1y":  "1Y",
  "5y":  "5Y",
  "max": "All",
};

async function fetchChart(
  yahooSymbol: string,
  chartRange: ChartRange = "1mo"
): Promise<{
  meta: ChartMeta;
  closes: number[];
  volumes: number[];
  timestamps: number[];
}> {
  const { range, interval } = CHART_RANGE_CONFIG[chartRange];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    yahooSymbol
  )}?interval=${interval}&range=${range}`;

  const res = await yahooFetch(url, {
    cache: "force-cache",
    next: { revalidate: 43200 },
  });
  if (!res.ok) throw new Error(`Yahoo chart API error: ${res.status}`);

  const json = (await res.json()) as {
    chart?: {
      result?: Array<{
        meta: ChartMeta;
        timestamp?: number[];
        indicators?: { quote?: Array<{ close?: Array<number | null>; volume?: Array<number | null> }> };
      }>;
    };
  };

  const result = json.chart?.result?.[0];
  if (!result) throw new Error("No chart data");

  const quote = result.indicators?.quote?.[0];
  const timestamps = result.timestamp ?? [];
  const closes: number[] = [];
  const volumes: number[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = quote?.close?.[i];
    if (close != null) {
      closes.push(close);
      volumes.push(quote?.volume?.[i] ?? 0);
    }
  }

  return { meta: result.meta, closes, volumes, timestamps };
}

export async function fetchYearReturn(yahooSymbol: string): Promise<number | null> {
  const entry = yearReturnCache.get(yahooSymbol);
  if (isFresh(entry, DETAIL_CACHE_TTL_MS)) return entry.data;

  try {
    const { closes } = await fetchChart(yahooSymbol, "1y");
    if (closes.length < 2) return null;
    const yearReturn = round2(((closes[closes.length - 1] - closes[0]) / closes[0]) * 100);
    yearReturnCache.set(yahooSymbol, { data: yearReturn, fetchedAt: Date.now() });
    return yearReturn;
  } catch {
    return null;
  }
}

export async function fetchQuoteDetail(
  symbol: string,
  chartRange: ChartRange = "1mo"
): Promise<QuoteDetail | null> {
  const yahooSymbol = toYahooSymbol(symbol);
  const cacheKey = `${yahooSymbol}:${chartRange}`;
  const cached = detailCache.get(cacheKey);
  if (isFresh(cached, DETAIL_CACHE_TTL_MS)) return cached.data;

  try {
    // Always fetch 1y for SMA/RSI; fetch selected range for chart display
    const [longChart, rangeChart] = await Promise.all([
      fetchChart(yahooSymbol, "1y"),
      fetchChart(yahooSymbol, chartRange),
    ]);

    const { meta, closes: longCloses } = longChart;
    const { closes: rangeCloses, volumes: rangeVolumes, timestamps: rangeTimestamps } = rangeChart;

    const price = meta.regularMarketPrice ?? longCloses[longCloses.length - 1];
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    const sma20 = sma(longCloses, 20);
    const sma50 = sma(longCloses, 50);
    const sma200 = sma(longCloses, 200);
    const rsi14 = rsi(longCloses, 14);
    const trend = deriveTrend(price, sma50, sma200, rsi14);

    const periodReturn =
      rangeCloses.length >= 2
        ? round2(((rangeCloses[rangeCloses.length - 1] - rangeCloses[0]) / rangeCloses[0]) * 100)
        : null;

    const chart: ChartPoint[] = rangeCloses.map((close, i) => ({
      date: new Date((rangeTimestamps[i] ?? Date.now() / 1000) * 1000).toISOString().slice(0, 10),
      close: round2(close),
      volume: rangeVolumes[i] ?? 0,
    }));

    const detail: QuoteDetail = {
      symbol: yahooSymbol.replace(/\.(NS|BO)$/i, "").replace(/^\^/, ""),
      yahooSymbol,
      name: meta.longName || meta.shortName || yahooSymbol,
      type: yahooSymbol.startsWith("^") ? "INDEX" : "EQUITY",
      exchange: yahooSymbol.endsWith(".BO") ? "BSE" : "NSE",
      price: round2(price),
      previousClose: round2(previousClose),
      change: round2(change),
      changePercent: round2(changePercent),
      dayHigh: round2(meta.regularMarketDayHigh ?? price),
      dayLow: round2(meta.regularMarketDayLow ?? price),
      volume: meta.regularMarketVolume ?? rangeVolumes[rangeVolumes.length - 1] ?? 0,
      fiftyTwoWeekHigh: round2(meta.fiftyTwoWeekHigh ?? price),
      fiftyTwoWeekLow: round2(meta.fiftyTwoWeekLow ?? price),
      periodReturn,
      chartRange,
      indicators: { sma20, sma50, sma200, rsi14, trend },
      chart,
      updatedAt: new Date().toISOString(),
    };

    const searchHits = await searchSymbols(detail.symbol, 1);
    if (searchHits[0]) {
      detail.type = searchHits[0].type;
      detail.sector = searchHits[0].sector;
      if (searchHits[0].name) detail.name = searchHits[0].name;
    } else {
      detail.sector = normalizeSector(guessSector(detail.name, detail.symbol));
    }

    detailCache.set(cacheKey, { data: detail, fetchedAt: Date.now() });
    return detail;
  } catch {
    return null;
  }
}

/** Major indices only in the header ticker — avoids confusing NIFTY IT (~28k) with NIFTY 50 (~23k). */
export const TICKER_INDICES = [
  { label: "NIFTY 50", yahooSymbol: "^NSEI", kind: "INDEX" as const },
  { label: "SENSEX", yahooSymbol: "^BSESN", kind: "INDEX" as const },
  { label: "NIFTY BANK", yahooSymbol: "^NSEBANK", kind: "INDEX" as const },
  { label: "GOLD BEES", yahooSymbol: "GOLDBEES.NS", kind: "ETF" as const },
] as const;

export const INDIAN_INDICES = [
  { label: "NIFTY 50", yahooSymbol: "^NSEI" },
  { label: "SENSEX", yahooSymbol: "^BSESN" },
  { label: "NIFTY BANK", yahooSymbol: "^NSEBANK" },
  { label: "NIFTY IT", yahooSymbol: "^CNXIT" },
  { label: "NIFTY MIDCAP", yahooSymbol: "^CNXMID" },
  { label: "NIFTY SMALLCAP", yahooSymbol: "^CNXSC" },
  { label: "NIFTY AUTO", yahooSymbol: "^CNXAUTO" },
  { label: "NIFTY PHARMA", yahooSymbol: "^CNXPHARMA" },
  { label: "NIFTY METAL", yahooSymbol: "^CNXMETAL" },
  { label: "NIFTY REALTY", yahooSymbol: "^CNXREALTY" },
  { label: "NIFTY PSU BANK", yahooSymbol: "^CNXPSUBANK" },
  { label: "INDIA VIX", yahooSymbol: "^INDIAVIX" },
] as const;

export const POPULAR_ETFS = [
  { label: "NIFTY BEES", yahooSymbol: "NIFTYBEES.NS" },
  { label: "BANK BEES", yahooSymbol: "BANKBEES.NS" },
  { label: "GOLD BEES", yahooSymbol: "GOLDBEES.NS" },
  { label: "JUNIOR BEES", yahooSymbol: "JUNIORBEES.NS" },
  { label: "IT BEES", yahooSymbol: "ITBEES.NS" },
] as const;

export const BENCHMARK_SYMBOLS = {
  nifty50: "^NSEI",
  sensex: "^BSESN",
} as const;
