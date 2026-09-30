export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  const sum = slice.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / period) * 100) / 100;
}

export function ema(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const k = 2 / (period + 1);

  // Initial seed with simple average of first 'period' values
  let currentEma = values.slice(0, period).reduce((acc, v) => acc + v, 0) / period;

  for (let i = period; i < values.length; i++) {
    currentEma = values[i] * k + currentEma * (1 - k);
  }

  return Math.round(currentEma * 100) / 100;
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

export interface MacdResult {
  macd: number;
  signal: number;
  histogram: number;
  crossover: "bullish" | "bearish" | "neutral";
}

export function macd(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdResult | null {
  if (closes.length < slowPeriod + signalPeriod) return null;

  const kFast = 2 / (fastPeriod + 1);
  const kSlow = 2 / (slowPeriod + 1);

  // Calculate fast and slow EMAs across historical series
  let fastEma = closes.slice(0, fastPeriod).reduce((acc, v) => acc + v, 0) / fastPeriod;
  let slowEma = closes.slice(0, slowPeriod).reduce((acc, v) => acc + v, 0) / slowPeriod;

  // Advance fastEma up to slowPeriod
  for (let i = fastPeriod; i < slowPeriod; i++) {
    fastEma = closes[i] * kFast + fastEma * (1 - kFast);
  }

  const macdSeries: number[] = [];

  for (let i = slowPeriod; i < closes.length; i++) {
    fastEma = closes[i] * kFast + fastEma * (1 - kFast);
    slowEma = closes[i] * kSlow + slowEma * (1 - kSlow);
    macdSeries.push(fastEma - slowEma);
  }

  if (macdSeries.length < signalPeriod) return null;

  // Calculate Signal line: 9-day EMA of MACD series
  const kSignal = 2 / (signalPeriod + 1);
  let signalEma =
    macdSeries.slice(0, signalPeriod).reduce((acc, v) => acc + v, 0) / signalPeriod;

  for (let i = signalPeriod; i < macdSeries.length; i++) {
    signalEma = macdSeries[i] * kSignal + signalEma * (1 - kSignal);
  }

  const lastMacd = macdSeries[macdSeries.length - 1];
  const lastSignal = signalEma;
  const histogram = lastMacd - lastSignal;

  const crossover =
    histogram > 0 && lastMacd > 0
      ? "bullish"
      : histogram < 0 && lastMacd < 0
      ? "bearish"
      : "neutral";

  return {
    macd: Math.round(lastMacd * 100) / 100,
    signal: Math.round(lastSignal * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
    crossover,
  };
}

export interface BollingerBandsResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number; // percentage
}

export function bollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2
): BollingerBandsResult | null {
  if (closes.length < period) return null;

  const slice = closes.slice(-period);
  const mean = slice.reduce((acc, v) => acc + v, 0) / period;

  const variance =
    slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = mean + multiplier * stdDev;
  const lower = mean - multiplier * stdDev;
  const bandwidth = mean > 0 ? ((upper - lower) / mean) * 100 : 0;

  return {
    upper: Math.round(upper * 100) / 100,
    middle: Math.round(mean * 100) / 100,
    lower: Math.round(lower * 100) / 100,
    bandwidth: Math.round(bandwidth * 10) / 10,
  };
}

export interface PivotPointsResult {
  pivot: number;
  r1: number;
  s1: number;
  r2: number;
  s2: number;
}

export function pivotPoints(
  high: number,
  low: number,
  close: number
): PivotPointsResult {
  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);

  return {
    pivot: Math.round(pivot * 100) / 100,
    r1: Math.round(r1 * 100) / 100,
    s1: Math.round(s1 * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    s2: Math.round(s2 * 100) / 100,
  };
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
