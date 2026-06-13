"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Phone, Save, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface UserProfile {
  name: string | null;
  email: string;
  address: string | null;
  mobile: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Automatically hide success alert after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
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
        <h1 className="text-2xl font-bold text-market-text">User Profile</h1>
        <p className="mt-1 text-xs text-market-muted">
          Manage your account information and settings. Clear optional fields to delete them.
        </p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-market-up/20 bg-emerald-950/10 px-4 py-3 text-sm text-market-up animate-fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-market-down/20 bg-red-950/10 px-4 py-3 text-sm text-market-down animate-fade-in">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
