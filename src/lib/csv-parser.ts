import Papa from "papaparse";

export interface ParsedHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  /** Per-share last traded price from the CSV, when present */
  csvLtp?: number;
  /** Total current/market value from the CSV, when present */
  csvCurrentValue?: number;
}

export interface ParseResult {
  holdings: ParsedHolding[];
  source: SourceType;
  errors: string[];
  detectedColumns?: Record<string, string | null>;
  headerRow?: number;
}

const SYMBOL_KEYS = [
  "symbol",
  "tradingsymbol",
  "trading symbol",
  "scrip",
  "scrip code",
  "scripcode",
  "ticker",
  "stock",
  "instrument",
  "nse symbol",
  "bse symbol",
];

const NAME_KEYS = [
  "name",
  "company",
  "company name",
  "security name",
  "scrip name",
  "stock name",
  "description",
  "security",
  "issuer name",
];

const ISIN_KEYS = ["isin", "isin code", "isin number"];

const QTY_KEYS = [
  "quantity",
  "qty",
  "units",
  "shares",
  "holding qty",
  "holding quantity",
  "balance",
  "current bal",
  "current balance",
  "closing balance",
  "no of shares",
  "no. of shares",
  "number of shares",
  "free balance",
  "total qty",
];

const AVG_PRICE_KEYS = [
  "avg price",
  "average price",
  "avg. price",
  "avg buy price",
  "average buy price",
  "buy price",
  "purchase price",
  "cost price",
  "avg cost",
  "average cost",
  "buy avg",
  "purchase rate",
  "average_price",
];

const LTP_KEYS = [
  "ltp",
  "last price",
  "last traded price",
  "current price",
  "market price",
  "close price",
  "closing price",
  "last",
];

const INVESTED_VALUE_KEYS = [
  "invested amount",
  "invested value",
  "investment amount",
  "cost value",
  "amount invested",
  "total invested",
];

const CURRENT_VALUE_KEYS = [
  "current value",
  "market value",
  "present value",
  "total value",
  "holding value",
  "portfolio value",
  "value",
];

const COMPANY_TO_SYMBOL: Record<string, string> = {
  RELIANCE: "RELIANCE",
  "RELIANCE INDUSTRIES": "RELIANCE",
  "RELIANCE INDUSTRIES LTD": "RELIANCE",
  TCS: "TCS",
  "TATA CONSULTANCY": "TCS",
  "TATA CONSULTANCY SERVICES": "TCS",
  HDFC: "HDFCBANK",
  "HDFC BANK": "HDFCBANK",
  INFOSYS: "INFY",
  INFY: "INFY",
  ICICI: "ICICIBANK",
  "ICICI BANK": "ICICIBANK",
  BHARTI: "BHARTIARTL",
  "BHARTI AIRTEL": "BHARTIARTL",
  ITC: "ITC",
  SBI: "SBIN",
  "STATE BANK": "SBIN",
  "STATE BANK OF INDIA": "SBIN",
  HUL: "HINDUNILVR",
  "HINDUSTAN UNILEVER": "HINDUNILVR",
  KOTAK: "KOTAKBANK",
  "KOTAK MAHINDRA": "KOTAKBANK",
  WIPRO: "WIPRO",
  MARUTI: "MARUTI",
  "MARUTI SUZUKI": "MARUTI",
  SUN: "SUNPHARMA",
  "SUN PHARMA": "SUNPHARMA",
  LARSEN: "LT",
  "L AND T": "LT",
  AXIS: "AXISBANK",
  "AXIS BANK": "AXISBANK",
};

function normalizeKey(key: string): string {
  return key
    .replace(/^\ufeff/, "")
    .toLowerCase()
    .trim()
    .replace(/[_\-./]+/g, " ")
    .replace(/\s+/g, " ");
}

function isLikelyLtpHeader(header: string): boolean {
  const norm = normalizeKey(header);
  if (
    norm.includes("avg") ||
    norm.includes("average") ||
    norm.includes("buy") ||
    norm.includes("purchase") ||
    norm.includes("cost")
  ) {
    return false;
  }
  return (
    norm.includes("ltp") ||
    norm.includes("last") ||
    norm.includes("current") ||
    norm.includes("market") ||
    norm.includes("close") ||
    norm.includes("closing")
  );
}

function findColumn(
  headers: string[],
  candidates: string[],
  options?: { exclude?: string[]; skipHeader?: (header: string) => boolean }
): string | null {
  const exclude = new Set(options?.exclude ?? []);
  const normalized = headers
    .map((h) => ({ original: h, norm: normalizeKey(h) }))
    .filter((h) => !exclude.has(h.original) && !options?.skipHeader?.(h.original));

  // Exact match first
  for (const candidate of candidates) {
    const match = normalized.find((h) => h.norm === candidate);
    if (match) return match.original;
  }

  // Prefix / contains match (candidate in header)
  for (const candidate of candidates) {
    const match = normalized.find(
      (h) => h.norm.startsWith(candidate) || h.norm.includes(candidate)
    );
    if (match) return match.original;
  }

  return null;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (value === null || value === undefined) return 0;

  let str = String(value).trim();
  if (!str || str === "-" || str === "NA" || str === "N/A") return 0;

  // Handle Indian number format: 1,23,456.78 or 1,23,456
  str = str.replace(/[₹$€\s]/g, "");

  // Parentheses for negative: (1,234.56)
  const negative = str.startsWith("(") && str.endsWith(")");
  if (negative) str = str.slice(1, -1);

  // Remove commas (works for both Western and Indian grouping)
  str = str.replace(/,/g, "");

  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return negative ? -num : num;
}

