"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface TickerIndex {
  name: string;
  kind?: string;
  value: number;
  change: number;
  up: boolean;
}

interface MarketData {
  indices: TickerIndex[];
  benchmarks: {
    nifty50: { yearReturn: number | null; price?: number };
    sensex: { yearReturn: number | null; price?: number };
  };
  updatedAt: string;
}

export function MarketTicker() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarketData() {
      try {
        const res = await fetch("/api/market");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMarketData();
    const interval = setInterval(loadMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const indices = data?.indices ?? [];
  const niftyYear = data?.benchmarks.nifty50.yearReturn;
  const sensexYear = data?.benchmarks.sensex.yearReturn;
  const niftyPrice = data?.benchmarks.nifty50.price;
  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="border-b border-market-border bg-market-bg overflow-hidden">
      {loading && indices.length === 0 ? (
        <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-market-muted">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading live market data…
        </div>
      ) : indices.length === 0 ? (
        <div className="px-4 py-2 text-xs text-market-muted">Market data unavailable</div>
      ) : (
        <div className="flex animate-ticker whitespace-nowrap">
          {[...indices, ...indices].map((idx, i) => (
            <div
              key={`${idx.name}-${i}`}
              className="inline-flex items-center gap-2 px-6 py-2 text-xs border-r border-market-border"
            >
              <span className="font-semibold text-market-text">{idx.name}</span>
              {idx.kind && (
                <span className="rounded bg-market-card px-1.5 py-0.5 text-[9px] font-bold uppercase text-market-muted">
                  {idx.kind}
                </span>
              )}
              <span className="font-mono text-market-text">
                {idx.name === "GOLD BEES"
                  ? `₹${idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                  : idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            <span
              className={`inline-flex items-center gap-0.5 font-mono font-medium ${
                idx.up ? "text-market-up" : "text-market-down"
              }`}
            >
                {idx.up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {idx.up ? "+" : ""}
                {idx.change}%
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="hidden sm:flex items-center justify-end gap-4 px-4 py-1.5 bg-market-surface border-t border-market-border text-[10px] text-market-muted">
        {niftyPrice != null && (
          <span className="font-mono text-market-text">
            NIFTY 50: {niftyPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        )}
        {niftyYear != null && (
          <span>
            1Y: {niftyYear >= 0 ? "+" : ""}
            {niftyYear}%
          </span>
        )}
        {sensexYear != null && (
          <span>
            SENSEX 1Y: {sensexYear >= 0 ? "+" : ""}
            {sensexYear}%
          </span>
        )}
        <span className="text-market-muted">|</span>
        <span>{updatedAt ? `Live · ${updatedAt}` : "Yahoo Finance"}</span>
      </div>
    </div>
  );
}
