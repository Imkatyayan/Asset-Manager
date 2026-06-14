import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Upload,
  TrendingUp,
  PieChart,
  LineChart,
  Lock,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getSession();

  let userStats = null;
  if (session) {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.id },
      include: { holdings: true },
    });
    const totalPortfolios = portfolios.length;
    const totalHoldings = portfolios.reduce((acc, p) => acc + p.holdings.length, 0);
    const uniqueSymbols = new Set(portfolios.flatMap(p => p.holdings.map(h => h.symbol))).size;
    userStats = { totalPortfolios, totalHoldings, uniqueSymbols };
  }

  const features = [
    {
      icon: Upload,
      title: "Upload Any Holdings",
      description: "Import from CDSL, NSDL, Zerodha, Groww, or any broker CSV format.",
    },
    {
      icon: TrendingUp,
      title: "Benchmark Comparison",
      description: "Compare your returns against NIFTY 50 and Sensex index funds.",
    },
    {
      icon: PieChart,
      title: "Allocation Analysis",
      description: "Visualize sector allocation and identify concentration risks.",
    },
    {
      icon: LineChart,
      title: "Momentum & Fundamentals",
      description: "Screener-style analysis with P/E, ROE, debt ratios, and trend signals.",
    },
    {
      icon: Zap,
      title: "Smart Suggestions",
      description: "AI-powered rebalancing, diversification, and allocation recommendations.",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Portfolio health score with momentum, fundamental, and risk metrics.",
    },
  ];

  const freeFeatures = [
    "CSV upload (any broker)",
    "P&L summary",
    "Sector allocation chart",
    "NIFTY 50 & Sensex comparison",
    "Basic rebalancing tips",
  ];

  const proFeatures = [
    "Everything in Free",
    "Momentum score per stock",
    "P/E, ROE, debt ratio analysis",
    "Smart diversification suggestions",
    "Save & track multiple portfolios",
    "Portfolio health score",
  ];

  return (
    <div className="relative overflow-hidden min-h-full bg-market-bg">
      {/* Background tech-grid overlay and hero light glows (matching original style colors) */}
      <div className="absolute top-0 inset-x-0 -z-10 h-[640px] tech-grid opacity-60" />
      <div className="absolute top-[10%] left-[10%] -z-10 h-[400px] w-[400px] rounded-full bg-market-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[15%] right-[10%] -z-10 h-[450px] w-[450px] rounded-full bg-market-up/5 blur-[140px] pointer-events-none" />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden bg-transparent">
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-sm text-market-muted animate-fade-in-up stagger-1">
              <BarChart3 className="h-4 w-4 text-market-up animate-pulse" />
              <span className="market-pulse-dot animate-ping" />
              Investor&apos;s one-stop solution for smart portfolio analysis.
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-market-text sm:text-5xl lg:text-6xl animate-fade-in-up stagger-2 leading-tight">
              Understand your portfolio.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-market-up via-market-accent to-market-up font-extrabold bg-[length:200%_auto] animate-pulse">Invest smarter.</span>
            </h1>

            <p className="mt-6 text-lg text-market-muted leading-relaxed animate-fade-in-up stagger-3">
              Upload holdings from CDSL or NSDL, or your broker. Get instant analysis
              with benchmark comparisons, sector allocation, momentum signals and
              personalized rebalancing suggestions.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-in-up stagger-4">
              <Link href="/analyze">
                <Button size="lg" className="w-full sm:w-auto shadow-md hover:shadow-market-up/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Upload className="h-4 w-4" />
                  Analyze Your Holdings
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/markets">
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-market-surface hover:border-market-accent/40 transition-all duration-200">
                  <LineChart className="h-4 w-4 text-market-accent" />
                  Live Markets
                </Button>
              </Link>
              {!session && (
                <Link href="/signup">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-market-surface hover:border-market-accent/40 transition-all duration-200">
                    Create Free Account
                  </Button>
                </Link>
              )}
              {session && (
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-market-surface hover:border-market-accent/40 transition-all duration-200">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>

            {!session && (
              <p className="mt-4 text-xs text-market-muted animate-fade-in-up stagger-5">
                Sign up for momentum, fundamentals & smart suggestions.
              </p>
            )}
          </div>

          {/* Stats or User Dashboard Summary */}
          {!session ? (
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 animate-fade-in-up stagger-6">
              {[
                { value: "Live", label: "NSE/BSE market data" },
                { value: "24/7", label: "Support" },
                { value: "Free", label: "Basic analysis" },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <p className="text-2xl font-bold text-market-up group-hover:scale-105 transition-transform duration-200">{stat.value}</p>
                  <p className="mt-1 text-xs text-market-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          ) : (
            userStats && (
              <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-market-border bg-market-card/60 backdrop-blur-sm p-6 shadow-xl animate-fade-in-up stagger-6 text-left relative overflow-hidden group hover:border-market-up/30 transition-all duration-300">
                <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-market-up opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-market-up"></span>
                      </span>
                      <span className="text-[10px] font-bold text-market-up uppercase tracking-widest">Workspace Active</span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-market-text">Your Workspace Stats</h3>
                    <p className="text-xs text-market-muted">
                      Synced with your connected brokerage files.
                    </p>
                    {userStats.totalPortfolios === 0 && (
                      <p className="text-[10px] text-market-accent font-semibold mt-1">
                        No portfolios connected yet. Go to your Dashboard to upload a CSV.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center sm:text-left">
                      <p className="text-2xl font-black text-market-text font-mono-nums">{userStats.totalPortfolios}</p>
                      <p className="text-[10px] uppercase font-bold text-market-muted tracking-wider">Portfolios</p>
                    </div>
                    <div className="h-8 w-px bg-market-border/40" />
                    <div className="text-center sm:text-left">
                      <p className="text-2xl font-black text-market-text font-mono-nums">{userStats.totalHoldings}</p>
                      <p className="text-[10px] uppercase font-bold text-market-muted tracking-wider font-sans">Total Assets</p>
                    </div>
                    <div className="h-8 w-px bg-market-border/40" />
                    <div className="text-center sm:text-left">
                      <p className="text-2xl font-black text-market-up font-mono-nums">{userStats.uniqueSymbols}</p>
                      <p className="text-[10px] uppercase font-bold text-market-muted tracking-wider">Unique Stocks</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">
            Built for serious investors
          </h2>
          <p className="mt-3 text-market-muted">
            Institutional-grade insights simplified for retail investors
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group border border-market-border bg-market-card rounded-2xl p-6 hover:border-market-up/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-market-glow-up/20 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-market-surface group-hover:bg-market-up/10 transition duration-300">
                <f.icon className="h-5 w-5 text-market-up transition duration-300" />
              </div>

              <h3 className="mt-4 font-semibold text-market-text group-hover:text-market-up transition-colors duration-200">{f.title}</h3>

              <p className="mt-2 text-sm text-market-muted leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-market-border bg-market-surface/40 backdrop-blur-md relative">
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10 px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-market-text">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Upload holdings", description: "CDSL, NSDL, Zerodha, Groww CSV — we auto-detect the format." },
              { step: "02", title: "Instant analysis", description: "P&L, sector allocation, NIFTY 50 & Sensex comparison." },
              { step: "03", title: "Get recommendations", description: "Free users get allocation tips. Pro unlocks momentum & fundamentals." },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-market-up text-xs font-bold text-white group-hover:scale-110 transition-transform duration-200">
                  {item.step}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-market-text">{item.title}</h3>
                <p className="mt-1.5 text-xs text-market-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Pro (Only visible for guests / non-logged in users) */}
      {!session && (
        <section className="border-t border-market-border bg-market-surface relative">
          <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />
          <div className="mx-auto max-w-7xl relative z-10 px-4 py-16 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-market-text">Free vs Pro</h2>
              <p className="mt-2 text-sm text-market-muted">Start free. Upgrade when you need deeper insights.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
              {/* Free */}
              <div className="market-panel p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-md bg-market-surface flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-market-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-market-text">Guest / Free</p>
                    <p className="text-xs text-market-muted">No signup needed</p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-market-muted">
                      <CheckCircle2 className="h-3.5 w-3.5 text-market-up shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/analyze" className="mt-5 block">
                  <Button variant="outline" size="sm" className="w-full">
                    Try free
                  </Button>
                </Link>
              </div>
              {/* Pro */}
              <div className="market-panel p-6 border-market-up/30 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-market-up/10 border border-market-up/20 px-2 py-0.5 text-[10px] font-semibold text-market-up">
                    <Star className="h-2.5 w-2.5" /> PRO
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-md bg-market-up/10 border border-market-up/20 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-market-up" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-market-text">Pro Account</p>
                    <p className="text-xs text-market-muted">Free to sign up</p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-market-muted">
                      <CheckCircle2 className="h-3.5 w-3.5 text-market-up shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-5 block">
                  <Button size="sm" className="w-full">
                    Create free account
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 relative">
        <div className="absolute inset-0 tech-grid opacity-15 pointer-events-none" />
        <div className="rounded-2xl p-8 text-center sm:p-12 relative z-10 border border-market-border bg-market-card/50 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-market-text sm:text-3xl">
            Ready to analyze your Holdings?
          </h2>
          <p className="mt-3 text-market-muted max-w-lg mx-auto">
            No signup required for basic analysis. Upload your Holdings and get started in seconds.
          </p>
          <Link href="/analyze" className="mt-6 inline-block">
            <Button size="lg" className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              Start Analyzing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}