function resolveSymbol(
  row: Record<string, string>,
  symbolCol: string | null,
  nameCol: string | null,
  isinCol: string | null
): string {
  if (symbolCol && row[symbolCol]) {
    const sym = String(row[symbolCol]).trim().toUpperCase();
    if (sym.startsWith("INE") && sym.length >= 12) {
      // ISIN in symbol column — resolve via name
      if (nameCol && row[nameCol]) return nameFromCompany(String(row[nameCol]));
      return sym;
    }
    return sym.replace(/\.(NS|BO|NSE|BSE)$/i, "").replace(/\s+/g, "");
  }

  if (isinCol && row[isinCol]) {
    if (nameCol && row[nameCol]) return nameFromCompany(String(row[nameCol]));
  }

  if (nameCol && row[nameCol]) {
    return nameFromCompany(String(row[nameCol]));
  }

  return "UNKNOWN";
}

function nameFromCompany(name: string): string {
  const upper = name.toUpperCase().trim();

  if (COMPANY_TO_SYMBOL[upper]) return COMPANY_TO_SYMBOL[upper];

  for (const [key, symbol] of Object.entries(COMPANY_TO_SYMBOL)) {
    if (upper.includes(key) || key.includes(upper.split(" ")[0])) {
      return symbol;
    }
  }

  // First word if it looks like a ticker (all caps, short)
  const first = upper.split(/[\s,.-]+/)[0];
  if (first.length <= 12 && /^[A-Z0-9&]+$/.test(first)) return first;

  return upper.split(" ")[0];
}

export type SourceType = "cdsl" | "nsdl" | "zerodha" | "groww" | "generic";

export function detectSource(headers: string[]): SourceType {
  const joined = headers.map(normalizeKey).join("|");
  if (joined.includes("dp id") || joined.includes("bo id") || joined.includes("current bal"))
    return "cdsl";
  if (joined.includes("nsdl") || joined.includes("client id")) return "nsdl";
  if (joined.includes("tradingsymbol") || joined.includes("exchange")) return "zerodha";
  if (joined.includes("groww") || joined.includes("folio") || joined.includes("avg buy"))
    return "groww";
  return "generic";
}

function stripBOM(content: string): string {
  if (content.charCodeAt(0) === 0xfeff) return content.slice(1);
  return content;
}

function scoreHeaderLine(line: string): number {
  const norm = normalizeKey(line);
  const parts = norm.split(/[,;\t|]/).map((p) => p.trim());
  let score = 0;

  const allCandidates = [
    ...SYMBOL_KEYS,
    ...NAME_KEYS,
    ...ISIN_KEYS,
    ...QTY_KEYS,
    ...AVG_PRICE_KEYS,
    ...LTP_KEYS,
    ...INVESTED_VALUE_KEYS,
    ...CURRENT_VALUE_KEYS,
  ];

  for (const part of parts) {
    for (const c of allCandidates) {
      if (part === c || part.includes(c) || c.includes(part)) {
        score += 2;
        break;
      }
    }
  }

  return score;
}

function findHeaderRowIndex(lines: string[]): number {
  let bestIdx = 0;
  let bestScore = 0;

  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const score = scoreHeaderLine(line);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  // Need at least 2 recognizable columns
  return bestScore >= 4 ? bestIdx : 0;
}

function detectDelimiter(line: string): string {
  const delimiters = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = 0;

  for (const d of delimiters) {
    const count = line.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }

  return best;
}

function preprocessCSV(rawContent: string): { content: string; headerRow: number } {
  let content = stripBOM(rawContent).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Handle UTF-16 LE BOM
  if (content.charCodeAt(0) === 0xfffd && content.length > 1) {
    // Already mangled — can't recover easily
  }

  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { content, headerRow: 0 };

  const headerRow = findHeaderRowIndex(lines);

  // Rebuild from header row onward
  const trimmedLines = lines.slice(headerRow);
  content = trimmedLines.join("\n");

  return { content, headerRow };
}

