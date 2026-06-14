import {
  BENCHMARKS,
  enrichHoldingsBatch,
  getLiveBenchmarks,
  type LiveBenchmarks,
  type StockFundamentals,
} from "./market-data";
import type { ParsedHolding } from "./csv-parser";
import { formatCurrency } from "./utils";

export interface EnrichedHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  returns: number;
  returnsPercent: number;
  sector: string;
  weight: number;
  fundamentals: StockFundamentals | null;
}

export interface AllocationSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface BenchmarkComparison {
  name: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  alpha: number;
  outperforming: boolean;
}

export interface Suggestion {
  type: "rebalance" | "reduce" | "increase" | "diversify" | "review" | "hold";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  symbol?: string;
}

export interface StockRecommendation {
  action: "ACCUMULATE" | "AVERAGE DOWN" | "HOLD" | "BOOK PROFITS" | "TRIM / REDUCE" | "SELL / EXIT";
  actionColor: string;
  badgeStyle: string;
  technicalTip: string;
  fundamentalTip: string;
  verdict: string;
}

export function getStockRecommendation(h: EnrichedHolding): StockRecommendation {
  const ltp = h.currentPrice;
  const avg = h.avgPrice;
  const ret = h.returnsPercent;
  const f = h.fundamentals;

  const support = Math.round(ltp * 0.94 * 100) / 100;
  const resistance = Math.round(ltp * 1.06 * 100) / 100;
  const stopLoss = Math.round(avg * 0.90 * 100) / 100;
  const rsi = f ? Math.round(45 + f.momentumScore * 0.35) : 56;

  if (f) {
    // ---- CASE 1: HOLDING IS IN PROFIT (ret > 0) ----
    if (ret > 0) {
      // High RSI or high PE or high returns -> BOOK PROFITS
      if (rsi > 70 || (ret > 25 && f.pe > 45)) {
        return {
          action: "BOOK PROFITS",
          actionColor: "text-violet-400 border-violet-900/30",
          badgeStyle: "bg-violet-950/20 text-violet-400 border-violet-900/40",
          technicalTip: `Overbought momentum (RSI: ${rsi}). Price is trading near immediate resistance of ${formatCurrency(resistance)}.`,
          fundamentalTip: f.pe > 0
            ? `High valuation of P/E ${f.pe.toFixed(1)} suggests current growth assumptions are fully priced in.`
            : `P/E is unavailable or negative; valuation cannot be structurally verified from current earnings.`,
          verdict: `Consider booking partial profits (e.g. 20-30% of position) on ${h.symbol} at current peak. Reinvest gains into defensive or discounted options; avoid fresh buy entries here.`
        };
      }
    } 
    // ---- CASE 2: HOLDING IS IN LOSS (ret <= 0) ----
    else {
      // 2a. Severe loss (ret < -12%) + high-quality fundamentals -> AVERAGE DOWN
      if (ret < -12 && f.roe > 15 && f.debtToEquity < 0.6 && f.profitGrowth > 5) {
        return {
          action: "AVERAGE DOWN",
          actionColor: "text-emerald-400 border-emerald-900/30",
          badgeStyle: "bg-emerald-950/20 text-emerald-400 border-emerald-900/40",
          technicalTip: `Price is down ${Math.abs(ret).toFixed(1)}%, trading close to consolidation support at ${formatCurrency(support)}. RSI is cool at ${rsi}.`,
          fundamentalTip: `Fundamentals remain excellent (ROE: ${f.roe}%, profit growth: +${f.profitGrowth}%, and low D/E: ${f.debtToEquity}).`,
          verdict: `Strong case to average down on ${h.symbol}. High-quality business facing short-term price correction; accumulating at support lowers average cost basis for multi-year upside.`
        };
      }

      // 2b. Severe loss (ret < -12%) + weak/declining fundamentals -> SELL / EXIT (Cut Losses)
      if (ret < -12 && (f.roe < 8 || f.debtToEquity > 1.2 || f.profitGrowth <= 0)) {
        return {
          action: "SELL / EXIT",
          actionColor: "text-red-400 border-red-900/30",
          badgeStyle: "bg-red-950/20 text-red-400 border-red-900/40",
          technicalTip: `Suggested Stop-Loss is breached. Price action is weak. Suggested Stop-Loss (SL) was near ${formatCurrency(stopLoss)}.`,
          fundamentalTip: `Weakening earnings growth (${f.profitGrowth}% y-o-y) or low capital efficiency (ROE: ${f.roe}%) elevates balance-sheet risks.`,
          verdict: `We recommend cutting losses and exiting or reducing exposure in ${h.symbol}. Severe loss of ${Math.abs(ret).toFixed(1)}% combined with weak profit growth/leverage indicates capital is better deployed in stronger peers.`
        };
      }

      // 2c. Overbought but in loss -> HOLD (AVOID FRESH BUYING)
      if (rsi > 70) {
        return {
          action: "HOLD",
          actionColor: "text-yellow-400 border-yellow-900/30",
          badgeStyle: "bg-yellow-950/10 text-yellow-400 border-yellow-900/30",
          technicalTip: `Stock has seen a short-term rally (RSI: ${rsi} is overbought) but you are sitting at a loss of ${Math.abs(ret).toFixed(1)}%.`,
          fundamentalTip: `Company has moderate fundamentals (ROE: ${f.roe}%, P/E: ${f.pe.toFixed(1)}).`,
          verdict: `Hold ${h.symbol} and avoid buying more at this short-term peak. The stock is overbought on charts, so wait for a price pullback or fundamental trend reversal before decision-making.`
        };
      }

      // 2d. Low RSI / oversold -> ACCUMULATE
      if (rsi < 40) {
        return {
          action: "ACCUMULATE",
          actionColor: "text-blue-400 border-blue-900/30",
          badgeStyle: "bg-blue-950/20 text-blue-400 border-blue-900/40",
          technicalTip: `Consolidating in accumulation zone (RSI: ${rsi}). Current price is near key support of ${formatCurrency(support)}.`,
          fundamentalTip: `Decent fundamentals with ROE of ${f.roe}% and comfortable debt levels. Valuations (P/E: ${f.pe.toFixed(1)}) are attractive.`,
          verdict: `Accumulate ${h.symbol} in a SIP or staggered format. Strong support levels and stable fundamentals represent an attractive risk-reward profile.`
        };
      }
    }
  } else {
    // If no fundamentals (untracked stock), fall back to price-action rules
    if (ret < -15) {
      return {
        action: "SELL / EXIT",
        actionColor: "text-red-400 border-red-900/30",
        badgeStyle: "bg-red-950/20 text-red-400 border-red-900/40",
        technicalTip: `Down trend is persistent (returns: ${ret.toFixed(1)}%). Stock is trading below short-term averages. Stop Loss at ${formatCurrency(stopLoss)} is recommended.`,
        fundamentalTip: `No fundamental data tracked for this custom instrument.`,
        verdict: `Consider exiting or trimming your position in ${h.symbol} to prevent further capital erosion. Price is in a strong downward trend.`
      };
    }
    if (ret > 30) {
      return {
        action: "BOOK PROFITS",
        actionColor: "text-violet-400 border-violet-900/30",
        badgeStyle: "bg-violet-950/20 text-violet-400 border-violet-900/40",
        technicalTip: `Strong run-up of ${ret.toFixed(1)}%. Immediate resistance is estimated at ${formatCurrency(resistance)}.`,
        fundamentalTip: `No fundamental data tracked for this custom instrument.`,
        verdict: `Lock in profits on ${h.symbol}. Having risen ${ret.toFixed(1)}% without structural data backing, it is wise to secure capital.`
      };
    }
  }

  // 5. Default -> HOLD
  return {
    action: "HOLD",
    actionColor: "text-yellow-400 border-yellow-900/30",
    badgeStyle: "bg-yellow-950/10 text-yellow-400 border-yellow-900/30",
    technicalTip: `Steady price action (RSI: ${rsi}). Trading comfortably between support at ${formatCurrency(support)} and resistance at ${formatCurrency(resistance)}.`,
    fundamentalTip: f 
      ? `Stable fundamentals (ROE: ${f.roe}%, profit growth: +${f.profitGrowth}%) warrant position holding.`
      : `No adverse price cues. Position is running neutral.`,
    verdict: `Hold your current position in ${h.symbol}. The stock is tracking standard indices, showing neutral momentum and stable parameters. No urgent rebalancing required.`
  };
}

