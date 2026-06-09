"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketItem {
  name: string;
  yahooSymbol?: string;
  kind?: string;
  value: number;
  change: number;
  up: boolean;
}

interface MarketNews {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

export function MarketOverview({
  onSelect,
}: {
  onSelect: (hit: { symbol: string; yahooSymbol: string; name: string; type: string; exchange: string }) => void;
}) {
  const [allIndices, setAllIndices] = useState<MarketItem[]>([]);
  const [etfs, setEtfs] = useState<MarketItem[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [marketRes, newsRes] = await Promise.all([
          fetch("/api/market"),
          fetch("/api/market/news?scope=market"),
        ]);

        if (marketRes.ok) {
          const data = await marketRes.json();
          setAllIndices(data.allIndices ?? []);
          setEtfs(data.etfs ?? []);
          setUpdatedAt(data.updatedAt);
        }

        if (newsRes.ok) {
          const data = await newsRes.json();
          setNews(data.news ?? []);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-market-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading live Indian market data…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-market-border">
            <CardTitle>All Indices</CardTitle>
            <p className="text-xs text-market-muted">
              Live NSE indices · {updatedAt ? new Date(updatedAt).toLocaleString("en-IN") : ""}
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4 sm:grid-cols-2">
            {allIndices.map((idx) => (
              <button
                key={idx.name}
                type="button"
                onClick={() =>
                  idx.yahooSymbol &&
                  onSelect({
                    symbol: idx.yahooSymbol.replace(/^\^/, "").replace(/\.(NS|BO)$/i, ""),
                    yahooSymbol: idx.yahooSymbol,
                    name: idx.name,
                    type: "INDEX",
                    exchange: "NSE",
                  })
                }
                className="rounded-md border border-market-border bg-market-surface p-3 text-left hover:border-market-up/50"
              >
                <p className="text-xs font-semibold text-market-text">{idx.name}</p>
                <p className="font-mono text-sm font-bold text-market-text">
                  {idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
                <p className={`flex items-center gap-1 text-xs ${idx.up ? "text-market-up" : "text-market-down"}`}>
                  {idx.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {idx.up ? "+" : ""}
                  {idx.change}%
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-market-border">
            <CardTitle>Popular ETFs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4 sm:grid-cols-2">
            {etfs.map((etf) => (
              <button
                key={etf.name}
                type="button"
                onClick={() =>
                  etf.yahooSymbol &&
                  onSelect({
                    symbol: etf.yahooSymbol.replace(/\.(NS|BO)$/i, ""),
                    yahooSymbol: etf.yahooSymbol,
                    name: etf.name,
                    type: "ETF",
                    exchange: "NSE",
                  })
                }
                className="w-full rounded-md border border-market-border bg-market-surface p-3 text-left hover:border-market-up/50"
              >
                <p className="text-xs font-semibold text-market-text">{etf.name}</p>
                <p className="font-mono text-sm font-bold text-market-text">
                  ₹{etf.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
                <p className={`flex items-center gap-1 text-xs ${etf.up ? "text-market-up" : "text-market-down"}`}>
                  {etf.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {etf.up ? "+" : ""}
                  {etf.change}%
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-market-border">
          <CardTitle>Indian Market News</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-market-border pt-0">
          {news.length === 0 ? (
            <p className="py-6 text-sm text-market-muted">No news available right now.</p>
          ) : (
            news.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 hover:text-market-up"
              >
                <p className="text-sm font-medium text-market-text">{item.title}</p>
                <p className="mt-1 text-xs text-market-muted">
                  {item.source} · {new Date(item.publishedAt).toLocaleDateString("en-IN")}
                </p>
              </a>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
