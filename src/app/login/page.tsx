"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 tech-grid">
      <Card className="w-full max-w-md market-panel border border-market-border/80 shadow-2xl">
        <CardContent className="pt-8 pb-8 px-6 sm:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-market-accent/20">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-market-text">Welcome back</h1>
            <p className="mt-1 text-sm text-market-muted">
              Login to access your portfolio dashboard
            </p>
          </div>

          {resetSuccess && (
            <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-market-up/30 bg-market-up/10 p-3.5 text-xs text-market-up animate-fade-in-up">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Password successfully reset! You can now log in with your new credentials.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-market-text">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-market-accent hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="rounded-lg border border-market-down/20 bg-market-down/10 px-3 py-2 text-xs text-market-down animate-fade-in-up">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-market-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-market-up hover:underline">
              Sign up free
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link href="/analyze" className="text-xs text-market-muted hover:text-market-text transition-colors">
              Or analyze CSV without signing up →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-market-up border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
