import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchQuoteDetail } from "@/lib/yahoo-finance";
import { runForensicAudit } from "@/lib/financial-forensics";
import { generateForwardForecast } from "@/lib/financial-forecasting";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  if (!symbol) {
    return NextResponse.json({ error: "symbol parameter is required" }, { status: 400 });
  }

  try {
    const session = await getSession();
    const isPro = !!(session && (session.plan === "pro" || session.role === "admin"));

    // Fetch quote detail with financials
    const quote = await fetchQuoteDetail(symbol, "1mo");
    if (!quote) {
      return NextResponse.json({ error: "Quote data not available for symbol" }, { status: 404 });
    }

    const quarters = quote.financials?.quarters || [];
    const annuals = quote.financials?.annuals || [];
    const pe = quote.financials?.pe ?? null;
    const periodReturn = quote.periodReturn;

    // Run Forensic Audit & AI Forward Prediction
    const fullForensic = runForensicAudit(
      quote.symbol,
      quote.name,
      quarters,
      annuals,
      quote.price,
      pe,
      periodReturn
    );

    const fullForecast = generateForwardForecast(
      quote.symbol,
      quote.name,
      quarters,
      annuals,
      quote.price,
      pe
    );

    if (isPro) {
      return NextResponse.json({
        isPro: true,
        userPlan: session?.plan || "pro",
        symbol: quote.symbol,
        name: quote.name,
        forensic: fullForensic,
        forecast: fullForecast,
      });
    }

    // Teaser / Paywall Preview payload for non-pro users
    return NextResponse.json({
      isPro: false,
      userPlan: session?.plan || "free",
      authenticated: !!session,
      symbol: quote.symbol,
      name: quote.name,
      preview: {
        riskLevel: fullForensic.riskLevel,
        riskScore: fullForensic.riskScore,
        integrityScore: fullForensic.integrityScore,
        totalChecksCount: fullForensic.checks.length,
        flagsCount: fullForensic.checks.filter((c) => c.status !== "PASS").length,
        dummyResultRiskSuspected: fullForensic.dummyResultRisk.isSuspected,
        confidenceScore: fullForecast.confidenceScore,
        growthTrajectory: fullForecast.growthTrajectory,
        nextQuarterLabel: fullForecast.projectedQuarters[0]?.period || "Upcoming Quarter",
        teaserExecutiveSummary:
          fullForecast.executiveSummary.slice(0, 140) + "… [PRO Members Unlock Full Forecast & Forensic Breakdown]",
      },
    });
  } catch (err) {
    console.error("Pro analysis error:", err);
    return NextResponse.json({ error: "Failed to generate Pro analysis" }, { status: 500 });
  }
}
