import { NextRequest, NextResponse } from "next/server";
import { registerUser, createSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

    const { name, email, password } = parsed.data;
    const result = await registerUser(name, email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await createSession(result.user!);
    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
