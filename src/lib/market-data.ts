export interface StockFundamentals {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  pe: number;
  pb: number;
  roe: number;
  debtToEquity: number;
  revenueGrowth: number;
  profitGrowth: number;
  dividendYield: number;
  marketCap: number;
  momentumScore: number; // 0-100
  trend: "bullish" | "neutral" | "bearish";
  yearReturn: number;
  beta: number;
  capSize: "large" | "mid" | "small";
}

export const BENCHMARKS = {
  nifty50: {
    name: "NIFTY 50",
    yearReturn: 12.4,
    threeYearCagr: 14.2,
    fiveYearCagr: 13.8,
    volatility: 15.2,
    sharpeRatio: 0.82,
  },
  sensex: {
    name: "SENSEX",
    yearReturn: 11.9,
    threeYearCagr: 13.6,
    fiveYearCagr: 13.2,
    volatility: 14.8,
    sharpeRatio: 0.79,
  },
};

export const STOCK_DATABASE: Record<string, StockFundamentals> = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy",
    currentPrice: 2850,
    pe: 28.5,
    pb: 2.1,
    roe: 9.8,
    debtToEquity: 0.35,
    revenueGrowth: 8.2,
    profitGrowth: 12.5,
    dividendYield: 0.35,
    marketCap: 1920000,
    momentumScore: 72,
    trend: "bullish",
    yearReturn: 18.4,
    beta: 1.05,
    capSize: "large",
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "IT",
    currentPrice: 4120,
    pe: 32.1,
    pb: 12.5,
    roe: 48.2,
    debtToEquity: 0.05,
    revenueGrowth: 7.5,
    profitGrowth: 9.2,
    dividendYield: 1.4,
    marketCap: 1480000,
    momentumScore: 65,
    trend: "neutral",
    yearReturn: 8.2,
    beta: 0.82,
    capSize: "large",
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    sector: "Banking",
    currentPrice: 1720,
    pe: 19.8,
    pb: 2.8,
    roe: 16.5,
    debtToEquity: 0,
    revenueGrowth: 15.2,
    profitGrowth: 18.1,
    dividendYield: 1.1,
    marketCap: 1320000,
    momentumScore: 78,
    trend: "bullish",
    yearReturn: 22.1,
    beta: 0.98,
    capSize: "large",
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys",
    sector: "IT",
    currentPrice: 1890,
    pe: 28.4,
    pb: 8.2,
    roe: 31.5,
    debtToEquity: 0.02,
    revenueGrowth: 5.8,
    profitGrowth: 6.5,
    dividendYield: 2.1,
    marketCap: 785000,
    momentumScore: 58,
    trend: "neutral",
    yearReturn: 5.4,
    beta: 0.88,
    capSize: "large",
  },
  ICICIBANK: {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    sector: "Banking",
    currentPrice: 1285,
    pe: 18.2,
    pb: 3.1,
    roe: 17.8,
    debtToEquity: 0,
    revenueGrowth: 18.5,
    profitGrowth: 22.3,
    dividendYield: 0.8,
    marketCap: 910000,
    momentumScore: 82,
    trend: "bullish",
    yearReturn: 28.5,
    beta: 1.02,
    capSize: "large",
  },
  BHARTIARTL: {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel",
    sector: "Telecom",
    currentPrice: 1580,
    pe: 42.5,
    pb: 8.5,
    roe: 12.2,
    debtToEquity: 1.85,
    revenueGrowth: 12.8,
    profitGrowth: 45.2,
    dividendYield: 0.5,
    marketCap: 895000,
    momentumScore: 85,
    trend: "bullish",
    yearReturn: 35.2,
    beta: 0.78,
    capSize: "large",
  },
  ITC: {
    symbol: "ITC",
    name: "ITC Limited",
    sector: "FMCG",
    currentPrice: 465,
    pe: 28.8,
    pb: 7.2,
    roe: 28.5,
    debtToEquity: 0.01,
    revenueGrowth: 6.2,
    profitGrowth: 8.5,
    dividendYield: 3.2,
    marketCap: 580000,
    momentumScore: 55,
    trend: "neutral",
    yearReturn: 12.8,
    beta: 0.62,
    capSize: "large",
  },
  SBIN: {
    symbol: "SBIN",
    name: "State Bank of India",
    sector: "Banking",
    currentPrice: 820,
    pe: 10.5,
    pb: 1.45,
    roe: 16.2,
    debtToEquity: 0,
    revenueGrowth: 12.5,
    profitGrowth: 28.5,
    dividendYield: 1.8,
    marketCap: 735000,
    momentumScore: 75,
    trend: "bullish",
    yearReturn: 42.5,
    beta: 1.15,
    capSize: "large",
  },
  HINDUNILVR: {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever",
    sector: "FMCG",
    currentPrice: 2380,
    pe: 58.2,
    pb: 12.8,
    roe: 22.5,
    debtToEquity: 0.02,
    revenueGrowth: 3.5,
    profitGrowth: 5.2,
    dividendYield: 1.6,
    marketCap: 560000,
    momentumScore: 42,
    trend: "bearish",
    yearReturn: -2.5,
    beta: 0.58,
    capSize: "large",
  },
  KOTAKBANK: {
    symbol: "KOTAKBANK",
    name: "Kotak Mahindra Bank",
    sector: "Banking",
    currentPrice: 1785,
    pe: 22.5,
    pb: 2.5,
    roe: 14.2,
    debtToEquity: 0,
    revenueGrowth: 10.2,
    profitGrowth: 12.8,
    dividendYield: 0.15,
    marketCap: 355000,
    momentumScore: 62,
    trend: "neutral",
    yearReturn: 15.2,
    beta: 0.85,
    capSize: "large",
  },
  LT: {
    symbol: "LT",
    name: "Larsen & Toubro",
    sector: "Infrastructure",
    currentPrice: 3580,
    pe: 35.2,
    pb: 5.8,
    roe: 15.8,
    debtToEquity: 0.65,
    revenueGrowth: 18.5,
    profitGrowth: 22.1,
    dividendYield: 0.85,
    marketCap: 495000,
    momentumScore: 80,
    trend: "bullish",
    yearReturn: 38.5,
    beta: 1.12,
    capSize: "large",
  },
  AXISBANK: {
    symbol: "AXISBANK",
    name: "Axis Bank",
    sector: "Banking",
    currentPrice: 1125,
    pe: 13.8,
    pb: 1.85,
    roe: 15.5,
    debtToEquity: 0,
    revenueGrowth: 14.2,
    profitGrowth: 18.5,
    dividendYield: 0.1,
    marketCap: 348000,
    momentumScore: 70,
    trend: "bullish",
    yearReturn: 25.8,
    beta: 1.22,
    capSize: "large",
  },
  WIPRO: {
    symbol: "WIPRO",
    name: "Wipro",
    sector: "IT",
    currentPrice: 285,
    pe: 22.5,
    pb: 3.2,
    roe: 16.8,
    debtToEquity: 0.08,
    revenueGrowth: 2.5,
    profitGrowth: 4.2,
    dividendYield: 2.8,
    marketCap: 152000,
    momentumScore: 38,
    trend: "bearish",
    yearReturn: -8.5,
    beta: 0.92,
    capSize: "large",
  },
  MARUTI: {
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    sector: "Auto",
    currentPrice: 12450,
    pe: 28.5,
    pb: 4.8,
    roe: 16.2,
    debtToEquity: 0.02,
    revenueGrowth: 12.5,
    profitGrowth: 15.8,
    dividendYield: 0.9,
    marketCap: 392000,
    momentumScore: 68,
    trend: "bullish",
    yearReturn: 18.2,
    beta: 0.95,
    capSize: "large",
  },
  SUNPHARMA: {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical",
    sector: "Pharma",
    currentPrice: 1820,
    pe: 38.5,
    pb: 5.2,
    roe: 14.5,
    debtToEquity: 0.12,
    revenueGrowth: 10.5,
    profitGrowth: 15.2,
    dividendYield: 0.7,
    marketCap: 438000,
    momentumScore: 72,
    trend: "bullish",
    yearReturn: 22.5,
    beta: 0.72,
    capSize: "large",
  },
  TATAMOTORS: {
    symbol: "TATAMOTORS",
    name: "Tata Motors",
    sector: "Auto",
    currentPrice: 980,
    pe: 18.5,
    pb: 4.2,
    roe: 22.8,
    debtToEquity: 1.1,
    revenueGrowth: 26.5,
    profitGrowth: 48.2,
    dividendYield: 0.6,
    marketCap: 380000,
    momentumScore: 88,
    trend: "bullish",
    yearReturn: 65.2,
    beta: 1.42,
    capSize: "large",
  },
  TATASTEEL: {
    symbol: "TATASTEEL",
    name: "Tata Steel",
    sector: "Materials",
    currentPrice: 165,
    pe: 24.2,
    pb: 1.8,
    roe: 7.2,
    debtToEquity: 0.95,
    revenueGrowth: -3.5,
    profitGrowth: -12.4,
    dividendYield: 2.1,
    marketCap: 185000,
    momentumScore: 68,
    trend: "neutral",
    yearReturn: 14.5,
    beta: 1.28,
    capSize: "large",
  },
  ZOMATO: {
    symbol: "ZOMATO",
    name: "Zomato Limited",
    sector: "IT",
    currentPrice: 180,
    pe: 125.4,
    pb: 6.8,
    roe: 3.5,
    debtToEquity: 0,
    revenueGrowth: 38.5,
    profitGrowth: 110.2,
    dividendYield: 0,
    marketCap: 165000,
    momentumScore: 92,
    trend: "bullish",
    yearReturn: 98.4,
    beta: 1.58,
    capSize: "large",
  },
  SUZLON: {
    symbol: "SUZLON",
    name: "Suzlon Energy",
    sector: "Energy",
    currentPrice: 52,
    pe: 65.4,
    pb: 8.5,
    roe: 18.2,
    debtToEquity: 0.1,
    revenueGrowth: 15.2,
    profitGrowth: 35.8,
    dividendYield: 0,
    marketCap: 72000,
    momentumScore: 95,
    trend: "bullish",
    yearReturn: 185.0,
    beta: 1.88,
    capSize: "mid",
  },
  JIOFIN: {
    symbol: "JIOFIN",
    name: "Jio Financial Services",
    sector: "Banking",
    currentPrice: 355,
    pe: 85.0,
    pb: 2.5,
    roe: 2.8,
    debtToEquity: 0.02,
    revenueGrowth: 8.2,
    profitGrowth: 10.5,
    dividendYield: 0,
    marketCap: 225000,
    momentumScore: 70,
    trend: "bullish",
    yearReturn: 28.4,
    beta: 1.12,
    capSize: "large",
  },
  RVNL: {
    symbol: "RVNL",
    name: "Rail Vikas Nigam",
    sector: "Infrastructure",
    currentPrice: 380,
    pe: 35.8,
    pb: 6.2,
    roe: 20.5,
    debtToEquity: 0.85,
    revenueGrowth: 12.8,
    profitGrowth: 18.2,
    dividendYield: 1.2,
    marketCap: 84000,
    momentumScore: 90,
    trend: "bullish",
    yearReturn: 145.0,
    beta: 1.72,
    capSize: "mid",
  },
  IREDA: {
    symbol: "IREDA",
    name: "Indian Renewable Energy Development Agency",
    sector: "Banking",
    currentPrice: 195,
    pe: 42.5,
    pb: 5.2,
    roe: 16.8,
    debtToEquity: 4.5,
    revenueGrowth: 22.1,
    profitGrowth: 28.5,
    dividendYield: 0.5,
    marketCap: 65000,
    momentumScore: 88,
    trend: "bullish",
    yearReturn: 120.0,
    beta: 1.65,
    capSize: "mid",
  },
  BSE: {
    symbol: "BSE",
    name: "BSE Limited",
    sector: "Banking",
    currentPrice: 2450,
    pe: 45.2,
    pb: 8.2,
    roe: 18.5,
    debtToEquity: 0,
    revenueGrowth: 28.2,
    profitGrowth: 42.5,
    dividendYield: 1.0,
    marketCap: 45000,
    momentumScore: 91,
    trend: "bullish",
    yearReturn: 168.0,
    beta: 1.32,
    capSize: "mid",
  },
  YESBANK: {
    symbol: "YESBANK",
    name: "Yes Bank",
    sector: "Banking",
    currentPrice: 24,
    pe: 62.4,
    pb: 1.2,
    roe: 2.1,
    debtToEquity: 0,
    revenueGrowth: 8.5,
    profitGrowth: 12.8,
    dividendYield: 0,
    marketCap: 78000,
    momentumScore: 52,
    trend: "neutral",
    yearReturn: 18.5,
    beta: 1.48,
    capSize: "mid",
  },
  KPITTECH: {
    symbol: "KPITTECH",
    name: "KPIT Technologies",
    sector: "IT",
    currentPrice: 1450,
    pe: 58.2,
    pb: 14.2,
    roe: 28.5,
    debtToEquity: 0.12,
    revenueGrowth: 30.5,
    profitGrowth: 38.2,
    dividendYield: 0.4,
    marketCap: 48000,
    momentumScore: 78,
    trend: "bullish",
    yearReturn: 45.2,
    beta: 1.38,
    capSize: "mid",
  },
  NHPC: {
    symbol: "NHPC",
    name: "NHPC Limited",
    sector: "Energy",
    currentPrice: 95,
    pe: 18.2,
    pb: 1.5,
    roe: 9.8,
    debtToEquity: 0.82,
    revenueGrowth: 5.2,
    profitGrowth: 8.4,
    dividendYield: 3.5,
    marketCap: 95000,
    momentumScore: 65,
    trend: "neutral",
    yearReturn: 32.5,
    beta: 1.18,
    capSize: "mid",
  },
  SULA: {
    symbol: "SULA",
    name: "Sula Vineyards",
    sector: "FMCG",
    currentPrice: 520,
    pe: 32.5,
    pb: 4.2,
    roe: 14.8,
    debtToEquity: 0.22,
    revenueGrowth: 10.5,
    profitGrowth: 15.2,
    dividendYield: 1.8,
    marketCap: 4500,
    momentumScore: 58,
    trend: "neutral",
    yearReturn: 12.5,
    beta: 0.92,
    capSize: "small",
  },
  MARKSANS: {
    symbol: "MARKSANS",
    name: "Marksans Pharma",
    sector: "Pharma",
    currentPrice: 165,
    pe: 22.4,
    pb: 3.1,
    roe: 18.2,
    debtToEquity: 0.08,
    revenueGrowth: 18.2,
    profitGrowth: 24.5,
    dividendYield: 0.5,
    marketCap: 7200,
    momentumScore: 72,
    trend: "bullish",
    yearReturn: 38.5,
    beta: 1.15,
    capSize: "small",
  },
  MOREPENLAB: {
    symbol: "MOREPENLAB",
    name: "Morepen Laboratories",
    sector: "Pharma",
    currentPrice: 55,
    pe: 28.5,
    pb: 2.2,
    roe: 10.5,
    debtToEquity: 0.15,
    revenueGrowth: 12.5,
    profitGrowth: 16.8,
    dividendYield: 0.2,
    marketCap: 3200,
    momentumScore: 60,
    trend: "neutral",
    yearReturn: 22.5,
    beta: 1.25,
    capSize: "small",
  },
};

