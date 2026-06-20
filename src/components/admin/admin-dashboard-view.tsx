"use client";

import { useEffect, useState } from "react";
import { 
  Users as UsersIcon, 
  FolderKanban, 
  Database, 
  Cpu, 
  Trash2, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AdminStats {
  users: number;
  portfolios: number;
  holdings: number;
  cacheEntries: number;
}

interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  portfolioCount: number;
}

interface AdminDashboardViewProps {
  currentAdminId: string;
}

export function AdminDashboardView({ currentAdminId }: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "diagnostics">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // holds action id/type

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchStats() {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        showMsg("error", "Failed to fetch platform metrics");
      }
    } catch {
      showMsg("error", "Error contacting server for statistics");
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        showMsg("error", "Failed to fetch user accounts");
      }
    } catch {
      showMsg("error", "Error loading user account lists");
    } finally {
      setLoadingUsers(false);
    }
  }

  function showMsg(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  async function toggleUserRole(userId: string, currentRole: string) {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    setActionLoading(`role-${userId}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", `Role for ${data.email} updated to ${data.role}`);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: data.role } : u))
        );
        fetchStats(); // Update stats in case admin count shifts
      } else {
        showMsg("error", data.error || "Failed to update role");
      }
    } catch {
      showMsg("error", "Network error updating user role");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Are you sure you want to permanently delete user "${email}"?\nThis will cascade delete all portfolios and holdings.`)) {
      return;
    }
    setActionLoading(`delete-${userId}`);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showMsg("success", `User ${email} and all data successfully deleted`);
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchStats();
      } else {
        const data = await res.json();
        showMsg("error", data.error || "Failed to delete user");
      }
    } catch {
      showMsg("error", "Network error deleting user");
    } finally {
      setActionLoading(null);
    }
  }

  async function purgeCache() {
    if (!confirm("Are you sure you want to purge the scrapers fundamentals cache? Ticker profiles will need to be re-fetched.")) {
      return;
    }
    setActionLoading("purge-cache");
    try {
      const res = await fetch("/api/admin/cache", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("success", data.message || "Cache successfully purged");
        fetchStats();
      } else {
        showMsg("error", data.error || "Failed to purge cache file");
      }
    } catch {
      showMsg("error", "Network error purging cache");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {message && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 text-sm font-medium shadow-lg animate-fade-in ${
          message.type === "success" 
            ? "border-market-up/20 bg-market-up/10 text-market-up" 
            : "border-market-down/20 bg-market-down/10 text-market-down"
        }`}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Modern Custom Tabsswitcher */}
      <div className="flex border-b border-market-border">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
            activeTab === "overview"
              ? "border-market-accent text-market-accent"
              : "border-transparent text-market-muted hover:text-market-text"
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
            activeTab === "users"
              ? "border-market-accent text-market-accent"
              : "border-transparent text-market-muted hover:text-market-text"
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
            activeTab === "diagnostics"
              ? "border-market-accent text-market-accent"
              : "border-transparent text-market-muted hover:text-market-text"
          }`}
        >
          Server & Diagnostics
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-4 sm:grid-cols-2 grid-cols-1">
            <Card className="border-market-border bg-market-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-market-muted">
                  Total Users
                </CardTitle>
                <UsersIcon className="h-4 w-4 text-market-accent" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="h-8 w-16 animate-pulse bg-market-border/40 rounded mt-1"></div>
                ) : (
                  <div className="text-2xl font-bold text-market-text">
                    {stats?.users ?? 0}
                  </div>
                )}
                <p className="text-[10px] text-market-muted mt-1">Registered accounts in DB</p>
              </CardContent>
            </Card>

            <Card className="border-market-border bg-market-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-market-muted">
                  Active Portfolios
                </CardTitle>
                <FolderKanban className="h-4 w-4 text-market-up" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="h-8 w-16 animate-pulse bg-market-border/40 rounded mt-1"></div>
                ) : (
                  <div className="text-2xl font-bold text-market-text">
                    {stats?.portfolios ?? 0}
                  </div>
                )}
                <p className="text-[10px] text-market-muted mt-1">Total uploaded portfolios</p>
              </CardContent>
            </Card>

            <Card className="border-market-border bg-market-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-market-muted">
                  Holdings Count
                </CardTitle>
                <Database className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="h-8 w-16 animate-pulse bg-market-border/40 rounded mt-1"></div>
                ) : (
                  <div className="text-2xl font-bold text-market-text">
                    {stats?.holdings ?? 0}
                  </div>
                )}
                <p className="text-[10px] text-market-muted mt-1">Individual asset entries</p>
              </CardContent>
            </Card>

            <Card className="border-market-border bg-market-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-market-muted">
                  Cache Entries
                </CardTitle>
                <Cpu className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="h-8 w-16 animate-pulse bg-market-border/40 rounded mt-1"></div>
                ) : (
                  <div className="text-2xl font-bold text-market-text">
                    {stats?.cacheEntries ?? 0}
                  </div>
                )}
                <p className="text-[10px] text-market-muted mt-1">Cached fundamental tickers</p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg border border-market-border bg-market-card/30 p-6">
            <h3 className="text-base font-semibold text-market-text mb-2">Operational Guidelines</h3>
            <p className="text-xs text-market-muted leading-relaxed">
              Use this dashboard to oversee user profiles and diagnose data scrapers. 
              The application uses automated fallback logic to query financial data from Finology and Screener. 
              If user requests encounter latency or scraping blocks, flush the cache under the **Server & Diagnostics** tab to force refreshing metadata.
            </p>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <Card className="border-market-border bg-market-card/30 backdrop-blur-sm shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-market-text">
                User Management Console
              </CardTitle>
              <p className="text-xs text-market-muted mt-1">
                Revoke admin grants, promote users, or terminate accounts.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUsers}
              className="text-market-muted hover:text-market-text"
              disabled={loadingUsers}
            >
              <RefreshCw className={`h-4 w-4 ${loadingUsers ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loadingUsers ? (
              <div className="py-20 text-center text-xs text-market-muted animate-pulse">
                Loading accounts in system database...
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center text-xs text-market-muted">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-market-border bg-market-surface/40 text-market-muted font-medium">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Registered On</th>
                      <th className="px-4 py-3 text-center">Portfolios</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-market-border/40">
                    {users.map((u) => {
                      const isSelf = u.id === currentAdminId;
                      return (
                        <tr key={u.id} className="hover:bg-market-surface/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-market-text">
                            {u.name || <span className="text-market-muted italic">No Name</span>}
                          </td>
                          <td className="px-4 py-3 text-market-muted">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              u.role === "admin" 
                                ? "bg-market-up/10 text-market-up border border-market-up/20" 
                                : "bg-market-border/40 text-market-muted border border-market-border/60"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-market-muted">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center text-market-text">{u.portfolioCount}</td>
                          <td className="px-4 py-3 text-right space-x-1.5">
                            {/* Toggle Role Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSelf || actionLoading === `role-${u.id}`}
                              onClick={() => toggleUserRole(u.id, u.role)}
                              className="text-market-accent hover:bg-market-accent/10 border border-market-accent/20"
                            >
                              {actionLoading === `role-${u.id}` ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : u.role === "admin" ? (
                                <>
                                  <UserX className="h-3 w-3 mr-1 inline" />
                                  Demote
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1 inline" />
                                  Promote
                                </>
                              )}
                            </Button>

                            {/* Delete User Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSelf || actionLoading === `delete-${u.id}`}
                              onClick={() => deleteUser(u.id, u.email)}
                              className="text-market-down hover:bg-market-down/10 border border-market-down/20"
                            >
                              {actionLoading === `delete-${u.id}` ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-3 w-3 mr-1 inline" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "diagnostics" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Cache Management Card */}
          <Card className="border-market-border bg-market-card/30 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-market-text flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-400" />
                Scraper Caching Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-market-muted leading-relaxed">
                Fundamental indicators (P/E ratios, sector descriptions, betas, and historical quarters) 
                are cached locally in `.screener_cache.json` to prevent server throttling and scraping blocks. 
                Purging this cache clears all saved data immediately.
              </p>

              <div className="border border-market-border/40 rounded bg-market-surface/20 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-market-muted">Current cached items:</span>
                  <span className="font-semibold text-market-text">{stats?.cacheEntries ?? 0} tickers</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-market-muted">Cache File Name:</span>
                  <span className="font-mono text-market-muted">.screener_cache.json</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionLoading === "purge-cache"}
                  onClick={purgeCache}
                  className="bg-market-down text-white hover:bg-market-down/90 w-full"
                >
                  {actionLoading === "purge-cache" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1.5 animate-spin inline" />
                      Purging disk cache...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1.5 inline" />
                      Flush Fundamentals Cache
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Warnings Card */}
          <Card className="border-market-border bg-market-card/30 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-market-text flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-market-down" />
                Scraper Fallbacks & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-market-muted">
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 rounded-md bg-amber-500/10 border border-amber-500/25 p-3 text-amber-300">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-200 mb-0.5">Scraper Latency Warn</h4>
                    <p className="leading-normal">
                      Scraper triggers occur asynchronously. Multiple concurrent uploads by different users 
                      will increase background queue times. Limit bulk CSV analysis when experiencing scraper timeouts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-md bg-market-up/10 border border-market-up/25 p-3 text-market-up">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-market-text mb-0.5">Auth Middleware Protection</h4>
                    <p className="leading-normal">
                      Security boundaries are validated server-side on both layout rendering and the `/api/admin/*` routers. 
                      Unauthorized attempts automatically return 403 Forbidden.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
