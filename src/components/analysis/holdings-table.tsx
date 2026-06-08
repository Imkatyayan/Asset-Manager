"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { EnrichedHolding } from "@/lib/analysis";

interface HoldingsTableProps {
  holdings: EnrichedHolding[];
  showFundamentals?: boolean;
}

export function HoldingsTable({ holdings, showFundamentals }: HoldingsTableProps) {
  const sorted = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  return (
    <Card>
      <CardHeader className="border-b border-market-border">
        <CardTitle>Holdings · {holdings.length} stocks</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-market-border bg-market-surface text-left text-[10px] uppercase tracking-wider text-market-muted">
              <th className="px-4 py-3 font-medium">Instrument</th>
              <th className="px-4 py-3 font-medium text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Avg.</th>
              <th className="px-4 py-3 font-medium text-right">LTP</th>
              <th className="px-4 py-3 font-medium text-right">Cur. val</th>
              <th className="px-4 py-3 font-medium text-right">P&L %</th>
              <th className="px-4 py-3 font-medium text-right">Wt%</th>
              {showFundamentals && (
                <>
                  <th className="px-4 py-3 font-medium text-right">P/E</th>
                  <th className="px-4 py-3 font-medium text-right">Signal</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => (
              <tr
                key={h.symbol}
                className="border-b border-market-border/50 hover:bg-market-surface/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-market-surface text-[10px] font-bold text-market-accent">
                      {h.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-market-text">{h.symbol}</p>
                      <p className="text-[10px] text-market-muted">{h.sector}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono-nums text-market-muted">
                  {formatNumber(h.quantity)}
                </td>
                <td className="px-4 py-3 text-right font-mono-nums text-market-muted">
                  {formatCurrency(h.avgPrice)}
                </td>
                <td className="px-4 py-3 text-right font-mono-nums text-market-text">
                  {formatCurrency(h.currentPrice)}
                </td>
                <td className="px-4 py-3 text-right font-mono-nums font-medium text-market-text">
                  {formatCurrency(h.currentValue)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono-nums font-semibold ${
                    h.returns >= 0 ? "text-market-up" : "text-market-down"
                  }`}
                >
                  {formatPercent(h.returnsPercent)}
                </td>
                <td className="px-4 py-3 text-right font-mono-nums text-market-muted">
                  {h.weight.toFixed(1)}
                </td>
                {showFundamentals && (
                  <>
                    <td className="px-4 py-3 text-right font-mono-nums text-market-muted">
                      {h.fundamentals?.pe?.toFixed(1) || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {h.fundamentals ? (
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            h.fundamentals.trend === "bullish"
                              ? "bg-emerald-900/40 text-market-up"
                              : h.fundamentals.trend === "bearish"
                              ? "bg-red-900/40 text-market-down"
                              : "bg-amber-900/40 text-market-warning"
                          }`}
                        >
                          {h.fundamentals.trend}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
