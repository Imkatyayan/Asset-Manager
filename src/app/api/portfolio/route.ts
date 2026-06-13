import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseHoldingsCSV } from "@/lib/csv-parser";
import { analyzeFull } from "@/lib/analysis";
import { enrichHoldingsBatch } from "@/lib/market-data";
import type { ParsedHolding } from "@/lib/csv-parser";

/**
 * Mirrors the resolveCurrentPrice logic in analysis.ts.
 * Priority: CSV-stated LTP → CSV current value ÷ qty → live enriched price.
 * This ensures the value saved to DB matches what /analyze shows.
 */
function resolveCurrentPrice(
  parsed: ParsedHolding,
  livePrice: number
): number {
  if (parsed.csvLtp && parsed.csvLtp > 0) return parsed.csvLtp;
  if (parsed.csvCurrentValue && parsed.quantity > 0)
    return parsed.csvCurrentValue / parsed.quantity;
  return livePrice;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.id },
    include: { holdings: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ portfolios });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { csvContent, name, fileName } = body;

    if (!csvContent) {
      return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
    }

    const { holdings, source, errors } = parseHoldingsCSV(csvContent);
    if (holdings.length === 0) {
      return NextResponse.json({ error: errors[0] || "No holdings found" }, { status: 400 });
    }

    // Enrich to get live prices, sector, and name for any fields the CSV omits.
    const enrichedHoldings = await enrichHoldingsBatch(
      holdings.map((h) => ({ symbol: h.symbol, avgPrice: h.avgPrice }))
    );

    const defaultName = `Portfolio - ${new Date().toLocaleDateString("en-IN")}`;
    const portfolioName =
      name ||
      (typeof fileName === "string"
        ? fileName.replace(/\.(csv|txt)$/i, "").trim() || defaultName
        : defaultName);

    const portfolio = await prisma.portfolio.create({
      data: {
        name: portfolioName,
        source,
        userId: session.id,
        holdings: {
          create: holdings.map((h, i) => {
            const enriched = enrichedHoldings[i];
            // Use the same price-resolution priority as analysis.ts so that
            // currentPrice stored in DB matches what /analyze displays.
            const currentPrice = resolveCurrentPrice(h, enriched.currentPrice);
            return {
              symbol: enriched.symbol,
              name: enriched.name,
              quantity: h.quantity,
              avgPrice: h.avgPrice,
              currentPrice,
              sector: enriched.sector,
            };
          }),
        },
      },
      include: { holdings: true },
    });

    // Run the same full analysis pipeline as /analyze so the response is consistent.
    const analysis = await analyzeFull(holdings);

    return NextResponse.json({ portfolio, analysis, warnings: errors });
  } catch {
    return NextResponse.json({ error: "Failed to save portfolio" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let idsToDelete: string[] = [];

    if (id) {
      idsToDelete = [id];
    } else {
      try {
        const body = await req.json();
        if (body.ids && Array.isArray(body.ids)) {
          idsToDelete = body.ids;
        } else if (body.id) {
          idsToDelete = [body.id];
        }
      } catch {
        // Request body might be empty
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: "Portfolio ID(s) required" }, { status: 400 });
    }

    // Verify ownership of the portfolios
    const portfolios = await prisma.portfolio.findMany({
      where: {
        id: { in: idsToDelete },
      },
    });

    if (portfolios.length === 0) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const isUnauthorized = portfolios.some((p) => p.userId !== session.id);
    if (isUnauthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.portfolio.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });

    return NextResponse.json({ success: true, deletedCount: portfolios.length });
  } catch {
    return NextResponse.json({ error: "Failed to delete portfolio" }, { status: 500 });
  }
}