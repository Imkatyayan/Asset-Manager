"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Brain,
  Loader2,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ForensicAuditReport } from "@/lib/financial-forensics";
import type { ForwardForecastReport } from "@/lib/financial-forecasting";

interface ProIntelligenceData {
  isPro: boolean;
  userPlan?: string;
  authenticated?: boolean;
  symbol: string;
  name: string;
  forensic?: ForensicAuditReport;
  forecast?: ForwardForecastReport;
  preview?: {
    riskLevel: "LOW" | "MODERATE" | "HIGH";
    riskScore: number;
    integrityScore: number;
    totalChecksCount: number;
    flagsCount: number;
    dummyResultRiskSuspected: boolean;
    confidenceScore: number;
    growthTrajectory: string;
    nextQuarterLabel: string;
    teaserExecutiveSummary: string;
  };
}

interface StockProIntelligenceProps {
  symbol: string;
  name: string;
}

export function StockProIntelligence({ symbol, name }: StockProIntelligenceProps) {
  const [data, setData] = useState<ProIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"forensic" | "forecast">("forensic");
  const [forecastScenario, setForecastScenario] = useState<"base" | "bull" | "bear">("base");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/market/pro-analysis?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) {
        throw new Error("Failed to load Pro analysis");
      }
      const json: ProIntelligenceData = await res.json();
      setData(json);
    } catch {
      setError("Unable to compute Pro financial forensic & forecast intelligence");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleProPlan = async (targetPlan: "pro" | "free") => {
    setUpgrading(true);
    setUpgradeMsg(null);
    try {
      const res = await fetch("/api/user/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setUpgradeMsg(resData.error || "Failed to update membership");
        return;
      }
      setUpgradeMsg(resData.message);
      // Reload analysis with new plan
      startTransition(() => {
        loadData();
      });
      setTimeout(() => {
        if (targetPlan === "pro") setShowUpgradeModal(false);
      }, 1200);
    } catch {
      setUpgradeMsg("Network error updating membership status");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card className="market-panel border border-market-border">
        <CardContent className="flex items-center justify-center gap-3 py-14 text-market-muted">
          <Loader2 className="h-5 w-5 animate-spin text-market-up" />
          <span>Running Forensic Irregularity Audit & AI Forward Prediction for {symbol}…</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="market-panel border border-market-border">
        <CardContent className="py-8 text-center text-sm text-market-muted">
          {error || "No Pro analysis available"}
          <button
            onClick={loadData}
            className="mt-3 block mx-auto text-xs text-market-up hover:underline"
          >
            Retry analysis
          </button>
        </CardContent>
      </Card>
    );
  }

  const isPro = data.isPro;
  const forensic = data.forensic;
  const forecast = data.forecast;
  const preview = data.preview;

  return (
    <div className="space-y-4">
      {/* Section Header Card */}
      <Card className="market-panel border border-amber-500/30 bg-gradient-to-r from-market-surface via-market-surface to-amber-950/15">
        <CardHeader className="pb-3 border-b border-market-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold text-market-text">
                    Institutional Forensic & AI Predictive Suite
                  </CardTitle>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    PRO TIER
                  </span>
                </div>
                <p className="text-xs text-market-muted">
                  Forensic irregularity & dummy results scanner + forward quarterly AI forecast model for {name} ({symbol})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPro ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Pro Access Active
                  </span>
                  <button
                    onClick={() => handleToggleProPlan("free")}
                    title="Switch to Free view to test paywall preview"
                    className="text-[10px] text-market-muted hover:text-market-text underline"
                  >
                    View as Free
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Unlock Pro Features
                </button>
              )}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-market-border/40 pt-3">
            <button
              onClick={() => setActiveTab("forensic")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
                activeTab === "forensic"
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                  : "bg-market-surface border border-market-border text-market-muted hover:text-market-text"
              )}
            >
              <ShieldAlert className="h-4 w-4" />
              Financial Irregularity & Dummy Results Detector
              {forensic && forensic.riskScore > 35 && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("forecast")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
                activeTab === "forecast"
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                  : "bg-market-surface border border-market-border text-market-muted hover:text-market-text"
              )}
            >
              <Brain className="h-4 w-4" />
              AI Future Quarters Predictor
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* ======================================================== */}
          {/* FREE / PAYWALL RESTRICTED TEASER VIEW                    */}
          {/* ======================================================== */}
          {!isPro && preview && (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-market-surface/80 p-6 space-y-6">
              {/* Blurred background teaser simulation */}
              <div className="space-y-4 filter blur-[1.5px] pointer-events-none select-none opacity-40">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="h-24 rounded-lg bg-market-surface border border-market-border" />
                  <div className="h-24 rounded-lg bg-market-surface border border-market-border" />
                  <div className="h-24 rounded-lg bg-market-surface border border-market-border" />
                </div>
                <div className="h-32 rounded-lg bg-market-surface border border-market-border" />
                <div className="h-48 rounded-lg bg-market-surface border border-market-border" />
              </div>

              {/* Floating Overlay Paywall Banner */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-market-surface/90 backdrop-blur-sm p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-3">
                  <Lock className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-market-text">
                  Exclusive Paid Feature: Forensic Audit & Forward AI Predictions
                </h3>
                <p className="mt-2 max-w-xl text-xs sm:text-sm text-market-muted">
                  Protect your capital from dummy earnings, unearned margin spikes, and fake stock momentum.
                  Plus, get forward quarter projections generated by our predictive machine learning model.
                </p>

                {/* Teaser Insights Banner */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
                  <span className="rounded-full bg-market-surface px-3 py-1 border border-market-border text-market-muted">
                    Analyzed: <strong className="text-market-text">{preview.totalChecksCount} Forensic Tests</strong>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 border font-semibold",
                      preview.riskLevel === "LOW"
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                        : "bg-red-950/40 border-red-500/40 text-red-400"
                    )}
                  >
                    Risk Level: {preview.riskLevel} ({preview.flagsCount} Flags Found)
                  </span>
                  <span className="rounded-full bg-market-surface px-3 py-1 border border-market-border text-market-muted">
                    AI Projected: <strong className="text-market-text">{preview.nextQuarterLabel}</strong>
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Unlock className="h-4 w-4" />
                    Unlock Paid Access Now
                  </button>
                  <button
                    onClick={() => handleToggleProPlan("pro")}
                    disabled={upgrading}
                    className="flex items-center gap-1.5 rounded-lg border border-market-border bg-market-surface px-4 py-2.5 text-xs font-semibold text-market-muted hover:text-market-text hover:border-market-border/80 transition-colors"
                  >
                    {upgrading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-amber-400" />}
                    Instant 1-Click Pro Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: UNLOCKED FORENSIC IRREGULARITY & DUMMY RESULTS    */}
          {/* ======================================================== */}
          {isPro && activeTab === "forensic" && forensic && (
            <div className="space-y-5">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Integrity & Risk Score Card */}
                <div className="rounded-lg border border-market-border bg-market-surface/60 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-market-muted">
                      Forensic Integrity Score
                    </span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase border",
                        forensic.riskLevel === "LOW" && "bg-emerald-950/40 text-emerald-400 border-emerald-500/30",
                        forensic.riskLevel === "MODERATE" && "bg-amber-950/40 text-amber-400 border-amber-500/30",
                        forensic.riskLevel === "HIGH" && "bg-red-950/40 text-red-400 border-red-500/30"
                      )}
                    >
                      {forensic.riskLevel} RISK
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black text-market-text">
                      {forensic.integrityScore}
                    </span>
                    <span className="text-xs text-market-muted">/ 100</span>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-market-surface overflow-hidden relative border border-market-border/40">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        forensic.integrityScore >= 75 && "bg-emerald-400",
                        forensic.integrityScore >= 50 && forensic.integrityScore < 75 && "bg-amber-400",
                        forensic.integrityScore < 50 && "bg-red-500"
                      )}
                      style={{ width: `${Math.max(5, forensic.integrityScore)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-market-muted">
                    Calculated across margin stability, revenue accrual, non-operating income, and momentum correlation.
                  </p>
                </div>

                {/* Dummy Result & Momentum Hyping Card */}
                <div
                  className={cn(
                    "rounded-lg border p-4 flex flex-col justify-between",
                    forensic.dummyResultRisk.isSuspected
                      ? "border-red-500/40 bg-red-950/20"
                      : "border-emerald-500/30 bg-emerald-950/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {forensic.dummyResultRisk.isSuspected ? (
                      <ShieldAlert className="h-5 w-5 text-red-400" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    )}
                    <span className="text-xs font-bold text-market-text">
                      {forensic.dummyResultRisk.flagTitle}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-market-muted leading-relaxed">
                    {forensic.dummyResultRisk.verdict}
                  </p>
                  <div className="mt-3 text-[10px] font-semibold text-market-muted">
                    Status:{" "}
                    <span className={forensic.dummyResultRisk.isSuspected ? "text-red-400" : "text-emerald-400"}>
                      {forensic.dummyResultRisk.isSuspected ? "HIGH CAUTION" : "CLEAN AUDIT TRAIL"}
                    </span>
                  </div>
                </div>

                {/* Checks Breakdown Summary Card */}
                <div className="rounded-lg border border-market-border bg-market-surface/60 p-4 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-market-muted">
                    Audit Checks Summary
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-emerald-950/30 border border-emerald-500/20 p-2">
                      <p className="font-mono text-xl font-bold text-emerald-400">
                        {forensic.checks.filter((c) => c.status === "PASS").length}
                      </p>
                      <p className="text-[10px] text-market-muted">Passed</p>
                    </div>
                    <div className="rounded bg-amber-950/30 border border-amber-500/20 p-2">
                      <p className="font-mono text-xl font-bold text-amber-400">
                        {forensic.checks.filter((c) => c.status === "WARNING").length}
                      </p>
                      <p className="text-[10px] text-market-muted">Warnings</p>
                    </div>
                    <div className="rounded bg-red-950/30 border border-red-500/20 p-2">
                      <p className="font-mono text-xl font-bold text-red-400">
                        {forensic.checks.filter((c) => c.status === "CRITICAL").length}
                      </p>
                      <p className="text-[10px] text-market-muted">Critical</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-market-muted">
                    Automated forensic rules updated with latest quarterly filing.
                  </p>
                </div>
              </div>

              {/* Forensic Executive Narrative Banner */}
              <div className="rounded-lg border border-market-border/80 bg-market-surface/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-1">
                  Forensic Auditor Synthesis
                </p>
                <p className="text-xs sm:text-sm text-market-text leading-relaxed">
                  {forensic.summary}
                </p>
              </div>

              {/* Itemized Forensic Checks */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-market-muted">
                  Itemized Forensic Checks & Accounting Tests ({forensic.checks.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {forensic.checks.map((check) => (
                    <div
                      key={check.id}
                      className={cn(
                        "rounded-lg border p-3.5 space-y-2 transition-colors",
                        check.status === "PASS" && "border-market-border bg-market-surface/50",
                        check.status === "WARNING" && "border-amber-500/40 bg-amber-950/15",
                        check.status === "CRITICAL" && "border-red-500/40 bg-red-950/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {check.status === "PASS" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                          {check.status === "WARNING" && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
                          {check.status === "CRITICAL" && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                          <span className="font-semibold text-xs text-market-text">
                            {check.title}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0 border",
                            check.status === "PASS" && "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
                            check.status === "WARNING" && "bg-amber-950/50 text-amber-400 border-amber-500/30",
                            check.status === "CRITICAL" && "bg-red-950/50 text-red-400 border-red-500/30"
                          )}
                        >
                          {check.status}
                        </span>
                      </div>

                      <div className="rounded bg-market-surface/60 px-2.5 py-1.5 text-[11px] font-mono text-market-muted border border-market-border/40">
                        <span className="text-market-text font-bold">{check.metric}</span>
                      </div>

                      <p className="text-[11px] text-market-muted leading-relaxed">
                        {check.explanation}
                      </p>

                      <div className="border-t border-market-border/40 pt-1.5 text-[10px] text-market-muted">
                        <span className="font-semibold text-amber-400/90">Takeaway: </span>
                        {check.investorTakeaway}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: UNLOCKED AI FUTURE QUARTERS PREDICTIONS           */}
          {/* ======================================================== */}
          {isPro && activeTab === "forecast" && forecast && (
            <div className="space-y-5">
              {/* Header & Scenario Selection */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-market-border bg-market-surface/40 p-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-market-text">
                      Forward Trajectory: {forecast.growthTrajectory}
                    </span>
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      Confidence: {forecast.confidenceScore}% ({forecast.confidenceRating})
                    </span>
                  </div>
                  <p className="text-[11px] text-market-muted mt-0.5">
                    Modeled over {forecast.historicalBaseQuartersCount} past audited reporting periods
                  </p>
                </div>

                {/* Scenario Toggle */}
                <div className="flex items-center gap-1.5 rounded-lg border border-market-border bg-market-surface p-1">
                  <span className="text-[10px] font-semibold text-market-muted px-2">Scenario:</span>
                  {(["base", "bull", "bear"] as const).map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setForecastScenario(sc)}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-bold uppercase transition-colors",
                        forecastScenario === sc
                          ? sc === "bull"
                            ? "bg-emerald-500 text-slate-950"
                            : sc === "bear"
                            ? "bg-red-500 text-white"
                            : "bg-amber-500 text-slate-950"
                          : "text-market-muted hover:text-market-text"
                      )}
                    >
                      {sc} Case
                    </button>
                  ))}
                </div>
              </div>

              {/* Projected Quarters Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {forecast.projectedQuarters.map((q) => {
                  const dataForScenario =
                    forecastScenario === "bull"
                      ? q.bull
                      : forecastScenario === "bear"
                      ? q.bear
                      : q.base;

                  return (
                    <div
                      key={q.period}
                      className="rounded-lg border border-market-border bg-market-surface/60 p-3.5 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-market-border/60 pb-2">
                        <span className="font-bold text-xs text-market-text">
                          {q.period}
                        </span>
                        <span className="rounded bg-market-surface px-1.5 py-0.5 text-[9px] font-bold text-market-muted uppercase border border-market-border">
                          Q+{q.quarterIndex} Ahead
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] uppercase text-market-muted">Projected Sales</p>
                          <p className="font-mono text-base font-bold text-market-text">
                            ₹{dataForScenario.sales.toLocaleString("en-IN")} Cr
                          </p>
                          <p className="text-[10px] font-semibold text-market-up">
                            {q.base.yoySalesGrowth >= 0 ? "+" : ""}
                            {q.base.yoySalesGrowth}% YoY (Base)
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase text-market-muted">Projected Net Profit</p>
                          <p className="font-mono text-sm font-bold text-market-text">
                            ₹{dataForScenario.netProfit.toLocaleString("en-IN")} Cr
                          </p>
                        </div>

                        <div className="flex justify-between text-xs pt-1 border-t border-market-border/40">
                          <div>
                            <p className="text-[10px] uppercase text-market-muted">OPM %</p>
                            <p className="font-mono font-bold text-market-text">
                              {dataForScenario.opmPercent}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase text-market-muted">Proj. EPS</p>
                            <p className="font-mono font-bold text-market-text">
                              ₹{dataForScenario.eps}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Narrative & Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Executive Summary Card */}
                <div className="rounded-lg border border-market-border bg-market-surface/60 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Brain className="h-4 w-4" />
                    AI Model Forward Synthesis
                  </div>
                  <p className="text-xs sm:text-sm text-market-text leading-relaxed">
                    {forecast.executiveSummary}
                  </p>
                  <p className="text-xs text-market-muted pt-2 border-t border-market-border/40">
                    {forecast.seasonalityInsight}
                  </p>
                </div>

                {/* Catalysts & Risks */}
                <div className="rounded-lg border border-market-border bg-market-surface/60 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Forecast Catalysts & Drivers
                    </p>
                    <ul className="space-y-1 text-xs text-market-muted">
                      {forecast.keyCatalysts.map((cat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-market-border/40 pt-2">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Key Risk Headwinds to Monitor
                    </p>
                    <ul className="space-y-1 text-xs text-market-muted">
                      {forecast.keyRisks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Methodology Footer Note */}
              <div className="text-[10px] text-market-muted italic border-t border-market-border/40 pt-2">
                {forecast.modelMethodology}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* PRO UPGRADE MODAL                                        */}
      {/* ======================================================== */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-market-panel p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-market-border pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-market-text">
                  Unlock Institutional PRO Intelligence
                </h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-full p-1 text-market-muted hover:text-market-text"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-market-muted">
              Gain institutional-grade transparency to spot dummy quarterly results, avoid pump-and-dump traps,
              and stay quarters ahead with our predictive AI forecasting engine.
            </p>

            <div className="space-y-2 rounded-xl bg-market-surface/80 border border-market-border/60 p-4 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-market-text">Forensic Irregularity & Dummy Result Detector:</strong>
                  <p className="text-market-muted text-[11px]">
                    Automatic scanning for artificial margin spikes, other income pumps, and disconnected sales.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-market-text">AI Forward Quarter Predictions:</strong>
                  <p className="text-market-muted text-[11px]">
                    Projections for next 4 quarters (Sales, OPM, PAT, EPS) with Bull, Base, and Bear scenarios.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-market-text">Seasonality & Behavioral Indices:</strong>
                  <p className="text-market-muted text-[11px]">
                    Calibrated historical cycle analysis for Indian & global market earnings behavior.
                  </p>
                </div>
              </div>
            </div>

            {upgradeMsg && (
              <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-2.5 text-xs text-emerald-400 text-center font-semibold">
                {upgradeMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full sm:w-auto rounded-lg border border-market-border px-4 py-2 text-xs font-semibold text-market-muted hover:text-market-text"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleProPlan("pro")}
                disabled={upgrading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                Activate 1-Click Pro Membership
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
