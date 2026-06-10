import {
  BENCHMARKS,
  enrichHoldingsBatch,
  getLiveBenchmarks,
  type LiveBenchmarks,
  type StockFundamentals,
} from "./market-data";
import type { ParsedHolding } from "./csv-parser";

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
}

const SECTOR_COLORS: Record<string, string> = {
  Banking: "#00D09C",
  IT: "#5367FF",
  Energy: "#FF6B35",
  FMCG: "#FFB800",
  Pharma: "#E040FB",
  Auto: "#00B8D4",
  Telecom: "#7C4DFF",
  Infrastructure: "#FF5252",
  Unknown: "#9E9E9E",
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
    suggestions.push({
      type: "review",
      priority: "medium",
      title: `Review ${h.symbol} — down ${Math.abs(h.returnsPercent).toFixed(1)}%`,
      description: `${h.symbol} is your worst performer by returns. Review whether to hold, average down, or exit.`,
      symbol: h.symbol,
    });
  }

  const outperformers = [...holdings]
    .filter((h) => h.returnsPercent > 25)
    .sort((a, b) => b.returnsPercent - a.returnsPercent)
    .slice(0, 1);
  for (const h of outperformers) {
    if (h.weight > 10) {
      suggestions.push({
        type: "reduce",
        priority: "low",
        title: `Book partial profits on ${h.symbol}`,
        description: `${h.symbol} is up ${h.returnsPercent.toFixed(1)}% and is ${h.weight.toFixed(1)}% of portfolio. Consider booking 20–30% gains and redeploying.`,
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
  niftyYearReturn: number = BENCHMARKS.nifty50.yearReturn
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
    if (!h.fundamentals) continue;
    const f = h.fundamentals;

    if (h.weight > 25) {
      suggestions.push({
        type: "rebalance",
        priority: "high",
        title: `Trim ${h.symbol} position`,
        description: `${h.symbol} is ${h.weight.toFixed(1)}% of portfolio. Single stock exposure above 20% increases risk significantly.`,
        symbol: h.symbol,
      });
    }

    if (f.trend === "bearish" && h.weight > 5) {
      suggestions.push({
        type: "review",
        priority: "medium",
        title: `Review ${h.symbol} — bearish trend`,
        description: `${h.symbol} shows bearish momentum (score: ${f.momentumScore}/100). Review fundamentals before adding more.`,
        symbol: h.symbol,
      });
    }

    if (f.pe > 50 && h.weight > 8) {
      suggestions.push({
        type: "reduce",
        priority: "medium",
        title: `${h.symbol} — high valuation`,
        description: `P/E of ${f.pe} is significantly above market average. Consider partial profit booking.`,
        symbol: h.symbol,
      });
    }

    if (f.momentumScore > 75 && f.trend === "bullish" && h.weight < 5) {
      suggestions.push({
        type: "increase",
        priority: "low",
        title: `Consider increasing ${h.symbol}`,
        description: `Strong momentum (${f.momentumScore}/100) and bullish trend. Currently underweight at ${h.weight.toFixed(1)}%.`,
        symbol: h.symbol,
      });
    }

    if (f.debtToEquity > 1.5) {
      suggestions.push({
        type: "review",
        priority: "medium",
        title: `${h.symbol} — high debt`,
        description: `Debt-to-equity ratio of ${f.debtToEquity} is elevated. Monitor interest coverage and cash flows.`,
        symbol: h.symbol,
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
  const momentumScore =
    withFundamentals.length > 0
      ? withFundamentals.reduce((s, h) => s + (h.fundamentals?.momentumScore || 0), 0) /
        withFundamentals.length
      : 50;

  const fundamentalScore =
    withFundamentals.length > 0
      ? withFundamentals.reduce((s, h) => {
          const f = h.fundamentals!;
          let score = 50;
          if (f.roe > 15) score += 15;
          if (f.pe < 30) score += 10;
          if (f.debtToEquity < 0.5) score += 10;
          if (f.profitGrowth > 10) score += 15;
          return s + Math.min(score, 100);
        }, 0) / withFundamentals.length
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
    withFundamentals.length > 0
      ? withFundamentals.reduce((s, h) => s + (h.fundamentals?.pe || 0), 0) /
        withFundamentals.length
      : 0;

  return {
    ...basic,
    momentumScore: Math.round(momentumScore),
    fundamentalScore: Math.round(fundamentalScore),
    riskScore: Math.round(riskScore),
    diversificationScore: Math.round(diversificationScore),
    overallHealthScore,
    suggestions: generateFullSuggestions(enriched, benchmarks.nifty50.yearReturn),
    trendBreakdown,
    peAnalysis: {
      avgPE: Math.round(avgPE * 10) / 10,
      vsMarket: avgPE > 25 ? "Above market average" : avgPE > 0 ? "Below market average" : "N/A",
    },
    concentrationRisk: {
      top3Weight: Math.round(top3Weight * 10) / 10,
      top5Weight: Math.round(top5Weight * 10) / 10,
    },
  };
}
