import { guessSector, normalizeSector } from "./sector-utils";

export interface PerformancePeriod {
  period: string;
  sales: number;
  netProfit: number;
  opmPercent: number;
  eps: number;
}

export interface StockFundamentals {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  pe: number;
  pb: number;
  roe: number;
  debtToEquity: number;
  revenueGrowth: number;
  profitGrowth: number;
  dividendYield: number;
  marketCap: number;
  momentumScore: number; // 0-100
  trend: "bullish" | "neutral" | "bearish";
  yearReturn: number;
  beta: number;
  capSize: "large" | "mid" | "small";
  quarters?: PerformancePeriod[];
  annuals?: PerformancePeriod[];
}

export const BENCHMARKS = {
  nifty50: {
    name: "NIFTY 50",
    yearReturn: 12.4,
    threeYearCagr: 14.2,
    fiveYearCagr: 13.8,
    volatility: 15.2,
    sharpeRatio: 0.82,
  },
  sensex: {
    name: "SENSEX",
    yearReturn: 11.9,
    threeYearCagr: 13.6,
    fiveYearCagr: 13.2,
    volatility: 14.8,
    sharpeRatio: 0.79,
  },
};

export const STOCK_DATABASE: Record<string, StockFundamentals> = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy",
    currentPrice: 2850,
    pe: 28.5,
    pb: 2.1,
    roe: 9.8,
    debtToEquity: 0.35,
    revenueGrowth: 8.2,
    profitGrowth: 12.5,
    dividendYield: 0.35,
    marketCap: 1920000,
    momentumScore: 72,
    trend: "bullish",
    yearReturn: 18.4,
    beta: 1.05,
    capSize: "large",
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "IT",
    currentPrice: 4120,
    pe: 32.1,
    pb: 12.5,
    roe: 48.2,
    debtToEquity: 0.05,
    revenueGrowth: 7.5,
    profitGrowth: 9.2,
    dividendYield: 1.4,
    marketCap: 1480000,
    momentumScore: 65,
    trend: "neutral",
    yearReturn: 8.2,
    beta: 0.82,
    capSize: "large",
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    sector: "Banking & Finance",
    currentPrice: 1720,
    pe: 19.8,
    pb: 2.8,
    roe: 16.5,
    debtToEquity: 0,
    revenueGrowth: 15.2,
    profitGrowth: 18.1,
    dividendYield: 1.1,
    marketCap: 1320000,
    momentumScore: 78,
    trend: "bullish",
    yearReturn: 22.1,
    beta: 0.98,
    capSize: "large",
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys",
    sector: "IT",
    currentPrice: 1890,
    pe: 28.4,
    pb: 8.2,
    roe: 31.5,
    debtToEquity: 0.02,
    revenueGrowth: 5.8,
    profitGrowth: 6.5,
    dividendYield: 2.1,
    marketCap: 785000,
    momentumScore: 58,
    trend: "neutral",
    yearReturn: 5.4,
    beta: 0.88,
    capSize: "large",
  },
  ICICIBANK: {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    sector: "Banking & Finance",
    currentPrice: 1285,
    pe: 18.2,
    pb: 3.1,
    roe: 17.8,
    debtToEquity: 0,
    revenueGrowth: 18.5,
    profitGrowth: 22.3,
    dividendYield: 0.8,
    marketCap: 910000,
    momentumScore: 82,
    trend: "bullish",
    yearReturn: 28.5,
    beta: 1.02,
    capSize: "large",
  },
  BHARTIARTL: {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel",
    sector: "Telecom",
    currentPrice: 1580,
    pe: 42.5,
    pb: 8.5,
    roe: 12.2,
    debtToEquity: 1.85,
    revenueGrowth: 12.8,
    profitGrowth: 45.2,
    dividendYield: 0.5,
    marketCap: 895000,
    momentumScore: 85,
    trend: "bullish",
    yearReturn: 35.2,
    beta: 0.78,
    capSize: "large",
  },
  ITC: {
    symbol: "ITC",
    name: "ITC Limited",
    sector: "FMCG",
    currentPrice: 465,
    pe: 28.8,
    pb: 7.2,
    roe: 28.5,
    debtToEquity: 0.01,
    revenueGrowth: 6.2,
    profitGrowth: 8.5,
    dividendYield: 3.2,
    marketCap: 580000,
    momentumScore: 55,
    trend: "neutral",
    yearReturn: 12.8,
    beta: 0.62,
    capSize: "large",
  },
  SBIN: {
    symbol: "SBIN",
    name: "State Bank of India",
    sector: "Banking & Finance",
    currentPrice: 820,
    pe: 10.5,
    pb: 1.45,
    roe: 16.2,
    debtToEquity: 0,
    revenueGrowth: 12.5,
    profitGrowth: 28.5,
    dividendYield: 1.8,
    marketCap: 735000,
    momentumScore: 75,
    trend: "bullish",
    yearReturn: 42.5,
    beta: 1.15,
    capSize: "large",
  },
  HINDUNILVR: {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever",
    sector: "FMCG",
    currentPrice: 2380,
    pe: 58.2,
    pb: 12.8,
    roe: 22.5,
    debtToEquity: 0.02,
    revenueGrowth: 3.5,
    profitGrowth: 5.2,
    dividendYield: 1.6,
    marketCap: 560000,
    momentumScore: 42,
    trend: "bearish",
    yearReturn: -2.5,
    beta: 0.58,
    capSize: "large",
  },
  KOTAKBANK: {
    symbol: "KOTAKBANK",
    name: "Kotak Mahindra Bank",
    sector: "Banking & Finance",
    currentPrice: 1785,
    pe: 22.5,
    pb: 2.5,
    roe: 14.2,
    debtToEquity: 0,
    revenueGrowth: 10.2,
    profitGrowth: 12.8,
    dividendYield: 0.15,
    marketCap: 355000,
    momentumScore: 62,
    trend: "neutral",
    yearReturn: 15.2,
    beta: 0.85,
    capSize: "large",
  },
  LT: {
    symbol: "LT",
    name: "Larsen & Toubro",
    sector: "Infrastructure",
    currentPrice: 3580,
    pe: 35.2,
    pb: 5.8,
    roe: 15.8,
    debtToEquity: 0.65,
    revenueGrowth: 18.5,
    profitGrowth: 22.1,
    dividendYield: 0.85,
    marketCap: 495000,
    momentumScore: 80,
    trend: "bullish",
    yearReturn: 38.5,
    beta: 1.12,
    capSize: "large",
  },
  AXISBANK: {
    symbol: "AXISBANK",
    name: "Axis Bank",
    sector: "Banking & Finance",
    currentPrice: 1125,
    pe: 13.8,
    pb: 1.85,
    roe: 15.5,
    debtToEquity: 0,
    revenueGrowth: 14.2,
    profitGrowth: 18.5,
    dividendYield: 0.1,
    marketCap: 348000,
    momentumScore: 70,
    trend: "bullish",
    yearReturn: 25.8,
    beta: 1.22,
    capSize: "large",
  },
  WIPRO: {
    symbol: "WIPRO",
    name: "Wipro",
    sector: "IT",
    currentPrice: 285,
    pe: 22.5,
    pb: 3.2,
    roe: 16.8,
    debtToEquity: 0.08,
    revenueGrowth: 2.5,
    profitGrowth: 4.2,
    dividendYield: 2.8,
    marketCap: 152000,
    momentumScore: 38,
    trend: "bearish",
    yearReturn: -8.5,
    beta: 0.92,
    capSize: "large",
  },
  MARUTI: {
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    sector: "Auto",
    currentPrice: 12450,
    pe: 28.5,
    pb: 4.8,
    roe: 16.2,
    debtToEquity: 0.02,
    revenueGrowth: 12.5,
    profitGrowth: 15.8,
    dividendYield: 0.9,
    marketCap: 392000,
    momentumScore: 68,
    trend: "bullish",
    yearReturn: 18.2,
    beta: 0.95,
    capSize: "large",
  },
  SUNPHARMA: {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical",
    sector: "Pharma",
    currentPrice: 1820,
    pe: 38.5,
    pb: 5.2,
    roe: 14.5,
    debtToEquity: 0.12,
    revenueGrowth: 10.5,
    profitGrowth: 15.2,
    dividendYield: 0.7,
    marketCap: 438000,
    momentumScore: 72,
    trend: "bullish",
    yearReturn: 22.5,
    beta: 0.72,
    capSize: "large",
  },
  TATAMOTORS: {
    symbol: "TATAMOTORS",
    name: "Tata Motors",
    sector: "Auto",
    currentPrice: 980,
    pe: 18.5,
    pb: 4.2,
    roe: 22.8,
    debtToEquity: 1.1,
    revenueGrowth: 26.5,
    profitGrowth: 48.2,
    dividendYield: 0.6,
    marketCap: 380000,
    momentumScore: 88,
    trend: "bullish",
    yearReturn: 65.2,
    beta: 1.42,
    capSize: "large",
  },
  TATASTEEL: {
    symbol: "TATASTEEL",
    name: "Tata Steel",
    sector: "Materials",
    currentPrice: 165,
    pe: 24.2,
    pb: 1.8,
    roe: 7.2,
    debtToEquity: 0.95,
    revenueGrowth: -3.5,
    profitGrowth: -12.4,
    dividendYield: 2.1,
    marketCap: 185000,
    momentumScore: 68,
    trend: "neutral",
    yearReturn: 14.5,
    beta: 1.28,
    capSize: "large",
  },
  ZOMATO: {
    symbol: "ZOMATO",
    name: "Zomato Limited",
    sector: "IT",
    currentPrice: 180,
    pe: 125.4,
    pb: 6.8,
    roe: 3.5,
    debtToEquity: 0,
    revenueGrowth: 38.5,
    profitGrowth: 110.2,
    dividendYield: 0,
    marketCap: 165000,
    momentumScore: 92,
    trend: "bullish",
    yearReturn: 98.4,
    beta: 1.58,
    capSize: "large",
  },
  SUZLON: {
    symbol: "SUZLON",
    name: "Suzlon Energy",
    sector: "Energy",
    currentPrice: 52,
    pe: 65.4,
    pb: 8.5,
    roe: 18.2,
    debtToEquity: 0.1,
    revenueGrowth: 15.2,
    profitGrowth: 35.8,
    dividendYield: 0,
    marketCap: 72000,
    momentumScore: 95,
    trend: "bullish",
    yearReturn: 185.0,
    beta: 1.88,
    capSize: "mid",
  },
  JIOFIN: {
    symbol: "JIOFIN",
    name: "Jio Financial Services",
    sector: "Banking & Finance",
    currentPrice: 355,
    pe: 85.0,
    pb: 2.5,
    roe: 2.8,
    debtToEquity: 0.02,
    revenueGrowth: 8.2,
    profitGrowth: 10.5,
    dividendYield: 0,
    marketCap: 225000,
    momentumScore: 70,
    trend: "bullish",
    yearReturn: 28.4,
    beta: 1.12,
    capSize: "large",
  },
  RVNL: {
    symbol: "RVNL",
    name: "Rail Vikas Nigam",
    sector: "Infrastructure",
    currentPrice: 380,
    pe: 35.8,
    pb: 6.2,
    roe: 20.5,
    debtToEquity: 0.85,
    revenueGrowth: 12.8,
    profitGrowth: 18.2,
    dividendYield: 1.2,
    marketCap: 84000,
    momentumScore: 90,
    trend: "bullish",
    yearReturn: 145.0,
    beta: 1.72,
    capSize: "mid",
  },
  IREDA: {
    symbol: "IREDA",
    name: "Indian Renewable Energy Development Agency",
    sector: "Banking & Finance",
    currentPrice: 195,
    pe: 42.5,
    pb: 5.2,
    roe: 16.8,
    debtToEquity: 4.5,
    revenueGrowth: 22.1,
    profitGrowth: 28.5,
    dividendYield: 0.5,
    marketCap: 65000,
    momentumScore: 88,
    trend: "bullish",
    yearReturn: 120.0,
    beta: 1.65,
    capSize: "mid",
  },
  BSE: {
    symbol: "BSE",
    name: "BSE Limited",
    sector: "Banking & Finance",
    currentPrice: 2450,
    pe: 45.2,
    pb: 8.2,
    roe: 18.5,
    debtToEquity: 0,
    revenueGrowth: 28.2,
    profitGrowth: 42.5,
    dividendYield: 1.0,
    marketCap: 45000,
    momentumScore: 91,
    trend: "bullish",
    yearReturn: 168.0,
    beta: 1.32,
    capSize: "mid",
  },
  YESBANK: {
    symbol: "YESBANK",
    name: "Yes Bank",
    sector: "Banking & Finance",
    currentPrice: 24,
    pe: 62.4,
    pb: 1.2,
    roe: 2.1,
    debtToEquity: 0,
    revenueGrowth: 8.5,
    profitGrowth: 12.8,
    dividendYield: 0,
    marketCap: 78000,
    momentumScore: 52,
    trend: "neutral",
    yearReturn: 18.5,
    beta: 1.48,
    capSize: "mid",
  },
  KPITTECH: {
    symbol: "KPITTECH",
    name: "KPIT Technologies",
    sector: "IT",
    currentPrice: 1450,
    pe: 58.2,
    pb: 14.2,
    roe: 28.5,
    debtToEquity: 0.12,
    revenueGrowth: 30.5,
    profitGrowth: 38.2,
    dividendYield: 0.4,
    marketCap: 48000,
    momentumScore: 78,
    trend: "bullish",
    yearReturn: 45.2,
    beta: 1.38,
    capSize: "mid",
  },
  NHPC: {
    symbol: "NHPC",
    name: "NHPC Limited",
    sector: "Energy",
    currentPrice: 95,
    pe: 18.2,
    pb: 1.5,
    roe: 9.8,
    debtToEquity: 0.82,
    revenueGrowth: 5.2,
    profitGrowth: 8.4,
    dividendYield: 3.5,
    marketCap: 95000,
    momentumScore: 65,
    trend: "neutral",
    yearReturn: 32.5,
    beta: 1.18,
    capSize: "mid",
  },
  SULA: {
    symbol: "SULA",
    name: "Sula Vineyards",
    sector: "FMCG",
    currentPrice: 520,
    pe: 32.5,
    pb: 4.2,
    roe: 14.8,
    debtToEquity: 0.22,
    revenueGrowth: 10.5,
    profitGrowth: 15.2,
    dividendYield: 1.8,
    marketCap: 4500,
    momentumScore: 58,
    trend: "neutral",
    yearReturn: 12.5,
    beta: 0.92,
    capSize: "small",
  },
  MARKSANS: {
    symbol: "MARKSANS",
    name: "Marksans Pharma",
    sector: "Pharma",
    currentPrice: 165,
    pe: 22.4,
    pb: 3.1,
    roe: 18.2,
    debtToEquity: 0.08,
    revenueGrowth: 18.2,
    profitGrowth: 24.5,
    dividendYield: 0.5,
    marketCap: 7200,
    momentumScore: 72,
    trend: "bullish",
    yearReturn: 38.5,
    beta: 1.15,
    capSize: "small",
  },
  MOREPENLAB: {
    symbol: "MOREPENLAB",
    name: "Morepen Laboratories",
    sector: "Pharma",
    currentPrice: 55,
    pe: 28.5,
    pb: 2.2,
    roe: 10.5,
    debtToEquity: 0.15,
    revenueGrowth: 12.5,
    profitGrowth: 16.8,
    dividendYield: 0.2,
    marketCap: 3200,
    momentumScore: 60,
    trend: "neutral",
    yearReturn: 22.5,
    beta: 1.25,
    capSize: "small",
  },
  INDHOTEL: {
    symbol: "INDHOTEL",
    name: "The Indian Hotels Company",
    sector: "Consumer Services",
    currentPrice: 680,
    pe: 65.5,
    pb: 7.5,
    roe: 13.5,
    debtToEquity: 0.15,
    revenueGrowth: 16.5,
    profitGrowth: 28.2,
    dividendYield: 0.35,
    marketCap: 98000,
    momentumScore: 78,
    trend: "bullish",
    yearReturn: 45.5,
    beta: 1.1,
    capSize: "large",
  },
  LEMONTREE: {
    symbol: "LEMONTREE",
    name: "Lemon Tree Hotels",
    sector: "Consumer Services",
    currentPrice: 108,
    pe: 55.2,
    pb: 6.2,
    roe: 11.8,
    debtToEquity: 1.2,
    revenueGrowth: 18.5,
    profitGrowth: 32.4,
    dividendYield: 0,
    marketCap: 8500,
    momentumScore: 48,
    trend: "neutral",
    yearReturn: 12.5,
    beta: 1.2,
    capSize: "small",
  },
  TRENT: {
    symbol: "TRENT",
    name: "Trent Limited",
    sector: "Consumer Services",
    currentPrice: 2750,
    pe: 120.4,
    pb: 18.5,
    roe: 15.6,
    debtToEquity: 0.1,
    revenueGrowth: 38.2,
    profitGrowth: 48.5,
    dividendYield: 0.15,
    marketCap: 185000,
    momentumScore: 92,
    trend: "bullish",
    yearReturn: 135.0,
    beta: 1.15,
    capSize: "large",
  },
  HAL: {
    symbol: "HAL",
    name: "Hindustan Aeronautics",
    sector: "Aerospace & Defence",
    currentPrice: 4100,
    pe: 38.5,
    pb: 8.8,
    roe: 26.2,
    debtToEquity: 0.02,
    revenueGrowth: 12.8,
    profitGrowth: 31.2,
    dividendYield: 1.2,
    marketCap: 295000,
    momentumScore: 85,
    trend: "bullish",
    yearReturn: 115.0,
    beta: 1.12,
    capSize: "large",
  },
  BEL: {
    symbol: "BEL",
    name: "Bharat Electronics",
    sector: "Aerospace & Defence",
    currentPrice: 280,
    pe: 45.2,
    pb: 10.2,
    roe: 24.5,
    debtToEquity: 0.01,
    revenueGrowth: 14.5,
    profitGrowth: 28.5,
    dividendYield: 0.9,
    marketCap: 210000,
    momentumScore: 82,
    trend: "bullish",
    yearReturn: 130.0,
    beta: 1.18,
    capSize: "large",
  },
  MAZDOCK: {
    symbol: "MAZDOCK",
    name: "Mazagon Dock Shipbuilders",
    sector: "Aerospace & Defence",
    currentPrice: 2410,
    pe: 42.4,
    pb: 11.5,
    roe: 28.5,
    debtToEquity: 0,
    revenueGrowth: 22.5,
    profitGrowth: 35.4,
    dividendYield: 1.8,
    marketCap: 82000,
    momentumScore: 94,
    trend: "bullish",
    yearReturn: 185.0,
    beta: 1.45,
    capSize: "mid",
  },
  COCHINSHIP: {
    symbol: "COCHINSHIP",
    name: "Cochin Shipyard",
    sector: "Aerospace & Defence",
    currentPrice: 1420,
    pe: 48.5,
    pb: 6.8,
    roe: 14.2,
    debtToEquity: 0.12,
    revenueGrowth: 18.5,
    profitGrowth: 25.4,
    dividendYield: 0.8,
    marketCap: 37000,
    momentumScore: 89,
    trend: "bullish",
    yearReturn: 142.0,
    beta: 1.35,
    capSize: "mid",
  },
  COALINDIA: {
    symbol: "COALINDIA",
    name: "Coal India Limited",
    sector: "Materials",
    currentPrice: 443,
    pe: 9.5,
    pb: 3.2,
    roe: 42.5,
    debtToEquity: 0.05,
    revenueGrowth: 6.5,
    profitGrowth: 18.2,
    dividendYield: 5.8,
    marketCap: 285000,
    momentumScore: 68,
    trend: "neutral",
    yearReturn: 65.0,
    beta: 0.95,
    capSize: "large",
  },
  AMARAJABAT: {
    symbol: "AMARAJABAT",
    name: "Amara Raja Energy & Mobility",
    sector: "Auto",
    currentPrice: 823,
    pe: 18.5,
    pb: 2.8,
    roe: 15.2,
    debtToEquity: 0.08,
    revenueGrowth: 12.5,
    profitGrowth: 18.4,
    dividendYield: 1.2,
    marketCap: 15000,
    momentumScore: 72,
    trend: "bullish",
    yearReturn: 42.5,
    beta: 1.15,
    capSize: "mid",
  },
  AMBER: {
    symbol: "AMBER",
    name: "Amber Enterprises India",
    sector: "Infrastructure",
    currentPrice: 7420,
    pe: 65.2,
    pb: 4.5,
    roe: 7.2,
    debtToEquity: 0.35,
    revenueGrowth: 18.2,
    profitGrowth: 22.5,
    dividendYield: 0.1,
    marketCap: 14000,
    momentumScore: 88,
    trend: "bullish",
    yearReturn: 85.2,
    beta: 1.2,
    capSize: "mid",
  },
  ANANTRAJ: {
    symbol: "ANANTRAJ",
    name: "Anant Raj Limited",
    sector: "Infrastructure",
    currentPrice: 534,
    pe: 42.5,
    pb: 3.8,
    roe: 9.2,
    debtToEquity: 0.25,
    revenueGrowth: 28.5,
    profitGrowth: 45.2,
    dividendYield: 0.15,
    marketCap: 16000,
    momentumScore: 92,
    trend: "bullish",
    yearReturn: 145.0,
    beta: 1.3,
    capSize: "mid",
  },
  BDL: {
    symbol: "BDL",
    name: "Bharat Dynamics Limited",
    sector: "Aerospace & Defence",
    currentPrice: 1200,
    pe: 58.5,
    pb: 12.2,
    roe: 22.5,
    debtToEquity: 0,
    revenueGrowth: 15.2,
    profitGrowth: 28.4,
    dividendYield: 0.8,
    marketCap: 38000,
    momentumScore: 82,
    trend: "bullish",
    yearReturn: 120.0,
    beta: 1.25,
    capSize: "mid",
  },
  CENTRALBK: {
    symbol: "CENTRALBK",
    name: "Central Bank of India",
    sector: "Banking & Finance",
    currentPrice: 31,
    pe: 16.5,
    pb: 1.2,
    roe: 8.5,
    debtToEquity: 0,
    revenueGrowth: 8.2,
    profitGrowth: 18.5,
    dividendYield: 0,
    marketCap: 45000,
    momentumScore: 58,
    trend: "neutral",
    yearReturn: 35.0,
    beta: 1.3,
    capSize: "mid",
  },
  CDSL: {
    symbol: "CDSL",
    name: "Central Depository Services",
    sector: "Banking & Finance",
    currentPrice: 1227,
    pe: 55.2,
    pb: 14.8,
    roe: 28.2,
    debtToEquity: 0,
    revenueGrowth: 24.5,
    profitGrowth: 38.2,
    dividendYield: 1.6,
    marketCap: 26000,
    momentumScore: 88,
    trend: "bullish",
    yearReturn: 120.0,
    beta: 1.1,
    capSize: "mid",
  },
  DIXON: {
    symbol: "DIXON",
    name: "Dixon Technologies",
    sector: "IT",
    currentPrice: 11546,
    pe: 98.4,
    pb: 24.5,
    roe: 22.4,
    debtToEquity: 0.15,
    revenueGrowth: 35.2,
    profitGrowth: 48.2,
    dividendYield: 0.08,
    marketCap: 68000,
    momentumScore: 90,
    trend: "bullish",
    yearReturn: 135.0,
    beta: 1.38,
    capSize: "large",
  },
  IOB: {
    symbol: "IOB",
    name: "Indian Overseas Bank",
    sector: "Banking & Finance",
    currentPrice: 33,
    pe: 22.5,
    pb: 2.1,
    roe: 7.8,
    debtToEquity: 0,
    revenueGrowth: 9.5,
    profitGrowth: 22.4,
    dividendYield: 0,
    marketCap: 98000,
    momentumScore: 62,
    trend: "neutral",
    yearReturn: 42.0,
    beta: 1.4,
    capSize: "mid",
  },
  INDIGO: {
    symbol: "INDIGO",
    name: "InterGlobe Aviation",
    sector: "Consumer Services",
    currentPrice: 4709,
    pe: 28.5,
    pb: 12.2,
    roe: 18.2,
    debtToEquity: 1.85,
    revenueGrowth: 22.1,
    profitGrowth: 42.8,
    dividendYield: 0,
    marketCap: 175000,
    momentumScore: 78,
    trend: "bullish",
    yearReturn: 85.0,
    beta: 1.1,
    capSize: "large",
  },
  IRB: {
    symbol: "IRB",
    name: "IRB Infrastructure Developers",
    sector: "Infrastructure",
    currentPrice: 20,
    pe: 32.4,
    pb: 2.1,
    roe: 7.5,
    debtToEquity: 1.8,
    revenueGrowth: 12.8,
    profitGrowth: 15.2,
    dividendYield: 0.5,
    marketCap: 38000,
    momentumScore: 65,
    trend: "neutral",
    yearReturn: 65.0,
    beta: 1.4,
    capSize: "mid",
  },
  KFINTECH: {
    symbol: "KFINTECH",
    name: "KFin Technologies",
    sector: "Banking & Finance",
    currentPrice: 826,
    pe: 38.2,
    pb: 7.8,
    roe: 22.4,
    debtToEquity: 0.05,
    revenueGrowth: 16.5,
    profitGrowth: 26.4,
    dividendYield: 0.6,
    marketCap: 14000,
    momentumScore: 80,
    trend: "bullish",
    yearReturn: 82.0,
    beta: 1.15,
    capSize: "mid",
  },
  PNB: {
    symbol: "PNB",
    name: "Punjab National Bank",
    sector: "Banking & Finance",
    currentPrice: 106,
    pe: 14.2,
    pb: 1.1,
    roe: 8.8,
    debtToEquity: 0,
    revenueGrowth: 10.5,
    profitGrowth: 24.8,
    dividendYield: 1.1,
    marketCap: 125000,
    momentumScore: 70,
    trend: "bullish",
    yearReturn: 65.0,
    beta: 1.28,
    capSize: "large",
  },
  TITAGARH: {
    symbol: "TITAGARH",
    name: "Titagarh Rail Systems",
    sector: "Infrastructure",
    currentPrice: 858,
    pe: 52.5,
    pb: 8.2,
    roe: 15.8,
    debtToEquity: 0.12,
    revenueGrowth: 28.2,
    profitGrowth: 42.5,
    dividendYield: 0.1,
    marketCap: 18000,
    momentumScore: 91,
    trend: "bullish",
    yearReturn: 168.0,
    beta: 1.42,
    capSize: "mid",
  },
  VBL: {
    symbol: "VBL",
    name: "Varun Beverages",
    sector: "FMCG",
    currentPrice: 522,
    pe: 68.4,
    pb: 16.5,
    roe: 26.5,
    debtToEquity: 0.45,
    revenueGrowth: 21.5,
    profitGrowth: 32.4,
    dividendYield: 0.25,
    marketCap: 165000,
    momentumScore: 78,
    trend: "bullish",
    yearReturn: 78.0,
    beta: 0.85,
    capSize: "large",
  },
};

