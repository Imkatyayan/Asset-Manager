"use client";

import { Activity, Shield, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { FullAnalysis as FullAnalysisType } from "@/lib/analysis";

interface FullAnalysisViewProps {
  analysis: FullAnalysisType;
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
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

export function FullAnalysisView({ analysis }: FullAnalysisViewProps) {
  return (
    <div className="space-y-5">
      <Card>
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

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
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

        <Card>
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

        <Card>
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
    </div>
  );
}