export interface BasicAnalysis {
  totalInvested: number;
  totalValue: number;
  totalReturns: number;
  totalReturnsPercent: number;
  holdings: EnrichedHolding[];
  sectorAllocation: AllocationSlice[];
  topHoldings: EnrichedHolding[];
  benchmarkComparison: BenchmarkComparison[];
  suggestions: Suggestion[];
  concentrationRisk: { top3Weight: number; top5Weight: number };
}

export interface FullAnalysis extends BasicAnalysis {
  momentumScore: number;
  fundamentalScore: number;
  riskScore: number;
  diversificationScore: number;
  overallHealthScore: number;
  suggestions: Suggestion[];
  trendBreakdown: { bullish: number; neutral: number; bearish: number };
  peAnalysis: { avgPE: number; vsMarket: string };
  concentrationRisk: { top3Weight: number; top5Weight: number };
  portfolioBeta: number;
  portfolioVolatility: number;
  portfolioSharpe: number;
  portfolioDividendYield: number;
  capAllocation: { large: number; mid: number; small: number };
}

const SECTOR_COLORS: Record<string, string> = {
  "Banking & Finance": "#10b981",
  IT: "#5367FF",
  Energy: "#FF6B35",
  FMCG: "#FFB800",
  Pharma: "#E040FB",
  Auto: "#00B8D4",
  Telecom: "#7C4DFF",
  Infrastructure: "#FF5252",
  Materials: "#8D6E63",
  "Consumer Services": "#FF4081",
  "Aerospace & Defence": "#607D8B",
  Unknown: "#9E9E9E",
  Others: "#9E9E9E",
};

