import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const cachePath = path.join(process.cwd(), ".screener_cache.json");

    try {
      // Write empty JSON object to purge cached values safely
      fs.writeFileSync(cachePath, JSON.stringify({}), "utf8");
      return NextResponse.json({ success: true, message: "Cache successfully purged" });
    } catch (e) {
      console.error("Failed to write empty cache file:", e);
      return NextResponse.json({ error: "Failed to purge cache file on disk" }, { status: 500 });
    }
  } catch (err) {
    console.error("Error in cache purge route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
