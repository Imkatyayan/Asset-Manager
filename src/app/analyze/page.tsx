"use client";

import { useState } from "react";
import { CsvUpload } from "@/components/analysis/csv-upload";
import { PortfolioSummary } from "@/components/analysis/portfolio-summary";
import { AllocationChart } from "@/components/analysis/allocation-chart";
import { BenchmarkComparison } from "@/components/analysis/benchmark-comparison";
import { HoldingsTable } from "@/components/analysis/holdings-table";
import { FullAnalysisView } from "@/components/analysis/full-analysis";
import { SuggestionsPanel } from "@/components/analysis/suggestions-panel";
import type { BasicAnalysis, FullAnalysis } from "@/lib/analysis";

interface AnalyzeResponse {
  tier: "basic" | "full";
  source: string;
  holdingsCount: number;
  analysis: BasicAnalysis | FullAnalysis;
  warnings?: string[];
  detectedColumns?: Record<string, string | null>;
}

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(csvContent: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent }),
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = data.detectedColumns
          ? ` Detected columns: ${Object.entries(data.detectedColumns)
              .filter(([, v]) => v)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ") || "none"}`
          : "";
        setError((data.error || "Analysis failed") + detail);
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to analyze. Please check your CSV and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 border-b border-market-border pb-4">
        <h1 className="text-xl font-bold text-market-text">Portfolio Analysis</h1>
        <p className="mt-1 text-sm text-market-muted">
          Import holdings · Compare vs NIFTY 50 & Sensex · Get allocation recommendations
        </p>
      </div>

      <CsvUpload onUpload={handleUpload} loading={loading} />

      {error && (
        <div className="mt-4 rounded-lg border border-market-down/30 bg-red-950/20 px-4 py-3 text-sm text-market-down">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-market-surface px-2.5 py-1 font-mono text-xs text-market-up">
              {result.holdingsCount} positions
            </span>
            <span className="rounded bg-market-surface px-2.5 py-1 text-xs text-market-muted">
              {result.source.toUpperCase()}
            </span>
            <span
              className={`rounded px-2.5 py-1 text-xs font-medium ${
                result.tier === "full"
                  ? "bg-emerald-900/30 text-market-up"
                  : "bg-amber-900/30 text-market-warning"
              }`}
            >
              {result.tier === "full" ? "PRO" : "FREE"} analysis
            </span>
          </div>

          <PortfolioSummary analysis={result.analysis} />

          <div className="grid gap-5 lg:grid-cols-2">
            <AllocationChart data={result.analysis.sectorAllocation} />
            <BenchmarkComparison data={result.analysis.benchmarkComparison} />
          </div>

          <SuggestionsPanel
            suggestions={result.analysis.suggestions}
            tier={result.tier === "full" ? "full" : "basic"}
          />

          <HoldingsTable
            holdings={result.analysis.holdings}
            showFundamentals={result.tier === "full"}
          />

          {result.tier === "full" && (
            <FullAnalysisView analysis={result.analysis as FullAnalysis} />
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="rounded-lg border border-market-warning/30 bg-amber-950/20 px-4 py-3 text-xs text-market-warning">
              {result.warnings.join(" · ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
