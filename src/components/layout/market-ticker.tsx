"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { BENCHMARKS } from "@/lib/market-data";

const indices = [
  { name: "NIFTY 50", value: 24187.35, change: 0.42, up: true },
  { name: "SENSEX", value: 79626.58, change: 0.38, up: true },
  { name: "NIFTY BANK", value: 51234.2, change: -0.15, up: false },
  { name: "NIFTY IT", value: 38456.7, change: 0.67, up: true },
  { name: "GOLD", value: 72450, change: 0.22, up: true },
];

export function MarketTicker() {
  return (
    <div className="border-b border-market-border bg-market-bg overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...indices, ...indices].map((idx, i) => (
          <div
            key={`${idx.name}-${i}`}
            className="inline-flex items-center gap-2 px-6 py-2 text-xs border-r border-market-border"
          >
            <span className="font-semibold text-market-text">{idx.name}</span>
            <span className="font-mono text-market-text">
              {idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
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
      <div className="hidden sm:flex items-center justify-end gap-4 px-4 py-1.5 bg-market-surface border-t border-market-border text-[10px] text-market-muted">
        <span>NIFTY 50 1Y: +{BENCHMARKS.nifty50.yearReturn}%</span>
        <span>SENSEX 1Y: +{BENCHMARKS.sensex.yearReturn}%</span>
        <span className="text-market-muted">|</span>
        <span>Market Open</span>
      </div>
    </div>
  );
}
