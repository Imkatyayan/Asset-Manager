"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Star,
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  ExternalLink,
  ArrowUpDown,
  Loader2,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SearchHit } from "./stock-search";
import { toYahooSymbol } from "@/lib/yahoo-finance";

export interface WatchlistStockItem {
  id: string;
  symbol: string;
  yahooSymbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  pe?: number | null;
  sector?: string | null;
  marketCap?: number | null;
  targetPrice?: number | null;
  notes?: string | null;
  isTargetReached?: boolean;
}

interface StockWatchlistProps {
  onSelect: (hit: SearchHit) => void;
  activeSymbol?: string | null;
}

const LOCAL_STORAGE_KEY = "asset_manager_watchlist_guest";
const MAX_CAPACITY = 50;

export function StockWatchlist({ onSelect, activeSymbol }: StockWatchlistProps) {
  const [items, setItems] = useState<WatchlistStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newSymbolInput, setNewSymbolInput] = useState("");
  const [addingSymbol, setAddingSymbol] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "gainers" | "losers" | "price" | "name">("recent");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load watchlist items from API or localStorage
  const loadWatchlist = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.authenticated ?? false);
        if (data.authenticated) {
          setItems(data.items ?? []);
          setLoading(false);
          return;
        }
      }

      // Guest fallback: load from localStorage
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setItems(Array.isArray(parsed) ? parsed : []);
          } catch {
            setItems([]);
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();

    // Listen to cross-component updates (e.g. starring from StockDetail)
    const handleSync = () => {
      loadWatchlist();
    };
    window.addEventListener("watchlist-updated", handleSync);
    return () => window.removeEventListener("watchlist-updated", handleSync);
  }, [loadWatchlist]);

  // Direct add symbol from input
  const handleAddDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbolInput.trim().toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
    if (!sym) return;

    if (items.some((i) => i.symbol.toUpperCase() === sym)) {
      setAddError(`${sym} is already in your watchlist.`);
      return;
    }

    if (items.length >= MAX_CAPACITY) {
      setAddError(`Watchlist capacity limit reached (${MAX_CAPACITY} stocks).`);
      return;
    }

    setAddingSymbol(true);
    setAddError(null);

    const yahooSymbol = toYahooSymbol(sym);

    if (isAuthenticated) {
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: sym, yahooSymbol, name: sym }),
        });
        const resData = await res.json();
        if (!res.ok) {
          setAddError(resData.error || "Failed to add stock");
          return;
        }
        setNewSymbolInput("");
        await loadWatchlist();
        window.dispatchEvent(new Event("watchlist-updated"));
      } catch {
        setAddError("Network error adding stock");
      } finally {
        setAddingSymbol(false);
      }
    } else {
      // Guest local storage add
      const newItem: WatchlistStockItem = {
        id: `guest-${Date.now()}-${sym}`,
        symbol: sym,
        yahooSymbol,
        name: sym,
        exchange: "NSE",
        price: 0,
        change: 0,
        changePercent: 0,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setNewSymbolInput("");
      setAddingSymbol(false);
      window.dispatchEvent(new Event("watchlist-updated"));
    }
  };

  // Remove item
  const handleRemove = async (symbol: string, id: string) => {
    const cleanSym = symbol.toUpperCase();
    if (isAuthenticated) {
      try {
        await fetch(`/api/watchlist?symbol=${encodeURIComponent(cleanSym)}`, {
          method: "DELETE",
        });
        setItems((prev) => prev.filter((i) => i.symbol.toUpperCase() !== cleanSym));
        window.dispatchEvent(new Event("watchlist-updated"));
      } catch {
        // error handling
      }
    } else {
      const updated = items.filter((i) => i.symbol.toUpperCase() !== cleanSym && i.id !== id);
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("watchlist-updated"));
    }
  };

  // Filtered & Sorted items
  const displayItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.symbol.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.sector?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "gainers") return b.changePercent - a.changePercent;
      if (sortBy === "losers") return a.changePercent - b.changePercent;
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "name") return a.symbol.localeCompare(b.symbol);
      return 0; // recent order preserved
    });

    return result;
  }, [items, searchQuery, sortBy]);

  return (
    <Card className="market-panel border border-market-border">
      <CardHeader className="border-b border-market-border/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-market-text">
                  Stock Watchlist & Quick Reference
                </CardTitle>
                <span className="rounded-full bg-market-surface border border-market-border px-2 py-0.5 text-[10px] font-mono font-semibold text-market-muted">
                  {items.length} / {MAX_CAPACITY} Stocks
                </span>
              </div>
              <p className="text-xs text-market-muted">
                Star stocks for 1-click inspection, quick target price tracking, and live updates
              </p>
            </div>
          </div>

          {/* Quick Direct Add Input & Collapse Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center gap-1 rounded-md border border-market-border bg-market-surface px-2.5 py-1.5 text-xs font-semibold text-market-muted hover:text-market-text hover:border-market-border/80 transition-colors"
                title={isCollapsed ? "Expand to view full grid" : "Collapse to compact header ticker"}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>View All ({items.length})</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Compact Ticker</span>
                  </>
                )}
              </button>
            )}

            <form onSubmit={handleAddDirect} className="flex items-center gap-1.5">
              <div className="relative w-36 sm:w-44">
                <input
                  type="text"
                  value={newSymbolInput}
                  onChange={(e) => {
                    setNewSymbolInput(e.target.value);
                    setAddError(null);
                  }}
                  placeholder="Add symbol (e.g. INFY)…"
                  className="w-full rounded-md border border-market-border bg-market-surface px-2.5 py-1.5 text-xs text-market-text placeholder:text-market-muted focus:border-market-up focus:outline-none uppercase font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={addingSymbol || !newSymbolInput.trim()}
                className="flex items-center gap-1 rounded-md bg-market-up/20 border border-market-up/40 px-3 py-1.5 text-xs font-semibold text-market-up hover:bg-market-up hover:text-white transition-colors disabled:opacity-50"
              >
                {addingSymbol ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {addError && (
          <p className="mt-2 text-xs text-market-down font-medium">{addError}</p>
        )}

        {/* Filter and Sorting Bar (only in expanded mode) */}
        {!isCollapsed && items.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-market-border/40">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-market-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter watchlist stocks…"
                className="w-full rounded-md border border-market-border bg-market-surface/60 pl-8 pr-2.5 py-1 text-xs text-market-text placeholder:text-market-muted focus:border-market-up focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-market-muted flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Sort:
              </span>
              {(
                [
                  { key: "recent", label: "Recent" },
                  { key: "gainers", label: "Top Gainers" },
                  { key: "losers", label: "Top Losers" },
                  { key: "price", label: "Price" },
                  { key: "name", label: "A-Z" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                    sortBy === opt.key
                      ? "bg-market-surface border border-market-border/80 text-market-text font-bold"
                      : "text-market-muted hover:text-market-text"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-market-muted">
            <Loader2 className="h-4 w-4 animate-spin text-market-up" />
            Loading your watchlist…
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <Bookmark className="mx-auto h-7 w-7 text-market-muted/60" />
            <p className="text-xs text-market-muted max-w-sm mx-auto">
              Your watchlist is empty. Star any stock from the search bar below or type a symbol above to build your 25–50 stock monitoring list.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS"].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setNewSymbolInput(sample);
                  }}
                  className="rounded-full border border-market-border bg-market-surface px-2.5 py-0.5 text-[10px] text-market-muted hover:border-amber-400 hover:text-amber-400 transition-colors"
                >
                  + {sample}
                </button>
              ))}
            </div>
          </div>
        ) : isCollapsed ? (
          /* Compact Header Ticker Strip */
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {items.map((item) => {
              const isSelected = activeSymbol?.toUpperCase() === item.symbol.toUpperCase();
              const up = item.changePercent >= 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onSelect({
                      symbol: item.symbol,
                      yahooSymbol: item.yahooSymbol,
                      name: item.name,
                      type: "EQUITY",
                      exchange: item.exchange,
                    })
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono shrink-0 transition-all hover:border-market-up/60 hover:bg-market-surface",
                    isSelected
                      ? "border-market-up/80 bg-market-surface text-market-text ring-1 ring-market-up/30 font-bold"
                      : "border-market-border bg-market-surface/40 text-market-muted hover:text-market-text"
                  )}
                >
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-market-text">{item.symbol}</span>
                  {item.price > 0 && (
                    <span>₹{item.price.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                  )}
                  {item.price > 0 && (
                    <span className={cn("text-[10px] font-semibold", up ? "text-market-up" : "text-market-down")}>
                      {up ? "+" : ""}{item.changePercent.toFixed(1)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {displayItems.map((item) => {
              const isSelected = activeSymbol?.toUpperCase() === item.symbol.toUpperCase();
              const up = item.changePercent >= 0;

              return (
                <div
                  key={item.id}
                  onClick={() =>
                    onSelect({
                      symbol: item.symbol,
                      yahooSymbol: item.yahooSymbol,
                      name: item.name,
                      type: "EQUITY",
                      exchange: item.exchange,
                    })
                  }
                  className={cn(
                    "group relative cursor-pointer rounded-lg border p-3 transition-all duration-150 hover:border-market-border/90 hover:bg-market-surface/80 flex flex-col justify-between space-y-2",
                    isSelected
                      ? "border-market-up/60 bg-market-surface shadow-sm ring-1 ring-market-up/20"
                      : "border-market-border/60 bg-market-surface/40"
                  )}
                >
                  {/* Top line: Symbol, Exchange & Star removal */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-market-text group-hover:text-market-up transition-colors truncate">
                          {item.symbol}
                        </span>
                        <span className="rounded bg-market-surface px-1 py-0.2 text-[9px] font-semibold text-market-muted border border-market-border/60 uppercase">
                          {item.exchange}
                        </span>
                        {item.isTargetReached && (
                          <span className="flex items-center gap-0.5 rounded bg-emerald-950/40 text-[9px] font-semibold text-emerald-400 border border-emerald-500/30 px-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Target Met
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-market-muted truncate mt-0.5">
                        {item.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.symbol, item.id);
                        }}
                        title="Remove from watchlist"
                        className="rounded p-1 text-amber-400 hover:text-red-400 hover:bg-market-surface/90 transition-colors"
                      >
                        <Star className="h-4 w-4 fill-amber-400 hover:fill-none" />
                      </button>
                    </div>
                  </div>

                  {/* Middle: Price & Today's Change */}
                  <div className="flex items-baseline justify-between pt-1 border-t border-market-border/40">
                    <div>
                      <p className="font-mono text-base font-bold text-market-text">
                        {item.price > 0
                          ? `₹${item.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                          : "Inspect →"}
                      </p>
                    </div>

                    {item.price > 0 && (
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs font-mono font-semibold",
                          up ? "text-market-up" : "text-market-down"
                        )}
                      >
                        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>
                          {up ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Sector / P/E / Target Note */}
                  <div className="flex items-center justify-between text-[10px] text-market-muted pt-0.5">
                    <span>{item.sector || "Equity"}</span>
                    {item.pe != null && item.pe > 0 && <span>P/E {item.pe.toFixed(1)}</span>}
                    <span className="text-[10px] text-market-up group-hover:underline flex items-center gap-0.5">
                      Open <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
