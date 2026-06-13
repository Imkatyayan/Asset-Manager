"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, CheckSquare, Square, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Holding {
  quantity: number;
  avgPrice: number;
  currentPrice: number | null;
}

interface Portfolio {
  id: string;
  name: string;
  source: string;
  updatedAt: string | Date;
  holdings: Holding[];
}

interface Stats {
  currentValue: number;
  invested: number;
  returns: number | null;
}

interface UploadsListProps {
  portfolios: Portfolio[];
  statsById: Record<string, Stats>;
}

export function UploadsList({ portfolios, statsById }: UploadsListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmSingleId, setConfirmSingleId] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle selection for an individual item
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle selection for all items
  const toggleSelectAll = () => {
    if (selectedIds.size === portfolios.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(portfolios.map((p) => p.id)));
    }
  };

  const isAllSelected = portfolios.length > 0 && selectedIds.size === portfolios.length;

  // Perform single deletion
  const deleteSingle = async (id: string) => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/portfolio?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Clear selection if deleted item was selected
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setConfirmSingleId(null);
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to delete portfolio");
      }
    } catch {
      setErrorMessage("Failed to delete portfolio. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Perform bulk deletion
  const deleteBulk = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        setConfirmBulk(false);
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to delete portfolios");
      }
    } catch {
      setErrorMessage("Failed to delete portfolios. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (portfolios.length === 0) return null;

  return (
    <Card className="relative overflow-hidden transition-all duration-300 border border-market-border bg-market-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-market-border/40 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-market-muted hover:text-market-text transition-colors duration-200 focus:outline-none"
            title={isAllSelected ? "Deselect All" : "Select All"}
          >
            {isAllSelected ? (
              <CheckSquare className="h-5 w-5 text-market-accent fill-market-accent/10" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
          <CardTitle className="text-sm font-semibold tracking-wide">
            Your Uploads ({portfolios.length})
          </CardTitle>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="text-xs text-market-muted">
              {selectedIds.size} selected
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmBulk(true)}
              disabled={isDeleting}
              className="gap-1.5 py-1 px-3.5 text-xs shadow-sm bg-market-down hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-market-down/20 bg-red-950/10 px-4 py-3 text-xs text-market-down flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Confirmation Modal/Card Overlay for Bulk Delete */}
        {confirmBulk && (
          <div className="absolute inset-0 bg-market-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-all duration-200">
            <div className="max-w-md w-full rounded-lg border border-market-border bg-market-card p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-market-down">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-base font-semibold">Delete Multiple Portfolios</h3>
              </div>
              <p className="text-sm text-market-muted">
                Are you sure you want to delete the <strong>{selectedIds.size}</strong> selected portfolios? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmBulk(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={deleteBulk}
                  disabled={isDeleting}
                  className="gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete Selected"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* List of portfolios */}
        <div className="space-y-3">
          {portfolios.map((p, index) => {
            const stats = statsById[p.id];
            const isSelected = selectedIds.has(p.id);
            const isSingleConfirming = confirmSingleId === p.id;

            return (
              <div
                key={p.id}
                className={`group relative flex items-center justify-between rounded-lg border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-market-accent bg-market-accent/5"
                    : "border-market-border hover:border-market-border/80 hover:bg-market-surface/40"
                }`}
              >
                {/* Single Delete Confirm Overlay inline */}
                {isSingleConfirming && (
                  <div className="absolute inset-0 rounded-lg bg-market-card/95 flex items-center justify-between px-4 z-10 animate-fade-in border border-market-down/40">
                    <p className="text-xs text-market-text font-medium flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-market-warning" />
                      Delete &ldquo;{p.name}&rdquo;?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="py-1 px-2.5 text-[11px] h-7"
                        onClick={() => setConfirmSingleId(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="py-1 px-2.5 text-[11px] h-7 bg-market-down hover:bg-red-600"
                        onClick={() => deleteSingle(p.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(p.id)}
                    className="text-market-muted hover:text-market-text transition-colors duration-200 focus:outline-none shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4.5 w-4.5 text-market-accent fill-market-accent/5" />
                    ) : (
                      <Square className="h-4.5 w-4.5 group-hover:text-market-muted/80 text-market-muted/40" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-market-text">{p.name}</p>
                      {index === 0 && (
                        <span className="rounded bg-market-accent/15 px-2 py-0.5 text-[10px] font-medium text-market-accent">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-market-muted">
                      {p.holdings.length} holdings · {p.source.toUpperCase()} ·{" "}
                      {new Date(p.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-medium text-market-text">
                      {formatCurrency(stats?.currentValue ?? 0)}
                    </p>
                    {stats?.returns !== null && stats?.returns !== undefined && (
                      <p
                        className={`text-xs font-semibold ${
                          stats.returns >= 0 ? "text-market-up" : "text-market-down"
                        }`}
                      >
                        {stats.returns >= 0 ? "+" : ""}
                        {stats.returns.toFixed(1)}%
                      </p>
                    )}
                  </div>

                  {/* Individual Delete Action */}
                  <button
                    type="button"
                    onClick={() => setConfirmSingleId(p.id)}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 hover:text-market-down text-market-muted/60 p-1.5 rounded-md hover:bg-market-down/10 transition-all duration-200 shrink-0"
                    title="Delete portfolio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