function resolveCurrentPrice(
  h: ParsedHolding,
  livePrice: number
): number {
  if (h.csvLtp && h.csvLtp > 0) return h.csvLtp;
  if (h.csvCurrentValue && h.quantity > 0) return h.csvCurrentValue / h.quantity;
  return livePrice;
}

function mapEnrichedHolding(
  h: ParsedHolding,
  enriched: Awaited<ReturnType<typeof enrichHoldingsBatch>>[number]
): EnrichedHolding {
  const invested = h.quantity * h.avgPrice;
  const currentPrice = resolveCurrentPrice(h, enriched.currentPrice);
  const currentValue =
    h.csvCurrentValue && h.csvCurrentValue > 0
      ? h.csvCurrentValue
      : h.quantity * currentPrice;
  const returns = currentValue - invested;
  const returnsPercent = invested > 0 ? (returns / invested) * 100 : 0;

  return {
    symbol: enriched.symbol,
    name: enriched.name,
    quantity: h.quantity,
    avgPrice: h.avgPrice,
    currentPrice,
    invested,
    currentValue,
    returns,
    returnsPercent,
    sector: enriched.sector,
    weight: 0,
    fundamentals: enriched.fundamentals,
  };
}

async function enrichHoldings(holdings: ParsedHolding[]): Promise<EnrichedHolding[]> {
  const enriched = await enrichHoldingsBatch(
    holdings.map((h) => ({ symbol: h.symbol, avgPrice: h.avgPrice }))
  );
  return holdings.map((h, i) => mapEnrichedHolding(h, enriched[i]));
}

function computeWeights(holdings: EnrichedHolding[]): EnrichedHolding[] {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  return holdings.map((h) => ({
    ...h,
    weight: total > 0 ? (h.currentValue / total) * 100 : 0,
  }));
}

