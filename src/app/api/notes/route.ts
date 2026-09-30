import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().default(""),
  category: z
    .enum(["analysis", "thoughts", "todo", "bucket_list", "pointers"])
    .default("analysis"),
  tags: z.string().optional().nullable(),
  symbol: z.string().optional().nullable(),
  sentiment: z.enum(["bullish", "bearish", "neutral"]).optional().nullable(),
  pinned: z.boolean().default(false),
  color: z.string().default("emerald"),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const symbol = searchParams.get("symbol")?.trim().toUpperCase();

    const whereClause: {
      userId: string;
      category?: string;
      symbol?: string;
      OR?: Array<{
        title?: { contains: string };
        content?: { contains: string };
        tags?: { contains: string };
        symbol?: { contains: string };
      }>;
    } = {
      userId: session.id,
    };

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (symbol) {
      whereClause.symbol = symbol;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } },
        { symbol: { contains: search } },
      ];
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, content, category, tags, symbol, sentiment, pinned, color } =
      parsed.data;

    const note = await prisma.note.create({
      data: {
        userId: session.id,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags?.trim() || null,
        symbol: symbol?.trim().toUpperCase() || null,
        sentiment: sentiment || null,
        pinned,
        color: color || "emerald",
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
