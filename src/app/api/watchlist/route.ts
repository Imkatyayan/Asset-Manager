import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { fetchQuotes, toYahooSymbol } from "@/lib/yahoo-finance";
import { getStockData } from "@/lib/market-data";

export const dynamic = "force-dynamic";

const MAX_WATCHLIST_CAPACITY = 50;

const watchlistItemSchema = z.object({
  symbol: z.string().min(1).max(20),
  yahooSymbol: z.string().optional(),
  name: z.string().optional(),
  exchange: z.string().default("NSE"),
  targetPrice: z.number().nullable().optional(),
  notes: z.string().max(300).nullable().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      items: [],
      maxCapacity: MAX_WATCHLIST_CAPACITY,
    });
  }

  try {
    const items = await prisma.watchlistItem.findMany({
      where: { userId: session.id },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    if (items.length === 0) {
      return NextResponse.json({
        authenticated: true,
        items: [],
        count: 0,
        maxCapacity: MAX_WATCHLIST_CAPACITY,
      });
    }

    // Fetch live quotes for all items in batch
    const yahooSymbols = items.map(
      (item) => item.yahooSymbol || toYahooSymbol(item.symbol)
    );

    let liveQuotes: import("@/lib/yahoo-finance").YahooQuote[] = [];
    try {
      liveQuotes = await fetchQuotes(yahooSymbols);
    } catch {
      // Graceful fallback to static/cached if live quotes fail
    }

    const quoteMap = new Map(liveQuotes.map((q) => [q.symbol.toUpperCase(), q]));

    const enriched = items.map((item) => {
      const ySym = (item.yahooSymbol || toYahooSymbol(item.symbol)).toUpperCase();
      const quote = quoteMap.get(ySym) || quoteMap.get(item.symbol.toUpperCase());
      const staticData = getStockData(item.symbol.toUpperCase());

      const price = quote?.price ?? staticData?.currentPrice ?? 0;
      const change =
        quote?.price && quote?.previousClose
          ? Math.round((quote.price - quote.previousClose) * 100) / 100
          : 0;
      const changePercent = quote?.changePercent ?? 0;
      const pe = staticData?.pe ?? null;
      const sector = staticData?.sector ?? null;
      const marketCap = staticData?.marketCap ?? null;

      return {
        id: item.id,
        symbol: item.symbol,
        yahooSymbol: item.yahooSymbol || ySym,
        name: quote?.name || item.name || staticData?.name || item.symbol,
        exchange: item.exchange,
        targetPrice: item.targetPrice,
        notes: item.notes,
        createdAt: item.createdAt,
        price,
        change,
        changePercent,
        pe,
        sector,
        marketCap,
        isTargetReached:
          item.targetPrice != null && item.targetPrice > 0
            ? price >= item.targetPrice
            : false,
      };
    });

    return NextResponse.json({
      authenticated: true,
      items: enriched,
      count: items.length,
      maxCapacity: MAX_WATCHLIST_CAPACITY,
    });
  } catch (err) {
    console.error("Watchlist fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to save to your watchlist" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = watchlistItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { symbol, name, exchange, targetPrice, notes } = parsed.data;
    const cleanSym = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "").trim();
    const yahooSymbol = parsed.data.yahooSymbol || toYahooSymbol(cleanSym);

    // Check capacity
    const currentCount = await prisma.watchlistItem.count({
      where: { userId: session.id },
    });

    // Check if item already exists
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_symbol: {
          userId: session.id,
          symbol: cleanSym,
        },
      },
    });

    if (!existing && currentCount >= MAX_WATCHLIST_CAPACITY) {
      return NextResponse.json(
        { error: `Watchlist limit of ${MAX_WATCHLIST_CAPACITY} stocks reached.` },
        { status: 400 }
      );
    }

    const item = await prisma.watchlistItem.upsert({
      where: {
        userId_symbol: {
          userId: session.id,
          symbol: cleanSym,
        },
      },
      update: {
        targetPrice: targetPrice !== undefined ? targetPrice : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      create: {
        userId: session.id,
        symbol: cleanSym,
        yahooSymbol,
        name: name || cleanSym,
        exchange: exchange || "NSE",
        targetPrice: targetPrice ?? null,
        notes: notes ?? null,
        order: currentCount,
      },
    });

    return NextResponse.json({
      success: true,
      item,
      count: existing ? currentCount : currentCount + 1,
      message: `${cleanSym} added to watchlist`,
    });
  } catch (err) {
    console.error("Watchlist add error:", err);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const symbolParam = searchParams.get("symbol")?.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "").trim();
    const idParam = searchParams.get("id");

    if (!symbolParam && !idParam) {
      return NextResponse.json({ error: "Symbol or ID is required" }, { status: 400 });
    }

    if (idParam) {
      await prisma.watchlistItem.deleteMany({
        where: { id: idParam, userId: session.id },
      });
    } else if (symbolParam) {
      await prisma.watchlistItem.deleteMany({
        where: { symbol: symbolParam, userId: session.id },
      });
    }

    const count = await prisma.watchlistItem.count({
      where: { userId: session.id },
    });

    return NextResponse.json({ success: true, count });
  } catch (err) {
    console.error("Watchlist delete error:", err);
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
