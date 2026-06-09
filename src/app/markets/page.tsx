"use client";

import { useState } from "react";
import { StockSearch, type SearchHit } from "@/components/markets/stock-search";
import { StockDetail } from "@/components/markets/stock-detail";
import { MarketOverview } from "@/components/markets/market-overview";

export default function MarketsPage() {
  const [selection, setSelection] = useState<SearchHit | null>(null);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Markets</h1>
        <p className="mt-1 text-text-secondary">
          Live NSE/BSE prices, indices, ETFs, technical indicators, and Indian market news.
          Data sourced from Yahoo Finance, refreshed every 5 minutes.
        </p>
      </div>

      <StockSearch onSelect={setSelection} />

      <div className="mt-3 flex flex-wrap gap-2">
        {["RELIANCE", "TCS", "HDFCBANK", "^NSEI", "^BSESN"].map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => handleQuickSelect(sym)}
            className="rounded-full border border-market-border bg-market-surface px-3 py-1 text-xs text-market-muted hover:border-market-up hover:text-market-up"
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
