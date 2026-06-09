"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChart } from "./price-chart";
import type { SearchHit } from "./stock-search";

type ChartRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y";

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: "1d", label: "1D" },
  { value: "5d", label: "5D" },
  { value: "1mo", label: "1M" },
  { value: "3mo", label: "3M" },
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1Y" },
];

interface QuoteDetail {
  symbol: string;
  yahooSymbol: string;
  name: string;
  type: string;
  exchange: string;
  sector?: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  periodReturn: number | null;
  chartRange: ChartRange;
  indicators: {
    sma20: number | null;
    sma50: number | null;
    sma200: number | null;
    rsi14: number | null;
    trend: "bullish" | "neutral" | "bearish";
  };
  chart: Array<{ date: string; close: number; volume: number }>;
  updatedAt: string;
}

interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

interface StockDetailProps {
  selection: SearchHit | null;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-market-border bg-market-surface p-3">
      <p className="text-[10px] uppercase tracking-wide text-market-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-market-text">{value}</p>
    </div>
  );
}

export function StockDetail({ selection }: StockDetailProps) {
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>("1mo");

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
            `/api/market/quote?symbol=${encodeURIComponent(selected.yahooSymbol)}&range=${chartRange}`
          ),
          fetch(`/api/market/news?symbol=${encodeURIComponent(selected.symbol)}&scope=symbol`),
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
            Search for any NSE/BSE stock, index, or ETF to view live price, volume, and
            technical indicators.
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
          Loading live data for {selection.symbol}…
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
  const trendColor =
    quote.indicators.trend === "bullish"
      ? "text-market-up"
      : quote.indicators.trend === "bearish"
        ? "text-market-down"
        : "text-market-muted";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-market-border">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{quote.name}</CardTitle>
                <span className="rounded bg-market-card px-2 py-0.5 text-[10px] font-semibold uppercase text-market-muted">
                  {quote.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-market-muted">
                {quote.symbol} · {quote.exchange}
                {quote.sector ? ` · ${quote.sector}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-market-text">
                ₹{quote.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <p className={`flex items-center justify-end gap-1 text-sm font-medium ${up ? "text-market-up" : "text-market-down"}`}>
                {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                Today: {up ? "+" : ""}
                {quote.change.toFixed(2)} ({up ? "+" : ""}
                {quote.changePercent}%)
              </p>
              <p className="mt-1 text-[10px] text-market-muted">
                Updated {new Date(quote.updatedAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setChartRange(opt.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    chartRange === opt.value
                      ? "bg-market-up text-white"
                      : "border border-market-border bg-market-surface text-market-muted hover:text-market-text"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {quote.periodReturn != null && (
              <p
                className={`font-mono text-sm font-semibold ${
                  quote.periodReturn >= 0 ? "text-market-up" : "text-market-down"
                }`}
              >
                {RANGE_OPTIONS.find((r) => r.value === chartRange)?.label} return:{" "}
                {quote.periodReturn >= 0 ? "+" : ""}
                {quote.periodReturn}%
              </p>
            )}
          </div>

          <PriceChart data={quote.chart} positive={(quote.periodReturn ?? quote.changePercent) >= 0} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Day High" value={`₹${quote.dayHigh.toLocaleString("en-IN")}`} />
            <Metric label="Day Low" value={`₹${quote.dayLow.toLocaleString("en-IN")}`} />
            <Metric label="Volume" value={quote.volume.toLocaleString("en-IN")} />
            <Metric label="Prev Close" value={`₹${quote.previousClose.toLocaleString("en-IN")}`} />
            <Metric label="52W High" value={`₹${quote.fiftyTwoWeekHigh.toLocaleString("en-IN")}`} />
            <Metric label="52W Low" value={`₹${quote.fiftyTwoWeekLow.toLocaleString("en-IN")}`} />
            <Metric
              label="Trend"
              value={quote.indicators.trend.toUpperCase()}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-market-border">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-market-up" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="RSI (14)"
              value={quote.indicators.rsi14 != null ? String(quote.indicators.rsi14) : "N/A"}
            />
            <Metric
              label="SMA 20"
              value={quote.indicators.sma20 != null ? `₹${quote.indicators.sma20.toLocaleString("en-IN")}` : "N/A"}
            />
            <Metric
              label="SMA 50"
              value={quote.indicators.sma50 != null ? `₹${quote.indicators.sma50.toLocaleString("en-IN")}` : "N/A"}
            />
            <Metric
              label="SMA 200"
              value={quote.indicators.sma200 != null ? `₹${quote.indicators.sma200.toLocaleString("en-IN")}` : "N/A"}
            />
          </div>
          <p className={`mt-4 text-sm ${trendColor}`}>
            Signal: <span className="font-semibold capitalize">{quote.indicators.trend}</span>
            {quote.indicators.rsi14 != null && (
              <span className="text-market-muted">
                {" "}
                · RSI {quote.indicators.rsi14 > 70 ? "overbought" : quote.indicators.rsi14 < 30 ? "oversold" : "neutral"}
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {news.length > 0 && (
        <Card>
          <CardHeader className="border-b border-market-border">
            <CardTitle>Related News</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-market-border pt-0">
            {news.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 py-3 hover:text-market-up"
              >
                <div>
                  <p className="text-sm font-medium text-market-text">{item.title}</p>
                  <p className="mt-1 text-xs text-market-muted">
                    {item.source} · {new Date(item.publishedAt).toLocaleDateString("en-IN")}
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
