import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, isPro: false, plan: "free" });
  }

  const isPro = session.plan === "pro" || session.role === "admin";
  return NextResponse.json({
    authenticated: true,
    isPro,
    plan: session.plan,
    role: session.role,
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to manage your subscription" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const targetPlan = body.plan === "free" ? "free" : "pro";

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { plan: targetPlan },
      select: { id: true, name: true, email: true, role: true, plan: true },
    });

    // Re-issue cookie with updated plan
    await createSession({
      id: updatedUser.id,
      name: updatedUser.name || "User",
      email: updatedUser.email,
      role: updatedUser.role,
      plan: updatedUser.plan,
    });

    const isPro = updatedUser.plan === "pro" || updatedUser.role === "admin";

    return NextResponse.json({
      success: true,
      plan: updatedUser.plan,
      isPro,
      message:
        targetPlan === "pro"
          ? "Pro membership activated successfully! You now have access to Forensic Irregularity Checks & AI Forward Quarter Forecasts."
          : "Subscription plan reverted to Free tier.",
    });
  } catch (err) {
    console.error("Subscription update error:", err);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
