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

export default async function HomePage() {
  const session = await getSession();

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
    <div>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-sm text-market-muted">
              <BarChart3 className="h-4 w-4 text-market-up" />
              <span className="market-pulse-dot" />
              Investor's one stop solution for smart portfolio analysis.
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-market-text sm:text-5xl lg:text-6xl">
              Understand your portfolio.
              <br />
              <span className="text-market-up">Invest smarter.</span>
            </h1>

            <p className="mt-6 text-lg text-market-muted leading-relaxed">
              Upload holdings from CDSL or NSDL, or your broker. Get instant analysis
              with benchmark comparisons, sector allocation, momentum signals and
              personalized rebalancing suggestions.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/analyze">
                <Button size="lg" className="w-full sm:w-auto">
                  <Upload className="h-4 w-4" />
                  Analyze Your Holdings
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/markets">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <LineChart className="h-4 w-4" />
                  Live Markets
                </Button>
              </Link>
              {!session && (
                <Link href="/signup">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Create Free Account
                  </Button>
                </Link>
              )}
              {session && (
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>

            <p className="mt-4 text-xs text-market-muted">
              Sign up for momentum, fundamentals & smart suggestions.
            </p>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6">
            {[
              { value: "Live", label: "NSE/BSE market data" },
              { value: "24/7", label: "Support" },
              { value: "Free", label: "Basic analysis" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-market-up">{stat.value}</p>
                <p className="mt-1 text-xs text-market-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold">
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
              className="group border border-market-border bg-market-card rounded-2xl p-6 hover:border-market-up/30 hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-market-surface group-hover:bg-market-up/10 transition">
                <f.icon className="h-5 w-5 text-market-up" />
              </div>

              <h3 className="mt-4 font-semibold">{f.title}</h3>

              <p className="mt-2 text-sm text-market-muted leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-market-border bg-market-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-market-text">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Upload holdings", description: "CDSL, NSDL, Zerodha, Groww CSV — we auto-detect the format." },
              { step: "02", title: "Instant analysis", description: "P&L, sector allocation, NIFTY 50 & Sensex comparison." },
              { step: "03", title: "Get recommendations", description: "Free users get allocation tips. Pro unlocks momentum & fundamentals." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-market-up text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-market-text">{item.title}</h3>
                <p className="mt-1.5 text-xs text-market-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Pro */}
      <section className="border-t border-market-border bg-market-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
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
              {!session ? (
                <Link href="/signup" className="mt-5 block">
                  <Button size="sm" className="w-full">
                    Create free account
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard" className="mt-5 block">
                  <Button size="sm" className="w-full">
                    Go to dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="rounded-2xl p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-market-text sm:text-3xl">
            Ready to analyze your Holdings?
          </h2>
          <p className="mt-3 text-market-muted">
            No signup required for basic analysis. Upload your Holdings and get started in seconds.
          </p>
          <Link href="/analyze" className="mt-6 inline-block">
            <Button size="lg">
              Start Analyzing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}