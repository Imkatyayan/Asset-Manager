import { getSession } from "@/lib/auth";
import { AnalyzeWorkspace } from "@/components/analysis/analyze-workspace";

export default async function AnalyzePage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 border-b border-market-border pb-4">
        <h1 className="text-xl font-bold text-market-text">Portfolio Analysis</h1>
        <p className="mt-1 text-sm text-market-muted">
          Import holdings · Compare vs NIFTY 50 & Sensex · Get allocation recommendations
        </p>
      </div>

      <AnalyzeWorkspace isAuthenticated={!!session} />
    </div>
  );
}
