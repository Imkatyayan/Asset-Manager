"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Loader2,
  ExternalLink,
  DollarSign,
  Calendar,
  Shield,
  Gauge,
  Sliders,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChart } from "./price-chart";
import { StockProIntelligence } from "./stock-pro-intelligence";
import type { SearchHit } from "./stock-search";
import type { QuoteDetail } from "@/lib/yahoo-finance";
import { cn } from "@/lib/utils";

type ChartRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y" | "max";

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: "1d", label: "1D" },
  { value: "5d", label: "5D" },
  { value: "1mo", label: "1M" },
  { value: "3mo", label: "3M" },
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
  { value: "max", label: "All" },
];

interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

interface StockDetailProps {
  selection: SearchHit | null;
}

function Metric({
  label,
  value,
  subtext,
  highlight,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-lg border border-market-border bg-market-surface/60 p-3 transition-colors hover:border-market-border/80">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-market-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-sm sm:text-base font-bold text-market-text",
          highlight === "up" && "text-market-up",
          highlight === "down" && "text-market-down"
        )}
      >
        {value}
      </p>
      {subtext && (
        <p className="mt-0.5 text-[10px] text-market-muted">{subtext}</p>
      )}
    </div>
  );
}

export function StockDetail({ selection }: StockDetailProps) {
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>("1mo");
  const [financialTab, setFinancialTab] = useState<"quarters" | "annuals">("quarters");
  const [isStarred, setIsStarred] = useState(false);
  const [togglingStar, setTogglingStar] = useState(false);

  const checkStarredStatus = useCallback(async (sym: string) => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && Array.isArray(data.items)) {
          const found = data.items.some(
            (i: { symbol: string }) => i.symbol.toUpperCase() === sym.toUpperCase()
          );
          setIsStarred(found);
          return;
        }
      }
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("asset_manager_watchlist_guest");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setIsStarred(
              parsed.some(
                (i: { symbol: string }) => i.symbol.toUpperCase() === sym.toUpperCase()
              )
            );
            return;
          }
        }
      }
      setIsStarred(false);
    } catch {
      setIsStarred(false);
    }
  }, []);

  const handleToggleWatchlist = async () => {
    if (!quote) return;
    setTogglingStar(true);
    const sym = quote.symbol.toUpperCase();
    try {
      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: sym,
          yahooSymbol: quote.yahooSymbol,
          name: quote.name,
          exchange: quote.exchange,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsStarred(data.starred);
        window.dispatchEvent(new Event("watchlist-updated"));
      } else {
        const errData = await res.json();
        if (errData.authenticated === false && typeof window !== "undefined") {
          const local = localStorage.getItem("asset_manager_watchlist_guest");
          let list: Array<{
            id: string;
            symbol: string;
            yahooSymbol: string;
            name: string;
            exchange: string;
            price: number;
            change: number;
            changePercent: number;
          }> = [];
          if (local) {
            try {
              list = JSON.parse(local);
            } catch {
              list = [];
            }
          }
          const exists = list.some((i) => i.symbol.toUpperCase() === sym);
          if (exists) {
            list = list.filter((i) => i.symbol.toUpperCase() !== sym);
            setIsStarred(false);
          } else {
            list.unshift({
              id: `guest-${Date.now()}-${sym}`,
              symbol: sym,
              yahooSymbol: quote.yahooSymbol,
              name: quote.name,
              exchange: quote.exchange,
              price: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
            });
            setIsStarred(true);
          }
          localStorage.setItem("asset_manager_watchlist_guest", JSON.stringify(list));
          window.dispatchEvent(new Event("watchlist-updated"));
        }
      }
    } catch {
      // ignore
    } finally {
      setTogglingStar(false);
    }
  };

  useEffect(() => {
    if (selection) {
      checkStarredStatus(selection.symbol);
    }
    const handleSync = () => {
      if (selection) checkStarredStatus(selection.symbol);
    };
    window.addEventListener("watchlist-updated", handleSync);
    return () => window.removeEventListener("watchlist-updated", handleSync);
  }, [selection, checkStarredStatus]);

  useEffect(() => {
    if (!selection) {
      setQuote(null);
      setNews([]);
      return;
    }

    const selected = selection;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [quoteRes, newsRes] = await Promise.all([
          fetch(
            `/api/market/quote?symbol=${encodeURIComponent(
              selected.yahooSymbol
            )}&range=${chartRange}`
          ),
          fetch(
            `/api/market/news?symbol=${encodeURIComponent(
              selected.symbol
            )}&scope=symbol`
          ),
        ]);

        if (!quoteRes.ok) {
          setError("Could not load quote data");
          return;
        }

        const quoteData = await quoteRes.json();
        setQuote(quoteData.quote);

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setNews(newsData.news ?? []);
        }
      } catch {
        setError("Failed to load market data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selection, chartRange]);

  if (!selection) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <BarChart2 className="mx-auto h-10 w-10 text-market-muted" />
          <p className="mt-4 text-sm text-market-muted">
            Search for any NSE/BSE stock, index, or ETF to view live price,
            fundamentals, financial statements, and technical indicators.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16 text-market-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading live financial & market data for {selection.symbol}…
        </CardContent>
      </Card>
    );
  }

  if (error || !quote) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-market-down">
          {error || "No data available"}
        </CardContent>
      </Card>
    );
  }

  const up = quote.changePercent >= 0;
  const ind = quote.indicators;
  const fin = quote.financials;

  const quartersList = fin?.quarters ? [...fin.quarters].slice(-6) : [];
  const annualsList = fin?.annuals ? [...fin.annuals].slice(-6) : [];

  return (
    <div className="space-y-6">
      {/* Primary Price & Overview Card */}
      <Card className="market-panel border border-market-border">
        <CardHeader className="border-b border-market-border/80 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold tracking-tight">
                  {quote.name}
                </CardTitle>
                <span className="rounded bg-market-surface px-2 py-0.5 text-[10px] font-semibold uppercase text-market-muted border border-market-border/60">
                  {quote.type}
                </span>
                {fin?.pe && (
                  <span className="rounded bg-market-up/10 px-2 py-0.5 text-[10px] font-semibold text-market-up border border-market-up/20">
                    P/E {fin.pe}
                  </span>
                )}
                {/* Watchlist Star Button */}
                <button
                  type="button"
                  onClick={handleToggleWatchlist}
                  disabled={togglingStar}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all duration-150 ml-1",
                    isStarred
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                      : "bg-market-surface border-market-border text-market-muted hover:border-amber-400/60 hover:text-amber-300"
                  )}
                  title={isStarred ? "Starred in watchlist (click to remove)" : "Star and add to watchlist"}
                >
                  <Star className={cn("h-3.5 w-3.5", isStarred && "fill-amber-400 text-amber-400")} />
                  <span>{isStarred ? "Starred" : "Watchlist"}</span>
                </button>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-market-muted">
                {quote.symbol} · {quote.exchange}
                {quote.sector ? ` · ${quote.sector}` : ""}
              </p>
            </div>

            <div className="text-right">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-market-text">
                ₹{quote.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <p
                className={cn(
                  "flex items-center justify-end gap-1 text-sm font-semibold mt-0.5",
                  up ? "text-market-up" : "text-market-down"
                )}
              >
                {up ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {up ? "+" : ""}
                {quote.change.toFixed(2)} ({up ? "+" : ""}
                {quote.changePercent}%)
              </p>
              <p className="mt-1 text-[10px] text-market-muted">
                Updated {new Date(quote.updatedAt).toLocaleTimeString("en-IN")}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {/* Chart Range Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setChartRange(opt.value)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                    chartRange === opt.value
                      ? "bg-market-up text-white shadow-sm"
                      : "border border-market-border bg-market-surface text-market-muted hover:text-market-text"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {quote.periodReturn != null && (
              <p
                className={cn(
                  "font-mono text-xs sm:text-sm font-bold",
                  quote.periodReturn >= 0 ? "text-market-up" : "text-market-down"
                )}
              >
                {RANGE_OPTIONS.find((r) => r.value === chartRange)?.label} return:{" "}
                {quote.periodReturn >= 0 ? "+" : ""}
                {quote.periodReturn}%
              </p>
            )}
          </div>

          {/* Price Chart */}
          <PriceChart
            data={quote.chart}
            positive={(quote.periodReturn ?? quote.changePercent) >= 0}
          />

          {/* Quick Intraday & 52W Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Metric
              label="Day Range"
              value={`₹${quote.dayLow.toLocaleString("en-IN")} - ₹${quote.dayHigh.toLocaleString("en-IN")}`}
            />
            <Metric
              label="52W High / Low"
              value={`₹${quote.fiftyTwoWeekHigh.toLocaleString("en-IN")} / ₹${quote.fiftyTwoWeekLow.toLocaleString("en-IN")}`}
            />
            <Metric
              label="Volume"
              value={quote.volume.toLocaleString("en-IN")}
              subtext="Regular shares traded"
            />
            <Metric
              label="Prev Close"
              value={`₹${quote.previousClose.toLocaleString("en-IN")}`}
            />
          </div>

          {/* 52-Week Range Position Progress Bar */}
          {ind.range52WeekPercent != null && (
            <div className="rounded-lg border border-market-border/60 bg-market-surface/40 p-3 space-y-1.5">
              <div className="flex justify-between text-xs text-market-muted">
                <span>52W Low: ₹{quote.fiftyTwoWeekLow}</span>
                <span className="font-semibold text-market-text">
                  52-Week Position: {ind.range52WeekPercent}%
                </span>
                <span>52W High: ₹{quote.fiftyTwoWeekHigh}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-market-surface overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-market-down via-amber-400 to-market-up transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, ind.range52WeekPercent))}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financials & Valuation Ratios Section */}
      <Card className="market-panel border border-market-border">
        <CardHeader className="border-b border-market-border/80">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-market-text">
            <DollarSign className="h-4 w-4 text-market-up" />
            Key Financial Ratios & Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric
              label="P/E Ratio"
              value={fin?.pe != null ? String(fin.pe) : "N/A"}
              subtext="Price to Earnings"
              highlight={fin?.pe && fin.pe < 25 ? "up" : undefined}
            />
            <Metric
              label="P/B Ratio"
              value={fin?.pb != null ? String(fin.pb) : "N/A"}
              subtext="Price to Book Value"
            />
            <Metric
              label="Return on Equity (ROE)"
              value={fin?.roe != null ? `${fin.roe}%` : "N/A"}
              subtext="Capital profitability"
              highlight={fin?.roe && fin.roe > 15 ? "up" : undefined}
            />
            <Metric
              label="Debt / Equity"
              value={fin?.debtToEquity != null ? String(fin.debtToEquity) : "N/A"}
              subtext="Solvency leverage"
              highlight={fin?.debtToEquity != null && fin.debtToEquity < 0.5 ? "up" : undefined}
            />
            <Metric
              label="Market Cap"
              value={
                fin?.marketCap != null
                  ? `₹${fin.marketCap.toLocaleString("en-IN")} Cr`
                  : "N/A"
              }
              subtext="Total company valuation"
            />
            <Metric
              label="Dividend Yield"
              value={fin?.dividendYield != null ? `${fin.dividendYield}%` : "N/A"}
              subtext="Annual cash return"
            />
            <Metric
              label="Book Value / Share"
              value={fin?.bookValue != null ? `₹${fin.bookValue}` : "N/A"}
              subtext="Net asset value"
            />
            <Metric
              label="Est. EPS"
              value={fin?.eps != null ? `₹${fin.eps}` : "N/A"}
              subtext="Earnings per share"
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Results Table (Quarters vs Annuals) */}
      {(quartersList.length > 0 || annualsList.length > 0) && (
        <Card className="market-panel border border-market-border">
          <CardHeader className="border-b border-market-border/80 flex flex-row items-center justify-between py-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-market-text">
              <Calendar className="h-4 w-4 text-market-up" />
              Financial Performance Results
            </CardTitle>

            <div className="flex rounded-lg border border-market-border bg-market-surface p-0.5">
              <button
                type="button"
                onClick={() => setFinancialTab("quarters")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                  financialTab === "quarters"
                    ? "bg-market-card text-market-up shadow-sm"
                    : "text-market-muted hover:text-market-text"
                )}
              >
                Quarter Results
              </button>
              <button
                type="button"
                onClick={() => setFinancialTab("annuals")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                  financialTab === "annuals"
                    ? "bg-market-card text-market-up shadow-sm"
                    : "text-market-muted hover:text-market-text"
                )}
              >
                Yearly Results (P&L)
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-4 overflow-x-auto">
            {financialTab === "quarters" ? (
              quartersList.length > 0 ? (
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-market-border/80 text-[11px] font-semibold uppercase tracking-wider text-market-muted">
                      <th className="py-2.5 pr-4">Quarter</th>
                      <th className="py-2.5 px-3 text-right">Revenue (₹ Cr)</th>
                      <th className="py-2.5 px-3 text-right">OPM %</th>
                      <th className="py-2.5 px-3 text-right">Net Profit (₹ Cr)</th>
                      <th className="py-2.5 pl-3 text-right">EPS (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-market-border/40 font-mono">
                    {quartersList.map((q, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-market-surface/40 transition-colors"
                      >
                        <td className="py-2.5 pr-4 font-sans font-medium text-market-text">
                          {q.period}
                        </td>
                        <td className="py-2.5 px-3 text-right text-market-text">
                          ₹{q.sales.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-right text-market-muted">
                          {q.opmPercent}%
                        </td>
                        <td
                          className={cn(
                            "py-2.5 px-3 text-right font-semibold",
                            q.netProfit >= 0 ? "text-market-up" : "text-market-down"
                          )}
                        >
                          ₹{q.netProfit.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 pl-3 text-right text-market-text">
                          ₹{q.eps}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-8 text-center text-xs text-market-muted">
                  No quarterly reports available for this security.
                </p>
              )
            ) : annualsList.length > 0 ? (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-market-border/80 text-[11px] font-semibold uppercase tracking-wider text-market-muted">
                    <th className="py-2.5 pr-4">Fiscal Year</th>
                    <th className="py-2.5 px-3 text-right">Sales (₹ Cr)</th>
                    <th className="py-2.5 px-3 text-right">Operating Margin</th>
                    <th className="py-2.5 px-3 text-right">Net Profit (₹ Cr)</th>
                    <th className="py-2.5 pl-3 text-right">EPS (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-market-border/40 font-mono">
                  {annualsList.map((a, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-market-surface/40 transition-colors"
                    >
                      <td className="py-2.5 pr-4 font-sans font-medium text-market-text">
                        {a.period}
                      </td>
                      <td className="py-2.5 px-3 text-right text-market-text">
                        ₹{a.sales.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right text-market-muted">
                        {a.opmPercent}%
                      </td>
                      <td
                        className={cn(
                          "py-2.5 px-3 text-right font-semibold",
                          a.netProfit >= 0 ? "text-market-up" : "text-market-down"
                        )}
                      >
                        ₹{a.netProfit.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 pl-3 text-right text-market-text">
                        ₹{a.eps}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-8 text-center text-xs text-market-muted">
                No annual financial statements available for this security.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Institutional Forensic Irregularity Audit & Forward AI Forecast (PRO Feature) */}
      <StockProIntelligence symbol={quote.symbol} name={quote.name} />

      {/* Advanced Technical Indicators Section */}
      <Card className="market-panel border border-market-border">
        <CardHeader className="border-b border-market-border/80">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-market-text">
            <Activity className="h-4 w-4 text-market-up" />
            Advanced Technical Indicators & Oscillators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">
          {/* Signal Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-market-border/60 bg-market-surface/40 p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-market-muted">Overall Technical Bias:</span>
              <span
                className={cn(
                  "font-bold uppercase tracking-wide text-xs px-2.5 py-0.5 rounded-full border",
                  ind.trend === "bullish"
                    ? "bg-market-up/10 text-market-up border-market-up/30"
                    : ind.trend === "bearish"
                    ? "bg-market-down/10 text-market-down border-market-down/30"
                    : "bg-market-surface text-market-muted border-market-border"
                )}
              >
                {ind.trend}
              </span>
            </div>

            {ind.macd && (
              <div className="text-xs flex items-center gap-1.5 text-market-muted">
                <span>MACD Crossover:</span>
                <span
                  className={cn(
                    "font-semibold capitalize",
                    ind.macd.crossover === "bullish"
                      ? "text-market-up"
                      : ind.macd.crossover === "bearish"
                      ? "text-market-down"
                      : "text-market-muted"
                  )}
                >
                  {ind.macd.crossover}
                </span>
              </div>
            )}
          </div>

          {/* Core Moving Averages & RSI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric
              label="RSI (14)"
              value={ind.rsi14 != null ? String(ind.rsi14) : "N/A"}
              subtext={
                ind.rsi14 != null
                  ? ind.rsi14 > 70
                    ? "Overbought (>70)"
                    : ind.rsi14 < 30
                    ? "Oversold (<30)"
                    : "Neutral zone"
                  : undefined
              }
              highlight={
                ind.rsi14 != null && ind.rsi14 < 35
                  ? "up"
                  : ind.rsi14 != null && ind.rsi14 > 65
                  ? "down"
                  : undefined
              }
            />
            <Metric
              label="SMA 20"
              value={ind.sma20 != null ? `₹${ind.sma20.toLocaleString("en-IN")}` : "N/A"}
              subtext="Short-term trend"
            />
            <Metric
              label="SMA 50 (50 DMA)"
              value={ind.sma50 != null ? `₹${ind.sma50.toLocaleString("en-IN")}` : "N/A"}
              subtext={
                ind.distanceFrom50Dma != null
                  ? `${ind.distanceFrom50Dma >= 0 ? "+" : ""}${ind.distanceFrom50Dma}% from price`
                  : undefined
              }
              highlight={
                ind.distanceFrom50Dma != null
                  ? ind.distanceFrom50Dma >= 0
                    ? "up"
                    : "down"
                  : undefined
              }
            />
            <Metric
              label="SMA 200 (200 DMA)"
              value={
                ind.sma200 != null ? `₹${ind.sma200.toLocaleString("en-IN")}` : "N/A"
              }
              subtext={
                ind.distanceFrom200Dma != null
                  ? `${ind.distanceFrom200Dma >= 0 ? "+" : ""}${ind.distanceFrom200Dma}% from price`
                  : "Long-term trendline"
              }
              highlight={
                ind.distanceFrom200Dma != null
                  ? ind.distanceFrom200Dma >= 0
                    ? "up"
                    : "down"
                  : undefined
              }
            />
          </div>

          {/* MACD & Bollinger Bands Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MACD Box */}
            <div className="rounded-xl border border-market-border bg-market-surface/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-market-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-market-text flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-market-up" />
                  MACD (12, 26, 9)
                </span>
                {ind.macd && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded border",
                      ind.macd.histogram >= 0
                        ? "bg-market-up/10 text-market-up border-market-up/20"
                        : "bg-market-down/10 text-market-down border-market-down/20"
                    )}
                  >
                    Histogram: {ind.macd.histogram > 0 ? "+" : ""}
                    {ind.macd.histogram}
                  </span>
                )}
              </div>

              {ind.macd ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-market-card border border-market-border/40">
                    <p className="text-[10px] text-market-muted uppercase">MACD Line</p>
                    <p className="font-mono text-sm font-semibold text-market-text">
                      {ind.macd.macd}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-market-card border border-market-border/40">
                    <p className="text-[10px] text-market-muted uppercase">Signal Line</p>
                    <p className="font-mono text-sm font-semibold text-market-text">
                      {ind.macd.signal}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-market-card border border-market-border/40">
                    <p className="text-[10px] text-market-muted uppercase">Momentum</p>
                    <p
                      className={cn(
                        "font-mono text-sm font-bold capitalize",
                        ind.macd.histogram >= 0 ? "text-market-up" : "text-market-down"
                      )}
                    >
                      {ind.macd.histogram >= 0 ? "Bullish" : "Bearish"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-market-muted py-2">
                  Calculating MACD indicators...
                </p>
              )}
            </div>

            {/* Bollinger Bands Box */}
            <div className="rounded-xl border border-market-border bg-market-surface/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-market-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-market-text flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-blue-400" />
                  Bollinger Bands (20, 2)
                </span>
                {ind.bollinger && (
                  <span className="text-[10px] font-semibold text-market-muted">
                    Bandwidth: {ind.bollinger.bandwidth}%
                  </span>
                )}
              </div>

              {ind.bollinger ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-market-card border border-market-border/40">
                    <p className="text-[10px] text-market-muted uppercase">Upper Band</p>
                    <p className="font-mono text-sm font-semibold text-market-down">
                      ₹{ind.bollinger.upper}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-market-card border border-market-border/40">
                    <p className="text-[10px] text-market-muted uppercase">Middle (SMA 20)</p>
                    <p className="font-mono text-sm font-semibold text-market-text">
                      ₹{ind.bollinger.middle}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-market-card border border-market-border/40">
                    <p className="text-[10px] text-market-muted uppercase">Lower Band</p>
                    <p className="font-mono text-sm font-semibold text-market-up">
                      ₹{ind.bollinger.lower}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-market-muted py-2">
                  Calculating Bollinger Bands...
                </p>
              )}
            </div>
          </div>

          {/* Classical Pivot Points (Support & Resistance) */}
          {ind.pivots && (
            <div className="rounded-xl border border-market-border bg-market-surface/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-market-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-market-text flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  Classical Intraday Pivot Points (Support & Resistance)
                </span>
                <span className="text-[10px] text-market-muted">
                  Daily Pivot Targets
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center font-mono">
                <div className="p-2 rounded bg-market-card border border-market-border/40">
                  <p className="text-[10px] font-sans font-bold text-market-down">R2</p>
                  <p className="text-xs sm:text-sm font-semibold text-market-text">
                    ₹{ind.pivots.r2}
                  </p>
                </div>
                <div className="p-2 rounded bg-market-card border border-market-border/40">
                  <p className="text-[10px] font-sans font-bold text-red-400">R1</p>
                  <p className="text-xs sm:text-sm font-semibold text-market-text">
                    ₹{ind.pivots.r1}
                  </p>
                </div>
                <div className="p-2 rounded bg-market-surface border border-market-accent/30 shadow-sm">
                  <p className="text-[10px] font-sans font-bold text-market-accent">Pivot (P)</p>
                  <p className="text-xs sm:text-sm font-bold text-market-text">
                    ₹{ind.pivots.pivot}
                  </p>
                </div>
                <div className="p-2 rounded bg-market-card border border-market-border/40">
                  <p className="text-[10px] font-sans font-bold text-emerald-400">S1</p>
                  <p className="text-xs sm:text-sm font-semibold text-market-text">
                    ₹{ind.pivots.s1}
                  </p>
                </div>
                <div className="p-2 rounded bg-market-card border border-market-border/40">
                  <p className="text-[10px] font-sans font-bold text-market-up">S2</p>
                  <p className="text-xs sm:text-sm font-semibold text-market-text">
                    ₹{ind.pivots.s2}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related News Card */}
      {news.length > 0 && (
        <Card className="market-panel border border-market-border">
          <CardHeader className="border-b border-market-border/80">
            <CardTitle className="text-base font-bold text-market-text">
              Related News & Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-market-border/40 pt-0">
            {news.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 py-3 hover:text-market-up transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-market-text">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-market-muted">
                    {item.source} ·{" "}
                    {new Date(item.publishedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-market-muted" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
