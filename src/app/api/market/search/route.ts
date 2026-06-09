import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchSymbols(q, 15);
    return NextResponse.json({ results, query: q });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
