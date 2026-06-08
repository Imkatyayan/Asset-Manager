"use client";

import {
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertTriangle,
  Minus,
  Lightbulb,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Suggestion } from "@/lib/analysis";

const suggestionIcons = {
  rebalance: Target,
  reduce: ArrowDownRight,
  increase: ArrowUpRight,
  diversify: Shield,
  review: AlertTriangle,
  hold: Minus,
};

const priorityColors = {
  high: "border-l-market-down bg-red-950/30",
  medium: "border-l-market-warning bg-amber-950/20",
  low: "border-l-market-up bg-emerald-950/20",
};

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  tier?: "basic" | "full";
}

export function SuggestionsPanel({ suggestions, tier = "basic" }: SuggestionsPanelProps) {
  return (
    <Card className="border-market-border bg-market-card">
      <CardHeader className="border-b border-market-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-market-warning" />
            <CardTitle>
              {tier === "full" ? "Smart Recommendations" : "Portfolio Recommendations"}
            </CardTitle>
          </div>
          {tier === "basic" && (
            <span className="rounded bg-market-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-market-muted">
              Free
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {suggestions.map((s, i) => {
          const Icon = suggestionIcons[s.type];
          return (
            <div
              key={i}
              className={`rounded-lg border-l-4 border border-market-border p-4 ${priorityColors[s.priority]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-market-muted" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-market-text">{s.title}</p>
                    {s.symbol && (
                      <span className="rounded bg-market-surface px-1.5 py-0.5 font-mono text-[10px] text-market-accent">
                        {s.symbol}
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                        s.priority === "high"
                          ? "bg-red-900/40 text-market-down"
                          : s.priority === "medium"
                          ? "bg-amber-900/40 text-market-warning"
                          : "bg-emerald-900/40 text-market-up"
                      }`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-market-muted leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {tier === "basic" && (
          <div className="rounded-lg border border-dashed border-market-border bg-market-surface/50 p-4 text-center">
            <Lock className="mx-auto h-5 w-5 text-market-muted" />
            <p className="mt-2 text-sm text-market-muted">
              Sign up for momentum scores, P/E analysis, and advanced rebalancing
            </p>
            <Link href="/signup" className="mt-3 inline-block">
              <Button size="sm" variant="secondary">
                Unlock Full Analysis
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
