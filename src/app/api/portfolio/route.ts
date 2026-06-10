import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseHoldingsCSV } from "@/lib/csv-parser";
import { analyzeFull } from "@/lib/analysis";
import { enrichHoldingsBatch } from "@/lib/market-data";

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
            return {
              symbol: enriched.symbol,
              name: enriched.name,
              quantity: h.quantity,
              avgPrice: h.avgPrice,
              currentPrice: enriched.currentPrice,
              sector: enriched.sector,
            };
          }),
        },
      },
      include: { holdings: true },
    });

    const analysis = await analyzeFull(holdings);

    return NextResponse.json({ portfolio, analysis, warnings: errors });
  } catch {
    return NextResponse.json({ error: "Failed to save portfolio" }, { status: 500 });
  }
}
