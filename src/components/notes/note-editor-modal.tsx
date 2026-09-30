"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckSquare,
  List,
  Pin,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Lightbulb,
  Target,
  Bookmark,
} from "lucide-react";
import { Note, NoteCategory, NoteSentiment, CATEGORY_CONFIG } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Partial<Note>) => Promise<void>;
  initialNote?: Note | null;
  defaultCategory?: NoteCategory;
  defaultSymbol?: string;
}

const TEMPLATES: Record<
  string,
  { label: string; category: NoteCategory; sentiment: NoteSentiment; title: string; content: string }
> = {
  analysis: {
    label: "📊 Stock Analysis Thesis",
    category: "analysis",
    sentiment: "bullish",
    title: "Analysis Thesis",
    content: `• Core Investment Thesis: \n• Key Catalysts (Earnings, Capex, Demand): \n• Valuation vs Historical Average (P/E, P/B): \n• Downside Risks / Margin of Safety: \n- [ ] Review latest quarterly investor presentation\n- [ ] Compare margin trends against top peer`,
  },
  bucket_list: {
    label: "🎯 Dip-Buy Bucket List",
    category: "bucket_list",
    sentiment: "bullish",
    title: "High Conviction Stocks on Dip",
    content: `1. Symbol: [Ticker] — Target Entry: ₹[Price] (Margin of Safety)\n2. Symbol: [Ticker] — Target Entry: ₹[Price] (200 DMA support)\n- [ ] Set broker GTT limit buy alert\n- [ ] Allocate emergency cash buffer for correction`,
  },
  todo: {
    label: "✅ Portfolio Action Checklist",
    category: "todo",
    sentiment: "neutral",
    title: "Portfolio Review & Rebalancing",
    content: `- [ ] Check portfolio weightings against ideal 70/20/10 target\n- [ ] Review underperforming stocks down > 15%\n- [ ] Harvest long-term capital gains under ₹1.25L exemption\n- [ ] Check SIP mandate bank balances for next month`,
  },
  pointers: {
    label: "📌 Trading & Risk Rule",
    category: "pointers",
    sentiment: "neutral",
    title: "Core Risk Management Rules",
    content: `• Max single stock exposure: 8% of total portfolio\n• Never average down on a stock if revenue growth decelerates\n• Stop-loss: Re-evaluate thesis if stock falls 12% against market trend\n• Stay patient in sideways market — don't overtrade`,
  },
  thoughts: {
    label: "💡 Macro & Market Sentiment",
    category: "thoughts",
    sentiment: "neutral",
    title: "Market Commentary & Sector Outlook",
    content: `• Current market pulse: \n• Sectors showing relative strength: \n• RBI / Fed monetary policy expectations: \n• Commodities & Crude Oil impact on domestic margins: `,
  },
};

const CategoryIcons: Record<NoteCategory, React.ElementType> = {
  analysis: Brain,
  thoughts: Lightbulb,
  todo: CheckSquare,
  bucket_list: Target,
  pointers: Bookmark,
};

const COLOR_OPTIONS = [
  { id: "emerald", label: "Green", class: "bg-emerald-500" },
  { id: "blue", label: "Blue", class: "bg-blue-500" },
  { id: "amber", label: "Amber", class: "bg-amber-500" },
  { id: "purple", label: "Purple", class: "bg-purple-500" },
  { id: "red", label: "Red", class: "bg-red-500" },
  { id: "default", label: "Subtle", class: "bg-neutral-500" },
];

