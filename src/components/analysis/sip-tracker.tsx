"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { SIPEntry, SIPResult } from "@/lib/sip-utils";
import { computeSIPResult } from "@/lib/sip-utils";
import type { EnrichedHolding } from "@/lib/analysis";
import {
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Info,
} from "lucide-react";

interface SIPTrackerProps {
  holdings: EnrichedHolding[];
}

let _idCounter = 0;
function genId() {
  return `sip-${Date.now()}-${++_idCounter}`;
}

export function SIPTracker({ holdings }: SIPTrackerProps) {
  const [entries, setEntries] = useState<SIPEntry[]>([
    { id: genId(), symbol: holdings[0]?.symbol ?? "", date: "", amount: 0 },
  ]);
  const [result, setResult] = useState<SIPResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addEntry = useCallback(() => {
    const last = entries[entries.length - 1];
    setEntries((prev) => [
      ...prev,
      { id: genId(), symbol: last?.symbol ?? "", date: "", amount: 0 },
    ]);
  }, [entries]);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback(
    <K extends keyof SIPEntry>(id: string, field: K, value: SIPEntry[K]) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      );
    },
    []
  );

  const calculate = () => {
    setError(null);
    setResult(null);

    // Validate all entries use the same symbol
    const symbols = [...new Set(entries.map((e) => e.symbol.toUpperCase().trim()))];
    if (symbols.length > 1) {
      setError("All entries must be for the same stock symbol. Add a separate tracker per stock.");
      return;
    }

    const sym = symbols[0];
    const holding = holdings.find(
      (h) => h.symbol.toUpperCase() === sym
    );
    if (!holding) {
      setError(`${sym} is not found in your current portfolio. Ensure the symbol matches exactly.`);
      return;
    }

    const valid = entries.filter((e) => e.date && e.amount > 0);
    if (valid.length === 0) {
      setError("Please add at least one SIP entry with a date and amount.");
      return;
    }

    const res = computeSIPResult(valid, holding.currentPrice, holding.avgPrice);
    if (!res) {
      setError("Could not compute XIRR. Please check your entries.");
      return;
    }
    setResult(res);
  };

  const xirrColor =
    result && result.xirr !== null && result.xirr >= 0 ? "text-market-up" : "text-market-down";
  const alphaColor =
    result && result.outperforming ? "text-market-up" : "text-market-down";

  return (
    <Card className="border border-market-border bg-market-card animate-fade-in-up">
      <CardHeader className="border-b border-market-border px-5 py-4">
        <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <Calculator className="h-4 w-4 text-market-accent" />
          SIP Tracker &amp; XIRR Calculator
        </CardTitle>
        <p className="text-[11px] text-market-muted normal-case mt-0.5 font-normal">
          Log your SIP installments to calculate the true annualised return (XIRR) vs NIFTY 50.
        </p>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Entry Table */}
        <div className="overflow-x-auto rounded-lg border border-market-border/50">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-market-border bg-market-surface text-left text-[10px] uppercase tracking-wider text-market-muted">
                <th className="px-3 py-2 font-medium">Stock Symbol</th>
                <th className="px-3 py-2 font-medium">Date of Investment</th>
                <th className="px-3 py-2 font-medium">Amount Invested (₹)</th>
                <th className="px-3 py-2 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-market-border/30 hover:bg-market-surface/30 transition-colors"
                >
                  <td className="px-3 py-2">
                    <select
                      value={entry.symbol}
                      onChange={(e) => updateEntry(entry.id, "symbol", e.target.value)}
                      className="w-full rounded bg-market-surface border border-market-border/50 px-2 py-1 text-xs text-market-text focus:outline-none focus:border-market-accent/50"
                    >
                      <option value="">Select stock</option>
                      {Array.from(new Set(holdings.map(h => h.symbol))).map((sym) => (
                        <option key={sym} value={sym}>
                          {sym}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={entry.date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                      className="w-full rounded bg-market-surface border border-market-border/50 px-2 py-1 text-xs text-market-text focus:outline-none focus:border-market-accent/50"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 5000"
                      value={entry.amount || ""}
                      onChange={(e) =>
                        updateEntry(entry.id, "amount", parseFloat(e.target.value) || 0)
                      }
                      className="w-full rounded bg-market-surface border border-market-border/50 px-2 py-1 text-xs text-market-text focus:outline-none focus:border-market-accent/50"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    {entries.length > 1 && (
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="text-market-muted hover:text-market-down transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addEntry}
            className="flex items-center gap-1.5 text-[11px] text-market-accent hover:text-market-accent/80 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add SIP Entry
          </button>
          <button
            onClick={calculate}
            className="ml-auto flex items-center gap-1.5 rounded bg-market-accent/10 border border-market-accent/30 px-4 py-1.5 text-xs font-semibold text-market-accent hover:bg-market-accent/20 transition-all duration-200"
          >
            <Calculator className="h-3.5 w-3.5" />
            Calculate XIRR
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-400">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Summary header */}
            <div className="rounded-lg border border-market-border/60 bg-market-surface/30 p-4">
              <p className="text-[10px] uppercase tracking-widest text-market-muted mb-3">
                XIRR Results for {result.symbol} · {result.entryCount} SIP{result.entryCount > 1 ? "s" : ""} · {result.firstDate} → today
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] text-market-muted">Total Invested</p>
                  <p className="font-mono-nums text-base font-bold text-market-text mt-0.5">
                    {formatCurrency(result.totalInvested)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-market-muted">Current Value</p>
                  <p className="font-mono-nums text-base font-bold text-market-text mt-0.5">
                    {formatCurrency(result.currentValue)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-market-muted">Absolute P&L</p>
                  <p className={`font-mono-nums text-base font-bold mt-0.5 ${result.absoluteReturn >= 0 ? "text-market-up" : "text-market-down"}`}>
                    {formatCurrency(result.absoluteReturn)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-market-muted">Entries</p>
                  <p className="font-mono-nums text-base font-bold text-market-text mt-0.5">
                    {result.entryCount}
                  </p>
                </div>
              </div>
            </div>

            {/* XIRR vs Benchmark */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Your XIRR */}
              <div className="rounded-lg border border-market-border/60 bg-market-card/50 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-market-muted mb-1">
                  {result.isShortTerm ? "Absolute Return" : "Your XIRR"}
                </p>
                {result.xirr !== null ? (
                  <p className={`font-mono-nums text-3xl font-bold ${xirrColor}`}>
                    {result.xirr >= 0 ? "+" : ""}{result.xirr}%
                  </p>
                ) : (
                  <p className="font-mono-nums text-xl font-bold text-market-muted">N/A</p>
                )}
                <p className="text-[10px] text-market-muted mt-1">
                  {result.isShortTerm ? "Holding period <90d" : "Annualised return"}
                </p>
              </div>

              {/* NIFTY 50 */}
              <div className="rounded-lg border border-market-border/60 bg-market-card/50 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-market-muted mb-1">NIFTY 50 XIRR</p>
                <p className="font-mono-nums text-3xl font-bold text-market-muted">
                  {result.isShortTerm ? "N/A" : `${result.niftyXirr}%`}
                </p>
                <p className="text-[10px] text-market-muted mt-1">
                  {result.isShortTerm ? "Short-term not compared" : "Benchmark (estimated)"}
                </p>
              </div>

              {/* Alpha */}
              <div className={`rounded-lg border p-4 text-center ${
                result.isShortTerm
                  ? "border-market-border/60 bg-market-card/50"
                  : result.outperforming
                  ? "border-emerald-900/40 bg-emerald-950/10"
                  : "border-red-900/40 bg-red-950/10"
              }`}>
                <p className="text-[10px] uppercase tracking-widest text-market-muted mb-1">Alpha vs NIFTY</p>
                <div className="flex items-center justify-center gap-1.5">
                  {result.isShortTerm ? (
                    <p className="font-mono-nums text-3xl font-bold text-market-muted">N/A</p>
                  ) : (
                    <>
                      {result.outperforming ? (
                        <TrendingUp className="h-5 w-5 text-market-up" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-market-down" />
                      )}
                      <p className={`font-mono-nums text-3xl font-bold ${alphaColor}`}>
                        {result.alpha !== null ? `${result.alpha >= 0 ? "+" : ""}${result.alpha}%` : "N/A"}
                      </p>
                    </>
                  )}
                </div>
                <p className={`text-[10px] mt-1 font-semibold ${result.isShortTerm ? "text-market-muted" : alphaColor}`}>
                  {result.isShortTerm
                    ? "Comparison disabled"
                    : result.outperforming
                    ? "Outperforming benchmark"
                    : "Underperforming benchmark"}
                </p>
              </div>
            </div>

            {result.warning && (
              <div className="flex items-start gap-2 rounded border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-400">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                {result.warning}
              </div>
            )}

            {/* Explanation note */}
            <p className="text-[10px] text-market-muted/70 leading-relaxed">
              * XIRR accounts for the timing of each installment. Current value is estimated as
              (SIP amount ÷ avg cost) × current price — excluding shares bought outside your SIP entries.
              NIFTY 50 benchmark uses quarterly historical SIP XIRR data (2015–2025).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
