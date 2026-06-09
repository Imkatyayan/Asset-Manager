"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Menu, X, LayoutDashboard, PieChart, Upload, HelpCircle, LineChart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: { name: string; email: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/markets", label: "Markets", icon: LineChart },
        { href: "/portfolio", label: "Holdings", icon: PieChart },
        { href: "/analyze", label: "Analyze", icon: Upload },
        { href: "/support", label: "Support", icon: HelpCircle },
      ]
    : [
        { href: "/markets", label: "Markets", icon: LineChart },
        { href: "/analyze", label: "Analyze", icon: Upload },
        { href: "/support", label: "Support", icon: HelpCircle },
      ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-market-border bg-market-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-market-up">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-market-text">
            Port<span className="text-market-up">folio</span>
            <span className="text-market-down">IQ</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-market-card text-market-up"
                  : "text-market-muted hover:bg-market-card hover:text-market-text"
              )}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-xs text-market-muted">
                <span className="font-medium text-market-text">{user.name.split(" ")[0]}</span>
              </span>
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
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-market-muted hover:bg-market-card"
              onClick={() => setMobileOpen(false)}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
