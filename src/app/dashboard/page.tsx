import { redirect } from "next/navigation";
import Link from "next/link";
import { Upload, TrendingUp, PieChart, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeFull, type FullAnalysis } from "@/lib/analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadsList } from "@/components/analysis/uploads-list";
import { PortfolioDashboardView } from "@/components/analysis/portfolio-dashboard-view";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ portfolioId?: string }>;
}) {
  const { portfolioId } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.id },
    include: { holdings: true },
    orderBy: { updatedAt: "desc" },
  });

  const latestPortfolio = portfolios[0];
  const activePortfolio = portfolioId
    ? portfolios.find((p) => p.id === portfolioId) || latestPortfolio
    : latestPortfolio;

  // Compute per-portfolio summary stats from DB values.
  const portfolioStats = portfolios.map((p) => {
    let currentValue = 0;
    let invested = 0;
    for (const h of p.holdings) {
      const price = h.currentPrice ?? h.avgPrice;
      currentValue += h.quantity * price;
      invested += h.quantity * h.avgPrice;
    }
    const returns = invested > 0 ? ((currentValue - invested) / invested) * 100 : null;
    return { id: p.id, currentValue, invested, returns };
  });
  const statsById = Object.fromEntries(portfolioStats.map((s) => [s.id, s]));

  const serializablePortfolios = portfolios.map((p) => ({
    id: p.id,
    name: p.name,
    source: p.source,
    updatedAt: p.updatedAt.toISOString(),
    holdings: p.holdings.map((h) => ({
      quantity: h.quantity,
      avgPrice: h.avgPrice,
      currentPrice: h.currentPrice,
    })),
  }));

  // Run full analysis on the active portfolio, passing DB-stored currentPrice
  // as csvLtp so resolveCurrentPrice uses it directly (same priority as /analyze).
  let analysis: FullAnalysis | null = null;
  if (activePortfolio?.holdings.length) {
    const parsedHoldings = activePortfolio.holdings.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      quantity: h.quantity,
      avgPrice: h.avgPrice,
      csvLtp: h.currentPrice ?? undefined,
      csvCurrentValue: h.currentPrice ? h.currentPrice * h.quantity : undefined,
    }));
    analysis = await analyzeFull(parsedHoldings);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {session.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-text-secondary">Your portfolio command center</p>
        </div>
        <Link href="/portfolio">
          <Button>
            <Upload className="h-4 w-4" />
            Upload Holdings
          </Button>
        </Link>
      </div>

      {!latestPortfolio ? (
        <Card className="mt-8">
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No portfolio yet</h2>
            <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
              Upload your holdings CSV from CDSL, NSDL, or any broker to get started with full analysis.
            </p>
            <Link href="/portfolio" className="mt-6 inline-block">
              <Button size="lg">
                Upload Your First Portfolio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Summary stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-text-muted">Portfolios</p>
                    <p className="text-xl font-bold">{portfolios.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <PieChart className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-text-muted">Holdings</p>
                    <p className="text-xl font-bold">{latestPortfolio.holdings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div>
                  <p className="text-xs text-text-muted">Latest Portfolio</p>
                  <p className="text-sm font-semibold truncate">{latestPortfolio.name}</p>
                  <p className="text-xs text-text-muted">
                    {formatCurrency(statsById[latestPortfolio.id]?.currentValue ?? 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uploads list */}
          <UploadsList
            portfolios={serializablePortfolios}
            statsById={statsById}
            selectedPortfolioId={activePortfolio?.id}
          />

          {/* Full analysis of active portfolio — same components as /analyze */}
          {analysis && (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">
                  Analysis · {activePortfolio.name}
                </h2>
                {activePortfolio.id === latestPortfolio.id ? (
                  <span className="rounded bg-emerald-950/40 border border-market-up/30 px-2 py-0.5 text-[10px] font-medium text-market-up">
                    Latest
                  </span>
                ) : (
                  <span className="rounded bg-market-surface border border-market-border/40 px-2 py-0.5 text-[10px] font-medium text-market-muted">
                    Active View
                  </span>
                )}
              </div>

              <PortfolioDashboardView analysis={analysis} tier="full" showSipTracker={true} />
            </>
          )}
        </div>
      )}
    </div>
  );
}