export function parseHoldingsCSV(rawContent: string): ParseResult {
  const errors: string[] = [];

  if (!rawContent || !rawContent.trim()) {
    return { holdings: [], source: "generic", errors: ["File is empty"] };
  }

  const { content, headerRow } = preprocessCSV(rawContent);
  const firstLine = content.split("\n")[0] || "";
  const delimiter = detectDelimiter(firstLine);

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: "greedy",
    delimiter,
    transformHeader: (h) => h.replace(/^\ufeff/, "").trim(),
    transform: (value) => (typeof value === "string" ? value.trim() : value),
  });

  if (result.errors.length > 0) {
    const critical = result.errors.filter((e) => e.type !== "FieldMismatch");
    if (critical.length > 0) {
      errors.push(...critical.map((e) => e.message));
    }
  }

  const headers = (result.meta.fields || []).filter((h) => h && h.trim());
  if (headers.length === 0) {
    return {
      holdings: [],
      source: "generic",
      errors: ["No column headers found. Ensure your CSV has a header row with Symbol, Quantity, and Price columns."],
      headerRow,
    };
  }

  const source = detectSource(headers);

  const symbolCol = findColumn(headers, SYMBOL_KEYS);
  const nameCol = findColumn(headers, NAME_KEYS);
  const isinCol = findColumn(headers, ISIN_KEYS);
  const qtyCol = findColumn(headers, QTY_KEYS);
  const avgPriceCol = findColumn(headers, AVG_PRICE_KEYS, {
    skipHeader: isLikelyLtpHeader,
  });
  const ltpCol = findColumn(headers, LTP_KEYS, {
    exclude: avgPriceCol ? [avgPriceCol] : [],
  });
  const investedValueCol = findColumn(headers, INVESTED_VALUE_KEYS);
  const currentValueCol = findColumn(headers, CURRENT_VALUE_KEYS, {
    exclude: investedValueCol ? [investedValueCol] : [],
  });

  // Don't reuse the same column as both avg price and LTP
  const effectiveLtpCol = ltpCol && ltpCol !== avgPriceCol ? ltpCol : null;

  const detectedColumns = {
    symbol: symbolCol,
    name: nameCol,
    isin: isinCol,
    quantity: qtyCol,
    avgPrice: avgPriceCol,
    ltp: effectiveLtpCol,
    investedValue: investedValueCol,
    currentValue: currentValueCol,
    // Back-compat alias for the primary value column (invested preferred)
    value: investedValueCol ?? currentValueCol,
  };

  if (!qtyCol && !symbolCol && !nameCol && !isinCol) {
    errors.push(
      `Could not identify holdings columns. Found headers: ${headers.slice(0, 8).join(", ")}${headers.length > 8 ? "..." : ""}. Expected columns like Symbol, Quantity, Avg Price.`
    );
  }

  if (!qtyCol) {
    errors.push("Could not find quantity column (quantity, qty, shares, current bal, etc.)");
  }

  const holdings: ParsedHolding[] = [];

  for (const row of result.data) {
    if (!row || Object.values(row).every((v) => !v || !String(v).trim())) continue;

    const quantity = qtyCol ? parseNumber(row[qtyCol]) : 0;
    if (quantity <= 0) continue;

    const symbol = resolveSymbol(row, symbolCol, nameCol, isinCol);
    if (symbol === "UNKNOWN") continue;

    const name = nameCol
      ? String(row[nameCol] || symbol).trim()
      : symbolCol
      ? String(row[symbolCol] || symbol).trim()
      : symbol;

    let avgPrice = avgPriceCol ? parseNumber(row[avgPriceCol]) : 0;
    const ltp = effectiveLtpCol ? parseNumber(row[effectiveLtpCol]) : 0;
    const investedTotal = investedValueCol ? parseNumber(row[investedValueCol]) : 0;
    const currentTotal = currentValueCol ? parseNumber(row[currentValueCol]) : 0;

    // Derive cost basis from invested amount when avg price column is missing
    if (avgPrice <= 0 && investedTotal > 0 && quantity > 0) {
      avgPrice = investedTotal / quantity;
    }

    let csvLtp = ltp > 0 ? ltp : undefined;
    let csvCurrentValue = currentTotal > 0 ? currentTotal : undefined;

    if (!csvLtp && csvCurrentValue && quantity > 0) {
      csvLtp = csvCurrentValue / quantity;
    }
    if (!csvCurrentValue && csvLtp && quantity > 0) {
      csvCurrentValue = csvLtp * quantity;
    }

    if (avgPrice <= 0 && !investedValueCol && !avgPriceCol) {
      if (csvCurrentValue || csvLtp) {
        errors.push(
          `Row ${symbol}: no cost basis found — add Avg Buy Price or Invested Amount for accurate P&L`
        );
      }
    }

    if (avgPrice <= 0) {
      // Last resort placeholder when no cost basis is available
      avgPrice = 100;
    }

    holdings.push({
      symbol,
      name,
      quantity,
      avgPrice,
      ...(csvLtp ? { csvLtp } : {}),
      ...(csvCurrentValue ? { csvCurrentValue } : {}),
    });
  }

  if (holdings.length === 0) {
    errors.push(
      "No valid holdings found. Check that your CSV has stock symbols/names and positive quantities."
    );
  }

  return { holdings, source, errors, detectedColumns, headerRow };
}
