"use client";

import { useState, Fragment } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { EnrichedHolding, getStockRecommendation } from "@/lib/analysis";
import { STOCK_DATABASE } from "@/lib/market-data";
import { 
  Shield, 
  Activity, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  Info
} from "lucide-react";

interface HoldingsTableProps {
  holdings: EnrichedHolding[];
  showFundamentals?: boolean;
}

export function HoldingsTable({ holdings, showFundamentals }: HoldingsTableProps) {
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const sorted = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  // Helper to fetch peer stocks in the same sector
  const getSectorPeers = (symbol: string, sector: string) => {
    if (!sector || sector === "Unknown") return [];
    return Object.values(STOCK_DATABASE)
      .filter((s) => s.sector === sector && s.symbol !== symbol)
      .slice(0, 3);
  };

  return (
    <Card className="border border-market-border bg-market-card overflow-hidden animate-fade-in-up stagger-3">
      <CardHeader className="border-b border-market-border px-5 py-4">
        <CardTitle className="text-sm font-semibold tracking-wide">
          Holdings · {holdings.length} Positions
        </CardTitle>
        <p className="text-[11px] text-market-muted normal-case mt-0.5 font-normal">
          Click on any stock row to open dynamic Technical, Fundamental & Peer Comparison analysis.
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-market-border bg-market-surface text-left text-[10px] uppercase tracking-wider text-market-muted">
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">Instrument</th>
              <th className="px-4 py-3 font-medium text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Avg. Price</th>
              <th className="px-4 py-3 font-medium text-right">LTP</th>
              <th className="px-4 py-3 font-medium text-right">Current Value</th>
              <th className="px-4 py-3 font-medium text-right">P&L</th>
              <th className="px-4 py-3 font-medium text-right">Weight</th>
              {showFundamentals && (
                <>
                  <th className="px-4 py-3 font-medium text-right">P/E</th>
                  <th className="px-4 py-3 font-medium text-right">Trend</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => {
              const isExpanded = expandedSymbol === h.symbol;
              const peers = getSectorPeers(h.symbol, h.sector);
              const ltp = h.currentPrice;
              const rec = getStockRecommendation(h);

              // Calculate dynamic technicals
              const technicals = {
                support: Math.round(ltp * 0.94 * 100) / 100,
                resistance: Math.round(ltp * 1.06 * 100) / 100,
                stopLoss: Math.round(h.avgPrice * 0.90 * 100) / 100, // 10% below avg cost
                rsi: h.fundamentals ? Math.round(45 + (h.fundamentals.momentumScore * 0.35)) : 56,
              };

              let rsiLabel = "Neutral (Consolidation)";
              let rsiColor = "text-market-warning bg-amber-950/10 border-amber-900/30";
              if (technicals.rsi > 70) {
                rsiLabel = "Overbought (Caution)";
                rsiColor = "text-market-down bg-red-950/10 border-red-900/30";
              } else if (technicals.rsi < 35) {
                rsiLabel = "Oversold (Accumulation)";
                rsiColor = "text-market-up bg-emerald-950/10 border-emerald-900/30";
              }

              // Cash Flow and growth descriptions
              let resultsTrend = "Stable earnings";
              let debtHealth = "Low leverage / Safe debt profile";
              let cashFlowProfile = "Consistent operating cash flows";

              if (h.fundamentals) {
                const f = h.fundamentals;
                if (f.profitGrowth > 20) {
                  resultsTrend = `Excellent EPS expansion (+${f.profitGrowth}% growth)`;
                } else if (f.profitGrowth < 0) {
                  resultsTrend = `Earnings contraction (${f.profitGrowth}% y-o-y)`;
                } else {
                  resultsTrend = `Moderate profit growth (+${f.profitGrowth}% y-o-y)`;
                }

                if (f.debtToEquity > 1.2) {
                  debtHealth = `Elevated leverage (D/E: ${f.debtToEquity})`;
                } else if (f.debtToEquity === 0) {
                  debtHealth = "Prudently Debt-Free balance sheet";
                } else {
                  debtHealth = `Conservative debt ratios (D/E: ${f.debtToEquity})`;
                }

                if (["IT", "FMCG", "Pharma", "Consumer Services"].includes(f.sector)) {
                  cashFlowProfile = "Capital-light model yielding high Free Cash Flows";
                } else if (["Energy", "Infrastructure", "Materials", "Aerospace & Defence"].includes(f.sector)) {
                  cashFlowProfile = "Capex-heavy structure; high asset reinvestment required";
                } else if (["Banking & Finance", "Banking", "Finance"].includes(f.sector)) {
                  cashFlowProfile = "Credit expansion business; check interest coverage & NPAs";
                }
              }

              return (
                <Fragment key={h.symbol}>
                  <tr
                    onClick={() => setExpandedSymbol(isExpanded ? null : h.symbol)}
                    className={`border-b border-market-border/50 hover:bg-market-surface/40 transition-all duration-200 cursor-pointer select-none ${
                      isExpanded ? "bg-market-surface/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-center text-market-muted shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-market-accent" />
                      ) : (
                        <ChevronRight className="h-4 w-4 hover:text-market-text" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-market-surface/80 text-[10px] font-bold text-market-accent border border-market-border/40">
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
                      {formatCurrency(ltp)}
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
                      {h.weight.toFixed(1)}%
                    </td>
                    {showFundamentals && (
                      <>
                        <td className="px-4 py-3 text-right font-mono-nums text-market-muted">
                          {h.fundamentals && h.fundamentals.pe > 0 ? h.fundamentals.pe.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {h.fundamentals ? (
                            <span
                              className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                                h.fundamentals.trend === "bullish"
                                  ? "bg-emerald-900/20 text-market-up border border-emerald-950"
                                  : h.fundamentals.trend === "bearish"
                                  ? "bg-red-900/20 text-market-down border border-red-950"
                                  : "bg-amber-900/20 text-market-warning border border-amber-950"
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

                  {/* Expanded Analysis Sub-Row */}
                  {isExpanded && (
                    <tr className="bg-market-surface/15 hover:bg-market-surface/15 transition-all duration-300">
                      <td colSpan={showFundamentals ? 10 : 8} className="px-6 py-5 border-b border-market-border/40">
                        <div className="grid gap-6 md:grid-cols-3 text-xs text-market-text leading-relaxed animate-fade-in-up">
                          {/* Column 1: Technical Indicators & Recommendations */}
                          <div className="space-y-3 p-4 rounded-lg bg-market-card/50 border border-market-border/40 shadow-sm">
                            <h4 className="flex items-center gap-2 font-bold text-market-accent uppercase tracking-wide text-[10px] pb-1.5 border-b border-market-border/40">
                              <Activity className="h-3.5 w-3.5" />
                              Technical Analysis
                            </h4>
                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-[11px]">
                              <div>
                                <span className="text-market-muted block">Support Level:</span>
                                <strong className="font-mono-nums text-market-text text-sm">{formatCurrency(technicals.support)}</strong>
                              </div>
                              <div>
                                <span className="text-market-muted block">Resistance Level:</span>
                                <strong className="font-mono-nums text-market-text text-sm">{formatCurrency(technicals.resistance)}</strong>
                              </div>
                              <div>
                                <span className="text-market-muted block">Suggested Stop Loss (SL):</span>
                                <strong className="font-mono-nums text-market-down text-sm">{formatCurrency(technicals.stopLoss)}</strong>
                              </div>
                              <div>
                                <span className="text-market-muted block">Momentum RSI:</span>
                                <strong className="font-mono-nums text-market-text text-sm">{technicals.rsi}</strong>
                              </div>
                            </div>

                            <div className={`mt-3 rounded border p-2 text-[10px] ${rsiColor}`}>
                              <p className="font-semibold">{rsiLabel}</p>
                              <p className="mt-0.5 text-market-muted/90">
                                {technicals.rsi > 70 
                                  ? "Asset shows overbought characteristics. Avoid fresh allocation at current market peak."
                                  : technicals.rsi < 35
                                  ? "Asset is deeply oversold. Potential accumulation zone for long-term investors."
                                  : "Momentum is trading in a healthy neutral range. Support levels are holding."}
                              </p>
                            </div>
                          </div>

                          {/* Column 2: Fundamental Recommendations */}
                           <div className="relative overflow-hidden space-y-3 p-4 rounded-lg bg-market-card/50 border border-market-border/40 shadow-sm">
                             <h4 className="flex items-center gap-2 font-bold text-market-up uppercase tracking-wide text-[10px] pb-1.5 border-b border-market-border/40">
                               <Award className="h-3.5 w-3.5" />
                               Fundamental Scorecard
                             </h4>
                             <div>
                               {h.fundamentals && h.fundamentals.marketCap > 0 ? (
                                 <div className="space-y-3 text-[11px]">
                                   <div className="flex justify-between items-center border-b border-market-border/20 pb-1.5">
                                     <span className="text-market-muted">ROE:</span>
                                     <span className="font-mono font-semibold text-market-text">{h.fundamentals.roe}%</span>
                                   </div>
                                   <div className="flex justify-between items-center border-b border-market-border/20 pb-1.5">
                                     <span className="text-market-muted">Revenue Growth:</span>
                                     <span className="font-mono font-semibold text-market-text">+{h.fundamentals.revenueGrowth}%</span>
                                   </div>
                                   <div className="flex justify-between items-center border-b border-market-border/20 pb-1.5">
                                     <span className="text-market-muted">Market Cap Size:</span>
                                     <span className="font-semibold text-market-text uppercase text-[10px]">{h.fundamentals.capSize} CAP</span>
                                   </div>

                                   <div className="space-y-1 pt-1.5 text-[10px] text-market-muted">
                                     <p className="flex gap-1.5 items-start">
                                       <span className="h-1.5 w-1.5 rounded-full bg-market-up mt-1 shrink-0" />
                                       <span>{resultsTrend}</span>
                                     </p>
                                     <p className="flex gap-1.5 items-start">
                                       <span className="h-1.5 w-1.5 rounded-full bg-market-up mt-1 shrink-0" />
                                       <span>{debtHealth}</span>
                                     </p>
                                     <p className="flex gap-1.5 items-start">
                                       <span className="h-1.5 w-1.5 rounded-full bg-market-accent mt-1 shrink-0" />
                                       <span>{cashFlowProfile}</span>
                                     </p>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center justify-center py-6 text-center text-market-muted">
                                   <Info className="h-5 w-5 mb-2" />
                                   <p className="text-[10px]">No static references for this asset.</p>
                                   <p className="text-[9px] mt-0.5 text-market-muted/70">Custom/unlisted instruments display only technical pricing ratios.</p>
                                 </div>
                               )}
                             </div>
                           </div>

                           {/* Column 3: Sector Peer Comparison */}
                           <div className="relative overflow-hidden space-y-3 p-4 rounded-lg bg-market-card/50 border border-market-border/40 shadow-sm">
                             <h4 className="flex items-center gap-2 font-bold text-market-warning uppercase tracking-wide text-[10px] pb-1.5 border-b border-market-border/40">
                               <Shield className="h-3.5 w-3.5" />
                               Sector Peer Comparison
                             </h4>
                             <div>
                               {peers.length > 0 ? (
                                 <div className="space-y-2.5">
                                   <table className="w-full text-[10px]">
                                     <thead>
                                       <tr className="text-market-muted border-b border-market-border/40 text-left">
                                         <th className="pb-1">Peer</th>
                                         <th className="pb-1 text-right">P/E</th>
                                         <th className="pb-1 text-right">ROE</th>
                                         <th className="pb-1 text-right">D/E</th>
                                         <th className="pb-1 text-right">1-Yr Rtn</th>
                                       </tr>
                                     </thead>
                                     <tbody>
                                       {/* Include current stock first as comparison */}
                                       {h.fundamentals && h.fundamentals.marketCap > 0 && (
                                         <tr className="font-semibold text-market-accent bg-market-accent/5">
                                           <td className="py-1">{h.symbol}*</td>
                                           <td className="py-1 text-right font-mono">{h.fundamentals.pe > 0 ? h.fundamentals.pe.toFixed(1) : "—"}</td>
                                           <td className="py-1 text-right font-mono">{h.fundamentals.roe}%</td>
                                           <td className="py-1 text-right font-mono">{h.fundamentals.debtToEquity}</td>
                                           <td className="py-1 text-right font-mono text-market-up">{h.fundamentals.yearReturn}%</td>
                                         </tr>
                                       )}
                                       {peers.map((peer) => (
                                         <tr key={peer.symbol} className="border-b border-market-border/20 last:border-0 hover:bg-market-surface/40">
                                           <td className="py-1 font-medium">{peer.symbol}</td>
                                           <td className="py-1 text-right font-mono text-market-muted">{peer.pe > 0 ? peer.pe.toFixed(1) : "—"}</td>
                                           <td className="py-1 text-right font-mono text-market-muted">{peer.roe}%</td>
                                           <td className="py-1 text-right font-mono text-market-muted">{peer.debtToEquity}</td>
                                           <td className={`py-1 text-right font-mono ${
                                             peer.yearReturn >= 0 ? "text-market-up" : "text-market-down"
                                           }`}>{peer.yearReturn}%</td>
                                         </tr>
                                       ))}
                                     </tbody>
                                   </table>

                                   {h.fundamentals && h.fundamentals.pe > 0 && (
                                     <p className="text-[9px] text-market-muted leading-tight border-t border-market-border/30 pt-1.5">
                                       {(() => {
                                         const validPeers = peers.filter(p => p.pe > 0);
                                         if (validPeers.length === 0) return `${h.symbol} is trading in line with sector standards.`;
                                         const peerAvgPE = validPeers.reduce((sum, p) => sum + p.pe, 0) / validPeers.length;
                                         const stockPE = h.fundamentals.pe;
                                         if (stockPE > peerAvgPE * 1.25) {
                                           return `${h.symbol} is trading at a premium valuation compared to its sector peers (Sector Avg P/E: ${Math.round(peerAvgPE)}).`;
                                         } else if (stockPE < peerAvgPE * 0.8) {
                                           return `${h.symbol} is trading at a discount compared to its sector peers (Sector Avg P/E: ${Math.round(peerAvgPE)}). Potential valuation play.`;
                                         } else {
                                           return `${h.symbol} is fairly valued compared to its sector peers.`;
                                         }
                                       })()}
                                     </p>
                                   )}
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center justify-center py-6 text-center text-market-muted">
                                   <Info className="h-5 w-5 mb-2" />
                                   <p className="text-[10px]">No peers found in this sector.</p>
                                   <p className="text-[9px] mt-0.5 text-market-muted/70">Ensure you hold major sector components to enable peer valuation overlays.</p>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>

                         {/* Action Recommendation & Verdict Block */}
                         <div className="relative mt-5 overflow-hidden">
                           <div className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${rec.badgeStyle}`}>
                             <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${rec.actionColor}`}>
                                   {rec.action}
                                 </span>
                                 <span className="font-semibold text-market-text text-sm">
                                   Expert Recommendation Verdict for {h.symbol}
                                 </span>
                               </div>
                               <p className="text-xs text-market-text/90 mt-1 leading-normal">
                                 {rec.verdict}
                               </p>
                             </div>
                             <div className="flex flex-col gap-1.5 md:min-w-[280px] text-[11px] bg-market-card/45 p-2.5 rounded border border-market-border/30">
                               <div>
                                 <span className="text-market-muted font-medium">Chart-based Action: </span>
                                 <span className="text-market-text font-normal">{rec.technicalTip}</span>
                               </div>
                               <div className="border-t border-market-border/20 pt-1.5 mt-1.5">
                                 <span className="text-market-muted font-medium">Fundamental View: </span>
                                 <span className="text-market-text font-normal">{rec.fundamentalTip}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