export function getStockData(symbol: string): StockFundamentals | null {
  const normalized = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
  return STOCK_DATABASE[normalized] || null;
}

function deriveMomentum(yearReturn: number): Pick<StockFundamentals, "momentumScore" | "trend"> {
  const momentumScore = Math.min(100, Math.max(0, Math.round(50 + yearReturn * 2)));
  const trend: StockFundamentals["trend"] =
    yearReturn > 10 ? "bullish" : yearReturn < -5 ? "bearish" : "neutral";
  return { momentumScore, trend };
}

function mergeWithLiveQuote(
  staticStock: StockFundamentals,
  livePrice: number,
  yearReturn: number | null
): StockFundamentals {
  const momentum = yearReturn != null ? deriveMomentum(yearReturn) : {};
  return {
    ...staticStock,
    currentPrice: livePrice,
    ...(yearReturn != null ? { yearReturn, ...momentum } : {}),
  };
}

export interface EnrichedHoldingData {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  fundamentals: StockFundamentals | null;
}

/** Sync fallback — prefer static reference price over avgPrice so P&L isn't falsely 0%. */
export function enrichHolding(symbol: string, avgPrice: number): EnrichedHoldingData {
  const normalized = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
  const stock = getStockData(normalized);
  const fallbackPrice = stock?.currentPrice ?? avgPrice;

  if (stock) {
    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      currentPrice: fallbackPrice,
      fundamentals: { ...stock, currentPrice: fallbackPrice },
    };
  }
  return {
    symbol: normalized,
    name: normalized,
    sector: "Unknown",
    currentPrice: fallbackPrice,
    fundamentals: null,
  };
}

