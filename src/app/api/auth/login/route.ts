import { NextRequest, NextResponse } from "next/server";
import { loginUser, createSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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

    const result = await loginUser(parsed.data.email, parsed.data.password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await createSession(result.user!);
    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