export function getStockData(symbol: string): StockFundamentals | null {
  const normalized = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
  return STOCK_DATABASE[normalized] || null;
}

function deriveMomentum(yearReturn: number): Pick<StockFundamentals, "momentumScore" | "trend"> {
  const momentumScore = Math.min(100, Math.max(0, Math.round(50 + yearReturn * 2)));
  const trend: StockFundamentals["trend"] =
    yearReturn > 10 ? "bullish" : yearReturn < -5 ? "bearish" : "neutral";
  return { momentumScore, trend };
}

function mergeWithLiveQuote(
  staticStock: StockFundamentals,
  livePrice: number,
  yearReturn: number | null
): StockFundamentals {
  const momentum = yearReturn != null ? deriveMomentum(yearReturn) : {};
  return {
    ...staticStock,
    currentPrice: livePrice,
    ...(yearReturn != null ? { yearReturn, ...momentum } : {}),
  };
}

export interface EnrichedHoldingData {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  fundamentals: StockFundamentals | null;
}


/** Sync fallback — prefer static reference price over avgPrice so P&L isn't falsely 0%. */
export function enrichHolding(symbol: string, avgPrice: number): EnrichedHoldingData {
  const normalized = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
  const stock = getStockData(normalized);
  const fallbackPrice = stock?.currentPrice ?? avgPrice;

  if (stock) {
    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      currentPrice: fallbackPrice,
      fundamentals: { ...stock, currentPrice: fallbackPrice },
    };
  }
  return {
    symbol: normalized,
    name: normalized,
    sector: normalizeSector(guessSector(normalized, normalized)),
    currentPrice: fallbackPrice,
    fundamentals: null,
  };
}

