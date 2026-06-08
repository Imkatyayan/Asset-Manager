"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { CsvUpload } from "@/components/analysis/csv-upload";
import { PortfolioSummary } from "@/components/analysis/portfolio-summary";
import { AllocationChart } from "@/components/analysis/allocation-chart";
import { BenchmarkComparison } from "@/components/analysis/benchmark-comparison";
import { HoldingsTable } from "@/components/analysis/holdings-table";
import { FullAnalysisView } from "@/components/analysis/full-analysis";
import { SuggestionsPanel } from "@/components/analysis/suggestions-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { FullAnalysis } from "@/lib/analysis";

export default function PortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [portfolioName, setPortfolioName] = useState("");
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleUpload(content: string) {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setSaved(false);
    setCsvContent(content);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: content }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }

      setAnalysis(data.analysis);
    } catch {
      setError("Failed to analyze portfolio.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!csvContent) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          name: portfolioName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError(data.error || "Failed to save");
        return;
      }

      setSaved(true);
      setAnalysis(data.analysis);
    } catch {
      setError("Failed to save portfolio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Manage Portfolio</h1>
        <p className="mt-1 text-text-secondary">
          Upload and save your holdings for ongoing tracking and analysis.
        </p>
      </div>

      <CsvUpload onUpload={handleUpload} loading={loading} />

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      {analysis && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    id="portfolio-name"
                    label="Portfolio Name (optional)"
                    placeholder="e.g. My Demat Holdings"
                    value={portfolioName}
                    onChange={(e) => setPortfolioName(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} disabled={saving || saved}>
                  <Save className="h-4 w-4" />
                  {saved ? "Saved!" : saving ? "Saving..." : "Save Portfolio"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <PortfolioSummary analysis={analysis} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AllocationChart data={analysis.sectorAllocation} />
            <BenchmarkComparison data={analysis.benchmarkComparison} />
          </div>

          <SuggestionsPanel suggestions={analysis.suggestions} tier="full" />

          <HoldingsTable holdings={analysis.holdings} showFundamentals />

          <FullAnalysisView analysis={analysis} />
        </div>
      )}
    </div>
  );
}
