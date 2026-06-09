import { NextRequest, NextResponse } from "next/server";
import {
  fetchIndianNews,
  MARKET_NEWS_QUERY,
  newsQueryForSymbol,
} from "@/lib/indian-news";
import { toYahooSymbol } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  const scope = req.nextUrl.searchParams.get("scope") || (symbol ? "symbol" : "market");

  try {
    const query =
      scope === "market" || !symbol
        ? MARKET_NEWS_QUERY
        : newsQueryForSymbol(toYahooSymbol(symbol).replace(/\.(NS|BO)$/i, ""));

    const news = await fetchIndianNews(query, 15);
    return NextResponse.json({ news, query, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("News error:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 502 });
  }
}