export interface ScrapedFundamentals {
  pe?: number;
  roe?: number;
  bookValue?: number;
  dividendYield?: number;
  marketCap?: number;
  salesGrowth3Y?: number;
  profitGrowth3Y?: number;
  debtToEquity?: number;
  quarters?: PerformancePeriod[];
  annuals?: PerformancePeriod[];
}

interface ScreenerTable {
  headers: string[];
  rows: Record<string, string[]>;
}

function parseScreenerTable(sectionHtml: string): ScreenerTable | null {
  const tableStart = sectionHtml.indexOf("<table");
  const tableEnd = sectionHtml.indexOf("</table>");
  if (tableStart === -1 || tableEnd === -1) return null;

  const tableHtml = sectionHtml.substring(tableStart, tableEnd + 8);

  const theadStart = tableHtml.indexOf("<thead>");
  const theadEnd = tableHtml.indexOf("</thead>");
  const headers: string[] = [];
  if (theadStart !== -1 && theadEnd !== -1) {
    const theadHtml = tableHtml.substring(theadStart, theadEnd);
    const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/g;
    let match;
    let index = 0;
    while ((match = thRegex.exec(theadHtml)) !== null) {
      const hText = match[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/[^a-zA-Z0-9% ]/g, "").replace(/\s+/g, " ").trim();
      // Skip the first column header (it's the row labels column header, e.g. "Features" or empty or "Particulars")
      if (index > 0) {
        headers.push(hText);
      }
      index++;
    }
  }

  const tbodyStart = tableHtml.indexOf("<tbody>");
  const tbodyEnd = tableHtml.indexOf("</tbody>");
  const rows: Record<string, string[]> = {};
  if (tbodyStart !== -1 && tbodyEnd !== -1) {
    const tbodyHtml = tableHtml.substring(tbodyStart, tbodyEnd);
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let trMatch;
    while ((trMatch = trRegex.exec(tbodyHtml)) !== null) {
      const trContent = trMatch[1];
      const tdRegex = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/g;
      const tds: string[] = [];
      let tdMatch;
      while ((tdMatch = tdRegex.exec(trContent)) !== null) {
        const tdText = tdMatch[2].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
        tds.push(tdText);
      }
      if (tds.length > 0) {
        const rowName = tds[0].replace(/[^a-zA-Z0-9% ]/g, "").replace(/\s+/g, " ").trim();
        const rowValues = tds.slice(1).map(v => v.replace(/\s+/g, " ").trim());
        rows[rowName.toLowerCase()] = rowValues;
      }
    }
  }

  return { headers, rows };
}

