import type { BasicAnalysis, FullAnalysis } from "./analysis";

export interface StoredAnalysisResult {
  tier: "basic" | "full";
  source: string;
  holdingsCount: number;
  analysis: BasicAnalysis | FullAnalysis;
  warnings?: string[];
  detectedColumns?: Record<string, string | null>;
}

export interface StoredAnalysisSession {
  fileName: string;
  result: StoredAnalysisResult;
  savedAt: number;
}

const STORAGE_KEY = "portfolioiq-analysis-session";

export function loadAnalysisSession(): StoredAnalysisSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAnalysisSession;
    if (!parsed?.result?.analysis || !parsed.fileName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAnalysisSession(session: StoredAnalysisSession): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage full or unavailable — analysis still works for this visit
  }
}

export function clearAnalysisSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
