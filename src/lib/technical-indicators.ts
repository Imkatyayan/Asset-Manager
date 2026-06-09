export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  const sum = slice.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / period) * 100) / 100;
}

export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;
  const start = closes.length - period;

  for (let i = start; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 10) / 10;
}

export function deriveTrend(
  price: number,
  sma50: number | null,
  sma200: number | null,
  rsi14: number | null
): "bullish" | "neutral" | "bearish" {
  let score = 0;
  if (sma50 != null && price > sma50) score += 1;
  if (sma200 != null && price > sma200) score += 1;
  if (rsi14 != null && rsi14 > 55) score += 1;
  if (rsi14 != null && rsi14 < 45) score -= 1;
  if (sma50 != null && price < sma50) score -= 1;

  if (score >= 2) return "bullish";
  if (score <= -1) return "bearish";
  return "neutral";
}
