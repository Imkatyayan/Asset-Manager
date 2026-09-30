"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchHit {
  symbol: string;
  yahooSymbol: string;
  name: string;
  type: string;
  exchange: string;
  sector?: string;
}

interface StockSearchProps {
  onSelect: (hit: SearchHit) => void;
  initialQuery?: string;
}

export function StockSearch({ onSelect, initialQuery = "" }: StockSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [starredSet, setStarredSet] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const syncStarred = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && Array.isArray(data.items)) {
          setStarredSet(new Set(data.items.map((i: { symbol: string }) => i.symbol.toUpperCase())));
          return;
        }
      }
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("asset_manager_watchlist_guest");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setStarredSet(new Set(parsed.map((i: { symbol: string }) => i.symbol.toUpperCase())));
            return;
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    syncStarred();
    const handleSync = () => syncStarred();
    window.addEventListener("watchlist-updated", handleSync);
    return () => window.removeEventListener("watchlist-updated", handleSync);
  }, [syncStarred]);

  const toggleStar = async (hit: SearchHit) => {
    const cleanSym = hit.symbol.toUpperCase();
    const wasStarred = starredSet.has(cleanSym);

    // Optimistic UI update
    setStarredSet((prev) => {
      const next = new Set(prev);
      if (wasStarred) next.delete(cleanSym);
      else next.add(cleanSym);
      return next;
    });

    try {
      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: cleanSym,
          yahooSymbol: hit.yahooSymbol,
          name: hit.name,
          exchange: hit.exchange,
        }),
      });

      if (!res.ok) {
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
          if (wasStarred) {
            list = list.filter((i) => i.symbol.toUpperCase() !== cleanSym);
          } else {
            list.unshift({
              id: `guest-${Date.now()}-${cleanSym}`,
              symbol: cleanSym,
              yahooSymbol: hit.yahooSymbol,
              name: hit.name,
              exchange: hit.exchange,
              price: 0,
              change: 0,
              changePercent: 0,
            });
          }
          localStorage.setItem("asset_manager_watchlist_guest", JSON.stringify(list));
        }
      }
      window.dispatchEvent(new Event("watchlist-updated"));
    } catch {
      syncStarred();
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-market-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search stocks, indices, ETFs — e.g. RELIANCE, TCS, NIFTYBEES"
          className="w-full rounded-lg border border-market-border bg-market-surface py-3 pl-10 pr-10 text-sm text-market-text placeholder:text-market-muted focus:border-market-up focus:outline-none focus:ring-1 focus:ring-market-up"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-market-muted" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-market-border bg-market-surface shadow-xl max-h-96 overflow-y-auto">
          {results.map((hit) => {
            const starred = starredSet.has(hit.symbol.toUpperCase());
            return (
              <div
                key={hit.yahooSymbol}
                onClick={() => {
                  onSelect(hit);
                  setQuery(hit.name);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 border-b border-market-border px-4 py-2.5 text-left last:border-0 hover:bg-market-card cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-market-text">{hit.name}</p>
                  <p className="text-xs text-market-muted">
                    {hit.symbol} · {hit.exchange}
                    {hit.sector ? ` · ${hit.sector}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded bg-market-surface px-2 py-0.5 text-[10px] font-semibold uppercase text-market-muted border border-market-border/60">
                    {hit.type}
                  </span>

                  {/* Direct Star / Watchlist button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(hit);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold border transition-all duration-150",
                      starred
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                        : "bg-market-surface border-market-border text-market-muted hover:border-amber-400 hover:text-amber-300"
                    )}
                    title={starred ? "In Watchlist (Click to remove)" : "Add to Watchlist"}
                  >
                    <Star className={cn("h-3.5 w-3.5", starred && "fill-amber-400 text-amber-400")} />
                    <span className="text-[10px] hidden sm:inline">{starred ? "Starred" : "+ Watchlist"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
