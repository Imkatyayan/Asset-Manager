import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const userCount = await prisma.user.count();
    const portfolioCount = await prisma.portfolio.count();
    const holdingCount = await prisma.holding.count();

    // Calculate cache size
    let cacheSize = 0;
    const cachePath = path.join(process.cwd(), ".screener_cache.json");
    try {
      if (fs.existsSync(cachePath)) {
        const content = fs.readFileSync(cachePath, "utf8");
        const parsed = JSON.parse(content);
        cacheSize = Object.keys(parsed).length;
      }
    } catch (e) {
      console.error("Error reading cache size:", e);
    }

    return NextResponse.json({
      users: userCount,
      portfolios: portfolioCount,
      holdings: holdingCount,
      cacheEntries: cacheSize,
    });
  } catch (err) {
    console.error("Error in stats route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
