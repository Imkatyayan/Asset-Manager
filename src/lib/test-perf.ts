import { enrichHoldingsBatch } from "./market-data";

async function run() {
  const holdings = [
    { symbol: "AMARA RAJA ENERGY MOB LTD", avgPrice: 1256.21 },
    { symbol: "AMBER ENTERPRISES (I) LTD", avgPrice: 7236.55 },
    { symbol: "RELIANCE", avgPrice: 2850 },
    { symbol: "TCS", avgPrice: 4120 },
    { symbol: "HDFCBANK", avgPrice: 1720 },
    { symbol: "INFY", avgPrice: 1890 },
    { symbol: "ICICIBANK", avgPrice: 1285 },
  ];

  console.log("=== First Run (no cache) ===");
  const start = Date.now();
  const res1 = await enrichHoldingsBatch(holdings);
  console.log(`Took ${Date.now() - start}ms`);
  console.log(`Results: ${res1.length} holdings enriched`);

  console.log("\n=== Second Run (with cache) ===");
  const start2 = Date.now();
  const res2 = await enrichHoldingsBatch(holdings);
  console.log(`Took ${Date.now() - start2}ms`);
  console.log(`Results: ${res2.length} holdings enriched`);
}

run().catch(console.error);
