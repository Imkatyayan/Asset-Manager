"use client";

import { TrendingUp, TrendingDown, Wallet, IndianRupee, HeartPulse } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { BasicAnalysis } from "@/lib/analysis";

interface PortfolioSummaryProps {
  analysis: BasicAnalysis;
}

function HealthScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "#00C076" : score >= 40 ? "#F59E0B" : "#FF5252";
  const label =
    score >= 70 ? "Healthy" : score >= 40 ? "Fair" : "Needs Review";

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#2A2E39" strokeWidth="4" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono-nums text-xs font-bold text-market-text">{score}</span>
        </div>
      </div>
      <div>
        <p className="font-mono-nums text-lg font-bold text-market-text" style={{ color }}>
          {label}
        </p>
        <p className="text-[10px] text-market-muted">Portfolio Health Score</p>
      </div>
    </div>
  );
}

export function PortfolioSummary({ analysis }: PortfolioSummaryProps) {
  const isPositive = analysis.totalReturns >= 0;

  const stats = [
    {
      label: "Current Value",
      value: formatCurrency(analysis.totalValue),
      sub: null,
      icon: Wallet,
      accent: "text-market-accent",
    },
    {
      label: "Invested",
      value: formatCurrency(analysis.totalInvested),
      sub: null,
      icon: IndianRupee,
      accent: "text-market-muted",
    },
    {
      label: "P&L",
      value: formatCurrency(analysis.totalReturns),
      sub: formatPercent(analysis.totalReturnsPercent),
      icon: isPositive ? TrendingUp : TrendingDown,
      accent: isPositive ? "text-market-up" : "text-market-down",
      positive: isPositive,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="market-panel p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-market-muted">
                {stat.label}
              </p>
              <p className="mt-1 font-mono-nums text-2xl font-bold text-market-text">
                {stat.value}
              </p>
              {stat.sub && (
                <p className={`mt-0.5 font-mono-nums text-sm font-semibold ${stat.accent}`}>
                  {stat.sub}
                </p>
              )}
            </div>
            <stat.icon className={`h-5 w-5 ${stat.accent}`} />
          </div>
        </div>
      ))}

      {/* Portfolio Health Score Card */}
      <div className="market-panel p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-market-muted">
            Portfolio Health
          </p>
          <HeartPulse className="h-5 w-5 text-market-muted" />
        </div>
        <HealthScoreRing score={analysis.healthScore} />
        <p className="mt-2 text-[9px] text-market-muted/70 leading-tight">
          Based on diversification, concentration risk, P&amp;L health &amp; recommendation signals.
        </p>
      </div>
    </div>
  );
}
