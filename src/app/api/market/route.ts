import { NextResponse } from "next/server";
import {
  BENCHMARK_SYMBOLS,
  fetchQuotes,
  fetchYearReturn,
  INDIAN_INDICES,
  POPULAR_ETFS,
  TICKER_INDICES,
} from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const yahooSymbols = [
      ...TICKER_INDICES.map((i) => i.yahooSymbol),
      ...INDIAN_INDICES.map((i) => i.yahooSymbol),
      ...POPULAR_ETFS.map((i) => i.yahooSymbol),
      BENCHMARK_SYMBOLS.nifty50,
      BENCHMARK_SYMBOLS.sensex,
    ];

    const quotes = await fetchQuotes([...new Set(yahooSymbols)]);
    const quoteByYahoo = new Map(quotes.map((q) => [q.yahooSymbol, q]));

    const indices = TICKER_INDICES.map((idx) => {
      const quote = quoteByYahoo.get(idx.yahooSymbol);
      return {
        name: idx.label,
        kind: idx.kind,
        value: quote?.price ?? 0,
        change: quote?.changePercent ?? 0,
        up: (quote?.changePercent ?? 0) >= 0,
      };
    });

    const allIndices = INDIAN_INDICES.map((idx) => {
      const quote = quoteByYahoo.get(idx.yahooSymbol);
      return {
        name: idx.label,
        yahooSymbol: idx.yahooSymbol,
        kind: "INDEX" as const,
        value: quote?.price ?? 0,
        change: quote?.changePercent ?? 0,
        up: (quote?.changePercent ?? 0) >= 0,
      };
    });

    const etfs = POPULAR_ETFS.map((etf) => {
      const quote = quoteByYahoo.get(etf.yahooSymbol);
      return {
        name: etf.label,
        yahooSymbol: etf.yahooSymbol,
        kind: "ETF" as const,
        value: quote?.price ?? 0,
        change: quote?.changePercent ?? 0,
        up: (quote?.changePercent ?? 0) >= 0,
      };
    });

    const [niftyYearReturn, sensexYearReturn] = await Promise.all([
      fetchYearReturn(BENCHMARK_SYMBOLS.nifty50),
      fetchYearReturn(BENCHMARK_SYMBOLS.sensex),
    ]);

    return NextResponse.json({
      indices,
      allIndices,
      etfs,
      benchmarks: {
        nifty50: { yearReturn: niftyYearReturn, price: quoteByYahoo.get("^NSEI")?.price },
        sensex: { yearReturn: sensexYearReturn, price: quoteByYahoo.get("^BSESN")?.price },
      },
      updatedAt: new Date().toISOString(),
      source: "yahoo-finance",
    });
  } catch (err) {
    console.error("Market data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 502 });
  }
}
