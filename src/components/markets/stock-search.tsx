"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-market-border bg-market-surface shadow-xl">
          {results.map((hit) => (
            <button
              key={hit.yahooSymbol}
              type="button"
              onClick={() => {
                onSelect(hit);
                setQuery(hit.name);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 border-b border-market-border px-4 py-3 text-left last:border-0 hover:bg-market-card"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-market-text">{hit.name}</p>
                <p className="text-xs text-market-muted">
                  {hit.symbol} · {hit.exchange}
                  {hit.sector ? ` · ${hit.sector}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded bg-market-card px-2 py-0.5 text-[10px] font-semibold uppercase text-market-muted">
                {hit.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
