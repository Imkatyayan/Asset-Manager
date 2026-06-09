import { NextRequest, NextResponse } from "next/server";
import { parseHoldingsCSV } from "@/lib/csv-parser";
import { analyzeBasic, analyzeFull } from "@/lib/analysis";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
    }

    const { holdings, source, errors, detectedColumns } = parseHoldingsCSV(csvContent);

    if (holdings.length === 0) {
      return NextResponse.json(
        {
          error: errors[0] || "No holdings found in CSV",
          errors,
          detectedColumns,
        },
        { status: 400 }
      );
    }

    const session = await getSession();
    const isAuthenticated = !!session;

    if (isAuthenticated) {
      const analysis = await analyzeFull(holdings);
      return NextResponse.json({
        tier: "full",
        source,
        holdingsCount: holdings.length,
        analysis,
        warnings: errors.filter((e) => !e.includes("No valid")),
        detectedColumns,
      });
    }

    const analysis = await analyzeBasic(holdings);
    return NextResponse.json({
      tier: "basic",
      source,
      holdingsCount: holdings.length,
      analysis,
      warnings: errors.filter((e) => !e.includes("No valid")),
      detectedColumns,
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Failed to analyze portfolio" }, { status: 500 });
  }
}