function parsePerformancePeriods(table: ScreenerTable | null): PerformancePeriod[] {
  if (!table) return [];
  const periods: PerformancePeriod[] = [];
  const headers = table.headers;
  
  const findRow = (keys: string[]) => {
    for (const key of keys) {
      if (table.rows[key]) return table.rows[key];
      const foundKey = Object.keys(table.rows).find(k => k.includes(key));
      if (foundKey) return table.rows[foundKey];
    }
    return [];
  };

  const salesRow = findRow(["net sales", "sales", "revenue", "interest earned", "income"]);
  const profitRow = findRow(["net profit", "profit after tax", "profit for the period"]);
  const opmRow = findRow(["opm %", "financing margin %", "operating margin %", "margin"]);
  const epsRow = findRow(["eps in rs", "eps", "adjusted eps rs", "equity dividend"]);
  const opRow = findRow(["operating profit", "profit before tax"]);

  for (let i = 0; i < headers.length; i++) {
    const period = headers[i];
    const sales = parseFloat((salesRow[i] || "").replace(/,/g, "")) || 0;
    const netProfit = parseFloat((profitRow[i] || "").replace(/,/g, "")) || 0;
    
    let opmPercent = 0;
    if (opmRow && opmRow[i]) {
      opmPercent = parseFloat((opmRow[i] || "").replace(/%/g, "")) || 0;
    } else if (sales > 0 && opRow && opRow[i]) {
      const op = parseFloat((opRow[i] || "").replace(/,/g, "")) || 0;
      opmPercent = Math.round((op / sales) * 10000) / 100;
    }
    
    const eps = parseFloat((epsRow[i] || "")) || 0;

    periods.push({
      period,
      sales,
      netProfit,
      opmPercent,
      eps
    });
  }

  return periods;
}