function buildSectorAllocation(holdings: EnrichedHolding[]): AllocationSlice[] {
  const sectors: Record<string, number> = {};
  for (const h of holdings) {
    sectors[h.sector] = (sectors[h.sector] || 0) + h.currentValue;
  }
  const total = Object.values(sectors).reduce((s, v) => s + v, 0);
  return Object.entries(sectors)
    .map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
      color: SECTOR_COLORS[name] || SECTOR_COLORS.Unknown,
    }))
    .sort((a, b) => b.value - a.value);
}

function computePortfolioReturn(holdings: EnrichedHolding[]): number {
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  return totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
}

function buildBenchmarkComparison(
  portfolioReturn: number,
  benchmarks: LiveBenchmarks = {
    nifty50: { name: BENCHMARKS.nifty50.name, yearReturn: BENCHMARKS.nifty50.yearReturn },
    sensex: { name: BENCHMARKS.sensex.name, yearReturn: BENCHMARKS.sensex.yearReturn },
  }
): BenchmarkComparison[] {
  return [
    {
      name: benchmarks.nifty50.name,
      portfolioReturn,
      benchmarkReturn: benchmarks.nifty50.yearReturn,
      alpha: portfolioReturn - benchmarks.nifty50.yearReturn,
      outperforming: portfolioReturn > benchmarks.nifty50.yearReturn,
    },
    {
      name: benchmarks.sensex.name,
      portfolioReturn,
      benchmarkReturn: benchmarks.sensex.yearReturn,
      alpha: portfolioReturn - benchmarks.sensex.yearReturn,
      outperforming: portfolioReturn > benchmarks.sensex.yearReturn,
    },
  ];
}

function computeConcentration(holdings: EnrichedHolding[]) {
  const sorted = [...holdings].sort((a, b) => b.weight - a.weight);
  return {
    top3Weight: Math.round(sorted.slice(0, 3).reduce((s, h) => s + h.weight, 0) * 10) / 10,
    top5Weight: Math.round(sorted.slice(0, 5).reduce((s, h) => s + h.weight, 0) * 10) / 10,
  };
}

