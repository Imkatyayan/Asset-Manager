/**
 * Tax Utilities — Indian equity tax calculations
 * STCG: 15% if held < 1 year  (Budget 2024 rate)
 * LTCG: 12.5% above ₹1.25L exemption if held >= 1 year  (Budget 2024 rate)
 * STT: 0.1% applies on SELL side only for delivery equity
 */

export type HoldingPeriodStatus = "ltcg" | "stcg" | "unknown";

/** How many days a holding has been held. Returns null if buyDate unknown. */
export function holdingDays(buyDate: Date | null): number | null {
  if (!buyDate) return null;
  const ms = Date.now() - buyDate.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/** Date on which LTCG kicks in (1 year after buy date) */
export function ltcgEligibleDate(buyDate: Date | null): Date | null {
  if (!buyDate) return null;
  const d = new Date(buyDate);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

/** Days remaining until LTCG eligibility. null if buyDate unknown. */
export function daysUntilLTCG(buyDate: Date | null): number | null {
  const eligible = ltcgEligibleDate(buyDate);
  if (!eligible) return null;
  return Math.ceil((eligible.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export interface TaxBreakdown {
  status: HoldingPeriodStatus;
  isLTCG: boolean;
  days: number | null;
  ltcgDate: Date | null;
  daysRemaining: number | null; // positive = not yet LTCG, negative/zero = already LTCG
  profit: number;
  stcgTax: number;   // tax if sold as STCG @ 15%
  ltcgTax: number;   // tax if sold as LTCG @ 12.5% above ₹1.25L
  taxSaving: number; // ₹ saved by waiting for LTCG
}

// Budget 2024 updated rates
const LTCG_EXEMPTION = 125_000; // ₹1.25 lakh exemption (Budget 2024)
const STCG_RATE = 0.15;         // 15% STCG
const LTCG_RATE = 0.125;        // 12.5% LTCG (Budget 2024, was 10%)

export function computeTaxBreakdown(
  profit: number,
  buyDate: Date | null
): TaxBreakdown {
  const days = holdingDays(buyDate);
  const status: HoldingPeriodStatus =
    days === null ? "unknown" : days >= 365 ? "ltcg" : "stcg";
  const isLTCG = status === "ltcg";
  const ltcgDate = ltcgEligibleDate(buyDate);
  const daysRemaining = daysUntilLTCG(buyDate);

  const taxableProfit = Math.max(0, profit);
  const stcgTax = Math.round(taxableProfit * STCG_RATE);
  const ltcgTaxable = Math.max(0, taxableProfit - LTCG_EXEMPTION);
  const ltcgTax = Math.round(ltcgTaxable * LTCG_RATE);
  const taxSaving = Math.max(0, stcgTax - ltcgTax);

  return {
    status,
    isLTCG,
    days,
    ltcgDate,
    daysRemaining,
    profit: taxableProfit,
    stcgTax,
    ltcgTax,
    taxSaving,
  };
}

/**
 * Breakeven price — includes STT (0.1% on sell side only) + brokerage + GST.
 * Formula: (invested + sell-side costs) / quantity
 */
export function computeBreakeven(
  avgPrice: number,
  quantity: number
): number {
  const invested = avgPrice * quantity;
  const sellValue = invested; // approximation: sell at breakeven ≈ buy price
  // STT: 0.1% on delivery sell side
  const stt = sellValue * 0.001;
  // Brokerage: ₹20 flat per leg × 2 (buy + sell), capped at 0.05%
  const brokPerLeg = Math.min(20, invested * 0.0005);
  const brokerage = brokPerLeg * 2;
  const gst = brokerage * 0.18;
  const sebiCharges = invested * 0.000001; // SEBI ₹10 per crore
  const stampDuty = invested * 0.00015;   // 0.015% on buy side
  const totalCosts = stt + brokerage + gst + sebiCharges + stampDuty;
  return Math.round(((invested + totalCosts) / quantity) * 100) / 100;
}

/** Sector-average PE multiples (BSE sectoral data, mid-2025) */
export const SECTOR_PE_MAP: Record<string, number> = {
  "Banking & Finance": 16,   // PSU+private blended, compressed post-rate cycle
  IT: 28,                     // corrected from bull-market 32x
  Energy: 12,                 // PSU oil + renewables blend
  FMCG: 45,
  Pharma: 26,
  Auto: 20,                   // OEM + ancillary blend
  Telecom: 30,                // high D/E, PE inflated
  Infrastructure: 18,
  Materials: 13,
  "Consumer Services": 32,
  "Aerospace & Defence": 35,
  Unknown: 20,
};

/**
 * Sector-PE Implied Price — NOT a DCF fair value.
 * Answers: "At what price would this stock trade if the market re-rated it to sector-average PE?"
 * Valid only for profitable companies with stable earnings.
 */
export function computeSectorImpliedPrice(
  currentPrice: number,
  stockPE: number | null,
  sector: string
): { price: number | null; label: string; upside: number | null } {
  const sectorPE = SECTOR_PE_MAP[sector] ?? 20;
  if (!stockPE || stockPE <= 0) {
    return { price: null, label: "No PE data", upside: null };
  }

  const implied = Math.round(currentPrice * (sectorPE / stockPE) * 100) / 100;

  // Cap at ±60% to avoid extreme outputs for outlier PE stocks
  const cappedImplied = Math.min(
    currentPrice * 1.6,
    Math.max(currentPrice * 0.4, implied)
  );

  const upside = Math.round(((cappedImplied / currentPrice) - 1) * 1000) / 10;

  return {
    price: cappedImplied,
    label: implied !== cappedImplied ? "Capped (±60%)" : `Sector PE: ${sectorPE}x`,
    upside,
  };
}