export async function fetchFinologyRatios(symbol: string): Promise<ScrapedFundamentals | null> {
  const cleanSym = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "").replace(/\s+/g, "").trim();
  try {
    const url = `https://ticker.finology.in/company/${encodeURIComponent(cleanSym)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const data: ScrapedFundamentals = {};

    const essentialsIdx = html.indexOf('id="companyessentials"');
    if (essentialsIdx !== -1) {
      const essentialsHtml = html.substring(essentialsIdx, essentialsIdx + 10000);
      const cleanEssentials = essentialsHtml.replace(/&#8377;/g, "").replace(/&nbsp;/g, " ");

      const mCapMatch = cleanEssentials.match(/Market\s+Cap[\s\S]*?class=['"]Number['"]>([\d\.,]+)/i);
      if (mCapMatch) data.marketCap = parseFloat(mCapMatch[1].replace(/,/g, ""));

      const peMatch = cleanEssentials.match(/P\/E[\s\S]*?<p>([\s\S]*?)<\/p>/i);
      if (peMatch) {
        const val = parseFloat(peMatch[1].replace(/<[^>]*>/g, "").trim());
        if (!isNaN(val)) data.pe = val;
      }

      const bvMatch = cleanEssentials.match(/Book\s+Value[\s\S]*?class=['"]Number['"]>([\d\.,-]+)/i);
      if (bvMatch) data.bookValue = parseFloat(bvMatch[1].replace(/,/g, ""));

      const divMatch = cleanEssentials.match(/Div\.\s+Yield[\s\S]*?<p>([\s\S]*?)<\/p>/i);
      if (divMatch) {
        const val = parseFloat(divMatch[1].replace(/<[^>]*>/g, "").replace(/%/g, "").trim());
        if (!isNaN(val)) data.dividendYield = val;
      }

      const roeMatch = cleanEssentials.match(/ROE[\s\S]*?class=['"]Number['"]>([\d\.,-]+)/i);
      if (roeMatch) data.roe = parseFloat(roeMatch[1].replace(/,/g, ""));

      const salesMatch = cleanEssentials.match(/Sales\s+Growth[\s\S]*?class=['"]Number['"]>([\d\.,-]+)/i);
      if (salesMatch) data.salesGrowth3Y = parseFloat(salesMatch[1].replace(/,/g, ""));

      const profitMatch = cleanEssentials.match(/Profit\s+Growth[\s\S]*?class=['"]Number['"]>([\d\.,-]+)/i);
      if (profitMatch) data.profitGrowth3Y = parseFloat(profitMatch[1].replace(/,/g, ""));
    }

    const deMatch = html.match(/id="mainContent_lblDebtEquity">Debt\/Equity[\s\S]*?class=['"]Number['"]>([\d\.,-]+)/i);
    if (deMatch) {
      data.debtToEquity = parseFloat(deMatch[1].replace(/,/g, ""));
    } else {
      data.debtToEquity = 0;
    }

    const quartersIdx = html.indexOf('id="mainContent_quarterly"');
    if (quartersIdx !== -1) {
      const table = parseScreenerTable(html.substring(quartersIdx, quartersIdx + 35000));
      data.quarters = parsePerformancePeriods(table);
    }

    const plIdx = html.indexOf('Profit & Loss');
    if (plIdx !== -1) {
      const table = parseScreenerTable(html.substring(plIdx, plIdx + 35000));
      data.annuals = parsePerformancePeriods(table);
    }

    return data;
  } catch (err) {
    console.error("Finology scraping failed for symbol:", symbol, err);
    return null;
  }
}

const getFs = () => {
  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("fs");
    } catch {
      return null;
    }
  }
  return null;
};

const getPath = () => {
  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("path");
    } catch {
      return null;
    }
  }
  return null;
};

const CACHE_FILE_NAME = ".screener_cache.json";

function getCacheFilePath(): string | null {
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return null;
  return path.join(process.cwd(), CACHE_FILE_NAME);
}

function loadCacheFromDisk(): Map<string, { data: ScrapedFundamentals | null; fetchedAt: number }> {
  const cache = new Map<string, { data: ScrapedFundamentals | null; fetchedAt: number }>();
  const fs = getFs();
  const filePath = getCacheFilePath();
  if (!fs || !filePath) return cache;

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      for (const [key, value] of Object.entries(parsed)) {
        cache.set(key, value as { data: ScrapedFundamentals | null; fetchedAt: number });
      }
      console.log(`[Cache] Loaded ${cache.size} entries from ${CACHE_FILE_NAME}`);
    }
  } catch (err) {
    console.error(`[Cache] Failed to load cache from disk:`, err);
  }
  return cache;
}

function saveCacheToDisk(cache: Map<string, { data: ScrapedFundamentals | null; fetchedAt: number }>) {
  const fs = getFs();
  const filePath = getCacheFilePath();
  if (!fs || !filePath) return;

  try {
    const obj: Record<string, { data: ScrapedFundamentals | null; fetchedAt: number }> = {};
    for (const [key, value] of cache.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error(`[Cache] Failed to save cache to disk:`, err);
  }
}

const screenerCache = loadCacheFromDisk();
const SCREENER_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours cache

export async function fetchScreenerRatios(symbol: string): Promise<ScrapedFundamentals | null> {
  const cleanSym = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "").replace(/\s+/g, "").trim();
  const cached = screenerCache.get(cleanSym);
  if (cached && Date.now() - cached.fetchedAt < SCREENER_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://www.screener.in/company/${encodeURIComponent(cleanSym)}/`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      if (res.status === 404) {
        screenerCache.set(cleanSym, { data: null, fetchedAt: Date.now() });
        saveCacheToDisk(screenerCache);
        return null;
      }
      const fallback = await fetchFinologyRatios(symbol);
      screenerCache.set(cleanSym, { data: fallback, fetchedAt: Date.now() });
      saveCacheToDisk(screenerCache);
      return fallback;
    }
    const html = await res.text();

    const data: ScrapedFundamentals = {};

    // 1. Extract from #top-ratios list
    const liRegex = /<li[^>]*>[\s\S]*?<span class="name">([\s\S]*?)<\/span>[\s\S]*?<span class="number">([\s\S]*?)<\/span>[\s\S]*?<\/li>/g;
    let match;
    while ((match = liRegex.exec(html)) !== null) {
      const name = match[1].trim().toLowerCase();
      const valueStr = match[2].replace(/,/g, "").trim();
      const val = parseFloat(valueStr);
      if (isNaN(val)) continue;

      if (name.includes("stock p/e")) {
        data.pe = val;
      } else if (name.includes("roe")) {
        data.roe = val;
      } else if (name.includes("book value")) {
        data.bookValue = val;
      } else if (name.includes("dividend yield")) {
        data.dividendYield = val;
      } else if (name.includes("market cap")) {
        data.marketCap = val;
      }
    }

    // 2. Extract Compounded Sales Growth
    const salesRegex = /Compounded Sales Growth[\s\S]*?<td>3 Years:<\/td>[\s\S]*?<td>(-?\d+)%<\/td>/i;
    const salesMatch = html.match(salesRegex);
    if (salesMatch) {
      data.salesGrowth3Y = parseFloat(salesMatch[1]);
    }

    // 3. Extract Compounded Profit Growth
    const profitRegex = /Compounded Profit Growth[\s\S]*?<td>3 Years:<\/td>[\s\S]*?<td>(-?\d+)%<\/td>/i;
    const profitMatch = html.match(profitRegex);
    if (profitMatch) {
      data.profitGrowth3Y = parseFloat(profitMatch[1]);
    }

    // 4. Calculate Debt to Equity from Balance Sheet
    const reservesRegex = /Reserves[\s\S]*?<\/td>([\s\S]*?)<\/tr>/i;
    const reservesMatch = html.match(reservesRegex);
    let reserves = 0;
    if (reservesMatch) {
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      const tds = [];
      let tdMatch;
      while ((tdMatch = tdRegex.exec(reservesMatch[1])) !== null) {
        tds.push(tdMatch[1].replace(/,/g, "").trim());
      }
      const val = parseFloat(tds[tds.length - 1]);
      if (!isNaN(val)) reserves = val;
    }

    const shareCapitalRegex = /Share Capital[\s\S]*?<\/td>([\s\S]*?)<\/tr>/i;
    const shareCapitalMatch = html.match(shareCapitalRegex);
    let shareCapital = 0;
    if (shareCapitalMatch) {
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      const tds = [];
      let tdMatch;
      while ((tdMatch = tdRegex.exec(shareCapitalMatch[1])) !== null) {
        tds.push(tdMatch[1].replace(/,/g, "").trim());
      }
      const val = parseFloat(tds[tds.length - 1]);
      if (!isNaN(val)) shareCapital = val;
    }

    const borrowingsRegex = /Borrowings[\s\S]*?<\/td>([\s\S]*?)<\/tr>/i;
    const borrowingsMatch = html.match(borrowingsRegex);
    let borrowings = 0;
    if (borrowingsMatch) {
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      const tds = [];
      let tdMatch;
      while ((tdMatch = tdRegex.exec(borrowingsMatch[1])) !== null) {
        tds.push(tdMatch[1].replace(/,/g, "").trim());
      }
      const val = parseFloat(tds[tds.length - 1]);
      if (!isNaN(val)) borrowings = val;
    }

    const equity = shareCapital + reserves;
    if (equity > 0) {
      data.debtToEquity = Math.round((borrowings / equity) * 100) / 100;
    } else {
      data.debtToEquity = 0;
    }

    // 5. Parse Quarters and Annual tables
    const quartersIdx = html.indexOf('id="quarters"');
    if (quartersIdx !== -1) {
      const table = parseScreenerTable(html.substring(quartersIdx, quartersIdx + 35000));
      data.quarters = parsePerformancePeriods(table);
    }

    const plIdx = html.indexOf('id="profit-loss"');
    if (plIdx !== -1) {
      const table = parseScreenerTable(html.substring(plIdx, plIdx + 35000));
      data.annuals = parsePerformancePeriods(table);
    }

    screenerCache.set(cleanSym, { data, fetchedAt: Date.now() });
    saveCacheToDisk(screenerCache);
    return data;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`Screener scraping failed for symbol "${symbol}", attempting Finology fallback:`, errMsg);
    const fallback = await fetchFinologyRatios(symbol);
    screenerCache.set(cleanSym, { data: fallback, fetchedAt: Date.now() });
    saveCacheToDisk(screenerCache);
    return fallback;
  }
}

