"use client";

import { Trophy, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import type { BenchmarkComparison as BenchmarkComparisonType } from "@/lib/analysis";

interface BenchmarkComparisonProps {
  data: BenchmarkComparisonType[];
}

export function BenchmarkComparison({ data }: BenchmarkComparisonProps) {
  return (
    <Card>
      <CardHeader className="border-b border-market-border">
        <CardTitle>vs Index Funds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {data.map((bench) => (
          <div key={bench.name} className="rounded-md border border-market-border bg-market-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {bench.outperforming ? (
                  <Trophy className="h-4 w-4 text-market-warning" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-market-down" />
                )}
                <span className="text-sm font-semibold text-market-text">{bench.name}</span>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  bench.outperforming
                    ? "bg-emerald-900/40 text-market-up"
                    : "bg-red-900/40 text-market-down"
                }`}
              >
                {bench.outperforming ? "Beat" : "Trail"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase text-market-muted">Portfolio</p>
                <p
                  className={`font-mono-nums text-sm font-bold ${
                    bench.portfolioReturn >= 0 ? "text-market-up" : "text-market-down"
                  }`}
                >
                  {formatPercent(bench.portfolioReturn)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-market-muted">Index</p>
                <p className="font-mono-nums text-sm font-bold text-market-text">
                  {formatPercent(bench.benchmarkReturn)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-market-muted">Alpha</p>
                <p
                  className={`font-mono-nums text-sm font-bold ${
                    bench.alpha >= 0 ? "text-market-up" : "text-market-down"
                  }`}
                >
                  {formatPercent(bench.alpha)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
