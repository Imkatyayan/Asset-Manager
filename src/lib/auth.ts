import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

const COOKIE_NAME = "asset-manager-session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan?: string; // "free" | "pro"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const effectivePlan = user.plan || (user.role === "admin" ? "pro" : "free");
  const token = await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: effectivePlan,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload.role as string) || "user";
    const plan = (payload.plan as string) || (role === "admin" ? "pro" : "free");
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role,
      plan,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user?: SessionUser; error?: string }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return {
    user: {
      id: user.id,
      name: user.name || "User",
      email: user.email,
      role: user.role,
      plan: user.plan || (user.role === "admin" ? "pro" : "free"),
    },
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user?: SessionUser; error?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password" };

  return {
    user: {
      id: user.id,
      name: user.name || "User",
      email: user.email,
      role: user.role,
      plan: user.plan || (user.role === "admin" ? "pro" : "free"),
    },
  };
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; token?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // For security reasons, do not leak whether a user exists
    return { success: true };
  }

  // Remove any preexisting reset tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

  await prisma.passwordResetToken.create({
    data: {
      token,
      email,
      expiresAt,
    },
  });

  return { success: true, token };
}

export async function verifyResetToken(
  token: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) {
    return { valid: false, error: "Invalid or expired password reset link." };
  }

  if (new Date() > record.expiresAt) {
    await prisma.passwordResetToken.delete({ where: { token } }).catch(() => {});
    return {
      valid: false,
      error: "This password reset link has expired. Please request a new one.",
    };
  }

  return { valid: true, email: record.email };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  const verification = await verifyResetToken(token);
  if (!verification.valid || !verification.email) {
    return { error: verification.error || "Invalid or expired reset token" };
  }

  const user = await prisma.user.findUnique({
    where: { email: verification.email },
  });

  if (!user) {
    return { error: "User account could not be found." };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Invalidate the token once used
  await prisma.passwordResetToken
    .delete({
      where: { token },
    })
    .catch(() => {});

  return { success: true };
}

