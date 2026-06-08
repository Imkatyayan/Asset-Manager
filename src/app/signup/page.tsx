"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  "Full momentum & trend analysis",
  "Fundamental metrics (P/E, ROE, debt)",
  "Smart rebalancing suggestions",
  "Save & track multiple portfolios",
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        <div className="hidden lg:block">
          <h2 className="text-2xl font-bold text-text-primary">
            Unlock the full power of PortfolioIQ
          </h2>
          <p className="mt-2 text-text-secondary">
            Create a free account to get smart portfolio insights beyond basic analysis.
          </p>
          <ul className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <Card>
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-text-primary">Create account</h1>
              <p className="mt-1 text-sm text-text-secondary">Free forever. No credit card needed.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input
                id="name"
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up Free"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
