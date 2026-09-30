"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  StickyNote,
  X,
  Plus,
  Maximize2,
  Search,
  Pin,
  Check,
  Brain,
  Lightbulb,
  CheckSquare,
  Target,
  Bookmark,
  Sparkles,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useNotes } from "@/lib/notes-store";
import { Note, NoteCategory, CATEGORY_CONFIG } from "@/types/note";
import { NoteEditorModal } from "./note-editor-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CategoryIcons: Record<NoteCategory, React.ElementType> = {
  analysis: Brain,
  thoughts: Lightbulb,
  todo: CheckSquare,
  bucket_list: Target,
  pointers: Bookmark,
};

const GUIDED_STARTERS = [
  {
    category: "analysis" as NoteCategory,
    icon: Brain,
    title: "Draft Stock Analysis",
    subtitle: "Valuation, moat, catalysts & risks",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    category: "todo" as NoteCategory,
    icon: CheckSquare,
    title: "Create Action Checklist",
    subtitle: "Rebalance tasks with checkable boxes",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    category: "bucket_list" as NoteCategory,
    icon: Target,
    title: "Dip Buy Bucket List",
    subtitle: "Target entry prices for wishlist stocks",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    category: "pointers" as NoteCategory,
    icon: Bookmark,
    title: "Trading Rule of Thumb",
    subtitle: "Discipline, risk & position sizing",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  {
    category: "thoughts" as NoteCategory,
    icon: Lightbulb,
    title: "Market Commentary",
    subtitle: "Macro outlook & sector rotations",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
];

export function NotesWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialCategoryForModal, setInitialCategoryForModal] =
    useState<NoteCategory>("analysis");

  // Quick note state inside widget
  const [quickTitle, setQuickTitle] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [quickCategory, setQuickCategory] = useState<NoteCategory>("analysis");

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

  // Keyboard shortcut: Alt+N or Option+N to toggle widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Strictly for authenticated users
  if (isAuthenticated === false) {
    return null;
  }

  const filteredNotes = notes.filter((n) => {
    const matchesCategory =
      selectedCategory === "all" || n.category === selectedCategory;
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.symbol && n.symbol.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await createNote({
      title: quickTitle.trim(),
      content: quickContent.trim(),
      category: quickCategory,
      color: "emerald",
    });

    setQuickTitle("");
    setQuickContent("");
    setIsQuickAddOpen(false);
  };

  const handleLaunchGuidedStarter = (category: NoteCategory) => {
    setInitialCategoryForModal(category);
    setEditingNote(null);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex h-13 w-13 items-center justify-center rounded-2xl gradient-primary text-white shadow-xl shadow-market-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-market-up/30 animate-glow-pulse"
            title="Open Notes & Analysis Scratchpad (Alt + N)"
          >
            <StickyNote className="h-6 w-6 transition-transform group-hover:rotate-12" />
            {notes.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5.5 min-w-[22px] items-center justify-center rounded-full bg-market-card px-1 text-[11px] font-bold text-market-up border border-market-border shadow-md">
                {notes.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Slide-up Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-40 w-[92vw] sm:w-[420px] max-h-[85vh] h-[600px] flex flex-col rounded-2xl border border-market-border bg-market-card shadow-2xl overflow-hidden backdrop-blur-md animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-market-border/80 px-4 py-3 bg-market-surface/80">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-white shadow-sm">
                <StickyNote className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-market-text flex items-center gap-1.5">
                  Investment Notes
                  <span className="text-[10px] text-market-muted font-normal">
                    (Alt+N)
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/notes"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-market-muted hover:text-market-text hover:bg-market-surface transition-colors"
                title="Expand to Full Screen Workspace"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-market-muted hover:text-market-text hover:bg-market-surface transition-colors"
                title="Minimize Widget"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Add Bar / Toggle */}
          <div className="border-b border-market-border/60 bg-market-surface/40 p-2.5">
            {!isQuickAddOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-market-muted" />
                  <input
                    type="text"
                    placeholder="Search thoughts, analysis, to-do..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-market-border bg-market-surface py-1.5 pl-8 pr-2 text-xs text-market-text placeholder:text-market-muted focus:border-market-accent focus:outline-none"
                  />
                </div>
                <Button
                  size="sm"
                  className="h-8 px-2.5 text-xs gap-1"
                  onClick={() => setIsQuickAddOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> Note
                </Button>
              </div>
            ) : (
              <form onSubmit={handleQuickSave} className="space-y-2 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-market-text flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-market-up" /> Fast Scratchpad
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="text-market-muted hover:text-market-text text-xs"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {(
                    [
                      "analysis",
                      "thoughts",
                      "todo",
                      "bucket_list",
                      "pointers",
                    ] as NoteCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setQuickCategory(cat)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[11px] font-medium whitespace-nowrap border transition-colors",
                        quickCategory === cat
                          ? "bg-market-up/10 text-market-up border-market-up/40 font-semibold"
                          : "border-market-border bg-market-card text-market-muted hover:text-market-text"
                      )}
                    >
                      {CATEGORY_CONFIG[cat].label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Note Title or Stock Symbol..."
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full rounded-md border border-market-border bg-market-surface px-2.5 py-1.5 text-xs text-market-text placeholder:text-market-muted focus:border-market-accent focus:outline-none"
                  autoFocus
                  required
                />

                <textarea
                  rows={2}
                  placeholder="Type pointers or checklist (- [ ] item)..."
                  value={quickContent}
                  onChange={(e) => setQuickContent(e.target.value)}
                  className="w-full rounded-md border border-market-border bg-market-surface px-2.5 py-1.5 text-xs text-market-text placeholder:text-market-muted focus:border-market-accent focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="text-[11px] text-market-accent hover:underline"
                  >
                    Open full editor & templates →
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setIsQuickAddOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="h-7 text-xs px-2.5">
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Category Filter Pills (when notes exist) */}
            {!isQuickAddOpen && notes.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto pt-2 text-[11px] scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 whitespace-nowrap transition-colors border",
                    selectedCategory === "all"
                      ? "bg-market-card border-market-border font-semibold text-market-up"
                      : "text-market-muted border-transparent hover:text-market-text"
                  )}
                >
                  All ({notes.length})
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
                  const Icon = CategoryIcons[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 whitespace-nowrap transition-colors border",
                        selectedCategory === cat
                          ? "bg-market-card border-market-border font-semibold text-market-up"
                          : "text-market-muted border-transparent hover:text-market-text"
                      )}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {CATEGORY_CONFIG[cat].label} {count > 0 && `(${count})`}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes Scrollable List OR Interactive Guided Tour */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-market-border/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-market-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-market-up border-t-transparent" />
                <p className="mt-2 text-xs">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              /* Interactive Onboarding State — No dummy notes! */
              <div className="py-2 space-y-3">
                <div className="rounded-xl border border-market-up/20 bg-market-up/5 p-3 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-market-up">
                    <Sparkles className="h-3.5 w-3.5" />
                    How to use your Scratchpad
                  </div>
                  <p className="mt-1 text-[11px] text-market-muted leading-relaxed">
                    Click any guided template below to see how each category organizes your investment ideas:
                  </p>
                </div>

                <div className="space-y-1.5">
                  {GUIDED_STARTERS.map((item) => (
                    <button
                      key={item.category}
                      onClick={() => handleLaunchGuidedStarter(item.category)}
                      className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border border-market-border/80 bg-market-surface/40 hover:bg-market-surface hover:border-market-border transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg border",
                            item.badgeClass
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-market-text group-hover:text-market-up transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-market-muted">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-market-muted group-hover:text-market-up group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-market-muted px-4">
                <StickyNote className="h-8 w-8 text-market-muted/40 stroke-1" />
                <p className="mt-2 text-xs font-medium text-market-text">
                  No matching notes
                </p>
                <p className="text-[11px] text-market-muted mt-0.5">
                  Try clearing your search query.
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const conf = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.analysis;
                const Icon = CategoryIcons[note.category] || Brain;
                const lines = note.content.split("\n");

                return (
                  <div
                    key={note.id}
                    className={cn(
                      "group pt-2.5 first:pt-0 rounded-lg p-2.5 transition-colors hover:bg-market-surface/40",
                      note.pinned && "bg-market-surface/20 border-l-2 border-market-up"
                    )}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border",
                            conf.badgeClass
                          )}
                        >
                          <Icon className="h-2.5 w-2.5" />
                          {conf.label}
                        </span>

                        {note.symbol && (
                          <span className="rounded bg-market-surface px-1.5 py-0.5 text-[10px] font-mono font-semibold text-market-text border border-market-border/60">
                            {note.symbol}
                          </span>
                        )}

                        {note.pinned && (
                          <Pin className="h-3 w-3 text-market-up fill-market-up" />
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePin(note.id)}
                          className="p-1 rounded text-market-muted hover:text-market-up"
                          title="Pin note"
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(note);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-market-muted hover:text-market-text"
                          title="Edit"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 rounded text-market-muted hover:text-market-down"
                          title="Delete"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <h4
                      onClick={() => {
                        setEditingNote(note);
                        setIsModalOpen(true);
                      }}
                      className="mt-1.5 text-xs font-bold text-market-text hover:text-market-up cursor-pointer line-clamp-1"
                    >
                      {note.title}
                    </h4>

                    {/* Interactive Checklist lines in widget */}
                    <div className="mt-1.5 space-y-1">
                      {lines.slice(0, 3).map((line, idx) => {
                        const isTodo =
                          line.includes("[ ] ") ||
                          line.includes("[x] ") ||
                          line.includes("- [ ] ") ||
                          line.includes("- [x] ");
                        const isChecked =
                          line.includes("[x] ") || line.includes("- [x] ");

                        if (isTodo) {
                          const cleanText = line
                            .replace(/^(\s*-\s*\[[ x]\]\s*|\s*\[[ x]\]\s*)/, "")
                            .trim();
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleTodoItem(note.id, idx)}
                              className="flex items-center gap-1.5 cursor-pointer text-[11px]"
                            >
                              <div
                                className={cn(
                                  "flex h-3 w-3 shrink-0 items-center justify-center rounded border",
                                  isChecked
                                    ? "bg-market-up border-market-up text-white"
                                    : "border-market-border bg-market-surface"
                                )}
                              >
                                {isChecked && <Check className="h-2 w-2 stroke-[3]" />}
                              </div>
                              <span
                                className={cn(
                                  isChecked
                                    ? "line-through text-market-muted/70"
                                    : "text-market-text"
                                )}
                              >
                                {cleanText}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <p
                            key={idx}
                            className="text-[11px] text-market-muted line-clamp-1 leading-snug"
                          >
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between border-t border-market-border/60 bg-market-surface/40 px-3.5 py-2 text-[11px] text-market-muted">
            <span>{notes.length} saved notes</span>
            <Link
              href="/notes"
              onClick={() => setIsOpen(false)}
              className="font-medium text-market-accent hover:underline flex items-center gap-1"
            >
              Open Full Workspace →
            </Link>
          </div>
        </div>
      )}

      {/* Full Note Editor Modal */}
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
        defaultCategory={initialCategoryForModal}
      />
    </>
  );
}