/** Fetch live NSE prices from Yahoo Finance, with static fundamentals as fallback. */
export async function enrichHoldingAsync(
  symbol: string,
  avgPrice: number,
  liveQuotes?: Map<string, import("./yahoo-finance").YahooQuote>
): Promise<EnrichedHoldingData> {
  const normalized = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
  const staticStock = getStockData(normalized);

  const { toYahooSymbol, fetchQuotes, fetchYearReturn } = await import("./yahoo-finance");
  const yahooSymbol = toYahooSymbol(normalized);

  let quote = liveQuotes?.get(yahooSymbol);
  if (!quote) {
    try {
      const quotes = await fetchQuotes([yahooSymbol]);
      quote = quotes[0];
    } catch {
      return enrichHolding(symbol, avgPrice);
    }
  }

  if (!quote) return enrichHolding(symbol, avgPrice);

  let yearReturn: number | null = null;
  try {
    yearReturn = await fetchYearReturn(yahooSymbol);
  } catch {
    // keep static year return if chart fetch fails
  }

  if (staticStock) {
    const fundamentals = mergeWithLiveQuote(staticStock, quote.price, yearReturn);
    return {
      symbol: staticStock.symbol,
      name: staticStock.name,
      sector: staticStock.sector,
      currentPrice: quote.price,
      fundamentals,
    };
  }

  const momentum = yearReturn != null ? deriveMomentum(yearReturn) : { momentumScore: 50, trend: "neutral" as const };
  const fundamentals: StockFundamentals = {
    symbol: normalized,
    name: quote.name,
    sector: "Unknown",
    currentPrice: quote.price,
    pe: 0,
    pb: 0,
    roe: 0,
    debtToEquity: 0,
    revenueGrowth: 0,
    profitGrowth: 0,
    dividendYield: 0,
    marketCap: 0,
    yearReturn: yearReturn ?? 0,
    beta: 1.0,
    capSize: "mid",
    ...momentum,
  };

  return {
    symbol: normalized,
    name: quote.name,
    sector: "Unknown",
    currentPrice: quote.price,
    fundamentals,
  };
}

