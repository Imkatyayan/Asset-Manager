"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StockSearch, type SearchHit } from "@/components/markets/stock-search";
import { StockDetail } from "@/components/markets/stock-detail";
import { MarketOverview } from "@/components/markets/market-overview";
import { toYahooSymbol } from "@/lib/yahoo-finance";

function MarketsContent() {
  const searchParams = useSearchParams();
  const [selection, setSelection] = useState<SearchHit | null>(null);

  useEffect(() => {
    const symbol = searchParams.get("symbol");
    if (symbol) {
      const clean = symbol.trim().toUpperCase();
      const map: Record<string, SearchHit> = {
        "^NSEI": { symbol: "NSEI", yahooSymbol: "^NSEI", name: "NIFTY 50", type: "INDEX", exchange: "NSE" },
        "^BSESN": { symbol: "BSESN", yahooSymbol: "^BSESN", name: "SENSEX", type: "INDEX", exchange: "BSE" },
        RELIANCE: { symbol: "RELIANCE", yahooSymbol: "RELIANCE.NS", name: "Reliance Industries", type: "EQUITY", exchange: "NSE" },
        TCS: { symbol: "TCS", yahooSymbol: "TCS.NS", name: "Tata Consultancy Services", type: "EQUITY", exchange: "NSE" },
        HDFCBANK: { symbol: "HDFCBANK", yahooSymbol: "HDFCBANK.NS", name: "HDFC Bank", type: "EQUITY", exchange: "NSE" },
      };
      const found = map[clean];
      if (found) {
        setSelection(found);
      } else {
        setSelection({
          symbol: clean,
          yahooSymbol: toYahooSymbol(clean),
          name: clean,
          type: "EQUITY",
          exchange: clean.endsWith(".BO") ? "BSE" : "NSE",
        });
      }
    }
  }, [searchParams]);

  function handleQuickSelect(label: string) {
    const map: Record<string, SearchHit> = {
      "^NSEI": { symbol: "NSEI", yahooSymbol: "^NSEI", name: "NIFTY 50", type: "INDEX", exchange: "NSE" },
      "^BSESN": { symbol: "BSESN", yahooSymbol: "^BSESN", name: "SENSEX", type: "INDEX", exchange: "BSE" },
      RELIANCE: { symbol: "RELIANCE", yahooSymbol: "RELIANCE.NS", name: "Reliance Industries", type: "EQUITY", exchange: "NSE" },
      TCS: { symbol: "TCS", yahooSymbol: "TCS.NS", name: "Tata Consultancy Services", type: "EQUITY", exchange: "NSE" },
      HDFCBANK: { symbol: "HDFCBANK", yahooSymbol: "HDFCBANK.NS", name: "HDFC Bank", type: "EQUITY", exchange: "NSE" },
    };
    const hit = map[label] ?? map[label.toUpperCase()];
    if (hit) setSelection(hit);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold">Markets</h1>
        <p className="text-text-secondary text-sm">
          Live NSE/BSE prices, indices, ETFs, technical indicators, and Indian market news.
          Data sourced from Yahoo Finance, refreshed every 5 minutes.
        </p>
      </div>

      {/* Stock Search Bar with 1-click star buttons */}
      <StockSearch onSelect={setSelection} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-market-muted uppercase font-semibold">Popular:</span>
        {["RELIANCE", "TCS", "HDFCBANK", "^NSEI", "^BSESN"].map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => handleQuickSelect(sym)}
            className="rounded-full border border-market-border bg-market-surface px-3 py-1 text-xs text-market-muted hover:border-market-up hover:text-market-up transition-colors"
          >
            {sym.replace("^", "")}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <StockDetail selection={selection} />
      </div>

      <div className="mt-10">
        <MarketOverview onSelect={setSelection} />
      </div>
    </div>
  );
}

export default function MarketsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 text-sm text-market-muted">Loading markets...</div>}>
      <MarketsContent />
    </Suspense>
  );
}