/** Fetch live NSE prices from Yahoo Finance, with dynamic fundamentals from Screener.in or static database. */
export async function enrichHoldingAsync(
  symbol: string,
  avgPrice: number,
  liveQuotes?: Map<string, import("./yahoo-finance").YahooQuote>,
  resolvedInfo?: {
    resolvedSymbol: string;
    resolvedName?: string;
    resolvedYahooSymbol?: string;
    resolvedSector?: string;
  }
): Promise<EnrichedHoldingData> {
  const normalized = symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
  let resolvedSymbol = resolvedInfo?.resolvedSymbol || normalized;
  let staticStock = getStockData(resolvedSymbol);

  const { toYahooSymbol, fetchQuotes, fetchYearReturn, searchSymbols } = await import("./yahoo-finance");

  let resolvedYahooSymbol = resolvedInfo?.resolvedYahooSymbol || toYahooSymbol(resolvedSymbol);
  let resolvedName = resolvedInfo?.resolvedName || symbol;

  if (!staticStock && !resolvedInfo) {
    try {
      const searchHits = await searchSymbols(normalized, 5);
      if (searchHits && searchHits.length > 0) {
        const bestHit = searchHits.find(hit => hit.symbol.toUpperCase() === normalized.toUpperCase()) || searchHits[0];
        resolvedSymbol = bestHit.symbol;
        resolvedYahooSymbol = bestHit.yahooSymbol;
        resolvedName = bestHit.name;
        staticStock = getStockData(resolvedSymbol);
      }
    } catch (err) {
      console.error("Dynamic symbol search failed for query:", normalized, err);
    }
  }

  let quote = liveQuotes?.get(resolvedYahooSymbol);
  if (!quote) {
    try {
      const quotes = await fetchQuotes([resolvedYahooSymbol]);
      quote = quotes[0];
    } catch {
      return enrichHolding(symbol, avgPrice);
    }
  }

  if (!quote) return enrichHolding(symbol, avgPrice);

  let yearReturn: number | null = null;
  try {
    yearReturn = await fetchYearReturn(resolvedYahooSymbol);
  } catch {
    // keep static year return if chart fetch fails
  }

  if (staticStock) {
    let scraped: ScrapedFundamentals | null = null;
    try {
      scraped = await fetchScreenerRatios(resolvedSymbol);
    } catch (err) {
      console.error("Failed to fetch dynamic screener data for symbol:", resolvedSymbol, err);
    }

    if (scraped && Object.keys(scraped).length > 0) {
      const momentum = yearReturn != null ? deriveMomentum(yearReturn) : { momentumScore: staticStock.momentumScore || 50, trend: staticStock.trend || ("neutral" as const) };
      const fundamentals: StockFundamentals = {
        ...staticStock,
        currentPrice: quote.price,
        pe: scraped.pe || staticStock.pe,
        pb: scraped.bookValue && scraped.bookValue > 0 ? Math.round((quote.price / scraped.bookValue) * 100) / 100 : staticStock.pb,
        roe: scraped.roe || staticStock.roe,
        debtToEquity: scraped.debtToEquity !== undefined ? scraped.debtToEquity : staticStock.debtToEquity,
        revenueGrowth: scraped.salesGrowth3Y || staticStock.revenueGrowth,
        profitGrowth: scraped.profitGrowth3Y || staticStock.profitGrowth,
        dividendYield: scraped.dividendYield !== undefined ? scraped.dividendYield : staticStock.dividendYield,
        marketCap: scraped.marketCap || staticStock.marketCap,
        yearReturn: yearReturn ?? staticStock.yearReturn,
        capSize: scraped.marketCap ? (scraped.marketCap > 100000 ? "large" : scraped.marketCap > 20000 ? "mid" : "small") : staticStock.capSize,
        quarters: scraped.quarters || [],
        annuals: scraped.annuals || [],
        ...momentum,
      };
      return {
        symbol: staticStock.symbol,
        name: staticStock.name,
        sector: staticStock.sector,
        currentPrice: quote.price,
        fundamentals,
      };
    }

    const fundamentals = mergeWithLiveQuote(staticStock, quote.price, yearReturn);
    return {
      symbol: staticStock.symbol,
      name: staticStock.name,
      sector: staticStock.sector,
      currentPrice: quote.price,
      fundamentals,
    };
  }

  const name = quote.name || resolvedName;
  const sector = normalizeSector(resolvedInfo?.resolvedSector || guessSector(name, resolvedSymbol));

  let scraped: ScrapedFundamentals | null = null;
  try {
    scraped = await fetchScreenerRatios(resolvedSymbol);
  } catch (err) {
    console.error("Failed to fetch dynamic screener data for symbol:", resolvedSymbol, err);
  }

  if (!scraped || Object.keys(scraped).length === 0) {
    return {
      symbol: resolvedSymbol,
      name: name,
      sector: sector,
      currentPrice: quote.price,
      fundamentals: null,
    };
  }

  const momentum = yearReturn != null ? deriveMomentum(yearReturn) : { momentumScore: 50, trend: "neutral" as const };
  const fundamentals: StockFundamentals = {
    symbol: resolvedSymbol,
    name: name,
    sector: sector,
    currentPrice: quote.price,
    pe: scraped.pe || 0,
    pb: scraped.bookValue && scraped.bookValue > 0 ? Math.round((quote.price / scraped.bookValue) * 100) / 100 : 0,
    roe: scraped.roe || 0,
    debtToEquity: scraped.debtToEquity || 0,
    revenueGrowth: scraped.salesGrowth3Y || 0,
    profitGrowth: scraped.profitGrowth3Y || 0,
    dividendYield: scraped.dividendYield || 0,
    marketCap: scraped.marketCap || 0,
    yearReturn: yearReturn ?? 0,
    beta: 1.0,
    capSize: scraped.marketCap ? (scraped.marketCap > 100000 ? "large" : scraped.marketCap > 20000 ? "mid" : "small") : "mid",
    quarters: scraped.quarters || [],
    annuals: scraped.annuals || [],
    ...momentum,
  };

  return {
    symbol: resolvedSymbol,
    name: name,
    sector: sector,
    currentPrice: quote.price,
    fundamentals,
  };
}