export async function enrichHoldingsBatch(
  holdings: Array<{ symbol: string; avgPrice: number }>
): Promise<EnrichedHoldingData[]> {
  const { toYahooSymbol, fetchQuotes } = await import("./yahoo-finance");

  const yahooSymbols = holdings.map((h) => toYahooSymbol(h.symbol));
  let quoteMap = new Map<string, import("./yahoo-finance").YahooQuote>();

  try {
    const quotes = await fetchQuotes(yahooSymbols);
    quoteMap = new Map(quotes.map((q) => [q.yahooSymbol, q]));
  } catch (err) {
    console.error("Batch quote fetch failed:", err);
  }

  const results = await Promise.all(
    holdings.map(async (h) => {
      const yahooSymbol = toYahooSymbol(h.symbol);
      if (!quoteMap.has(yahooSymbol)) {
        try {
          const single = await fetchQuotes([yahooSymbol]);
          if (single[0]) quoteMap.set(yahooSymbol, single[0]);
        } catch {
          // fall through to enrichHolding fallback
        }
      }
      return enrichHoldingAsync(h.symbol, h.avgPrice, quoteMap);
    })
  );

  return results;
}

export interface LiveBenchmarks {
  nifty50: { name: string; yearReturn: number };
  sensex: { name: string; yearReturn: number };
}

