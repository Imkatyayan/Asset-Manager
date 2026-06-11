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

// In-memory only — survives tab switching but clears on refresh/close.
// Intentionally not persisted to sessionStorage or localStorage.
let _session: StoredAnalysisSession | null = null;

export function loadAnalysisSession(): StoredAnalysisSession | null {
  return _session;
}

export function saveAnalysisSession(session: StoredAnalysisSession): void {
  _session = session;
}

export function clearAnalysisSession(): void {
  _session = null;
}