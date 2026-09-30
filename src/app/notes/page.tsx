"use client";

import { useState } from "react";
import Link from "next/link";
import {
  StickyNote,
  Plus,
  Search,
  Download,
  Brain,
  Lightbulb,
  CheckSquare,
  Target,
  Bookmark,
  Sparkles,
  Filter,
  Lock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useNotes } from "@/lib/notes-store";
import { Note, NoteCategory, CATEGORY_CONFIG } from "@/types/note";
import { NoteCard } from "@/components/notes/note-card";
import { NoteEditorModal } from "@/components/notes/note-editor-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CategoryIcons: Record<NoteCategory, React.ElementType> = {
  analysis: Brain,
  thoughts: Lightbulb,
  todo: CheckSquare,
  bucket_list: Target,
  pointers: Bookmark,
};

const INTERACTIVE_STARTERS = [
  {
    category: "analysis" as NoteCategory,
    icon: Brain,
    title: "Draft a Stock Analysis Thesis",
    subtitle: "Valuation, moat, catalysts & earnings expectations",
    example: "e.g. Reliance Retail IPO thesis, TCS margin recovery",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    buttonText: "Draft Stock Analysis",
  },
  {
    category: "todo" as NoteCategory,
    icon: CheckSquare,
    title: "Create a Portfolio Action Checklist",
    subtitle: "Interactive to-dos with one-click checkable boxes",
    example: "e.g. Rebalance IT allocation, check dividend tax, set GTT",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    buttonText: "Create Action Checklist",
  },
  {
    category: "bucket_list" as NoteCategory,
    icon: Target,
    title: "Build your Dip-Buy Bucket List",
    subtitle: "Target entry prices & discount alerts for high-conviction stocks",
    example: "e.g. Buy HDFCBANK below ₹1,650, L&T below ₹3,300",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    buttonText: "Add to Bucket List",
  },
  {
    category: "pointers" as NoteCategory,
    icon: Bookmark,
    title: "Record Trading Rules of Thumb",
    subtitle: "Personal rules for risk management & position sizing",
    example: "e.g. Max 7% per small cap, cut loss if thesis breaks",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    buttonText: "Write Trading Rule",
  },
  {
    category: "thoughts" as NoteCategory,
    icon: Lightbulb,
    title: "Log Macro & Market Thoughts",
    subtitle: "Sector rotations, RBI policy expectations & sentiment instincts",
    example: "e.g. Capital goods capex cycle, crude oil margin impacts",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    buttonText: "Jot Down Thought",
  },
];

