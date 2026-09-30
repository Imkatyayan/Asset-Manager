import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  content: z.string().optional(),
  category: z
    .enum(["analysis", "thoughts", "todo", "bucket_list", "pointers"])
    .optional(),
  tags: z.string().optional().nullable(),
  symbol: z.string().optional().nullable(),
  sentiment: z.enum(["bullish", "bearish", "neutral"]).optional().nullable(),
  pinned: z.boolean().optional(),
  color: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note || note.userId !== session.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Failed to get note:", error);
    return NextResponse.json({ error: "Failed to get note" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.note.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title.trim();
    if (parsed.data.content !== undefined) data.content = parsed.data.content.trim();
    if (parsed.data.category !== undefined) data.category = parsed.data.category;
    if (parsed.data.tags !== undefined) data.tags = parsed.data.tags?.trim() || null;
    if (parsed.data.symbol !== undefined)
      data.symbol = parsed.data.symbol?.trim().toUpperCase() || null;
    if (parsed.data.sentiment !== undefined) data.sentiment = parsed.data.sentiment || null;
    if (parsed.data.pinned !== undefined) data.pinned = parsed.data.pinned;
    if (parsed.data.color !== undefined) data.color = parsed.data.color;

    const note = await prisma.note.update({
      where: { id },
      data,
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Failed to update note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.note.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
