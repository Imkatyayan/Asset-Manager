"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process request. Please try again.");
        return;
      }

      setSubmitted(true);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch {
      setError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 tech-grid">
      <Card className="w-full max-w-md market-panel border border-market-border/80 shadow-2xl backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 px-6 sm:px-8">
          {submitted ? (
            <div className="text-center animate-fade-in-up">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-market-up/10 text-market-up border border-market-up/20">
                <CheckCircle2 className="h-7 w-7 text-market-up" />
              </div>
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-market-text">
                Check Your Email
              </h1>
              <p className="mt-2 text-sm text-market-muted leading-relaxed">
                If an account exists for <span className="font-semibold text-market-text">{email}</span>,
                password reset instructions have been issued. The reset link is valid for 1 hour.
              </p>

              {devResetUrl && (
                <div className="mt-6 rounded-xl border border-market-up/30 bg-market-up/5 p-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-market-up">
                    <span className="h-2 w-2 rounded-full bg-market-up animate-pulse" />
                    Local Development Mode
                  </div>
                  <p className="mt-1.5 text-xs text-market-muted">
                    No SMTP mail service is required. Click below to directly open your password reset link:
                  </p>
                  <a
                    href={devResetUrl}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-market-up px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-600"
                  >
                    Open Reset Password Form
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSubmitted(false);
                    setDevResetUrl(null);
                  }}
                >
                  Request another link
                </Button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-market-muted hover:text-market-text transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-market-accent/20">
                  <KeyRound className="h-6 w-6 text-white" />
                </div>
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-market-text">
                  Reset Password
                </h1>
                <p className="mt-1 text-sm text-market-muted">
                  Enter your verified account email to receive a secure recovery link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div className="space-y-1.5">
                  <Input
                    id="email"
                    label="Email address"
                    type="email"
                    placeholder="e.g. admin@portfolioiq.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-market-down/20 bg-market-down/10 p-3 text-xs text-market-down animate-fade-in-up">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending reset link...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-market-border/60 pt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-medium text-market-muted hover:text-market-text transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Remember your password? Sign in
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
