import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-market-border bg-market-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-market-up">
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-market-text">
                Port<span className="text-market-up">folioIQ</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-market-muted leading-relaxed">
              Portfolio analysis for Indian investors. CDSL, NSDL, Zerodha, Groww compatible.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-market-muted">Product</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/analyze" className="text-xs text-market-muted hover:text-market-up">Analyze</Link></li>
              <li><Link href="/dashboard" className="text-xs text-market-muted hover:text-market-up">Dashboard</Link></li>
              <li><Link href="/portfolio" className="text-xs text-market-muted hover:text-market-up">Holdings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-market-muted">Support</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/support" className="text-xs text-market-muted hover:text-market-up">Help</Link></li>
              <li><Link href="/support#faq" className="text-xs text-market-muted hover:text-market-up">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-market-muted">Legal</h4>
            <p className="mt-3 text-xs text-market-muted">
              Not SEBI-registered advice. For education only.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-market-border pt-4 text-center text-[10px] text-market-muted">
          &copy; {new Date().getFullYear()} PortfolioIQ
        </div>
      </div>
    </footer>
  );
}