export function cleanSymbolForSearch(symbol: string): string {
  let clean = symbol.toUpperCase().trim();
  
  // Strip parenthesized terms
  clean = clean.replace(/\((I|INDIA|IND|NSE|BSE)\)/g, " ");
  clean = clean.replace(/\(([^)]+)\)/g, " $1 "); 

  // Strip common suffixes from the end of the string
  const suffixes = [
    "SYSTEMSLTD", "MOBLTD", "CO.LTD", "COLTD", "LTD", "LIMITED", "CORP", "CORPORATION", 
    "SYSTEMS", "RAIL", "ENERGY", "ENTERPRISES", "CO", "COMMUNICATIONS", "INDUSTRIES", 
    "FINANCE", "FINCORP", "DEVELOPMENT", "RENEWABLE", "INFRASTRUCTURE", "JEWELLERS", 
    "BEVERAGES", "ELECTRONICS", "SHIPBUILDERS", "HOLDINGS", "INVESTMENTS", "SERVICES", 
    "PEOPLE", "PORTS", "POWER", "STEEL", "CEMENT", "PHARMA", "CHEMICALS", "AUTOMOTIVE", 
    "MOTORS", "AVIATION", "PETROLEUM", "INSURANCE", "BANK", "ASSET"
  ];
  
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of suffixes) {
      if (clean.endsWith(suffix)) {
        clean = clean.slice(0, -suffix.length).trim();
        changed = true;
        break;
      }
    }
  }

  // Split common merged keywords
  const wordReplacements = [
    { pattern: /COALINDIA/g, replacement: "COAL INDIA" },
    { pattern: /ANGELONE/g, replacement: "ANGEL ONE" },
    { pattern: /DIXONTECH/g, replacement: "DIXON TECH" },
    { pattern: /COCHINSHIP/g, replacement: "COCHIN SHIPYARD" },
    { pattern: /VARUNBEV/g, replacement: "VARUN BEVERAGES" },
    { pattern: /KPITTECH/g, replacement: "KPIT TECH" },
    { pattern: /LEMONTREE/g, replacement: "LEMON TREE" },
    { pattern: /TITAGARH/g, replacement: "TITAGARH" },
    { pattern: /WAAREE/g, replacement: "WAAREE" },
    { pattern: /AMARARAJA/g, replacement: "AMARA RAJA" },
    { pattern: /JIOFIN/g, replacement: "JIO FINANCIAL" },
    { pattern: /KALYANKJIL/g, replacement: "KALYAN JEWELLERS" },
    { pattern: /TATAPOWER/g, replacement: "TATA POWER" },
    { pattern: /TATASTEEL/g, replacement: "TATA STEEL" },
    { pattern: /TATAMOTORS/g, replacement: "TATA MOTORS" },
    { pattern: /TATACONSUM/g, replacement: "TATA CONSUMER" },
    { pattern: /TATAELXSI/g, replacement: "TATA ELXSI" },
    { pattern: /HDFCBANK/g, replacement: "HDFC BANK" },
    { pattern: /ICICIBANK/g, replacement: "ICICI BANK" },
    { pattern: /INDUSINDBK/g, replacement: "INDUSIND BANK" },
    { pattern: /YESBANK/g, replacement: "YES BANK" },
    { pattern: /SBIN/g, replacement: "STATE BANK OF INDIA" },
    { pattern: /ONGC/g, replacement: "ONGC" },
    { pattern: /RVNL/g, replacement: "RAIL VIKAS INTEGRATED" },
    { pattern: /IRFC/g, replacement: "IRFC" },
    { pattern: /IRCTC/g, replacement: "IRCTC" },
    { pattern: /IREDA/g, replacement: "IREDA" },
    { pattern: /NHPC/g, replacement: "NHPC" },
    { pattern: /HUDCO/g, replacement: "HUDCO" },
    { pattern: /PFC/g, replacement: "POWER FINANCE" },
    { pattern: /RECLTD/g, replacement: "REC" },
  ];

  for (const { pattern, replacement } of wordReplacements) {
    clean = clean.replace(pattern, replacement);
  }
  
  return clean.replace(/\s+/g, " ").trim();
}

