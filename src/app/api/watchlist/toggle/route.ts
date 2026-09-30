import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toYahooSymbol } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

const MAX_WATCHLIST_CAPACITY = 50;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({
      error: "Please log in to star and save stocks to your personal watchlist",
      authenticated: false,
    }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawSymbol = body.symbol;
    if (!rawSymbol || typeof rawSymbol !== "string") {
      return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 });
    }

    const cleanSym = rawSymbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "").trim();
    const yahooSymbol = body.yahooSymbol || toYahooSymbol(cleanSym);
    const name = body.name || cleanSym;
    const exchange = body.exchange || (yahooSymbol.endsWith(".BO") ? "BSE" : "NSE");

    // Check if already in watchlist
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_symbol: {
          userId: session.id,
          symbol: cleanSym,
        },
      },
    });

    if (existing) {
      // Remove it (unstar)
      await prisma.watchlistItem.delete({
        where: { id: existing.id },
      });
      const count = await prisma.watchlistItem.count({ where: { userId: session.id } });
      return NextResponse.json({
        starred: false,
        symbol: cleanSym,
        count,
        message: `Removed ${cleanSym} from watchlist`,
      });
    } else {
      // Add it (star)
      const count = await prisma.watchlistItem.count({ where: { userId: session.id } });
      if (count >= MAX_WATCHLIST_CAPACITY) {
        return NextResponse.json({
          error: `Watchlist limit reached (${MAX_WATCHLIST_CAPACITY} stocks maximum). Please remove an existing stock to add ${cleanSym}.`,
        }, { status: 400 });
      }

      await prisma.watchlistItem.create({
        data: {
          userId: session.id,
          symbol: cleanSym,
          yahooSymbol,
          name,
          exchange,
          order: count,
        },
      });

      return NextResponse.json({
        starred: true,
        symbol: cleanSym,
        count: count + 1,
        message: `Added ${cleanSym} to watchlist ⭐`,
      });
    }
  } catch (err) {
    console.error("Watchlist toggle error:", err);
    return NextResponse.json({ error: "Failed to update watchlist star" }, { status: 500 });
  }
}
