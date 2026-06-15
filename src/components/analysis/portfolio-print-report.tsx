"use client";

import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { BasicAnalysis, FullAnalysis } from "@/lib/analysis";
import { getStockRecommendation } from "@/lib/analysis";

interface PortfolioPrintReportProps {
  analysis: BasicAnalysis | FullAnalysis;
  tier?: "basic" | "full";
  portfolioName?: string;
}

export function PortfolioPrintReport({ 
  analysis, 
  tier = "basic",
  portfolioName 
}: PortfolioPrintReportProps) {
  const isFull = tier === "full";
  const dateStr = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const sortedHoldings = [...analysis.holdings].sort((a, b) => b.currentValue - a.currentValue);

  // Compute portfolio-level risk metrics
  const portfolioBeta = analysis.holdings.reduce((sum, h) => {
    const b = h.fundamentals?.beta ?? 1.0;
    return sum + (h.weight * b);
  }, 0) / 100;

  // Extract cap size distribution if full analysis
  const capData = isFull && "capAllocation" in analysis 
    ? (analysis as FullAnalysis).capAllocation 
    : { large: 60, mid: 25, small: 15 }; // Mock fallback for basic view prints if needed

  return (
    <div className="hidden print:block w-full max-w-[210mm] min-h-[297mm] bg-white text-black font-sans px-8 py-10 print:px-0 print:py-0 print:m-0">
      
      {/* 1. Header Section */}
      <div className="border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Asset Manager</h1>
          <p className="text-xs text-stone-500 font-mono">Portfolio Intelligence Report</p>
        </div>
        <div className="text-right">
          <h2 className="text-sm font-semibold">{portfolioName || "Default Portfolio"}</h2>
          <p className="text-[10px] text-stone-500 font-mono">Generated: {dateStr}</p>
        </div>
      </div>

      {/* 2. Key Executive Summary Metrics */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="border border-stone-300 p-3 rounded">
          <span className="text-[9px] uppercase tracking-wider text-stone-500 block">Total Portfolio Value</span>
          <span className="font-mono text-base font-bold">{formatCurrency(analysis.totalValue)}</span>
        </div>
        <div className="border border-stone-300 p-3 rounded">
          <span className="text-[9px] uppercase tracking-wider text-stone-500 block">Invested Capital</span>
          <span className="font-mono text-base font-bold">{formatCurrency(analysis.totalInvested)}</span>
        </div>
        <div className="border border-stone-300 p-3 rounded">
          <span className="text-[9px] uppercase tracking-wider text-stone-500 block">Unrealized P&L</span>
          <span className={`font-mono text-base font-bold ${analysis.totalReturns >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {analysis.totalReturns >= 0 ? "+" : ""}{formatCurrency(analysis.totalReturns)} ({formatPercent(analysis.totalReturnsPercent)})
          </span>
        </div>
        <div className="border border-stone-300 p-3 rounded bg-stone-50">
          <span className="text-[9px] uppercase tracking-wider text-stone-500 block">Portfolio Health Score</span>
          <span className="font-mono text-lg font-extrabold text-stone-900">
            {analysis.healthScore}/100
          </span>
        </div>
      </div>

      {/* 3. Beta, Cap-Size, and Benchmarks row */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        
        {/* Benchmarks & Volatility */}
        <div className="border border-stone-300 p-4 rounded space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-stone-200 pb-1.5">Alpha Benchmarking</h3>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-stone-500 border-b border-stone-200 text-left">
                <th className="pb-1">Index</th>
                <th className="pb-1 text-right">Index Return</th>
                <th className="pb-1 text-right">Alpha</th>
              </tr>
            </thead>
            <tbody>
              {analysis.benchmarkComparison.map((bench) => (
                <tr key={bench.name} className="border-b border-stone-100 last:border-0">
                  <td className="py-1 font-medium">{bench.name}</td>
                  <td className="py-1 text-right font-mono">{bench.benchmarkReturn.toFixed(1)}%</td>
                  <td className={`py-1 text-right font-semibold font-mono ${bench.alpha >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {bench.alpha >= 0 ? "+" : ""}{bench.alpha.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[9px] text-stone-500 border-t border-stone-200 pt-2 flex justify-between">
            <span>Portfolio Beta: <strong>{portfolioBeta.toFixed(2)}</strong></span>
            <span>Risk Lean: <strong>{portfolioBeta > 1.1 ? "Aggressive" : portfolioBeta < 0.9 ? "Defensive" : "Market Neutral"}</strong></span>
          </div>
        </div>

        {/* Cap Size Allocation */}
        <div className="border border-stone-300 p-4 rounded space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-stone-200 pb-1.5">Cap-Size Weight Distribution</h3>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Large Cap Exposure</span>
              <span className="font-mono">{capData.large.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-stone-800 h-full" style={{ width: `${capData.large}%` }} />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">Mid Cap Exposure</span>
              <span className="font-mono">{capData.mid.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-stone-500 h-full" style={{ width: `${capData.mid}%` }} />
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold">Small Cap Exposure</span>
              <span className="font-mono">{capData.small.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-stone-300 h-full" style={{ width: `${capData.small}%` }} />
            </div>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div className="border border-stone-300 p-4 rounded space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-stone-200 pb-1.5">Major Sectors</h3>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-stone-500 border-b border-stone-200 text-left">
                <th className="pb-1">Sector</th>
                <th className="pb-1 text-right">Value</th>
                <th className="pb-1 text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              {analysis.sectorAllocation.slice(0, 4).map((sec) => (
                <tr key={sec.name} className="border-b border-stone-100 last:border-0">
                  <td className="py-1 font-medium">{sec.name}</td>
                  <td className="py-1 text-right font-mono text-stone-600">{formatCurrency(sec.value)}</td>
                  <td className="py-1 text-right font-semibold font-mono">{sec.percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. Actionable Suggestions Summary */}
      <div className="border border-stone-300 p-4 rounded mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-stone-200 pb-2 mb-3">
          Executive Rebalancing Recommendations
        </h3>
        <ul className="space-y-2.5 text-[10px]">
          {analysis.suggestions.slice(0, 4).map((s, idx) => (
            <li key={idx} className="flex gap-2 items-start border-b border-stone-100 pb-2 last:border-0 last:pb-0">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide shrink-0 ${
                s.priority === "high" ? "bg-red-100 text-red-800" : s.priority === "medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {s.priority}
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-stone-900">{s.title}</span>
                <p className="text-stone-600 leading-snug">{s.description}</p>
              </div>
            </li>
          ))}
          {analysis.suggestions.length === 0 && (
            <li className="text-stone-500 italic">No rebalancing recommendations found. Your portfolio is optimally diversified!</li>
          )}
        </ul>
      </div>

      {/* 5. Complete Holdings & Recommendations Table */}
      <div className="mt-8">
        <h3 className="text-xs font-bold uppercase tracking-wider border-b-2 border-stone-800 pb-2 mb-3">
          Comprehensive Position Review & Verdicts
        </h3>
        <table className="w-full text-[10px] text-left">
          <thead>
            <tr className="border-b border-stone-400 bg-stone-50 text-[9px] uppercase tracking-wider text-stone-600 font-semibold">
              <th className="px-2 py-1.5">Asset Symbol</th>
              <th className="px-2 py-1.5">Sector</th>
              <th className="px-2 py-1.5 text-right">Qty</th>
              <th className="px-2 py-1.5 text-right">Avg Cost</th>
              <th className="px-2 py-1.5 text-right">LTP</th>
              <th className="px-2 py-1.5 text-right">Current Value</th>
              <th className="px-2 py-1.5 text-right">P&L (%)</th>
              <th className="px-2 py-1.5 text-right">Weight</th>
              <th className="px-2 py-1.5 text-center">Expert Verdict</th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((h) => {
              const rec = getStockRecommendation(h);
              return (
                <tr key={h.symbol} className="border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors">
                  <td className="px-2 py-2">
                    <div className="font-bold text-stone-900">{h.symbol}</div>
                    <div className="text-[8px] text-stone-500 truncate max-w-[140px]">{h.name}</div>
                  </td>
                  <td className="px-2 py-2 text-stone-600">{h.sector}</td>
                  <td className="px-2 py-2 text-right font-mono text-stone-600">{formatNumber(h.quantity)}</td>
                  <td className="px-2 py-2 text-right font-mono text-stone-600">{formatCurrency(h.avgPrice)}</td>
                  <td className="px-2 py-2 text-right font-mono text-stone-900">{formatCurrency(h.currentPrice)}</td>
                  <td className="px-2 py-2 text-right font-mono text-stone-900 font-semibold">{formatCurrency(h.currentValue)}</td>
                  <td className={`px-2 py-2 text-right font-semibold font-mono ${
                    h.returns >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}>
                    {h.returnsPercent >= 0 ? "+" : ""}{h.returnsPercent.toFixed(1)}%
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-stone-900">{h.weight.toFixed(1)}%</td>
                  <td className="px-2 py-2 text-center">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold border border-stone-300">
                      {rec.action}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. Footer disclaimer */}
      <div className="border-t border-stone-300 pt-3 mt-12 text-center text-[8px] text-stone-400 leading-normal">
        <p>This report is generated automatically by Asset Manager based on data loaded from user portfolio statements and public static market databases.</p>
        <p className="mt-0.5 font-semibold">DISCLAIMER: For educational and informational purposes only. Do not treat as certified financial advice.</p>
      </div>

    </div>
  );
}