export async function enrichHoldingsBatch(
  holdings: Array<{ symbol: string; name?: string; avgPrice: number }>
): Promise<EnrichedHoldingData[]> {
  const { toYahooSymbol, fetchQuotes, searchSymbols } = await import("./yahoo-finance");

  interface ResolvedHoldingInfo {
    originalSymbol: string;
    resolvedSymbol: string;
    resolvedName?: string;
    resolvedYahooSymbol?: string;
    resolvedSector?: string;
    avgPrice: number;
  }

  // First, resolve all non-standard symbols or ISINs dynamically using a fallback search chain
  const resolvedHoldings: ResolvedHoldingInfo[] = await Promise.all(
    holdings.map(async (h) => {
      const normalized = h.symbol.toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/i, "");
      const staticStock = getStockData(normalized);
      if (staticStock) {
        return {
          originalSymbol: h.symbol,
          resolvedSymbol: staticStock.symbol,
          resolvedName: staticStock.name,
          resolvedYahooSymbol: toYahooSymbol(staticStock.symbol),
          resolvedSector: staticStock.sector,
          avgPrice: h.avgPrice,
        };
      }

      // Dynamic lookup fallback chain:
      // 1. Raw normalized symbol
      // 2. Stated company name from CSV (if available and different)
      // 3. Cleaned symbol to remove broker decorations and space-separate keywords
      const searchTerms: string[] = [];
      searchTerms.push(normalized);
      if (h.name && h.name.toUpperCase().trim() !== normalized) {
        searchTerms.push(h.name);
      }
      const cleaned = cleanSymbolForSearch(normalized);
      if (cleaned && cleaned !== normalized) {
        searchTerms.push(cleaned);
      }

      for (const term of searchTerms) {
        try {
          const searchHits = await searchSymbols(term, 5);
          if (searchHits && searchHits.length > 0) {
            const bestHit = searchHits.find(hit => hit.symbol.toUpperCase() === term.toUpperCase()) || searchHits[0];
            return {
              originalSymbol: h.symbol,
              resolvedSymbol: bestHit.symbol,
              resolvedName: bestHit.name,
              resolvedYahooSymbol: bestHit.yahooSymbol,
              resolvedSector: normalizeSector(bestHit.sector || ""),
              avgPrice: h.avgPrice,
            };
          }
        } catch (err) {
          console.error(`Dynamic symbol search failed for term "${term}" in batch:`, err);
        }
      }

      return {
        originalSymbol: h.symbol,
        resolvedSymbol: normalized,
        resolvedYahooSymbol: toYahooSymbol(normalized),
        avgPrice: h.avgPrice,
      };
    })
  );

  const yahooSymbols = resolvedHoldings.map((h) => h.resolvedYahooSymbol || toYahooSymbol(h.resolvedSymbol));
  let quoteMap = new Map<string, import("./yahoo-finance").YahooQuote>();

  try {
    const quotes = await fetchQuotes(yahooSymbols);
    quoteMap = new Map(quotes.map((q) => [q.yahooSymbol, q]));
  } catch (err) {
    console.error("Batch quote fetch failed:", err);
  }

  const results = await Promise.all(
    resolvedHoldings.map(async (h) => {
      const yahooSymbol = h.resolvedYahooSymbol || toYahooSymbol(h.resolvedSymbol);
      if (!quoteMap.has(yahooSymbol)) {
        try {
          const single = await fetchQuotes([yahooSymbol]);
          if (single[0]) quoteMap.set(yahooSymbol, single[0]);
        } catch {
          // fall through to enrichHolding fallback
        }
      }
      return enrichHoldingAsync(h.originalSymbol, h.avgPrice, quoteMap, h);
    })
  );

  return results;
}

export interface LiveBenchmarks {
  nifty50: { name: string; yearReturn: number };
  sensex: { name: string; yearReturn: number };
}

let benchmarkCache: { data: LiveBenchmarks; fetchedAt: number } | null = null;

export async function getLiveBenchmarks(): Promise<LiveBenchmarks> {
  if (benchmarkCache && Date.now() - benchmarkCache.fetchedAt < 15 * 60 * 1000) {
    return benchmarkCache.data;
  }

  const { BENCHMARK_SYMBOLS, fetchYearReturn } = await import("./yahoo-finance");

  try {
    const [niftyReturn, sensexReturn] = await Promise.all([
      fetchYearReturn(BENCHMARK_SYMBOLS.nifty50),
      fetchYearReturn(BENCHMARK_SYMBOLS.sensex),
    ]);

    const data: LiveBenchmarks = {
      nifty50: {
        name: BENCHMARKS.nifty50.name,
        yearReturn: niftyReturn ?? BENCHMARKS.nifty50.yearReturn,
      },
      sensex: {
        name: BENCHMARKS.sensex.name,
        yearReturn: sensexReturn ?? BENCHMARKS.sensex.yearReturn,
      },
    };

    benchmarkCache = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    return {
      nifty50: { name: BENCHMARKS.nifty50.name, yearReturn: BENCHMARKS.nifty50.yearReturn },
      sensex: { name: BENCHMARKS.sensex.name, yearReturn: BENCHMARKS.sensex.yearReturn },
    };
  }
}
