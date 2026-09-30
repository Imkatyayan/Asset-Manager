"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Menu, X, LayoutDashboard, PieChart, Upload, LineChart, ShieldCheck, StickyNote, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderWatchlist } from "@/components/layout/header-watchlist";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: { name: string; email: string; role?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const baseLinks = user
    ? [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/markets", label: "Markets", icon: LineChart },
      { href: "/portfolio", label: "Holdings", icon: PieChart },
      { href: "/notes", label: "Notes", icon: StickyNote },
    ]
    : [
      { href: "/markets", label: "Markets", icon: LineChart },
      { href: "/analyze", label: "Analyze", icon: Upload },
    ];

  const navLinks = user?.role === "admin"
    ? [...baseLinks, { href: "/admin", label: "Admin Panel", icon: ShieldCheck }]
    : baseLinks;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-market-border bg-market-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={user ? "/" : "/"} className="flex items-center gap-2.5 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-market-up shadow-lg shadow-market-up/20 animate-float animate-glow-pulse">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-market-text tracking-wide">
            Port<span className="text-market-up">folio</span>
            <span className="text-market-accent">IQ</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <div key={link.href} className="contents">
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
                  pathname === link.href
                    ? "bg-market-card text-market-up border border-market-border/40 font-semibold"
                    : "text-market-muted hover:bg-market-card hover:text-market-text hover:scale-[1.01]"
                )}
              >
                <link.icon className="h-3.5 w-3.5 group-hover:animate-pulse" />
                {link.label}
              </Link>
              {link.href === "/markets" && <HeaderWatchlist />}
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-xs text-market-muted hover:text-market-text transition-colors duration-200"
              >
                <span className="font-medium text-market-text hover:text-market-up transition-colors duration-200">
                  Welcome <strong className="text-market-up font-semibold">{(user.name || "User").split(" ")[0]}</strong>
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-market-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-market-border bg-market-surface px-4 py-3 md:hidden">
          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-xs text-market-muted">Theme</span>
            <ThemeToggle />
          </div>
          {navLinks.map((link) => (
            <div key={link.href} className="contents">
              <Link
                href={link.href}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-market-muted hover:bg-market-card"
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
              {link.href === "/markets" && (
                <Link
                  href="/watchlist"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                    pathname === "/watchlist"
                      ? "text-amber-400 bg-market-card font-semibold"
                      : "text-market-muted hover:bg-market-card"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Watchlist
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
