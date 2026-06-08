import { readFileSync } from "fs";

const { parseHoldingsCSV } = await import("../src/lib/csv-parser.ts");

const tests = {
  sample: readFileSync("./public/sample-holdings.csv", "utf8"),
  bom: "\ufeff" + readFileSync("./public/sample-holdings.csv", "utf8"),
  zerodha: "tradingsymbol,exchange,quantity,average_price,last_price\nRELIANCE,NSE,50,2450,2850\nTCS,NSE,30,3650,4120",
  cdsl: "CDSL Demat Account Statement\nDP ID: 12081600\n\nISIN,Security Name,Current Bal,Value\nINE002A01018,RELIANCE INDUSTRIES LTD,50,142500\nINE467B01029,TATA CONSULTANCY SERVICES LTD,30,123600\n",
  semi: "Symbol;Quantity;Avg Price\nRELIANCE;50;2450\nTCS;30;3650",
  groww: "Stock Name,Symbol,Qty,Avg. Buy Price,Invested Amount\nReliance Industries,RELIANCE,50,2450,122500",
};

let pass = 0;
let fail = 0;

for (const [name, content] of Object.entries(tests)) {
  const r = parseHoldingsCSV(content);
  const ok = r.holdings.length > 0;
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "✓" : "✗"} ${name}: ${r.holdings.length} holdings`, r.errors[0] || "");
}

console.log(`\n${pass} passed, ${fail} failed`);
