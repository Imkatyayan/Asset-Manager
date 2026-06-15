"use client";

import { Activity, Shield, Target, TrendingUp, Zap, Award, Percent } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { FullAnalysis as FullAnalysisType } from "@/lib/analysis";
import { StressTest } from "@/components/analysis/stress-test";

interface FullAnalysisViewProps {
  analysis: FullAnalysisType;
}

export function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#2A2E39" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono-nums text-xl font-bold text-market-text">{score}</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-market-muted">{label}</p>
    </div>
  );
}

export function PortfolioHealthMetrics({ analysis }: { analysis: FullAnalysisType }) {
  return (
    <Card className="border border-market-border bg-market-card animate-fade-in-up">
      <CardHeader className="border-b border-market-border">
        <CardTitle>Portfolio Health · Pro Metrics</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
          <ScoreRing
            score={analysis.overallHealthScore}
            label="Overall"
            color={
              analysis.overallHealthScore >= 70
                ? "#00C076"
                : analysis.overallHealthScore >= 50
                ? "#FFB800"
                : "#FF5252"
            }
          />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <ScoreRing score={analysis.momentumScore} label="Momentum" color="#387ED1" />
            <ScoreRing score={analysis.fundamentalScore} label="Fundamentals" color="#00C076" />
            <ScoreRing score={analysis.diversificationScore} label="Diversify" color="#FFB800" />
            <ScoreRing score={100 - analysis.riskScore} label="Risk Safety" color="#7C4DFF" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskOverviewCards({ analysis }: { analysis: FullAnalysisType }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="border border-market-border bg-market-card">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-market-accent" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-market-muted">Trends</p>
              <div className="mt-1 flex gap-3 text-sm">
                <span className="text-market-up">{analysis.trendBreakdown.bullish} ↑</span>
                <span className="text-market-warning">{analysis.trendBreakdown.neutral} →</span>
                <span className="text-market-down">{analysis.trendBreakdown.bearish} ↓</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-market-border bg-market-card">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-market-up" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-market-muted">Avg P/E</p>
              <p className="font-mono-nums text-sm font-bold text-market-text">
                {analysis.peAnalysis.avgPE || "N/A"}{" "}
                <span className="text-xs font-normal text-market-muted">
                  ({analysis.peAnalysis.vsMarket})
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-market-border bg-market-card">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-market-warning" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-market-muted">Concentration</p>
              <p className="font-mono-nums text-sm font-bold text-market-text">
                T3 {analysis.concentrationRisk.top3Weight}% · T5 {analysis.concentrationRisk.top5Weight}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PortfolioRatiosGrid({ analysis }: { analysis: FullAnalysisType }) {
  // Determine Beta classification
  let betaLabel = "Market Matching";
  let betaColor = "text-market-accent bg-market-accent/10";
  if (analysis.portfolioBeta < 0.8) {
    betaLabel = "Low Risk / Defensive";
    betaColor = "text-market-up bg-market-up/10";
  } else if (analysis.portfolioBeta > 1.2) {
    betaLabel = "High Beta / Aggressive";
    betaColor = "text-market-down bg-market-down/10";
  }

  // Determine Sharpe classification
  let sharpeLabel = "Adequate";
  let sharpeColor = "text-market-muted bg-market-surface";
  if (analysis.portfolioSharpe < 0) {
    sharpeLabel = "Poor Risk-Adjusted Return";
    sharpeColor = "text-market-down bg-market-down/10";
  } else if (analysis.portfolioSharpe > 1.5) {
    sharpeLabel = "Excellent";
    sharpeColor = "text-market-up bg-market-up/10";
  } else if (analysis.portfolioSharpe > 0.8) {
    sharpeLabel = "Good";
    sharpeColor = "text-market-up bg-market-up/10";
  }

  return (
    <Card className="border border-market-border bg-market-card">
      <CardHeader className="border-b border-market-border">
        <CardTitle>Advanced Portfolio Ratios</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid gap-6 sm:grid-cols-4">
          <div className="space-y-1.5 border-r border-market-border/40 last:border-0 pr-4">
            <div className="flex items-center gap-2 text-market-muted">
              <TrendingUp className="h-4 w-4 text-market-up" />
              <span className="text-[10px] uppercase tracking-wide font-medium">Weighted Beta</span>
            </div>
            <p className="font-mono-nums text-2xl font-bold text-market-text">
              {analysis.portfolioBeta}
            </p>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${betaColor}`}>
              {betaLabel}
            </span>
            <p className="text-[10px] text-market-muted pt-1">Sensitivity to NIFTY 50 returns.</p>
          </div>

          <div className="space-y-1.5 border-r border-market-border/40 last:border-0 pr-4">
            <div className="flex items-center gap-2 text-market-muted">
              <Award className="h-4 w-4 text-market-accent" />
              <span className="text-[10px] uppercase tracking-wide font-medium">Sharpe Ratio</span>
            </div>
            <p className="font-mono-nums text-2xl font-bold text-market-text">
              {analysis.portfolioSharpe}
            </p>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${sharpeColor}`}>
              {sharpeLabel}
            </span>
            <p className="text-[10px] text-market-muted pt-1">Risk-adjusted returns (above 7.0% bond yield).</p>
          </div>

          <div className="space-y-1.5 border-r border-market-border/40 last:border-0 pr-4">
            <div className="flex items-center gap-2 text-market-muted">
              <Zap className="h-4 w-4 text-market-warning" />
              <span className="text-[10px] uppercase tracking-wide font-medium">Est. Volatility</span>
            </div>
            <p className="font-mono-nums text-2xl font-bold text-market-text">
              {analysis.portfolioVolatility}%
            </p>
            <p className="text-[10px] text-market-muted pt-4">Weighted estimated annual fluctuation.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-market-muted">
              <Percent className="h-4 w-4 text-market-up" />
              <span className="text-[10px] uppercase tracking-wide font-medium">Weighted Div. Yield</span>
            </div>
            <p className="font-mono-nums text-2xl font-bold text-market-text">
              {analysis.portfolioDividendYield}%
            </p>
            <p className="text-[10px] text-market-muted pt-4">Weighted portfolio cash flow from dividends.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CapSizeDistribution({ analysis }: { analysis: FullAnalysisType }) {
  return (
    <Card className="border border-market-border bg-market-card">
      <CardHeader className="border-b border-market-border">
        <CardTitle>Cap-Size Distribution</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-5">
          {/* Visual stacked bar */}
          <div className="h-5 w-full flex rounded-full overflow-hidden bg-market-surface shadow-inner border border-market-border/40">
            {analysis.capAllocation.large > 0 && (
              <div
                className="bg-market-up h-full transition-all duration-300 relative group"
                style={{ width: `${analysis.capAllocation.large}%` }}
              >
                <span className="sr-only">Large Cap: {analysis.capAllocation.large}%</span>
              </div>
            )}
            {analysis.capAllocation.mid > 0 && (
              <div
                className="bg-market-accent h-full transition-all duration-300 relative group"
                style={{ width: `${analysis.capAllocation.mid}%` }}
              >
                <span className="sr-only">Mid Cap: {analysis.capAllocation.mid}%</span>
              </div>
            )}
            {analysis.capAllocation.small > 0 && (
              <div
                className="bg-market-warning h-full transition-all duration-300 relative group"
                style={{ width: `${analysis.capAllocation.small}%` }}
              >
                <span className="sr-only">Small Cap: {analysis.capAllocation.small}%</span>
              </div>
            )}
          </div>

          {/* Legends */}
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="flex gap-3 items-start p-3 rounded-lg bg-market-surface/40 border border-market-border/30">
              <span className="h-3 w-3 rounded-full bg-market-up mt-1 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-market-text">Large Cap ({analysis.capAllocation.large}%)</h4>
                <p className="text-[10px] text-market-muted mt-0.5">Highly stable blue-chips (e.g. Reliance, HDFC, TCS).</p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-lg bg-market-surface/40 border border-market-border/30">
              <span className="h-3 w-3 rounded-full bg-market-accent mt-1 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-market-text">Mid Cap ({analysis.capAllocation.mid}%)</h4>
                <p className="text-[10px] text-market-muted mt-0.5">High growth potential, moderate volatility (e.g. Suzlon, BSE).</p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-lg bg-market-surface/40 border border-market-border/30">
              <span className="h-3 w-3 rounded-full bg-market-warning mt-1 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-market-text">Small Cap ({analysis.capAllocation.small}%)</h4>
                <p className="text-[10px] text-market-muted mt-0.5">Aggressive micro-caps, extreme risk/reward (e.g. Marksans).</p>
              </div>
            </div>
          </div>

          {/* Advisory block */}
          <div className="rounded-lg border border-market-border/60 bg-market-surface/20 p-4 text-xs text-market-muted leading-relaxed">
            {analysis.capAllocation.large < 50 ? (
              <p className="text-market-warning flex items-start gap-2">
                <Shield className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning: Aggressive Cap Mix.</strong> Large-cap exposure is currently under 50% ({analysis.capAllocation.large}%). While mid/small caps offer faster growth, they are prone to severe drawdowns (30-50%) in bear markets. Consider rebalancing to quality blue-chips.
                </span>
              </p>
            ) : analysis.capAllocation.large > 85 ? (
              <p className="text-market-accent flex items-start gap-2">
                <Shield className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip: Highly Conservative.</strong> Over 85% of your portfolio is in large-caps. For optimal long-term wealth compounding, retail investors can comfortably allocate 15-25% to high-growth mid-caps or small-caps.
                </span>
              </p>
            ) : (
              <p className="text-market-up flex items-start gap-2">
                <Shield className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Optimal Distribution!</strong> Your Cap-size allocation has a healthy large-cap foundation ({analysis.capAllocation.large}%) backed by mid/small cap growth drivers. This structure aligns with standard institutional recommendations for retail portfolios.
                </span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FullAnalysisView({ analysis }: FullAnalysisViewProps) {
  return (
    <div className="space-y-5">
      <PortfolioHealthMetrics analysis={analysis} />
      <RiskOverviewCards analysis={analysis} />
      <PortfolioRatiosGrid analysis={analysis} />
      <CapSizeDistribution analysis={analysis} />
      <StressTest holdings={analysis.holdings} totalValue={analysis.totalValue} />
    </div>
  );
}
