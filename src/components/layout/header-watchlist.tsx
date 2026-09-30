"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Star,
  Plus,
  TrendingUp,
  TrendingDown,
  Loader2,
  ExternalLink,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WatchlistStockItem } from "@/components/markets/stock-watchlist";
import { toYahooSymbol } from "@/lib/yahoo-finance";

const LOCAL_STORAGE_KEY = "asset_manager_watchlist_guest";
const MAX_CAPACITY = 50;

export function HeaderWatchlist() {
  const [items, setItems] = useState<WatchlistStockItem[]>([]);
  const [open, setOpen] = useState(false);
  const [newSym, setNewSym] = useState("");
  const [adding, setAdding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isWatchlistPage = pathname === "/watchlist";

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.authenticated ?? false);
        if (data.authenticated) {
          setItems(data.items ?? []);
          return;
        }
      }

      // Guest fallback
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
      // ignore
    }
  }, []);

  useEffect(() => {
    loadItems();

    const handleSync = () => loadItems();
    window.addEventListener("watchlist-updated", handleSync);
    return () => window.removeEventListener("watchlist-updated", handleSync);
  }, [loadItems]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDirectAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSym.trim().toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
    if (!sym) return;

    if (items.some((i) => i.symbol.toUpperCase() === sym)) {
      setNewSym("");
      return;
    }

    if (items.length >= MAX_CAPACITY) return;

    setAdding(true);
    const yahooSymbol = toYahooSymbol(sym);

    if (isAuthenticated) {
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: sym, yahooSymbol, name: sym }),
        });
        if (res.ok) {
          setNewSym("");
          await loadItems();
          window.dispatchEvent(new Event("watchlist-updated"));
        }
      } catch {
        // ignore
      } finally {
        setAdding(false);
      }
    } else {
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
      setNewSym("");
      setAdding(false);
      window.dispatchEvent(new Event("watchlist-updated"));
    }
  };

  const handleRemove = async (sym: string, id: string) => {
    const cleanSym = sym.toUpperCase();
    if (isAuthenticated) {
      try {
        await fetch(`/api/watchlist?symbol=${encodeURIComponent(cleanSym)}`, {
          method: "DELETE",
        });
        setItems((prev) => prev.filter((i) => i.symbol.toUpperCase() !== cleanSym));
        window.dispatchEvent(new Event("watchlist-updated"));
      } catch {
        // ignore
      }
    } else {
      const updated = items.filter((i) => i.symbol.toUpperCase() !== cleanSym && i.id !== id);
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("watchlist-updated"));
    }
  };

  const handleStockClick = (symbol: string) => {
    setOpen(false);
    router.push(`/markets?symbol=${encodeURIComponent(symbol)}`);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Header Button next to Markets / Support */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
          open || isWatchlistPage
            ? "bg-market-card text-amber-400 border border-amber-500/40 font-semibold"
            : "text-market-muted hover:bg-market-card hover:text-market-text hover:scale-[1.01]"
        )}
        title="Quick Watchlist & Starred Stocks"
      >
        <Star className={cn("h-3.5 w-3.5 transition-colors", items.length > 0 ? "fill-amber-400 text-amber-400" : "text-market-muted")} />
        <span>Watchlist</span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold border transition-colors",
            items.length > 0
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-market-surface text-market-muted border-market-border"
          )}
        >
          {items.length}
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform text-market-muted", open && "rotate-180")} />
      </button>

      {/* Flyout Quick Watchlist Dropdown */}
      {open && (
        <div className="absolute left-0 sm:left-0 z-50 mt-2 w-80 sm:w-96 rounded-xl border border-market-border bg-market-card shadow-2xl shadow-black/70 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-market-border px-4 py-3 bg-market-surface">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/15 border border-amber-500/30">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-market-text tracking-wide">
                Starred Watchlist <span className="text-amber-400 font-mono">({items.length}/{MAX_CAPACITY})</span>
              </span>
            </div>

            <Link
              href="/watchlist"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-market-up hover:underline flex items-center gap-1"
            >
              Full Workspace <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleDirectAdd} className="flex items-center gap-2 p-3 border-b border-market-border bg-market-surface">
            <input
              type="text"
              value={newSym}
              onChange={(e) => setNewSym(e.target.value)}
              placeholder="Add stock (e.g. INFY, TCS, RELIANCE)…"
              className="flex-1 rounded-md border border-market-border bg-market-card px-3 py-1.5 text-xs text-market-text placeholder:text-market-muted focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30 uppercase font-mono"
            />
            <button
              type="submit"
              disabled={adding || !newSym.trim() || items.length >= MAX_CAPACITY}
              className="flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              <span>Add</span>
            </button>
          </form>

          {/* Scrollable Stock List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-market-border bg-market-card">
            {items.length === 0 ? (
              <div className="py-10 text-center px-4 bg-market-card">
                <Star className="mx-auto h-7 w-7 text-market-muted/30 mb-2" />
                <p className="text-xs font-medium text-market-text">No starred stocks yet</p>
                <p className="text-[11px] text-market-muted mt-1 max-w-[240px] mx-auto">
                  Type a ticker above or click the ⭐ on any stock in Markets to track it here.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const up = item.changePercent >= 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleStockClick(item.symbol)}
                    className="flex items-center justify-between px-4 py-2.5 bg-market-card hover:bg-market-surface cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-market-text group-hover:text-amber-400 transition-colors">
                          {item.symbol}
                        </span>
                        <span className="rounded bg-market-surface px-1.5 py-0.5 text-[9px] font-semibold text-market-muted uppercase border border-market-border">
                          {item.exchange}
                        </span>
                      </div>
                      <p className="text-[11px] text-market-muted truncate max-w-[160px] mt-0.5">
                        {item.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono">
                        <p className="text-xs font-bold text-market-text">
                          {item.price > 0
                            ? `₹${item.price.toLocaleString("en-IN", { maximumFractionDigits: 1 })}`
                            : "—"}
                        </p>
                        {item.price > 0 && (
                          <p
                            className={cn(
                              "text-[10px] font-semibold flex items-center justify-end gap-0.5",
                              up ? "text-market-up" : "text-market-down"
                            )}
                          >
                            {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                            {up ? "+" : ""}
                            {item.changePercent.toFixed(1)}%
                          </p>
                        )}
                      </div>

                      {/* Remove star button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.symbol, item.id);
                        }}
                        className="rounded p-1 text-market-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Unstar from watchlist"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-3 border-t border-market-border bg-market-surface text-center">
              <Link
                href="/watchlist"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-market-up hover:underline block"
              >
                Open Full Watchlist Workspace ({items.length} stocks) →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
