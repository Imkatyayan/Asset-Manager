"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { EnrichedHolding } from "@/lib/analysis";
import { ShieldAlert, TrendingDown, AlertTriangle } from "lucide-react";

interface StressTestProps {
  holdings: EnrichedHolding[];
  totalValue: number;
}

interface Scenario {
  id: string;
  name: string;
  period: string;
  indexDrawdown: number; // negative percentage e.g. -38
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "trump2026",
    name: "Trump Tariffs Shock",
    period: "Jan – Feb 2026",
    indexDrawdown: -10,
    description:
      "Universal tariff threats in early 2026 sparked global trade war fears and emerging market currency volatility, correcting NIFTY by 10%.",
    color: "text-orange-400",
    bgColor: "bg-orange-950/20",
    borderColor: "border-orange-900/40",
  },
  {
    id: "israeliran2024",
    name: "Israel-Iran Escalation",
    period: "Apr – Oct 2024",
    indexDrawdown: -7,
    description:
      "Direct military exchanges between Israel and Iran triggered crude oil price spikes and a flight-to-safety correction of 7% in Indian equities.",
    color: "text-amber-400",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-900/40",
  },
  {
    id: "budget2024",
    name: "Budget 2024 Tax Shock",
    period: "Jul 2024",
    indexDrawdown: -6,
    description:
      "Union Budget 2024 increased LTCG tax from 10% to 12.5% and STCG tax to 15%, triggering a sudden 6% intraday plunge before rapid retail-driven recovery.",
    color: "text-amber-400",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-900/40",
  },
  {
    id: "russiaukraine2022",
    name: "Russia-Ukraine War Shock",
    period: "Feb – Jun 2022",
    indexDrawdown: -15,
    description:
      "The outbreak of the Russia-Ukraine war spiked Brent crude to $130/bbl, driving severe domestic inflation fears and a 15% NIFTY drawdown.",
    color: "text-orange-400",
    bgColor: "bg-orange-950/20",
    borderColor: "border-orange-900/40",
  },
  {
    id: "fii2022",
    name: "2022 FII Outflow Cycle",
    period: "Oct 2021 – Jun 2022",
    indexDrawdown: -17,
    description:
      "Rising inflation and interest rate tightening triggered massive, continuous FII outflows. NIFTY corrected 17% over a prolonged 9 months.",
    color: "text-orange-400",
    bgColor: "bg-orange-950/20",
    borderColor: "border-orange-900/40",
  },
  {
    id: "covid-w2",
    name: "COVID Wave 2 (Delta)",
    period: "Mar – Apr 2021",
    indexDrawdown: -11,
    description:
      "A devastating second wave of COVID-19 led to state-level lockdowns and healthcare stress. NIFTY faced brief volatility, dropping 11% before a major rally.",
    color: "text-amber-400",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-900/40",
  },
  {
    id: "covid",
    name: "COVID-19 Crash (Wave 1)",
    period: "Feb – Mar 2020",
    indexDrawdown: -38,
    description:
      "Global pandemic lockdown announcement triggered one of the swiftest and steepest market crashes in history. NIFTY 50 fell 38% in 40 days.",
    color: "text-red-400",
    bgColor: "bg-red-950/20",
    borderColor: "border-red-900/40",
  },
  {
    id: "ilfs",
    name: "IL&FS NBFC Crisis",
    period: "Sep – Oct 2018",
    indexDrawdown: -16,
    description:
      "Default of infrastructure financier IL&FS caused a systemic liquidity squeeze across shadow banks (NBFCs), triggering a 16% crash, worst in mid/small caps.",
    color: "text-orange-400",
    bgColor: "bg-orange-950/20",
    borderColor: "border-orange-900/40",
  },
  {
    id: "demonetisation",
    name: "Demonetisation Shock",
    period: "Nov – Dec 2016",
    indexDrawdown: -10,
    description:
      "Sudden withdrawal of 86% of cash currency in circulation disrupted cash-reliant supply chains. Consumer sectors dragged NIFTY down by 10%.",
    color: "text-amber-400",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-900/40",
  },
  {
    id: "gfc",
    name: "2008 Financial Crisis",
    period: "Jan – Dec 2008",
    indexDrawdown: -52,
    description:
      "Global financial meltdown triggered by the US subprime crisis and Lehman Brothers collapse. NIFTY crashed 52% in 12 months as foreign liquidity dried up.",
    color: "text-red-400",
    bgColor: "bg-red-950/20",
    borderColor: "border-red-900/40",
  },
  {
    id: "911",
    name: "9/11 Terror Shock",
    period: "Sep 2001",
    indexDrawdown: -15,
    description:
      "World Trade Center attacks caused global market closures and risk-off panic. NIFTY dropped 15% in two weeks before bottoming out.",
    color: "text-amber-400",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-900/40",
  },
  {
    id: "dotcom",
    name: "Dot-com Bust",
    period: "Feb 2000 – Sep 2001",
    indexDrawdown: -40,
    description:
      "Global tech bubble burst. Exorbitant IT valuations crashed, resulting in a structural 40% correction for the Indian benchmark index.",
    color: "text-red-400",
    bgColor: "bg-red-950/20",
    borderColor: "border-red-900/40",
  },
  {
    id: "kargil",
    name: "Kargil War Conflict",
    period: "May – Jul 1999",
    indexDrawdown: -16,
    description:
      "Military conflict between India and Pakistan in Kashmir created geopolitical fears. NIFTY corrected 16% but fully recovered before the war ended.",
    color: "text-amber-400",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-900/40",
  },
  {
    id: "gulfwar",
    name: "1990 Gulf War Shock",
    period: "Aug – Oct 1990",
    indexDrawdown: -20,
    description:
      "Iraq's invasion of Kuwait spiked crude oil prices and triggered a balance of payments crisis in India. BSE Sensex corrected around 20% in response.",
    color: "text-orange-400",
    bgColor: "bg-orange-950/20",
    borderColor: "border-orange-900/40",
  },
  {
    id: "hormuz",
    name: "Strait of Hormuz Blockade",
    period: "Geopolitical Risk",
    indexDrawdown: -22,
    description:
      "A blockade of the Strait of Hormuz disrupting 20% of global oil supply. Would cause severe crude spike, rupee crash, and high inflation. Estimated NIFTY fall ~22%.",
    color: "text-red-400",
    bgColor: "bg-red-950/20",
    borderColor: "border-red-900/40",
  },
];

