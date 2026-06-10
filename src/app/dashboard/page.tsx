import { redirect } from "next/navigation";
import Link from "next/link";
import { Upload, TrendingUp, PieChart, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeFull } from "@/lib/analysis";
import { enrichHoldingsBatch } from "@/lib/market-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortfolioSummary } from "@/components/analysis/portfolio-summary";
import { AllocationChart } from "@/components/analysis/allocation-chart";
import { BenchmarkComparison } from "@/components/analysis/benchmark-comparison";
import { FullAnalysisView } from "@/components/analysis/full-analysis";
import { SuggestionsPanel } from "@/components/analysis/suggestions-panel";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.id },
    include: { holdings: true },
    orderBy: { updatedAt: "desc" },
  });

  const latestPortfolio = portfolios[0];
  let analysis = null;
  const portfolioStats: Record<
    string,
    { currentValue: number; invested: number }
  > = {};

  for (const portfolio of portfolios) {
    if (portfolio.holdings.length === 0) continue;
    const enriched = await enrichHoldingsBatch(
      portfolio.holdings.map((h) => ({ symbol: h.symbol, avgPrice: h.avgPrice }))
    );
    const invested = portfolio.holdings.reduce(
      (sum, h) => sum + h.quantity * h.avgPrice,
      0
    );
    const currentValue = portfolio.holdings.reduce(
      (sum, h, i) => sum + h.quantity * enriched[i].currentPrice,
      0
    );
    portfolioStats[portfolio.id] = { currentValue, invested };
  }

  if (latestPortfolio && latestPortfolio.holdings.length > 0) {
    const holdings = latestPortfolio.holdings.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      quantity: h.quantity,
      avgPrice: h.avgPrice,
    }));
    analysis = await analyzeFull(holdings);
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
            <h2 className="mt-4 text-lg font-semibold">
              No portfolio yet
            </h2>
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
                    <p className="text-xl font-bold">
                      {latestPortfolio.holdings.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div>
                  <p className="text-xs text-text-muted">Latest Portfolio</p>
                  <p className="text-sm font-semibold truncate">
                    {latestPortfolio.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {analysis ? formatCurrency(analysis.totalValue) : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolios.map((p, index) => {
                  const stats = portfolioStats[p.id];
                  const returns =
                    stats && stats.invested > 0
                      ? ((stats.currentValue - stats.invested) / stats.invested) * 100
                      : null;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{p.name}</p>
                          {index === 0 && (
                            <span className="rounded bg-primary-light px-2 py-0.5 text-[10px] font-medium text-primary">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">
                          {p.holdings.length} holdings · {p.source.toUpperCase()} ·{" "}
                          {new Date(p.updatedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(stats?.currentValue ?? 0)}
                        </p>
                        {returns !== null && (
                          <p
                            className={`text-xs font-medium ${
                              returns >= 0 ? "text-success" : "text-danger"
                            }`}
                          >
                            {returns >= 0 ? "+" : ""}
                            {returns.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <>
              <PortfolioSummary analysis={analysis} />
              <div className="grid gap-6 lg:grid-cols-2">
                <AllocationChart data={analysis.sectorAllocation} />
                <BenchmarkComparison data={analysis.benchmarkComparison} />
              </div>
              <SuggestionsPanel suggestions={analysis.suggestions} tier="full" />
              <FullAnalysisView analysis={analysis} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
