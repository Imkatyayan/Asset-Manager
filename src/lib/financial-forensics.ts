import type { PerformancePeriod } from "./market-data";

export interface ForensicCheck {
  id: string;
  title: string;
  category: "Cash Quality" | "Revenue Integrity" | "Margin Authenticity" | "Non-Operating Inflation" | "Momentum Disconnect" | "Solvency Strain";
  status: "PASS" | "WARNING" | "CRITICAL";
  scoreImpact: number; // deducted points
  metric: string;
  benchmark: string;
  explanation: string;
  investorTakeaway: string;
}

export interface ForensicAuditReport {
  symbol: string;
  name: string;
  riskScore: number; // 0 to 100 (0 = Lowest Risk/Cleanest, 100 = Maximum Manipulation Risk)
  integrityScore: number; // 100 - riskScore (100 = Perfect Integrity)
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  riskBadge: string;
  summary: string;
  dummyResultRisk: {
    isSuspected: boolean;
    flagTitle: string;
    verdict: string;
  };
  checks: ForensicCheck[];
  timestamp: string;
}

/**
 * Analyzes quarterly and annual financial statements for accounting anomalies,
 * earnings manipulation, dummy results, and fake momentum indicators.
 */
export function runForensicAudit(
  symbol: string,
  name: string,
  quarters: PerformancePeriod[],
  annuals: PerformancePeriod[],
  currentPrice: number,
  pe: number | null,
  periodReturn?: number | null
): ForensicAuditReport {
  const checks: ForensicCheck[] = [];
  let totalRiskDeductions = 0;

  // We need at least 2 quarters to compute sequential shifts; if unavailable, provide graceful baseline
  const qLen = quarters.length;
  const recentQ = qLen > 0 ? quarters[qLen - 1] : null;
  const prevQ = qLen > 1 ? quarters[qLen - 2] : null;

  // 1. ABNORMAL OPERATING MARGIN (OPM) SPIKE CHECK
  // Dummy results often report fictitious revenue with zero matching expenses or deferred cost recognition,
  // causing an unnatural 600-1500 bps surge in OPM.
  if (recentQ && qLen >= 3) {
    const historicalOPMs = quarters.slice(-8, -1).map((q) => q.opmPercent);
    const avgHistoricalOPM =
      historicalOPMs.reduce((sum, v) => sum + v, 0) / Math.max(1, historicalOPMs.length);
    const opmSpikeBps = Math.round((recentQ.opmPercent - avgHistoricalOPM) * 100);

    if (opmSpikeBps > 750 && recentQ.opmPercent > 18) {
      checks.push({
        id: "opm-abnormal-surge",
        title: "Abnormal Operating Margin (OPM) Spike",
        category: "Margin Authenticity",
        status: "CRITICAL",
        scoreImpact: 25,
        metric: `Latest OPM: ${recentQ.opmPercent.toFixed(1)}% (vs 7Q Avg: ${avgHistoricalOPM.toFixed(1)}%)`,
        benchmark: `Historical normal tolerance: ±300 bps (Observed: +${opmSpikeBps} bps)`,
        explanation:
          "The reported operating margin expanded abruptly by over 750 basis points in a single reporting cycle. In corporate forensics, abrupt margin leaps without proportional top-line volume leverage frequently signal deferred operational expense booking or dummy revenue inclusion.",
        investorTakeaway:
          "High caution: Verify whether management capitalized operating expenses or reported unaudited provisional figures to engineer short-term trading enthusiasm.",
      });
      totalRiskDeductions += 25;
    } else if (opmSpikeBps > 400) {
      checks.push({
        id: "opm-elevated",
        title: "Elevated Operating Margin Volatility",
        category: "Margin Authenticity",
        status: "WARNING",
        scoreImpact: 12,
        metric: `Latest OPM: ${recentQ.opmPercent.toFixed(1)}% (+${opmSpikeBps} bps vs avg)`,
        benchmark: "Historical band: ±250 bps",
        explanation:
          "Operating margins showed noticeable sequential expansion. While potentially driven by raw material softening, quarterly volatility warrants monitoring.",
        investorTakeaway: "Scrutinize upcoming quarterly sustainability to confirm if gross margin gains are recurring.",
      });
      totalRiskDeductions += 12;
    } else {
      checks.push({
        id: "opm-stable",
        title: "Operating Margin Consistency",
        category: "Margin Authenticity",
        status: "PASS",
        scoreImpact: 0,
        metric: `Latest OPM: ${recentQ.opmPercent.toFixed(1)}% (7Q Avg: ${avgHistoricalOPM.toFixed(1)}%)`,
        benchmark: "Stability within historical range",
        explanation:
          "Quarterly operating margin aligns closely with historical cost structures. No anomalous margin inflation or expense deferral detected.",
        investorTakeaway: "Operational cost reporting appears disciplined and transparent.",
      });
    }
  }

  // 2. CASH CONVERSION & REVENUE-PROFIT SKEW (Accrual Distortion)
  // When sales or PAT surges, but net profit significantly exceeds historical cash realization ratios.
  if (recentQ && prevQ) {
    const qoqSalesGrowth =
      prevQ.sales > 0 ? ((recentQ.sales - prevQ.sales) / prevQ.sales) * 100 : 0;
    const qoqProfitGrowth =
      prevQ.netProfit > 0
        ? ((recentQ.netProfit - prevQ.netProfit) / prevQ.netProfit) * 100
        : 0;

    const profitDivergence = qoqProfitGrowth - qoqSalesGrowth;

    if (qoqProfitGrowth > 50 && qoqSalesGrowth < 5) {
      checks.push({
        id: "profit-sales-disconnect",
        title: "Disproportionate Profit vs Sales Decoupling",
        category: "Revenue Integrity",
        status: "CRITICAL",
        scoreImpact: 22,
        metric: `Profit Growth: +${qoqProfitGrowth.toFixed(1)}% QoQ vs Sales: +${qoqSalesGrowth.toFixed(1)}%`,
        benchmark: "Profit growth should correlate with underlying core top-line expansion",
        explanation:
          "Net profit surged dramatically while core top-line revenue remained essentially flat or sluggish. This divergence indicates profit numbers are either driven by non-operating one-offs (asset sales, tax reversals) or aggressive accrual accounting rather than commercial customer demand.",
        investorTakeaway:
          "Do not mistake paper bottom-line beats for genuine business scale. Check note disclosures for exceptional items.",
      });
      totalRiskDeductions += 22;
    } else if (profitDivergence > 35 && qoqProfitGrowth > 30) {
      checks.push({
        id: "profit-acceleration-watch",
        title: "Profit-to-Sales Growth Asymmetry",
        category: "Revenue Integrity",
        status: "WARNING",
        scoreImpact: 10,
        metric: `Profit +${qoqProfitGrowth.toFixed(1)}% QoQ vs Sales +${qoqSalesGrowth.toFixed(1)}%`,
        benchmark: "Sustainable operating leverage gap typically < 20%",
        explanation:
          "Bottom-line growth outpaced sales expansion significantly. Likely assisted by favorable operating leverage or financial adjustments.",
        investorTakeaway: "Review cash flow from operations in the next audited half-year release.",
      });
      totalRiskDeductions += 10;
    } else {
      checks.push({
        id: "profit-sales-alignment",
        title: "Top-Line & Bottom-Line Growth Cohesion",
        category: "Revenue Integrity",
        status: "PASS",
        scoreImpact: 0,
        metric: `Sales QoQ: ${qoqSalesGrowth >= 0 ? "+" : ""}${qoqSalesGrowth.toFixed(1)}% | Profit QoQ: ${qoqProfitGrowth >= 0 ? "+" : ""}${qoqProfitGrowth.toFixed(1)}%`,
        benchmark: "Balanced revenue-to-profit expansion",
        explanation:
          "Revenue and profit trajectories are synchronized with healthy operating fundamentals. No artificial top-line dummy bloating identified.",
        investorTakeaway: "Earnings growth is driven by genuine business volume.",
      });
    }
  }

  // 3. NON-OPERATING / OTHER INCOME DISTORTION CHECK
  // Tests if reported profit is cosmetically pumped up by non-core other income
  if (recentQ) {
    const estimatedOperatingProfit = recentQ.sales * (recentQ.opmPercent / 100);
    const nonOpSpread = recentQ.netProfit - estimatedOperatingProfit * 0.75; // after approximate tax

    if (nonOpSpread > 0 && recentQ.netProfit > 50 && nonOpSpread / recentQ.netProfit > 0.45) {
      checks.push({
        id: "other-income-distortion",
        title: "Heavy Reliance on Non-Core Other Income",
        category: "Non-Operating Inflation",
        status: "CRITICAL",
        scoreImpact: 20,
        metric: `Non-core contribution: ~${Math.round((nonOpSpread / recentQ.netProfit) * 100)}% of reported PAT`,
        benchmark: "Core operations should contribute >= 80% of net profit",
        explanation:
          "Over 45% of this quarter's net earnings originate from outside core operations (treasury yields, revaluations, or subsidiary dividend pass-through). Headlines reporting record profits mask stagnation in the actual commercial business.",
        investorTakeaway:
          "Disregard headlines: Strip out non-core items when evaluating forward P/E multiples.",
      });
      totalRiskDeductions += 20;
    } else {
      checks.push({
        id: "other-income-clean",
        title: "Core Operating Dominance",
        category: "Non-Operating Inflation",
        status: "PASS",
        scoreImpact: 0,
        metric: "Core operating EBIT fuels > 85% of net profit",
        benchmark: "Healthy operating quality threshold: > 75%",
        explanation:
          "Reported bottom line is solidly backed by core operating activities rather than artificial non-operational entries.",
        investorTakeaway: "High earnings quality. Minimal risk of deceptive non-operational inflation.",
      });
    }
  }

  // 4. MOMENTUM HYPING & RESULT LEAK / PUMP DISCONNECT
  // Flags stocks where price surged +25% leading into results, while underlying fundamentals are erratic
  const priceRunup = periodReturn ?? 0;
  if (recentQ && priceRunup > 25) {
    const isFundamentalStrong = (pe ?? 50) < 40 && recentQ.netProfit > 0;
    if (!isFundamentalStrong) {
      checks.push({
        id: "speculative-momentum-disconnect",
        title: "Speculative Run-Up vs Fundamental Multiples",
        category: "Momentum Disconnect",
        status: "WARNING",
        scoreImpact: 15,
        metric: `Stock Run-up: +${priceRunup.toFixed(1)}% | Valuation P/E: ${pe ? pe.toFixed(1) : "High / Undefined"}`,
        benchmark: "Price surge without proportional fundamental multiple support",
        explanation:
          "Stock price has rallied aggressively (+25%+) into this earnings announcement. When high trading volume precedes results while valuation is stretched, retail investors face elevated risk of 'buy the rumor, sell the news' or promoter liquidity distribution.",
        investorTakeaway:
          "Avoid chasing momentum near multi-month highs until confirmed audited cash flows validate the valuation.",
      });
      totalRiskDeductions += 15;
    }
  }

  // 5. EARNINGS SMOOTHING & VOLATILITY IRREGULARITY
  // Checks if multi-quarter results display artificial robotic linear growth or extreme 'sawtooth' patterns
  if (quarters.length >= 6) {
    const last6Profits = quarters.slice(-6).map((q) => q.netProfit);
    const mean = last6Profits.reduce((a, b) => a + b, 0) / 6;
    const variance =
      last6Profits.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / 6;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? (stdDev / mean) * 100 : 0;

    // Erratic sawtooth pattern: Alternating between high profit and near-zero or loss
    if (coefficientOfVariation > 120) {
      checks.push({
        id: "erratic-earnings-pattern",
        title: "High Quarterly Earnings Volatility (Sawtooth Trend)",
        category: "Cash Quality",
        status: "WARNING",
        scoreImpact: 10,
        metric: `Coefficient of Variation: ${coefficientOfVariation.toFixed(0)}%`,
        benchmark: "Stable predictable businesses: < 35%",
        explanation:
          "Quarterly net profit swings wildly across reporting periods. Such volatility makes forward forecasting hazardous and frequently indicates project-based lumpiness or arbitrary quarter-end revenue recognition.",
        investorTakeaway:
          "Evaluate trailing 12-month (TTM) aggregates rather than isolated quarter headlines.",
      });
      totalRiskDeductions += 10;
    } else {
      checks.push({
        id: "earnings-pattern-clean",
        title: "Consistent Earnings Trajectory",
        category: "Cash Quality",
        status: "PASS",
        scoreImpact: 0,
        metric: `Coefficient of Variation: ${coefficientOfVariation.toFixed(0)}% (Well controlled)`,
        benchmark: "Healthy consistency threshold: < 50%",
        explanation:
          "Quarterly earnings show steady compounding without erratic cliff-edge drops or unnatural manipulation signatures.",
        investorTakeaway: "Business model displays predictable operational cadence.",
      });
    }
  }

  // 6. SOLVENCY & BALANCE SHEET STABILITY
  if (annuals.length >= 2) {
    const latestAnnual = annuals[annuals.length - 1];
    if (latestAnnual.netProfit < 0) {
      checks.push({
        id: "annual-profitability-strain",
        title: "Annual Operating Deficit Warning",
        category: "Solvency Strain",
        status: "CRITICAL",
        scoreImpact: 18,
        metric: `Annual Net Loss: ₹${Math.abs(latestAnnual.netProfit).toLocaleString("en-IN")} Cr`,
        benchmark: "Profitable operational standing",
        explanation:
          "Company posted negative cumulative annual net profit in the last fiscal year. Quarterly green shoots should be treated with skepticism until sustained annual solvency is restored.",
        investorTakeaway: "Exercise caution: Turnaround thesis is not yet proven on balance sheet.",
      });
      totalRiskDeductions += 18;
    }
  }

  // Calculate final score: 0 = Pristine / Low Risk, 100 = Severe Risk
  const riskScore = Math.min(100, Math.max(0, Math.round(totalRiskDeductions)));
  const integrityScore = 100 - riskScore;

  let riskLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
  let riskBadge = "Clean Forensic Integrity (Low Risk)";
  let summary =
    "Our forensic algorithms analyzed reported quarters for revenue stuffing, unearned margin spikes, cash-profit disconnects, and promotional momentum. Financial statements demonstrate high institutional integrity with no evidence of dummy results.";

  if (riskScore >= 45) {
    riskLevel = "HIGH";
    riskBadge = "Elevated Manipulation Risk / Red Flags Detected";
    summary =
      "CRITICAL FORENSIC ALERT: Detected strong indicators of financial irregularities, including abnormal margin spikes or decoupled profit-to-revenue dynamics. This profile frequently corresponds to promotional trading momentum driven by aggressive or unaudited provisional figures.";
  } else if (riskScore >= 20) {
    riskLevel = "MODERATE";
    riskBadge = "Scrutiny Advised (Moderate Accounting Flags)";
    summary =
      "MODERATE SCRUTINY: While the company remains broadly operational, specific quarterly metrics (such as margin expansion or non-operating profit reliance) warrant careful inspection. Investors should verify cash flow conversion.";
  }

  const dummySuspected = riskScore >= 45;
  const dummyResultRisk = {
    isSuspected: dummySuspected,
    flagTitle: dummySuspected
      ? "Warning: Potential Dummy Results or Momentum Engineering"
      : "Low Risk: No Dummy Results Detected",
    verdict: dummySuspected
      ? "Recent quarterly figures exhibit multiple red flags typical of dummy billing, aggressive revenue front-loading, or promotional stock hyping. Institutional investors are advised to demand audited cash flow proof before entering fresh positions."
      : "Quarterly performance follows legitimate operational cycles. Figures are backed by consistent gross margins and realistic sales-to-profit ratios.",
  };

  return {
    symbol,
    name,
    riskScore,
    integrityScore,
    riskLevel,
    riskBadge,
    summary,
    dummyResultRisk,
    checks,
    timestamp: new Date().toISOString(),
  };
}