export function NoteEditorModal({
  isOpen,
  onClose,
  onSave,
  initialNote,
  defaultCategory = "analysis",
  defaultSymbol = "",
}: NoteEditorModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>(defaultCategory);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [sentiment, setSentiment] = useState<NoteSentiment | "">("");
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState("emerald");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setCategory(initialNote.category);
      setSymbol(initialNote.symbol || "");
      setSentiment(initialNote.sentiment || "");
      setPinned(initialNote.pinned);
      setColor(initialNote.color || "emerald");
      setTags(initialNote.tags || "");
    } else {
      setTitle("");
      setContent("");
      setCategory(defaultCategory);
      setSymbol(defaultSymbol);
      setSentiment("");
      setPinned(false);
      setColor("emerald");
      setTags("");
    }
    setError("");
  }, [initialNote, defaultCategory, defaultSymbol, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (key: string) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setTitle(t.title);
    setContent(t.content);
    setCategory(t.category);
    setSentiment(t.sentiment);
  };

  const insertTextAtCursor = (insertion: string) => {
    setContent((prev) => (prev ? prev + "\n" + insertion : insertion));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        category,
        symbol: symbol.trim().toUpperCase() || null,
        sentiment: (sentiment as NoteSentiment) || null,
        pinned,
        color,
        tags: tags.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save note. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-market-border bg-market-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-market-border px-6 py-4 bg-market-surface/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-market-text">
                {initialNote ? "Edit Note" : "Create New Note"}
              </h2>
              <p className="text-xs text-market-muted">
                Document investment thesis, action checklists, or market thoughts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                pinned
                  ? "bg-market-up/10 border-market-up/40 text-market-up"
                  : "border-market-border text-market-muted hover:text-market-text"
              )}
              title={pinned ? "Pinned to top" : "Pin note"}
            >
              <Pin className={cn("h-4 w-4", pinned && "fill-market-up")} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-market-muted hover:text-market-text hover:bg-market-surface transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick Templates bar (only for new notes) */}
          {!initialNote && (
            <div className="rounded-lg border border-market-border/60 bg-market-surface/40 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-market-muted mb-2">
                <Sparkles className="h-3.5 w-3.5 text-market-up" />
                <span>Instant Templates:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyTemplate(key)}
                    className="rounded-md border border-market-border bg-market-card px-2.5 py-1 text-xs text-market-text hover:border-market-up hover:text-market-up transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Selector Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-market-muted">
              Note Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(
                [
                  "analysis",
                  "thoughts",
                  "todo",
                  "bucket_list",
                  "pointers",
                ] as NoteCategory[]
              ).map((cat) => {
                const conf = CATEGORY_CONFIG[cat];
                const Icon = CategoryIcons[cat];
                const active = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-xs font-medium transition-all text-center",
                      active
                        ? cn(conf.badgeClass, "font-semibold shadow-sm scale-[1.02]")
                        : "border-market-border bg-market-surface/50 text-market-muted hover:text-market-text hover:bg-market-surface"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <Input
            id="note-title"
            label="Title"
            placeholder="e.g. Tata Motors EV Margin Expansion Thesis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          {/* Content with Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="note-content"
                className="block text-xs font-medium text-market-muted"
              >
                Note Content & Action Items
              </label>
              {/* Quick insertion toolbar */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("- [ ] ")}
                  className="inline-flex items-center gap-1 rounded bg-market-surface px-2 py-0.5 text-[11px] text-market-muted hover:text-market-up border border-market-border transition-colors"
                >
                  <CheckSquare className="h-3 w-3" />
                  + Checkbox
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("• ")}
                  className="inline-flex items-center gap-1 rounded bg-market-surface px-2 py-0.5 text-[11px] text-market-muted hover:text-market-text border border-market-border transition-colors"
                >
                  <List className="h-3 w-3" />
                  + Bullet
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("🎯 Target Price: ₹")}
                  className="inline-flex items-center gap-1 rounded bg-market-surface px-2 py-0.5 text-[11px] text-market-muted hover:text-market-text border border-market-border transition-colors"
                >
                  + Target
                </button>
              </div>
            </div>

            <textarea
              id="note-content"
              rows={6}
              placeholder="Write your analysis, checklist (- [ ] task), thoughts, or key entry triggers..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-market-border bg-market-surface px-3.5 py-2.5 text-sm text-market-text placeholder:text-market-muted transition-colors focus:border-market-accent focus:outline-none focus:ring-1 focus:ring-market-accent/30 font-sans"
            />
            <p className="text-[11px] text-market-muted">
              Tip: Lines starting with <code className="text-market-up">- [ ]</code> become interactive checklist items!
            </p>
          </div>

          {/* Stock Symbol & Sentiment Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                id="note-symbol"
                label="Stock Symbol (Optional)"
                placeholder="e.g. INFY, RELIANCE, TCS"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-market-muted">
                Conviction / Sentiment
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSentiment(sentiment === "bullish" ? "" : "bullish")}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-md border py-2 text-xs font-medium transition-colors",
                    sentiment === "bullish"
                      ? "border-market-up bg-market-up/10 text-market-up font-semibold"
                      : "border-market-border bg-market-surface/40 text-market-muted hover:text-market-text"
                  )}
                >
                  <TrendingUp className="h-3 w-3" /> Bullish
                </button>
                <button
                  type="button"
                  onClick={() => setSentiment(sentiment === "neutral" ? "" : "neutral")}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-md border py-2 text-xs font-medium transition-colors",
                    sentiment === "neutral"
                      ? "border-market-border bg-market-surface text-market-text font-semibold"
                      : "border-market-border bg-market-surface/40 text-market-muted hover:text-market-text"
                  )}
                >
                  <Minus className="h-3 w-3" /> Neutral
                </button>
                <button
                  type="button"
                  onClick={() => setSentiment(sentiment === "bearish" ? "" : "bearish")}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-md border py-2 text-xs font-medium transition-colors",
                    sentiment === "bearish"
                      ? "border-market-down bg-market-down/10 text-market-down font-semibold"
                      : "border-market-border bg-market-surface/40 text-market-muted hover:text-market-text"
                  )}
                >
                  <TrendingDown className="h-3 w-3" /> Bearish
                </button>
              </div>
            </div>
          </div>

          {/* Tags & Color Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <Input
                id="note-tags"
                label="Tags (Comma separated)"
                placeholder="e.g. EV, HighPE, LongTerm"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-market-muted">
                Accent Highlight
              </label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={cn(
                      "h-6 w-6 rounded-full transition-transform",
                      c.class,
                      color === c.id
                        ? "ring-2 ring-white ring-offset-2 ring-offset-market-card scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-market-down/20 bg-market-down/10 px-3 py-2 text-xs text-market-down animate-fade-in-up">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-market-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : initialNote ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
