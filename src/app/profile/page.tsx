"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Phone, Save, Loader2, CheckCircle2, AlertTriangle, ArrowLeft, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserProfile {
  id?: string;
  name: string | null;
  email: string;
  address: string | null;
  mobile: string | null;
  role?: string;
  plan?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingPlan, setTogglingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");

  // Fetch profile details
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setName(data.user.name || "");
          setAddress(data.user.address || "");
          setMobile(data.user.mobile || "");
        } else {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          setError("Failed to load profile details.");
        }
      } catch {
        setError("An error occurred while loading profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  // Handle Plan Upgrade / Switch
  const handleTogglePlan = async () => {
    if (!profile) return;
    setTogglingPlan(true);
    setPlanMessage(null);
    const nextPlan = profile.plan === "pro" ? "free" : "pro";

    try {
      const res = await fetch("/api/user/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: nextPlan }),
      });
      const data = await res.json();

      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, plan: nextPlan } : null));
        setPlanMessage(data.message || `Successfully switched to ${nextPlan.toUpperCase()} plan.`);
        setTimeout(() => setPlanMessage(null), 4000);
        // Refresh router so header session updates
        router.refresh();
      } else {
        setError(data.error || "Failed to update membership plan.");
      }
    } catch {
      setError("Network error while updating plan.");
    } finally {
      setTogglingPlan(false);
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, mobile }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name || "");
        setAddress(data.user.address || "");
        setMobile(data.user.mobile || "");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile.");
      }
    } catch {
      setError("An error occurred while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  // Clear optional fields
  const handleClearOptional = () => {
    setName("");
    setAddress("");
    setMobile("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-market-accent" />
          <p className="text-sm text-market-muted">Loading profile details...</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const isPro = profile?.plan === "pro" || isAdmin;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back to Dashboard Link */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-market-muted hover:text-market-text transition-colors duration-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-market-text">User Profile & Membership</h1>
        <p className="mt-1 text-xs text-market-muted">
          Manage your account information, membership tier, and investment intelligence features.
        </p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-market-up/20 bg-emerald-950/10 px-4 py-3 text-sm text-market-up animate-fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {planMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/15 px-4 py-3 text-sm text-amber-300 animate-fade-in">
          <Sparkles className="h-4.5 w-4.5 shrink-0 text-amber-400" />
          <span>{planMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-market-down/20 bg-red-950/10 px-4 py-3 text-sm text-market-down animate-fade-in">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MEMBERSHIP & SUBSCRIPTION STATUS CARD                    */}
      {/* ======================================================== */}
      <Card className="mb-8 border border-market-border bg-market-card overflow-hidden shadow-xl">
        <div className="border-b border-market-border px-6 py-4 bg-market-surface flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border",
              isAdmin
                ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                : isPro
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-market-surface border-market-border text-market-muted"
            )}>
              {isAdmin ? <ShieldCheck className="h-5 w-5" /> : isPro ? <Crown className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-market-text">Membership & Plan</h2>
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border",
                  isAdmin
                    ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                    : isPro
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/40 flex items-center gap-1"
                    : "bg-market-surface text-market-muted border-market-border"
                )}>
                  {isAdmin ? "🛡️ Administrator" : isPro ? "★ PRO Member" : "Free Plan"}
                </span>
              </div>
              <p className="text-xs text-market-muted mt-0.5">
                {isAdmin
                  ? "Full Platform Access + Admin Panel Privileges"
                  : isPro
                  ? "Institutional-Grade Forensic Audits & Forecast Intelligence Active"
                  : "Standard Portfolio Tracking & Live Market Quotes"}
              </p>
            </div>
          </div>

          {/* Plan switch / manage button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTogglePlan}
            disabled={togglingPlan}
            className={cn(
              "gap-1.5 text-xs font-semibold transition-all",
              isPro
                ? "border-market-border hover:bg-market-surface text-market-muted hover:text-market-text"
                : "border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
            )}
          >
            {togglingPlan ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPro ? (
              <span>Switch to Free Tier</span>
            ) : (
              <>
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Upgrade to PRO</span>
              </>
            )}
          </Button>
        </div>

        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-market-border bg-market-surface/40 p-3.5">
              <span className="text-[11px] font-semibold text-market-muted uppercase tracking-wider">Account Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-market-up animate-pulse" />
                <span className="text-sm font-bold text-market-text">Active</span>
              </div>
            </div>

            <div className="rounded-lg border border-market-border bg-market-surface/40 p-3.5">
              <span className="text-[11px] font-semibold text-market-muted uppercase tracking-wider">Membership Tier</span>
              <p className="text-sm font-bold text-market-text mt-1">
                {isAdmin ? "Administrator" : isPro ? "PRO Institutional" : "Standard Free"}
              </p>
            </div>

            <div className="rounded-lg border border-market-border bg-market-surface/40 p-3.5">
              <span className="text-[11px] font-semibold text-market-muted uppercase tracking-wider">Member Since</span>
              <p className="text-sm font-bold text-market-text mt-1">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                  : "Active"}
              </p>
            </div>
          </div>

          <div className="border-t border-market-border/60 pt-4">
            <h3 className="text-xs font-semibold text-market-muted uppercase tracking-wider mb-3">
              Included In Your Current Plan:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-market-text">
                <CheckCircle2 className="h-4 w-4 text-market-up shrink-0" />
                <span>Real-Time NSE & BSE Live Market Quotes</span>
              </div>
              <div className="flex items-center gap-2 text-market-text">
                <CheckCircle2 className="h-4 w-4 text-market-up shrink-0" />
                <span>CAS Multi-Broker Portfolio Import & Allocation</span>
              </div>
              <div className="flex items-center gap-2 text-market-text">
                <CheckCircle2 className="h-4 w-4 text-market-up shrink-0" />
                <span>50-Stock Watchlist & Real-Time Price Tracking</span>
              </div>
              <div className={cn("flex items-center gap-2", isPro ? "text-market-text" : "text-market-muted opacity-60")}>
                {isPro ? (
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-market-muted shrink-0" />
                )}
                <span>Institutional Forensics (Altman-Z, Beneish-M, DuPont)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-market-border bg-market-card overflow-hidden">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Email Field - Read-only */}
            <div className="space-y-1.5 relative">
              <label className="block text-sm font-medium text-market-muted">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-market-muted/60">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full rounded-md border border-market-border/40 bg-market-surface/40 px-3.5 py-2.5 pl-10 text-sm text-market-muted select-none cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-market-muted/70">
                Your email address is used for login and cannot be modified.
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="block text-sm font-medium text-market-text">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-market-muted/60">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="profile-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mobile Field */}
            <div className="space-y-1.5">
              <label htmlFor="profile-mobile" className="block text-sm font-medium text-market-text">
                Mobile Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-market-muted/60">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  id="profile-mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <label htmlFor="profile-address" className="block text-sm font-medium text-market-text">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 text-market-muted/60">
                  <MapPin className="h-4 w-4" />
                </div>
                <textarea
                  id="profile-address"
                  rows={3}
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-market-border bg-market-surface px-3.5 py-2.5 pl-10 text-sm text-market-text placeholder:text-market-muted transition-colors focus:border-market-accent focus:outline-none focus:ring-1 focus:ring-market-accent/30"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-market-border/40 pt-6 gap-3">
              <button
                type="button"
                onClick={handleClearOptional}
                className="text-xs text-market-muted hover:text-market-down transition-colors focus:outline-none"
              >
                Clear all fields
              </button>

              <div className="flex w-full sm:w-auto gap-3 justify-end">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" type="button" className="w-full sm:w-auto" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="w-full sm:w-auto gap-1.5">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
