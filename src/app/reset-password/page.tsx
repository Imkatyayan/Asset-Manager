"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [associatedEmail, setAssociatedEmail] = useState("");
  const [tokenError, setTokenError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        setTokenError("No reset token provided. Please use the link sent to your email.");
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          setAssociatedEmail(data.email || "");
        } else {
          setTokenValid(false);
          setTokenError(data.error || "The reset link is invalid or has expired.");
        }
      } catch {
        setTokenValid(false);
        setTokenError("Failed to verify reset token. Please check your connection.");
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [token]);

  const hasMinLength = password.length >= 6;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!hasMinLength) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to reset password.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2500);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (verifying) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 tech-grid">
        <Card className="w-full max-w-md market-panel border border-market-border/80 text-center py-12 px-6">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-market-up border-t-transparent" />
          <p className="mt-4 text-sm text-market-muted">Verifying your secure reset link...</p>
        </Card>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 tech-grid">
        <Card className="w-full max-w-md market-panel border border-market-border/80 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6 sm:px-8 text-center animate-fade-in-up">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-market-down/10 text-market-down border border-market-down/20">
              <AlertTriangle className="h-7 w-7 text-market-down" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-market-text">
              Invalid or Expired Link
            </h1>
            <p className="mt-2 text-sm text-market-muted leading-relaxed">
              {tokenError || "This password reset link is invalid or has expired."}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/forgot-password" className="w-full">
                <Button className="w-full">Request a new reset link</Button>
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-market-muted hover:text-market-text transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 tech-grid">
        <Card className="w-full max-w-md market-panel border border-market-border/80 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6 sm:px-8 text-center animate-fade-in-up">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-market-up/10 text-market-up border border-market-up/20">
              <CheckCircle2 className="h-7 w-7 text-market-up" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-market-text">
              Password Reset Complete!
            </h1>
            <p className="mt-2 text-sm text-market-muted">
              Your password has been securely updated. Redirecting you to login...
            </p>

            <div className="mt-6">
              <Link href="/login?reset=success">
                <Button className="w-full inline-flex items-center justify-center gap-2">
                  Continue to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Reset Password Form
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 tech-grid">
      <Card className="w-full max-w-md market-panel border border-market-border/80 shadow-2xl backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 px-6 sm:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-market-accent/20">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-market-text">
              Set New Password
            </h1>
            {associatedEmail && (
              <p className="mt-1 text-xs text-market-muted">
                Updating credentials for <span className="font-semibold text-market-text">{associatedEmail}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label htmlFor="new-password" className="block text-sm font-medium text-market-text">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter at least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-market-border bg-market-surface px-3.5 py-2.5 pr-10 text-sm text-market-text placeholder:text-market-muted transition-colors focus:border-market-accent focus:outline-none focus:ring-1 focus:ring-market-accent/30"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-market-muted hover:text-market-text"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-market-text">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-market-border bg-market-surface px-3.5 py-2.5 pr-10 text-sm text-market-text placeholder:text-market-muted transition-colors focus:border-market-accent focus:outline-none focus:ring-1 focus:ring-market-accent/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-market-muted hover:text-market-text"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Validation indicators */}
            <div className="rounded-lg border border-market-border/60 bg-market-surface/40 p-3 space-y-1.5 text-xs text-market-muted">
              <div className="flex items-center gap-2">
                {hasMinLength ? (
                  <Check className="h-3.5 w-3.5 text-market-up" />
                ) : (
                  <X className="h-3.5 w-3.5 text-market-muted" />
                )}
                <span className={hasMinLength ? "text-market-up font-medium" : ""}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordsMatch ? (
                  <Check className="h-3.5 w-3.5 text-market-up" />
                ) : (
                  <X className="h-3.5 w-3.5 text-market-muted" />
                )}
                <span className={passwordsMatch ? "text-market-up font-medium" : ""}>
                  Passwords match
                </span>
              </div>
            </div>

            {formError && (
              <p className="rounded-lg border border-market-down/20 bg-market-down/10 px-3 py-2 text-xs text-market-down animate-fade-in-up">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading || !hasMinLength || !passwordsMatch}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Confirm & Reset Password
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-market-border/60 pt-5 text-center">
            <Link
              href="/login"
              className="text-xs font-medium text-market-muted hover:text-market-text transition-colors"
            >
              Cancel and return to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 tech-grid">
          <Card className="w-full max-w-md market-panel border border-market-border/80 text-center py-12 px-6">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-market-up border-t-transparent" />
            <p className="mt-4 text-sm text-market-muted">Loading reset password interface...</p>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
