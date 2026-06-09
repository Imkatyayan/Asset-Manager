import { NextRequest, NextResponse } from "next/server";
import { fetchQuoteDetail, type ChartRange } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

const VALID_RANGES = new Set(["1d", "5d", "1mo", "3mo", "6mo", "1y"]);

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  const rangeParam = req.nextUrl.searchParams.get("range") || "1mo";
  const chartRange = (VALID_RANGES.has(rangeParam) ? rangeParam : "1mo") as ChartRange;

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const quote = await fetchQuoteDetail(symbol, chartRange);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    return NextResponse.json({ quote });
  } catch (err) {
    console.error("Quote error:", err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 502 });
  }
}