export default function NotesPage() {
  const {
    notes,
    loading,
    isAuthenticated,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleTodoItem,
  } = useNotes();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [activeCategoryForModal, setActiveCategoryForModal] =
    useState<NoteCategory>("analysis");

  // Authentication Guard
  if (!loading && isAuthenticated === false) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 tech-grid">
        <Card className="w-full max-w-md market-panel border border-market-border/80 shadow-2xl text-center">
          <CardContent className="pt-8 pb-8 px-6 sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-market-up/10 text-market-up border border-market-up/20">
              <Lock className="h-7 w-7 text-market-up" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-market-text">
              Login Required
            </h1>
            <p className="mt-2 text-sm text-market-muted leading-relaxed">
              Your investment notes, stock theses, and action checklists are private and securely stored in your personal account.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/login" className="w-full">
                <Button className="w-full">Log In to View Notes</Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button variant="outline" className="w-full">
                  Create a Free Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract all unique stock symbols from notes
  const symbols = Array.from(
    new Set(notes.map((n) => n.symbol).filter(Boolean))
  ) as string[];

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesCategory =
      selectedCategory === "all" || note.category === selectedCategory;
    const matchesSymbol =
      selectedSymbol === "all" || note.symbol === selectedSymbol;
    const matchesSearch =
      !search ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      (note.symbol && note.symbol.toLowerCase().includes(search.toLowerCase())) ||
      (note.tags && note.tags.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSymbol && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const regularNotes = filteredNotes.filter((n) => !n.pinned);

  // Stats calculation
  const totalNotes = notes.length;
  const analysisCount = notes.filter((n) => n.category === "analysis").length;
  const bucketListCount = notes.filter((n) => n.category === "bucket_list").length;

  let totalTodos = 0;
  let completedTodos = 0;
  notes.forEach((n) => {
    const lines = n.content.split("\n");
    lines.forEach((l) => {
      if (l.includes("[ ] ") || l.includes("- [ ] ")) totalTodos++;
      if (l.includes("[x] ") || l.includes("- [x] ")) {
        totalTodos++;
        completedTodos++;
      }
    });
  });

  const handleOpenStarter = (cat: NoteCategory) => {
    setActiveCategoryForModal(cat);
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleExportMarkdown = () => {
    let md = `# PortfolioIQ Notes & Investment Scratchpad\n\nExported on: ${new Date().toLocaleString(
      "en-IN"
    )}\n\n---\n\n`;

    notes.forEach((n) => {
      md += `## [${CATEGORY_CONFIG[n.category]?.label.toUpperCase()}] ${n.title}\n`;
      if (n.symbol) md += `**Stock:** ${n.symbol} | `;
      if (n.sentiment) md += `**Sentiment:** ${n.sentiment} | `;
      md += `**Updated:** ${new Date(n.updatedAt).toLocaleDateString()}\n\n`;
      md += `${n.content}\n\n`;
      if (n.tags) md += `*Tags: ${n.tags}*\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PortfolioIQ-Notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-market-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white shadow-lg shadow-market-accent/20">
              <StickyNote className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-market-text flex items-center gap-2">
                Investment Notes & Analysis
              </h1>
              <p className="text-xs sm:text-sm text-market-muted mt-0.5">
                Organize your investment thesis, stock valuation notes, to-do checklists, and dip bucket lists.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMarkdown}
            className="text-xs gap-1.5"
            disabled={notes.length === 0}
            title="Export all notes to Markdown"
          >
            <Download className="h-3.5 w-3.5" />
            Export MD
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            className="text-xs gap-1.5 shadow-md shadow-market-up/20"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* KPI Stats Row (Visible when notes exist) */}
      {notes.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up">
          <Card className="market-panel border border-market-border bg-market-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-market-muted">Total Notes</span>
              <StickyNote className="h-4 w-4 text-market-up" />
            </div>
            <div className="mt-2 text-2xl font-bold text-market-text">{totalNotes}</div>
            <div className="text-[11px] text-market-muted">Across 5 categories</div>
          </Card>

          <Card className="market-panel border border-market-border bg-market-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-market-muted">Checklist To-Dos</span>
              <CheckSquare className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-market-text">
              {completedTodos} / {totalTodos}
            </div>
            <div className="text-[11px] text-market-muted">
              {totalTodos - completedTodos} tasks remaining
            </div>
          </Card>

          <Card className="market-panel border border-market-border bg-market-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-market-muted">Stock Theses</span>
              <Brain className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-market-text">{analysisCount}</div>
            <div className="text-[11px] text-market-muted">Fundamental & technical</div>
          </Card>

          <Card className="market-panel border border-market-border bg-market-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-market-muted">Dip Bucket List</span>
              <Target className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-market-text">{bucketListCount}</div>
            <div className="text-[11px] text-market-muted">Target entry watchlists</div>
          </Card>
        </div>
      )}

      {/* Filter & Search Bar (Visible when notes exist) */}
      {notes.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-market-border bg-market-card/80 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-market-muted" />
            <input
              type="text"
              placeholder="Search notes, tickers, tags, or to-dos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-market-border bg-market-surface py-2 pl-9 pr-3 text-xs sm:text-sm text-market-text placeholder:text-market-muted focus:border-market-accent focus:outline-none"
            />
          </div>

          {symbols.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-market-muted" />
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="rounded-md border border-market-border bg-market-surface px-2.5 py-2 text-xs text-market-text focus:border-market-accent focus:outline-none"
              >
                <option value="all">All Tickers</option>
                {symbols.map((sym) => (
                  <option key={sym} value={sym}>
                    {sym}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Category Filter Pills (when notes exist) */}
      {notes.length > 0 && (
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border",
              selectedCategory === "all"
                ? "bg-market-card border-market-up text-market-up font-semibold shadow-sm"
                : "border-market-border bg-market-surface/40 text-market-muted hover:text-market-text hover:bg-market-surface"
            )}
          >
            All Notes ({notes.length})
          </button>

          {(
            [
              "analysis",
              "thoughts",
              "todo",
              "bucket_list",
              "pointers",
            ] as NoteCategory[]
          ).map((cat) => {
            const count = notes.filter((n) => n.category === cat).length;
            const conf = CATEGORY_CONFIG[cat];
            const Icon = CategoryIcons[cat];
            const active = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border",
                  active
                    ? cn(conf.badgeClass, "font-semibold shadow-sm border-current scale-[1.02]")
                    : "border-market-border bg-market-surface/40 text-market-muted hover:text-market-text hover:bg-market-surface"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{conf.label}</span>
                {count > 0 && <span className="opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-market-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-market-up border-t-transparent" />
            <p className="mt-3 text-sm">Loading your notes & scratchpad...</p>
          </div>
        ) : notes.length === 0 ? (
          /* Interactive Onboarding Experience — Guides user on what and how to do */
          <div className="space-y-6 animate-fade-in-up">
            {/* Hero Quick Start Card */}
            <div className="rounded-2xl border border-market-border bg-market-card/90 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-market-up/10 blur-2xl pointer-events-none" />
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-market-up/10 border border-market-up/20 px-3 py-1 text-xs font-semibold text-market-up mb-3">
                  <Zap className="h-3.5 w-3.5" />
                  Interactive Quick-Start Guide
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-market-text">
                  Welcome to your Personal Investment Scratchpad
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-market-muted leading-relaxed">
                  Capture your thoughts, analysis, to-do lists, and buy-in targets in one unified workspace.
                  Click any interactive template below to get started immediately:
                </p>
              </div>

              {/* Floating Widget Tip */}
              <div className="mt-4 rounded-xl border border-market-border/60 bg-market-surface/60 p-3.5 flex items-start gap-3 text-xs text-market-muted">
                <div className="p-1.5 rounded-lg bg-market-up/10 text-market-up shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-market-text">Pro-Tip: Quick Floating Widget</span>
                  <p className="mt-0.5 leading-relaxed">
                    You can press <kbd className="px-1.5 py-0.5 rounded bg-market-card border border-market-border font-mono text-market-text font-bold">Alt + N</kbd> (or click the green note button in the bottom-right corner) from any page in the app to slide up your scratchpad without losing your current view.
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Interactive Category Starters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INTERACTIVE_STARTERS.map((item) => (
                <div
                  key={item.category}
                  onClick={() => handleOpenStarter(item.category)}
                  className="group relative flex flex-col justify-between rounded-xl border border-market-border bg-market-card/60 p-5 hover:border-market-up/50 hover:bg-market-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl border",
                          item.badgeClass
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-market-muted uppercase tracking-wider">
                        {CATEGORY_CONFIG[item.category].label}
                      </span>
                    </div>

                    <h3 className="mt-3.5 text-base font-bold text-market-text group-hover:text-market-up transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-market-muted leading-relaxed">
                      {item.subtitle}
                    </p>

                    <div className="mt-3 rounded-lg border border-market-border/40 bg-market-surface/40 p-2 text-[11px] text-market-text/70 font-mono">
                      {item.example}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-market-border/40 flex items-center justify-between text-xs font-semibold text-market-up group-hover:underline">
                    <span>{item.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card className="market-panel border border-market-border/80 text-center py-16 px-6">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-market-surface border border-market-border text-market-muted">
                <StickyNote className="h-7 w-7 stroke-1" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-market-text">
                No matching notes found
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-market-muted max-w-md">
                No notes matched &quot;{search}&quot;. Try adjusting your search or filters.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setSelectedSymbol("all");
                }}
                variant="outline"
                className="mt-4 text-xs"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-market-up">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pinned Notes ({pinnedNotes.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsModalOpen(true);
                      }}
                      onDelete={deleteNote}
                      onTogglePin={togglePin}
                      onToggleTodo={toggleTodoItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notes Section */}
            <div className="space-y-3">
              {pinnedNotes.length > 0 && regularNotes.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-market-muted">
                  <span>All Other Notes ({regularNotes.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(n) => {
                      setEditingNote(n);
                      setIsModalOpen(true);
                    }}
                    onDelete={deleteNote}
                    onTogglePin={togglePin}
                    onToggleTodo={toggleTodoItem}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={async (data) => {
          if (editingNote) {
            await updateNote(editingNote.id, data);
          } else {
            await createNote(data);
          }
        }}
        initialNote={editingNote}
        defaultCategory={activeCategoryForModal}
      />
    </div>
  );
}