function computeStockDrawdown(h: EnrichedHolding, scenarioDrawdown: number): number {
  const beta = h.fundamentals?.beta ?? 1.0;
  return Math.max(-99, scenarioDrawdown * beta);
}

interface ScenarioResult {
  portfolioDrawdown: number;
  estimatedLoss: number;
  worstHoldings: { symbol: string; drawdown: number; loss: number }[];
  resilienceScore: number; // 0-100: how much better than raw index
}

function computeScenarioResult(
  holdings: EnrichedHolding[],
  totalValue: number,
  scenarioDrawdown: number
): ScenarioResult {
  if (holdings.length === 0) {
    return {
      portfolioDrawdown: 0,
      estimatedLoss: 0,
      worstHoldings: [],
      resilienceScore: 100,
    };
  }

  const stockResults = holdings.map((h) => {
    const drawdown = computeStockDrawdown(h, scenarioDrawdown);
    const loss = (h.currentValue * drawdown) / 100;
    return { symbol: h.symbol, drawdown, loss, weight: h.weight };
  });

  const portfolioDrawdown =
    stockResults.reduce((sum, s) => sum + (s.drawdown * s.weight) / 100, 0);

  const estimatedLoss = (totalValue * portfolioDrawdown) / 100;

  const worstHoldings = [...stockResults]
    .sort((a, b) => a.drawdown - b.drawdown)
    .slice(0, 3)
    .map(({ symbol, drawdown, loss }) => ({ symbol, drawdown, loss }));

  // Resilience: if portfolio drops less than index, it's resilient
  const resilienceScore = Math.round(
    Math.min(100, Math.max(0, ((scenarioDrawdown - portfolioDrawdown) / Math.abs(scenarioDrawdown)) * 50 + 50))
  );

  return {
    portfolioDrawdown: Math.round(portfolioDrawdown * 10) / 10,
    estimatedLoss: Math.round(estimatedLoss),
    worstHoldings,
    resilienceScore,
  };
}

