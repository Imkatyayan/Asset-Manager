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

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-market-text">
            Built like a broker terminal
          </h2>
          <p className="mt-2 text-market-muted">
            Kite & Groww inspired · Made for Indian retail investors
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group market-panel p-5 transition-all hover:border-market-up/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-market-surface">
                <feature.icon className="h-5 w-5 text-market-up" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-market-text">{feature.title}</h3>
              <p className="mt-1.5 text-xs text-market-muted leading-relaxed">{feature.description}</p>
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="rounded-2xl gradient-hero p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to analyze your portfolio?
          </h2>
          <p className="mt-3 text-white/70">
            No signup required for basic analysis. Upload your CSV and get started in seconds.
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
