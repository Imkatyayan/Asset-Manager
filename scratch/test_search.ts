import { PrismaClient } from "@prisma/client";
import { enrichHoldingsBatch } from "../src/lib/market-data";

const prisma = new PrismaClient();

async function main() {
  const holdings = await prisma.holding.findMany();
  // Get unique symbol/name pairs
  const uniqueHoldingsMap = new Map<string, { symbol: string; name: string }>();
  for (const h of holdings) {
    uniqueHoldingsMap.set(h.symbol.toUpperCase(), { symbol: h.symbol, name: h.name });
  }

  const list = Array.from(uniqueHoldingsMap.values()).map(h => ({
    symbol: h.symbol,
    name: h.name,
    avgPrice: 100
  }));

  console.log(`Enriching all ${list.length} unique holdings from DB...`);
  const results = await enrichHoldingsBatch(list);

  let noFundamentalsCount = 0;
  for (const r of results) {
    if (!r.fundamentals) {
      console.log(`- NO FUNDAMENTALS: Symbol: "${r.symbol}" | Name: "${r.name}" | Sector: "${r.sector}"`);
      noFundamentalsCount++;
    }
  }
  console.log(`Summary: ${noFundamentalsCount} / ${results.length} holdings have NO fundamentals.`);
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
