import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        mobile: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, address, mobile } = body;

    // Sanitization: trim values or store null if cleared/empty
    const updatedName = typeof name === "string" ? name.trim() : null;
    const updatedAddress = typeof address === "string" ? address.trim() : null;
    const updatedMobile = typeof mobile === "string" ? mobile.trim() : null;

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: updatedName || null,
        address: updatedAddress || null,
        mobile: updatedMobile || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        mobile: true,
        role: true,
      },
    });

    // Sync changes with JWT session cookie so Navbar is instantly updated
    await createSession({
      id: user.id,
      name: user.name || "User",
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
