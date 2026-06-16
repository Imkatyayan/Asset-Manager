"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { EnrichedHolding } from "@/lib/analysis";
import { getStockRecommendation } from "@/lib/analysis";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Info,
  Lock
} from "lucide-react";

interface RebalanceSimulatorProps {
  holdings: EnrichedHolding[];
  tier?: "basic" | "full";
}

type StrategyType = "tactical" | "defensive" | "equal";

export function RebalanceSimulator({ holdings, tier = "basic" }: RebalanceSimulatorProps) {
  const [cash, setCash] = useState<number>(50000);
  const [strategy, setStrategy] = useState<StrategyType>("tactical");
  const isFull = tier === "full";

  // Helper to safely parse numbers
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);

  // Quick Preset Handlers
  const handlePreset = (amount: number) => {
    if (!isFull) return;
    setCash(amount);
  };

  // Rebalancing Solver Algorithm (Greedy Optimization Loop)
  const runSimulation = () => {
    // 1. Calculate current metrics
    const currentTop3Weight = [...holdings]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .reduce((s, h) => s + h.weight, 0);

    const currentWeightedBeta = holdings.reduce((sum, h) => {
      const b = h.fundamentals?.beta ?? 1.0;
      return sum + (h.weight * b);
    }, 0) / 100;

    // 2. Identify eligible assets (Exclude SELL / TRIM)
    const eligibleHoldings = holdings.map(h => {
      const rec = getStockRecommendation(h);
      const beta = h.fundamentals?.beta ?? 1.0;
      const roe = h.fundamentals?.roe ?? 12;
      const pe = h.fundamentals?.pe ?? 20;

      const isExcluded = rec.action === "SELL / EXIT" || rec.action === "TRIM / REDUCE";

      return {
        holding: h,
        symbol: h.symbol,
        name: h.name,
        sector: h.sector,
        ltp: h.currentPrice,
        beta,
        roe,
        pe,
        rec,
        isExcluded
      };
    });

    // 3. Initialize Solver State
    let unusedCash = cash;
    const suggestedBuys = new Map<string, number>(); // symbol -> quantity to buy
    holdings.forEach(h => suggestedBuys.set(h.symbol, 0));

    const cheapestStockPrice = Math.min(...eligibleHoldings.filter(h => !h.isExcluded).map(h => h.ltp));

    // 4. Greedy Allocation Loop (Terminates when remaining cash is too small)
    let safetyCounter = 0;
    const maxIterations = 2000; // prevent infinite loops

    while (unusedCash >= cheapestStockPrice && safetyCounter < maxIterations) {
      safetyCounter++;

      // Compute simulated values & weights dynamically based on current simulated purchases
      const simulatedTotalValue = totalValue + (cash - unusedCash);
      const simulatedHoldings = holdings.map(h => {
        const qtyBought = suggestedBuys.get(h.symbol) ?? 0;
        const value = h.currentValue + (qtyBought * h.currentPrice);
        const weight = simulatedTotalValue > 0 ? (value / simulatedTotalValue) * 100 : 0;
        const beta = h.fundamentals?.beta ?? 1.0;

        return {
          symbol: h.symbol,
          value,
          weight,
          beta
        };
      });

      // Calculate allocation scores for each asset based on strategy
      let bestSymbol = "";
      let highestScore = -Infinity;

      eligibleHoldings.forEach(item => {
        if (item.isExcluded || item.ltp > unusedCash) {
          return; // Skip excluded or unaffordable
        }

        const simHolding = simulatedHoldings.find(h => h.symbol === item.symbol);
        const simWeight = simHolding ? simHolding.weight : 0;

        let score = 0;

        if (strategy === "tactical") {
          // Tactical Cost-Averaging Strategy
          score = 1.0;
          if (item.rec.action === "AVERAGE DOWN") score += 2.5;
          if (item.rec.action === "ACCUMULATE") score += 1.2;
          if (item.rec.action === "HOLD") score += 0.5;

          // Favor lower-weighted positions to control concentration
          score += (100 - simWeight) / 100;

          // Quality factors
          if (item.roe > 15) score += 0.4;
          if (item.pe > 0 && item.pe < 30) score += 0.3;

        } else if (strategy === "defensive") {
          // Defensive Beta Shield Strategy
          score = 1.0;
          score += (2.0 - item.beta); // Lower beta yields higher score

          // Sector tilt (defensive sectors)
          if (["FMCG", "Pharma", "IT", "Consumer Services"].includes(item.sector)) {
            score += 1.5;
          }
          score += (100 - simWeight) / 100; // diversification

        } else if (strategy === "equal") {
          // Equal Weight Rebalancing Strategy
          const targetWeight = 100 / holdings.length;
          score = Math.max(0, targetWeight - simWeight); // High score for extremely underweight stocks
        }

        if (score > highestScore) {
          highestScore = score;
          bestSymbol = item.symbol;
        }
      });

      // Break if no stock was affordable or scored
      if (!bestSymbol) {
        break;
      }

      // Record simulated purchase
      const currentQty = suggestedBuys.get(bestSymbol) ?? 0;
      suggestedBuys.set(bestSymbol, currentQty + 1);
      
      const purchasePrice = eligibleHoldings.find(h => h.symbol === bestSymbol)?.ltp ?? 0;
      unusedCash -= purchasePrice;
    }

    // 5. Compile simulation outputs
    const recommendations: Array<{
      symbol: string;
      name: string;
      sector: string;
      ltp: number;
      qtyToBuy: number;
      cost: number;
      targetWeight: number;
    }> = [];

    suggestedBuys.forEach((qty, symbol) => {
      if (qty > 0) {
        const item = eligibleHoldings.find(h => h.symbol === symbol);
        if (item) {
          recommendations.push({
            symbol: item.symbol,
            name: item.name,
            sector: item.sector,
            ltp: item.ltp,
            qtyToBuy: qty,
            cost: qty * item.ltp,
            targetWeight: 0, // will calculate next
          });
        }
      }
    });

    const finalTotalValue = totalValue + (cash - unusedCash);
    const finalHoldings = holdings.map(h => {
      const qtyBought = suggestedBuys.get(h.symbol) ?? 0;
      const value = h.currentValue + (qtyBought * h.currentPrice);
      const weight = finalTotalValue > 0 ? (value / finalTotalValue) * 100 : 0;
      const beta = h.fundamentals?.beta ?? 1.0;

      // Update targetWeight for output list
      const rec = recommendations.find(r => r.symbol === h.symbol);
      if (rec) {
        rec.targetWeight = weight;
      }

      return {
        symbol: h.symbol,
        weight,
        beta
      };
    });

    const simulatedTop3Weight = [...finalHoldings]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .reduce((s, h) => s + h.weight, 0);

    const simulatedWeightedBeta = finalHoldings.reduce((sum, h) => {
      return sum + (h.weight * h.beta);
    }, 0) / 100;

    // Sort suggestions by cash spent descending
    recommendations.sort((a, b) => b.cost - a.cost);

    return {
      recommendations,
      unusedCash,
      currentTop3Weight,
      simulatedTop3Weight,
      currentWeightedBeta,
      simulatedWeightedBeta,
    };
  };

  const sim = runSimulation();

  const strategyDescriptions = {
    tactical: "Dip-Buying focus. Directs capital toward top-quality assets trading at short-term price corrections (AVERAGE DOWN) to optimize cost-basis.",
    defensive: "Beta Shield focus. Allocates cash to low-beta defensive sectors (Pharma, FMCG, IT) to reduce portfolio volatility and cushion drawdowns.",
    equal: "Diversification focus. Routes fresh funds to underweight positions to push all holdings closer to a balanced, uniform weight allocation."
  };

  return (
    <Card className="border-market-border bg-market-card overflow-hidden animate-fade-in-up stagger-2">
      <CardHeader className="border-b border-market-border px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-market-warning" />
            <CardTitle className="text-sm font-semibold tracking-wide">
              Portfolio Rebalance Solver (Strategic Knapsack Solver)
            </CardTitle>
          </div>
          
          {/* Strategy Selector Segmented Control */}
          <div className="flex bg-market-surface/80 border border-market-border/80 rounded-lg p-0.5 self-start sm:self-auto">
            {(["tactical", "defensive", "equal"] as StrategyType[]).map((strat) => (
              <button
                key={strat}
                disabled={!isFull}
                onClick={() => setStrategy(strat)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  strategy === strat
                    ? "bg-market-card text-market-accent border border-market-border shadow"
                    : "text-market-muted hover:text-market-text"
                }`}
              >
                {strat === "tactical" ? "Tactical" : strat === "defensive" ? "Beta Shield" : "Equal Weight"}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-market-muted normal-case mt-1 max-w-2xl leading-normal">
          <strong>Selected Mode:</strong> {strategyDescriptions[strategy]}
        </p>
      </CardHeader>

      <CardContent className="p-5 space-y-6 relative">
        <div className={`space-y-6 ${!isFull ? "blur-[4px] select-none pointer-events-none" : ""}`}>
          
          {/* Investment Input Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-market-surface/40 p-4 rounded-lg border border-market-border/40">
              <div className="space-y-1">
                <label htmlFor="cash-input" className="text-[10px] font-bold uppercase tracking-wider text-market-muted">
                  Fresh Cash Injection
                </label>
                <div className="relative max-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-market-muted font-semibold text-sm">₹</span>
                  <input
                    id="cash-input"
                    type="number"
                    value={cash}
                    min={1000}
                    max={2500000}
                    step={1000}
                    disabled={!isFull}
                    onChange={(e) => setCash(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-market-bg border border-market-border rounded px-7 py-1.5 text-sm font-mono-nums text-market-text focus:outline-none focus:border-market-accent/50"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 items-end">
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2.5 h-auto cursor-pointer" onClick={() => handlePreset(10000)}>
                  + ₹10K
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2.5 h-auto cursor-pointer" onClick={() => handlePreset(50000)}>
                  + ₹50K
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2.5 h-auto cursor-pointer" onClick={() => handlePreset(100000)}>
                  + ₹1L
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2.5 h-auto cursor-pointer" onClick={() => handlePreset(500000)}>
                  + ₹5L
                </Button>
              </div>
            </div>

            {/* Slider input */}
            <div className="px-1 pt-2">
              <input
                type="range"
                min={1000}
                max={1000000}
                step={5000}
                value={cash}
                disabled={!isFull}
                onChange={(e) => setCash(parseInt(e.target.value) || 1000)}
                className="w-full h-1.5 bg-market-border rounded-lg appearance-none cursor-pointer accent-market-accent"
              />
              <div className="flex justify-between text-[9px] text-market-muted font-mono mt-1">
                <span>₹1K</span>
                <span>₹5L</span>
                <span>₹10L</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid gap-5 md:grid-cols-3">
            
            {/* Allocation Recommendations Table */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-market-up uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                Solver Recommended Purchases
              </h4>

              {sim.recommendations.length > 0 ? (
                <div className="rounded border border-market-border bg-market-surface/25 overflow-x-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-market-border bg-market-surface/60 text-[9px] uppercase tracking-wider text-market-muted">
                        <th className="px-3 py-2 font-medium">Stock</th>
                        <th className="px-3 py-2 font-medium">Sector</th>
                        <th className="px-3 py-2 font-medium text-right">LTP</th>
                        <th className="px-3 py-2 font-medium text-right">Qty to Buy</th>
                        <th className="px-3 py-2 font-medium text-right">Capital Cost</th>
                        <th className="px-3 py-2 font-medium text-right">Simulated Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sim.recommendations.map((r) => (
                        <tr key={r.symbol} className="border-b border-market-border/40 last:border-0 hover:bg-market-surface/40 transition-colors">
                          <td className="px-3 py-2">
                            <div className="font-semibold text-market-text">{r.symbol}</div>
                            <div className="text-[9px] text-market-muted truncate max-w-[120px]">{r.name}</div>
                          </td>
                          <td className="px-3 py-2 text-market-muted">{r.sector}</td>
                          <td className="px-3 py-2 text-right font-mono-nums">{formatCurrency(r.ltp)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-market-up font-mono-nums">+{r.qtyToBuy}</td>
                          <td className="px-3 py-2 text-right font-mono-nums text-market-text">{formatCurrency(r.cost)}</td>
                          <td className="px-3 py-2 text-right font-mono-nums text-market-accent font-medium">{r.targetWeight.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-market-border/60 bg-market-surface/20 rounded text-center text-market-muted">
                  <Info className="h-5 w-5 mb-1.5" />
                  <p className="text-[10px]">No allocation suggestions found for this capital amount.</p>
                  <p className="text-[9px] mt-0.5">Eligible assets require a share cost lower than ₹{cash.toLocaleString("en-IN")}.</p>
                </div>
              )}
            </div>

            {/* Allocation Statistics & Forecasts */}
            <div className="space-y-4 bg-market-surface/30 border border-market-border/40 p-4 rounded-lg">
              <h4 className="text-[10px] font-bold text-market-accent uppercase tracking-wider">
                Simulated Portfolio Impact
              </h4>
              
              <div className="space-y-4">
                
                {/* Top-3 Concentration */}
                <div className="border-b border-market-border/20 pb-3 space-y-1">
                  <span className="text-[10px] text-market-muted flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Top 3 Concentration:
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono-nums text-market-muted text-xs">
                      {sim.currentTop3Weight.toFixed(1)}%
                    </span>
                    <span className="text-market-muted text-[10px]">→</span>
                    <span className={`font-mono-nums font-bold text-sm ${
                      sim.simulatedTop3Weight < sim.currentTop3Weight ? "text-market-up" : "text-market-text"
                    }`}>
                      {sim.simulatedTop3Weight.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[9px] text-market-muted/70">
                    {sim.simulatedTop3Weight < sim.currentTop3Weight ? (
                      <span className="text-market-up">✓ Diversification improved (-{(sim.currentTop3Weight - sim.simulatedTop3Weight).toFixed(1)}%)</span>
                    ) : (
                      <span>Weight change is neutral</span>
                    )}
                  </div>
                </div>

                {/* Portfolio Beta */}
                <div className="border-b border-market-border/20 pb-3 space-y-1">
                  <span className="text-[10px] text-market-muted flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Weighted Portfolio Beta:
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono-nums text-market-muted text-xs">
                      {sim.currentWeightedBeta.toFixed(2)}
                    </span>
                    <span className="text-market-muted text-[10px]">→</span>
                    <span className={`font-mono-nums font-bold text-sm ${
                      sim.simulatedWeightedBeta < sim.currentWeightedBeta ? "text-market-up" : "text-market-text"
                    }`}>
                      {sim.simulatedWeightedBeta.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[9px] text-market-muted/70">
                    {sim.simulatedWeightedBeta < sim.currentWeightedBeta ? (
                      <span className="text-market-up font-semibold">✓ Volatility reduced (-{(sim.currentWeightedBeta - sim.simulatedWeightedBeta).toFixed(2)})</span>
                    ) : sim.simulatedWeightedBeta > sim.currentWeightedBeta ? (
                      <span className="text-market-warning">Growth/Volatility tilt (+{(sim.simulatedWeightedBeta - sim.currentWeightedBeta).toFixed(2)})</span>
                    ) : (
                      <span>Beta remains steady</span>
                    )}
                  </div>
                </div>

                {/* Unused Cash */}
                <div className="space-y-1">
                  <span className="text-[10px] text-market-muted flex items-center gap-1">
                    <Coins className="h-3 w-3" /> Unallocated Balance:
                  </span>
                  <div className="font-mono-nums font-bold text-sm text-market-text">
                    {formatCurrency(sim.unusedCash)}
                  </div>
                  <div className="text-[9px] text-market-muted/70 leading-normal flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5 text-market-muted shrink-0" />
                    <span>Unused balance is minimized by the greedy knapsack solver (strictly below Cheapest Stock LTP).</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
        
        {/* Converter Paywall Lock Overlay */}
        {!isFull && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-market-bg/60 backdrop-blur-[2px] p-6 text-center rounded-lg border border-market-accent/20">
            <Lock className="h-6 w-6 text-market-accent mb-2 animate-bounce" />
            <span className="text-xs font-bold tracking-wider uppercase text-market-accent font-mono">Rebalance Solver Locked</span>
            <p className="text-xs text-market-text mt-1.5 max-w-[320px] leading-normal font-medium">
              Run fresh capital allocation simulations to automatically optimize your diversification, sector exposure, and portfolio beta.{" "}
              <Link href="/signup" className="text-market-up underline ml-1 hover:text-market-up-dark font-semibold">Create a free account</Link> to unlock this tool.
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
