import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const result = await requestPasswordReset(email.trim().toLowerCase());

    // Generate full URL
    const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
    const resetUrl = result.token ? `${origin}/reset-password?token=${result.token}` : null;

    if (resetUrl) {
      console.log(`\n======================================================`);
      console.log(`🔑 [AUTH] Password reset requested for: ${email}`);
      console.log(`🔗 [AUTH] Direct Reset Link: ${resetUrl}`);
      console.log(`======================================================\n`);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account is associated with this email, you will receive password reset instructions.",
      // Include devResetUrl in non-production so local testing works seamlessly without external SMTP
      devResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
