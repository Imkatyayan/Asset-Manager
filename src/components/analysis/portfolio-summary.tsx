"use client";

import { TrendingUp, TrendingDown, Wallet, IndianRupee } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { BasicAnalysis } from "@/lib/analysis";

interface PortfolioSummaryProps {
  analysis: BasicAnalysis;
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
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="market-panel p-4"
        >
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
    </div>
  );
}
