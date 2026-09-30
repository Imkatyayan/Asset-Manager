"use client";

import { useRouter } from "next/navigation";
import { StockWatchlist } from "@/components/markets/stock-watchlist";
import type { SearchHit } from "@/components/markets/stock-search";
import { Star } from "lucide-react";

export default function WatchlistPage() {
  const router = useRouter();

  const handleSelect = (hit: SearchHit) => {
    router.push(`/markets?symbol=${encodeURIComponent(hit.symbol)}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-market-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Star className="h-5 w-5 fill-amber-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-market-text">
              My Watchlist & Wishlist
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Monitor 25–50 high-conviction Indian stocks. Check real-time NSE/BSE prices, track target buy prices, and jump straight into full financial & forensic analysis.
          </p>
        </div>
      </div>

      <StockWatchlist onSelect={handleSelect} />
    </div>
  );
}