function sortSuggestions(suggestions: Suggestion[]): Suggestion[] {
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/** Recommendations available to free / guest users */
function generateBasicSuggestions(
  holdings: EnrichedHolding[],
  niftyYearReturn: number = BENCHMARKS.nifty50.yearReturn
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const sorted = [...holdings].sort((a, b) => b.weight - a.weight);
  const portfolioReturn = computePortfolioReturn(holdings);

  const top3Weight = sorted.slice(0, 3).reduce((s, h) => s + h.weight, 0);
  if (top3Weight > 55) {
    suggestions.push({
      type: "rebalance",
      priority: "high",
      title: "Reduce concentration risk",
      description: `Top 3 stocks (${sorted
        .slice(0, 3)
        .map((h) => h.symbol)
        .join(", ")}) make up ${top3Weight.toFixed(1)}% of your portfolio. Spread across 8–12 stocks for better risk-adjusted returns.`,
    });
  }

  for (const h of sorted) {
    if (h.weight > 20) {
      suggestions.push({
        type: "rebalance",
        priority: "high",
        title: `${h.symbol} is overweight at ${h.weight.toFixed(1)}%`,
        description: `Single-stock exposure above 20% adds significant risk. Consider trimming and reallocating to other sectors.`,
        symbol: h.symbol,
      });
    }
  }

  const sectors: Record<string, number> = {};
  for (const h of holdings) {
    sectors[h.sector] = (sectors[h.sector] || 0) + h.weight;
  }
  for (const [sector, weight] of Object.entries(sectors)) {
    if (weight > 35 && sector !== "Unknown") {
      suggestions.push({
        type: "diversify",
        priority: "medium",
        title: `Overweight ${sector} (${weight.toFixed(1)}%)`,
        description: `Consider reducing ${sector} exposure to ~25–30% and adding IT, Pharma, or FMCG for balance.`,
      });
    }
  }

  const laggards = [...holdings]
    .filter((h) => h.returnsPercent < 0)
    .sort((a, b) => a.returnsPercent - b.returnsPercent)
    .slice(0, 2);
  for (const h of laggards) {
    const rec = getStockRecommendation(h);
    let type: Suggestion["type"] = "review";
    let priority: Suggestion["priority"] = "medium";
    if (rec.action === "SELL / EXIT" || rec.action === "TRIM / REDUCE") {
      type = "reduce";
      priority = "high";
    } else if (rec.action === "AVERAGE DOWN" || rec.action === "ACCUMULATE") {
      type = "increase";
      priority = "medium";
    }
    suggestions.push({
      type,
      priority,
      title: `${rec.action}: ${h.symbol} (Down ${Math.abs(h.returnsPercent).toFixed(1)}%)`,
      description: `${rec.verdict} Technical Remarks: ${rec.technicalTip}`,
      symbol: h.symbol,
    });
  }

  const outperformers = [...holdings]
    .filter((h) => h.returnsPercent > 20)
    .sort((a, b) => b.returnsPercent - a.returnsPercent)
    .slice(0, 2);
  for (const h of outperformers) {
    const rec = getStockRecommendation(h);
    if (rec.action === "BOOK PROFITS") {
      suggestions.push({
        type: "reduce",
        priority: "medium",
        title: `BOOK PROFITS: ${h.symbol} (Up ${h.returnsPercent.toFixed(1)}%)`,
        description: `${rec.verdict} Technical Remarks: ${rec.technicalTip}`,
        symbol: h.symbol,
      });
    }
  }

  if (portfolioReturn < niftyYearReturn) {
    suggestions.push({
      type: "increase",
      priority: "high",
      title: "Trailing NIFTY 50 — add index exposure",
      description: `Your ${portfolioReturn.toFixed(1)}% return trails NIFTY 50 (${niftyYearReturn}%). Allocate 20–30% to a NIFTY 50 index fund as a core holding.`,
    });
  } else {
    suggestions.push({
      type: "hold",
      priority: "low",
      title: "Beating NIFTY 50 — stay disciplined",
      description: `Portfolio return of ${portfolioReturn.toFixed(1)}% beats NIFTY 50. Avoid over-trading; rebalance only when allocations drift >5%.`,
    });
  }

  const hasIndex = holdings.some((h) =>
    /NIFTY|SENSEX|INDEX|BEES/i.test(h.symbol)
  );
  if (!hasIndex) {
    suggestions.push({
      type: "increase",
      priority: "medium",
      title: "Add NIFTY 50 / Sensex index fund",
      description:
        "No index fund detected. A 20–30% NIFTY 50 allocation lowers volatility and provides market-matching core returns.",
    });
  }

  if (holdings.length < 6) {
    suggestions.push({
      type: "diversify",
      priority: "medium",
      title: "Portfolio too concentrated",
      description: `Only ${holdings.length} stocks held. Indian experts recommend 8–15 stocks across 4–6 sectors for retail portfolios.`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: "hold",
      priority: "low",
      title: "Allocation looks reasonable",
      description: "No major issues detected from returns and allocation data. Sign up for momentum & fundamental insights.",
    });
  }

  return sortSuggestions(suggestions).slice(0, 6);
}

export async function analyzeBasic(holdings: ParsedHolding[]): Promise<BasicAnalysis> {
  const [enrichedRaw, benchmarks] = await Promise.all([
    enrichHoldings(holdings),
    getLiveBenchmarks(),
  ]);
  const enriched = computeWeights(enrichedRaw);
  const totalInvested = enriched.reduce((s, h) => s + h.invested, 0);
  const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalReturns = totalValue - totalInvested;
  const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  const portfolioReturn = computePortfolioReturn(enriched);

  return {
    totalInvested,
    totalValue,
    totalReturns,
    totalReturnsPercent,
    holdings: enriched,
    sectorAllocation: buildSectorAllocation(enriched),
    topHoldings: [...enriched].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5),
    benchmarkComparison: buildBenchmarkComparison(portfolioReturn, benchmarks),
    suggestions: generateBasicSuggestions(enriched, benchmarks.nifty50.yearReturn),
    concentrationRisk: computeConcentration(enriched),
  };
}