let benchmarkCache: { data: LiveBenchmarks; fetchedAt: number } | null = null;

export async function getLiveBenchmarks(): Promise<LiveBenchmarks> {
  if (benchmarkCache && Date.now() - benchmarkCache.fetchedAt < 15 * 60 * 1000) {
    return benchmarkCache.data;
  }

  const { BENCHMARK_SYMBOLS, fetchYearReturn } = await import("./yahoo-finance");

  try {
    const [niftyReturn, sensexReturn] = await Promise.all([
      fetchYearReturn(BENCHMARK_SYMBOLS.nifty50),
      fetchYearReturn(BENCHMARK_SYMBOLS.sensex),
    ]);

    const data: LiveBenchmarks = {
      nifty50: {
        name: BENCHMARKS.nifty50.name,
        yearReturn: niftyReturn ?? BENCHMARKS.nifty50.yearReturn,
      },
      sensex: {
        name: BENCHMARKS.sensex.name,
        yearReturn: sensexReturn ?? BENCHMARKS.sensex.yearReturn,
      },
    };

    benchmarkCache = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    return {
      nifty50: { name: BENCHMARKS.nifty50.name, yearReturn: BENCHMARKS.nifty50.yearReturn },
      sensex: { name: BENCHMARKS.sensex.name, yearReturn: BENCHMARKS.sensex.yearReturn },
    };
  }
}