export function StressTest({ holdings, totalValue }: StressTestProps) {
  const [activeScenario, setActiveScenario] = useState<string>("covid");

  const scenario = SCENARIOS.find((s) => s.id === activeScenario)!;
  const result = computeScenarioResult(holdings, totalValue, scenario.indexDrawdown);

  const resilienceLabel =
    result.resilienceScore >= 70
      ? "Resilient"
      : result.resilienceScore >= 45
      ? "Moderate"
      : "Vulnerable";
  const resilienceColor =
    result.resilienceScore >= 70
      ? "text-market-up"
      : result.resilienceScore >= 45
      ? "text-amber-400"
      : "text-market-down";

  return (
    <Card className="border border-market-border bg-market-card animate-fade-in-up">
      <CardHeader className="border-b border-market-border px-5 py-4">
        <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-market-down" />
          Portfolio Stress Test
        </CardTitle>
        <p className="text-[11px] text-market-muted normal-case mt-0.5 font-normal">
          Simulates your portfolio&apos;s estimated drawdown under historical and hypothetical market crash
          scenarios using each stock&apos;s beta coefficient.
        </p>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Scenario Selector */}
        <div className="flex gap-2 overflow-x-auto pb-3 pt-1 select-none flex-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-market-border/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-market-border">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`rounded-lg border px-3 py-2 text-left shrink-0 transition-all duration-200 cursor-pointer ${
                activeScenario === s.id
                  ? `${s.bgColor} ${s.borderColor} ${s.color}`
                  : "bg-market-surface/40 border-market-border/40 text-market-muted hover:border-market-border/80"
              }`}
            >
              <p className="text-[11px] font-semibold whitespace-nowrap">{s.name}</p>
              <p className="text-[10px] opacity-70 whitespace-nowrap">{s.period}</p>
            </button>
          ))}
        </div>

        {/* Active Scenario Details */}
        <div className={`rounded-lg border p-4 ${scenario.bgColor} ${scenario.borderColor}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className={`text-sm font-bold ${scenario.color}`}>{scenario.name}</p>
              <p className="text-[11px] text-market-muted mt-1 max-w-xl">{scenario.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-market-muted uppercase tracking-wider">Index Fall</p>
              <p className={`font-mono-nums text-2xl font-bold ${scenario.color}`}>
                {scenario.indexDrawdown}%
              </p>
            </div>
          </div>
        </div>

        {/* Impact Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Portfolio Drawdown */}
          <div className="rounded-lg border border-market-border/50 bg-market-card/50 p-4">
            <p className="text-[10px] text-market-muted uppercase tracking-wider mb-1">
              Portfolio Drawdown
            </p>
            <p className="font-mono-nums text-2xl font-bold text-market-down">
              {result.portfolioDrawdown}%
            </p>
            <p className="text-[9px] text-market-muted/70 mt-1">
              vs index {scenario.indexDrawdown}%
            </p>
          </div>

          {/* Estimated Loss */}
          <div className="rounded-lg border border-market-border/50 bg-market-card/50 p-4">
            <p className="text-[10px] text-market-muted uppercase tracking-wider mb-1">
              Estimated Loss
            </p>
            <p className="font-mono-nums text-2xl font-bold text-market-down">
              {formatCurrency(result.estimatedLoss)}
            </p>
            <p className="text-[9px] text-market-muted/70 mt-1">
              From current ₹{Math.round(totalValue / 1000)}K value
            </p>
          </div>

          {/* Surviving Value */}
          <div className="rounded-lg border border-market-border/50 bg-market-card/50 p-4">
            <p className="text-[10px] text-market-muted uppercase tracking-wider mb-1">
              Surviving Value
            </p>
            <p className="font-mono-nums text-2xl font-bold text-market-text">
              {formatCurrency(totalValue + result.estimatedLoss)}
            </p>
            <p className="text-[9px] text-market-muted/70 mt-1">Post-crash estimated value</p>
          </div>

          {/* Resilience Score */}
          <div
            className={`rounded-lg border p-4 ${
              result.resilienceScore >= 70
                ? "border-emerald-900/40 bg-emerald-950/10"
                : result.resilienceScore >= 45
                ? "border-amber-900/40 bg-amber-950/10"
                : "border-red-900/40 bg-red-950/10"
            }`}
          >
            <p className="text-[10px] text-market-muted uppercase tracking-wider mb-1">
              Resilience
            </p>
            <p className={`font-mono-nums text-2xl font-bold ${resilienceColor}`}>
              {result.resilienceScore}/100
            </p>
            <p className={`text-[9px] font-semibold mt-1 ${resilienceColor}`}>
              {resilienceLabel}
            </p>
          </div>
        </div>

        {/* Worst Hit Stocks */}
        <div>
          <p className="text-[10px] text-market-muted uppercase tracking-wider mb-2">
            Top 3 Most Impacted Holdings
          </p>
          <div className="space-y-2">
            {result.worstHoldings.map((w) => (
              <div
                key={w.symbol}
                className="flex items-center justify-between rounded border border-market-border/30 bg-market-surface/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-market-down" />
                  <span className="text-sm font-semibold text-market-text">{w.symbol}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono-nums text-sm font-bold text-market-down">
                    {w.drawdown.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-market-muted ml-2">
                    (~{formatCurrency(w.loss)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded border border-market-border/30 bg-market-surface/20 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-market-muted" />
          <p className="text-[10px] text-market-muted/70 leading-relaxed">
            Stress test uses each stock&apos;s beta coefficient to estimate proportional drawdown.
            Simulated drawdown = scenario index fall × stock beta. Actual results during a crisis
            may differ due to sector-specific dynamics, liquidity events, and correlation
            breakdowns. For informational purposes only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
