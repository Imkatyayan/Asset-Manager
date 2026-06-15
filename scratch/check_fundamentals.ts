import { PrismaClient } from "@prisma/client";
import { enrichHoldingsBatch, fetchScreenerRatios } from "../src/lib/market-data";

const prisma = new PrismaClient();

async function main() {
  const holdings = await prisma.holding.findMany();
  console.log(`Analyzing ${holdings.length} holdings from dev.db...`);

  const list = holdings.map(h => ({
    symbol: h.symbol,
    name: h.name,
    avgPrice: h.avgPrice
  }));

  const enriched = await enrichHoldingsBatch(list);

  console.log("\n--- ENRICHMENT REPORT ---");
  for (let i = 0; i < enriched.length; i++) {
    const item = enriched[i];
    const orig = holdings[i];
    const hasFundamentals = !!item.fundamentals;
    const hasQuarters = !!(item.fundamentals?.quarters && item.fundamentals.quarters.length > 0);
    const hasAnnuals = !!(item.fundamentals?.annuals && item.fundamentals.annuals.length > 0);
    
    console.log(`Original: "${orig.symbol}" ("${orig.name}") -> Resolved: "${item.symbol}"`);
    console.log(`  - Fundamentals tracked: ${hasFundamentals ? "YES" : "NO"}`);
    if (hasFundamentals) {
      console.log(`  - P/E: ${item.fundamentals?.pe} | ROE: ${item.fundamentals?.roe}% | D/E: ${item.fundamentals?.debtToEquity} | Market Cap: ${item.fundamentals?.marketCap} Cr`);
      console.log(`  - Quarters Count: ${item.fundamentals?.quarters?.length || 0} | Annuals Count: ${item.fundamentals?.annuals?.length || 0}`);
      if (item.fundamentals?.quarters && item.fundamentals.quarters.length > 0) {
        console.log(`    Last Quarter: ${JSON.stringify(item.fundamentals.quarters[item.fundamentals.quarters.length - 1])}`);
      }
    } else {
      console.log(`  - Warning: PRICE ACTION ONLY!`);
    }
  }
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
