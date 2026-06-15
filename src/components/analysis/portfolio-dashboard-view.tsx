"use client";

import { useState } from "react";
import { 
  PieChart, 
  Layers, 
  Lightbulb, 
  Share2
} from "lucide-react";
import { PortfolioSummary } from "./portfolio-summary";
import { AllocationChart } from "./allocation-chart";
import { BenchmarkComparison } from "./benchmark-comparison";
import { SuggestionsPanel } from "./suggestions-panel";
import { HoldingsTable } from "./holdings-table";
import { SIPTracker } from "./sip-tracker";
import { StressTest } from "./stress-test";
import { RebalanceSimulator } from "./rebalance-simulator";
import { PortfolioPrintReport } from "./portfolio-print-report";
import { 
  PortfolioHealthMetrics, 
  PortfolioRatiosGrid, 
  CapSizeDistribution, 
  RiskOverviewCards 
} from "./full-analysis";
import type { BasicAnalysis, FullAnalysis } from "@/lib/analysis";

interface PortfolioDashboardViewProps {
  analysis: BasicAnalysis | FullAnalysis;
  tier?: "basic" | "full";
  showSipTracker?: boolean;
}

type TabType = "overview" | "holdings" | "insights";

export function PortfolioDashboardView({ 
  analysis, 
  tier = "full", 
  showSipTracker = true 
}: PortfolioDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Define tabs configuration
  const tabs = [
    { 
      id: "overview" as const, 
      label: "Health & Overview", 
      icon: PieChart, 
      count: null 
    },
    { 
      id: "holdings" as const, 
      label: "Positions & SIP", 
      icon: Layers, 
      count: analysis.holdings.length 
    },
    { 
      id: "insights" as const, 
      label: "Recommendations & Risks", 
      icon: Lightbulb, 
      count: analysis.suggestions.length 
    },
  ];

  return (
    <>
      {/* 1. Printable Executive Report Component (Only visible on printed paper/PDF export) */}
      <PortfolioPrintReport 
        analysis={analysis} 
        tier={tier} 
        portfolioName={analysis.holdings.length > 0 ? `${analysis.holdings.length}-Position Allocation` : "My Portfolio"}
      />

      {/* 2. Standard Screen View Dashboard (Hidden when printed) */}
      <div className="space-y-6 print:hidden">
        {/* Summary Header Card (Always Visible for Core Context) */}
        <PortfolioSummary analysis={analysis} />

        {/* Action Header & Tabs Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 flex border border-market-border/60 bg-market-surface/40 p-1.5 rounded-xl backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 relative cursor-pointer ${
                    isActive
                      ? "bg-market-surface border border-market-border text-market-text shadow-md shadow-black/10"
                      : "text-market-muted hover:text-market-text hover:bg-market-surface/20"
                  }`}
                >
                  <Icon 
                    className={`h-4.5 w-4.5 transition-transform duration-300 ${
                      isActive ? "scale-110 text-market-up" : ""
                    }`} 
                  />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">
                    {tab.id === "overview" ? "Overview" : tab.id === "holdings" ? "Positions" : "Insights"}
                  </span>
                  
                  {tab.count !== null && (
                    <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold border transition-all duration-300 ${
                      isActive
                        ? "bg-market-up/10 text-market-up border-market-up/30 scale-105"
                        : "bg-market-surface border-market-border/40 text-market-muted"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-market-border bg-market-surface/80 text-xs font-semibold text-market-text hover:bg-market-surface hover:text-market-accent transition-all duration-300 shadow-md cursor-pointer shrink-0"
          >
            <Share2 className="h-4 w-4 text-market-accent" />
            <span>Export Health PDF</span>
          </button>
        </div>

        {/* Render Tab Contents with CSS Fade Animation */}
        <div key={activeTab} className="animate-fade-in-up space-y-5">
          {activeTab === "overview" && (
            <>
              <div className="grid gap-5 lg:grid-cols-2">
                <AllocationChart data={analysis.sectorAllocation} />
                <BenchmarkComparison data={analysis.benchmarkComparison} />
              </div>
              {tier === "full" && (
                <>
                  <PortfolioHealthMetrics analysis={analysis as FullAnalysis} />
                  <PortfolioRatiosGrid analysis={analysis as FullAnalysis} />
                  <CapSizeDistribution analysis={analysis as FullAnalysis} />
                </>
              )}
            </>
          )}

          {activeTab === "holdings" && (
            <>
              <HoldingsTable 
                holdings={analysis.holdings} 
                showFundamentals={tier === "full"} 
              />
              {showSipTracker && <SIPTracker holdings={analysis.holdings} />}
            </>
          )}

          {activeTab === "insights" && (
            <>
              <RebalanceSimulator 
                holdings={analysis.holdings} 
                tier={tier} 
              />
              <SuggestionsPanel 
                suggestions={analysis.suggestions} 
                tier={tier} 
              />
              {tier === "full" && (
                <>
                  <RiskOverviewCards analysis={analysis as FullAnalysis} />
                  <StressTest 
                    holdings={analysis.holdings} 
                    totalValue={analysis.totalValue} 
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