function generateFullSuggestions(
  holdings: EnrichedHolding[],
  niftyYearReturn: number = BENCHMARKS.nifty50.yearReturn,
  extra?: {
    portfolioBeta: number;
    portfolioSharpe: number;
    capAllocation: { large: number; mid: number; small: number };
  }
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const sorted = [...holdings].sort((a, b) => b.weight - a.weight);

  // Concentration risk
  const top3Weight = sorted.slice(0, 3).reduce((s, h) => s + h.weight, 0);
  if (top3Weight > 60) {
    suggestions.push({
      type: "rebalance",
      priority: "high",
      title: "High concentration risk",
      description: `Your top 3 holdings account for ${top3Weight.toFixed(1)}% of portfolio. Consider diversifying across more stocks or sectors.`,
    });
  }

  // Sector concentration
  const sectors: Record<string, number> = {};
  for (const h of holdings) {
    sectors[h.sector] = (sectors[h.sector] || 0) + h.weight;
  }
  for (const [sector, weight] of Object.entries(sectors)) {
    if (weight > 40) {
      suggestions.push({
        type: "diversify",
        priority: "medium",
        title: `Overweight ${sector} sector`,
        description: `${sector} makes up ${weight.toFixed(1)}% of your portfolio. Indian market best practice suggests keeping sector exposure under 30-35%.`,
      });
    }
  }

  // Individual stock analysis
  for (const h of holdings) {
    const rec = getStockRecommendation(h);

    if (h.weight > 25) {
      suggestions.push({
        type: "rebalance",
        priority: "high",
        title: `Trim ${h.symbol} Position (Overweight)`,
        description: `${h.symbol} makes up ${h.weight.toFixed(1)}% of your portfolio. Single-stock exposure above 20% adds significant risk. Recommendation: ${rec.verdict}`,
        symbol: h.symbol,
      });
      continue;
    }

    if (rec.action === "SELL / EXIT") {
      suggestions.push({
        type: "reduce",
        priority: "high",
        title: `SELL / EXIT Alert: ${h.symbol}`,
        description: `${rec.verdict} Technical view: ${rec.technicalTip}`,
        symbol: h.symbol,
      });
    } else if (rec.action === "BOOK PROFITS") {
      suggestions.push({
        type: "reduce",
        priority: "medium",
        title: `BOOK PROFITS: ${h.symbol}`,
        description: `${rec.verdict} Technical view: ${rec.technicalTip}`,
        symbol: h.symbol,
      });
    } else if (rec.action === "AVERAGE DOWN") {
      suggestions.push({
        type: "increase",
        priority: "medium",
        title: `AVERAGE DOWN: ${h.symbol}`,
        description: `${rec.verdict} Technical view: ${rec.technicalTip}`,
        symbol: h.symbol,
      });
    } else if (rec.action === "ACCUMULATE") {
      suggestions.push({
        type: "increase",
        priority: "low",
        title: `ACCUMULATE: ${h.symbol}`,
        description: `${rec.verdict} Technical view: ${rec.technicalTip}`,
        symbol: h.symbol,
      });
    } else if (h.fundamentals && h.fundamentals.debtToEquity > 1.5) {
      suggestions.push({
        type: "review",
        priority: "medium",
        title: `High Debt Alert: ${h.symbol}`,
        description: `${h.symbol} has a high debt-to-equity ratio of ${h.fundamentals.debtToEquity}. ${rec.fundamentalTip}`,
        symbol: h.symbol,
      });
    }
  }

  // Cap-size and portfolio metrics suggestions
  if (extra) {
    const smallAndMid = extra.capAllocation.mid + extra.capAllocation.small;
    if (smallAndMid > 55) {
      suggestions.push({
        type: "diversify",
        priority: "high",
        title: `Heavy Small & Mid Cap exposure (${smallAndMid.toFixed(1)}%)`,
        description: "Your portfolio is heavily exposed to mid & small-caps. Consider allocating at least 50% to large-cap core stocks to buffer market volatility.",
      });
    } else if (extra.capAllocation.large > 85) {
      suggestions.push({
        type: "diversify",
        priority: "low",
        title: `High Large Cap skew (${extra.capAllocation.large.toFixed(1)}%)`,
        description: "Your portfolio is almost entirely large-caps. Consider adding 15-20% high-quality mid-caps or small-caps for higher growth.",
      });
    }

    if (extra.portfolioBeta > 1.3) {
      suggestions.push({
        type: "rebalance",
        priority: "high",
        title: `High Beta Volatility (Beta: ${extra.portfolioBeta})`,
        description: "Your portfolio beta is aggressive. Consider adding defensive large-cap IT or FMCG stocks (e.g. TCS, HINDUNILVR) to lower risk.",
      });
    } else if (extra.portfolioBeta < 0.7) {
      suggestions.push({
        type: "increase",
        priority: "low",
        title: `Defensive Portfolio (Beta: ${extra.portfolioBeta})`,
        description: "Your portfolio is defensive and might underperform in a bull run. Consider adding growth or index momentum stocks to boost potential.",
      });
    }

    if (extra.portfolioSharpe < 0 && holdings.length > 0) {
      suggestions.push({
        type: "review",
        priority: "high",
        title: `Negative Sharpe Ratio (${extra.portfolioSharpe})`,
        description: "Your risk-adjusted returns are lower than risk-free assets (7.0%). Review holdings to weed out consistent laggards.",
      });
    }
  }

  // Underperformers vs benchmark
  const portfolioReturn = computePortfolioReturn(holdings);
  if (portfolioReturn < niftyYearReturn) {
    suggestions.push({
      type: "rebalance",
      priority: "high",
      title: "Underperforming NIFTY 50",
      description: `Portfolio return of ${portfolioReturn.toFixed(1)}% trails NIFTY 50 (${niftyYearReturn}%). Consider adding index fund exposure or reviewing laggards.`,
    });
  }

  // Index fund suggestion
  const hasIndexExposure = holdings.some(
    (h) => h.symbol.includes("NIFTY") || h.symbol.includes("SENSEX") || h.symbol.includes("INDEX")
  );
  if (!hasIndexExposure && holdings.length < 15) {
    suggestions.push({
      type: "increase",
      priority: "medium",
      title: "Add index fund allocation",
      description: "Consider allocating 20-30% to a NIFTY 50 or NIFTY Next 50 index fund for stable core exposure.",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: "hold",
      priority: "low",
      title: "Portfolio looks balanced",
      description: "No major red flags detected. Continue periodic review and rebalance quarterly.",
    });
  }

  const basicSuggestions = generateBasicSuggestions(holdings, niftyYearReturn);
  const combined = [...suggestions, ...basicSuggestions];
  const seen = new Set<string>();
  const unique = combined.filter((s) => {
    const key = `${s.type}-${s.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return sortSuggestions(unique);
}

export async function analyzeFull(holdings: ParsedHolding[]): Promise<FullAnalysis> {
  const basic = await analyzeBasic(holdings);
  const enriched = basic.holdings;
  const benchmarks = await getLiveBenchmarks();

  const withFundamentals = enriched.filter((h) => h.fundamentals);
  const withValidFundamentals = enriched.filter(
    (h) => h.fundamentals && h.fundamentals.pe > 0 && h.fundamentals.roe > 0
  );

  const momentumScore =
    withFundamentals.length > 0
      ? withFundamentals.reduce((s, h) => s + (h.fundamentals?.momentumScore || 0), 0) /
        withFundamentals.length
      : 50;

  const fundamentalScore =
    withValidFundamentals.length > 0
      ? withValidFundamentals.reduce((s, h) => {
          const f = h.fundamentals!;
          let score = 50;
          if (f.roe > 15) score += 15;
          if (f.pe < 30) score += 10;
          if (f.debtToEquity < 0.5) score += 10;
          if (f.profitGrowth > 10) score += 15;
          return s + Math.min(score, 100);
        }, 0) / withValidFundamentals.length
      : 50;

  const sorted = [...enriched].sort((a, b) => b.weight - a.weight);
  const top3Weight = sorted.slice(0, 3).reduce((s, h) => s + h.weight, 0);
  const top5Weight = sorted.slice(0, 5).reduce((s, h) => s + h.weight, 0);
  const sectorCount = new Set(enriched.map((h) => h.sector)).size;

  const diversificationScore = Math.min(
    100,
    sectorCount * 12 + (100 - top3Weight) * 0.5
  );

  const riskScore = Math.min(
    100,
    top3Weight * 0.8 + enriched.filter((h) => h.fundamentals?.trend === "bearish").length * 10
  );

  const overallHealthScore = Math.round(
    momentumScore * 0.25 +
      fundamentalScore * 0.3 +
      diversificationScore * 0.25 +
      (100 - riskScore) * 0.2
  );

  const trendBreakdown = { bullish: 0, neutral: 0, bearish: 0 };
  for (const h of withFundamentals) {
    const trend = h.fundamentals!.trend;
    trendBreakdown[trend]++;
  }

  const avgPE =
    withValidFundamentals.length > 0
      ? withValidFundamentals.reduce((s, h) => s + (h.fundamentals?.pe || 0), 0) /
        withValidFundamentals.length
      : 0;

  // Cap Allocation Calculations
  let largeWeight = 0;
  let midWeight = 0;
  let smallWeight = 0;

  for (const h of enriched) {
    const cap = h.fundamentals?.capSize || "mid";
    if (cap === "large") largeWeight += h.weight;
    else if (cap === "mid") midWeight += h.weight;
    else if (cap === "small") smallWeight += h.weight;
  }

  const capAllocation = {
    large: Math.round(largeWeight * 10) / 10,
    mid: Math.round(midWeight * 10) / 10,
    small: Math.round(smallWeight * 10) / 10,
  };

  // Weighted Beta and Volatility/Sharpe Calculations
  let weightedBetaSum = 0;
  let weightedDivYieldSum = 0;

  for (const h of enriched) {
    const beta = h.fundamentals?.beta ?? 1.0;
    const divYield = h.fundamentals?.dividendYield ?? 0;
    weightedBetaSum += (h.weight * beta) / 100;
    weightedDivYieldSum += (h.weight * divYield) / 100;
  }

  const portfolioBeta = Math.round(weightedBetaSum * 100) / 100;
  const portfolioDividendYield = Math.round(weightedDivYieldSum * 100) / 100;

  const indexVolatility = 15.2; // standard Nifty 50 volatility
  const portfolioVolatility = Math.round(indexVolatility * portfolioBeta * 10) / 10;

  const portfolioReturn = basic.totalReturnsPercent;
  const riskFreeRate = 7.0; // Indian 10-year G-Sec yield
  const portfolioSharpe = portfolioVolatility > 0
    ? Math.round(((portfolioReturn - riskFreeRate) / portfolioVolatility) * 100) / 100
    : 0;

  const suggestions = generateFullSuggestions(enriched, benchmarks.nifty50.yearReturn, {
    portfolioBeta,
    portfolioSharpe,
    capAllocation,
  });

  return {
    ...basic,
    momentumScore: Math.round(momentumScore),
    fundamentalScore: Math.round(fundamentalScore),
    riskScore: Math.round(riskScore),
    diversificationScore: Math.round(diversificationScore),
    overallHealthScore,
    suggestions,
    trendBreakdown,
    peAnalysis: {
      avgPE: Math.round(avgPE * 10) / 10,
      vsMarket: avgPE > 28 ? "Above market average" : avgPE > 0 ? "Below market average" : "N/A",
    },
    concentrationRisk: {
      top3Weight: Math.round(top3Weight * 10) / 10,
      top5Weight: Math.round(top5Weight * 10) / 10,
    },
    portfolioBeta,
    portfolioVolatility,
    portfolioSharpe,
    portfolioDividendYield,
    capAllocation,
  };
}
