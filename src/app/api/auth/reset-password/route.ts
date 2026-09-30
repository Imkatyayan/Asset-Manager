import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken, verifyResetToken } from "@/lib/auth";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Reset token is required." },
        { status: 400 }
      );
    }

    const verification = await verifyResetToken(token);
    if (!verification.valid) {
      return NextResponse.json(
        { valid: false, error: verification.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: verification.email,
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify reset token." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const result = await resetPasswordWithToken(token, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
