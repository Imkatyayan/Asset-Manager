"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { CsvUpload } from "@/components/analysis/csv-upload";
import { PortfolioSummary } from "@/components/analysis/portfolio-summary";
import { AllocationChart } from "@/components/analysis/allocation-chart";
import { BenchmarkComparison } from "@/components/analysis/benchmark-comparison";
import { HoldingsTable } from "@/components/analysis/holdings-table";
import { FullAnalysisView } from "@/components/analysis/full-analysis";
import { SuggestionsPanel } from "@/components/analysis/suggestions-panel";
import { Button } from "@/components/ui/button";
import type { FullAnalysis } from "@/lib/analysis";
import {
  loadAnalysisSession,
  saveAnalysisSession,
  type StoredAnalysisResult,
} from "@/lib/analysis-session";

interface AnalyzeWorkspaceProps {
  isAuthenticated: boolean;
}

export function AnalyzeWorkspace({ isAuthenticated }: AnalyzeWorkspaceProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<StoredAnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedToDashboard, setSavedToDashboard] = useState(false);

  useEffect(() => {
    const stored = loadAnalysisSession();
    if (stored) {
      setResult(stored.result);
      setFileName(stored.fileName);
    }
  }, []);

  const saveToDashboard = useCallback(async () => {
    if (!isAuthenticated || !csvContent || !fileName) return;

    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent, fileName }),
      });

      if (res.ok) {
        setSavedToDashboard(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save to dashboard");
      }
    } catch {
      setError("Failed to save to dashboard. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, csvContent, fileName]);

  async function handleUpload(content: string, uploadedFileName: string) {
    setLoading(true);
    setError(null);
    setSavedToDashboard(false);
    setCsvContent(content);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: content }),
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

      const analysisResult: StoredAnalysisResult = {
        tier: data.tier,
        source: data.source,
        holdingsCount: data.holdingsCount,
        analysis: data.analysis,
        warnings: data.warnings,
        detectedColumns: data.detectedColumns,
      };

      setResult(analysisResult);
      setFileName(uploadedFileName);
      saveAnalysisSession({
        fileName: uploadedFileName,
        result: analysisResult,
        savedAt: Date.now(),
      });
    } catch {
      setError("Failed to analyze. Please check your CSV and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CsvUpload onUpload={handleUpload} loading={loading} initialFileName={fileName} />

      {error && (
        <div className="mt-4 rounded-lg border border-market-down/30 bg-red-950/20 px-4 py-3 text-sm text-market-down">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
              {savedToDashboard && (
                <span className="flex items-center gap-1 rounded bg-emerald-900/30 px-2.5 py-1 text-xs font-medium text-market-up">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved to dashboard
                </span>
              )}
            </div>

            {isAuthenticated && !savedToDashboard && (
              <Button
                onClick={saveToDashboard}
                disabled={saving}
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
              >
                {saving ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    Save to Dashboard
                  </>
                )}
              </Button>
            )}
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
    </>
  );
}