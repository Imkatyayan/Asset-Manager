"use client";

import { useState } from "react";
import {
  Pin,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Brain,
  Lightbulb,
  CheckSquare,
  Target,
  Bookmark,
  Calendar,
} from "lucide-react";
import { Note, NoteCategory, CATEGORY_CONFIG, COLOR_CONFIG } from "@/types/note";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleTodo?: (noteId: string, lineIndex: number) => void;
}

const CategoryIcons: Record<NoteCategory, React.ElementType> = {
  analysis: Brain,
  thoughts: Lightbulb,
  todo: CheckSquare,
  bucket_list: Target,
  pointers: Bookmark,
};

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleTodo,
}: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const categoryConfig = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.analysis;
  const CategoryIcon = CategoryIcons[note.category] || Brain;
  const colorConfig = COLOR_CONFIG[note.color || "emerald"] || COLOR_CONFIG.default;

  const lines = note.content.split("\n");

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${note.title}\n\n${note.content}${
      note.symbol ? `\n\nSymbol: ${note.symbol}` : ""
    }`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate todo stats if note has checklist items
  const todoItems = lines.filter(
    (l) => l.includes("[ ] ") || l.includes("[x] ") || l.includes("- [ ] ") || l.includes("- [x] ")
  );
  const completedTodoItems = lines.filter(
    (l) => l.includes("[x] ") || l.includes("- [x] ")
  );

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 border-l-4",
        colorConfig.bg,
        note.pinned ? "border-market-up/40 bg-market-card/90" : "border-market-border bg-market-card/60"
      )}
    >
      <div className="p-4 sm:p-5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
                categoryConfig.badgeClass
              )}
            >
              <CategoryIcon className="h-3 w-3" />
              {categoryConfig.label}
            </span>

            {/* Symbol tag */}
            {note.symbol && (
              <span className="inline-flex items-center rounded-md bg-market-surface px-2 py-0.5 text-xs font-mono font-semibold text-market-text border border-market-border/60">
                {note.symbol}
              </span>
            )}

            {/* Sentiment */}
            {note.sentiment === "bullish" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-market-up bg-market-up/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="h-3 w-3" /> Bullish
              </span>
            )}
            {note.sentiment === "bearish" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-market-down bg-market-down/10 px-1.5 py-0.5 rounded">
                <TrendingDown className="h-3 w-3" /> Bearish
              </span>
            )}
            {note.sentiment === "neutral" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-market-muted bg-market-surface px-1.5 py-0.5 rounded">
                <Minus className="h-3 w-3" /> Neutral
              </span>
            )}
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 text-market-muted opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onTogglePin(note.id)}
              title={note.pinned ? "Unpin note" : "Pin note to top"}
              className={cn(
                "p-1.5 rounded hover:bg-market-surface transition-colors",
                note.pinned ? "text-market-up" : "hover:text-market-text"
              )}
            >
              <Pin className={cn("h-3.5 w-3.5", note.pinned && "fill-market-up")} />
            </button>
            <button
              onClick={handleCopy}
              title="Copy note text"
              className="p-1.5 rounded hover:bg-market-surface hover:text-market-text transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-market-up" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => onEdit(note)}
              title="Edit note"
              className="p-1.5 rounded hover:bg-market-surface hover:text-market-text transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              title="Delete note"
              className="p-1.5 rounded hover:bg-market-surface hover:text-market-down transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onEdit(note)}
          className="mt-3 text-base font-bold text-market-text cursor-pointer hover:text-market-up transition-colors line-clamp-2"
        >
          {note.title}
        </h3>

        {/* Todo Progress bar if there are todos */}
        {todoItems.length > 0 && (
          <div className="mt-2.5 space-y-1">
            <div className="flex justify-between text-[11px] text-market-muted">
              <span>Checklist</span>
              <span>
                {completedTodoItems.length} of {todoItems.length} completed
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-market-surface overflow-hidden">
              <div
                className="h-full bg-market-up transition-all duration-300"
                style={{
                  width: `${(completedTodoItems.length / todoItems.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="mt-3 space-y-1 text-sm text-market-text/90">
          {lines.slice(0, 6).map((line, idx) => {
            const isTodoUnchecked = line.includes("- [ ] ") || line.includes("[ ] ");
            const isTodoChecked = line.includes("- [x] ") || line.includes("[x] ");

            if (isTodoUnchecked || isTodoChecked) {
              const textContent = line
                .replace(/^(\s*-\s*\[[ x]\]\s*|\s*\[[ x]\]\s*)/, "")
                .trim();

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleTodo) onToggleTodo(note.id, idx);
                  }}
                  className="flex items-start gap-2.5 py-0.5 cursor-pointer select-none group/todo"
                >
                  <input
                    type="checkbox"
                    checked={isTodoChecked}
                    onChange={() => {}} // handled by div click
                    className="mt-1 h-3.5 w-3.5 rounded border-market-border bg-market-surface text-market-up focus:ring-0 cursor-pointer"
                  />
                  <span
                    className={cn(
                      "text-xs transition-colors leading-relaxed",
                      isTodoChecked
                        ? "line-through text-market-muted/70"
                        : "text-market-text group-hover/todo:text-market-up"
                    )}
                  >
                    {textContent}
                  </span>
                </div>
              );
            }

            return (
              <p
                key={idx}
                className="text-xs leading-relaxed text-market-text/80 line-clamp-2"
              >
                {line}
              </p>
            );
          })}

          {lines.length > 6 && (
            <p
              onClick={() => onEdit(note)}
              className="text-xs text-market-accent hover:underline cursor-pointer pt-1"
            >
              +{lines.length - 6} more lines...
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-market-border/40 px-4 py-2.5 bg-market-surface/30 text-[11px] text-market-muted">
        <div className="flex flex-wrap gap-1">
          {note.tags &&
            note.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 3)
              .map((tag) => (
                <span key={tag} className="text-market-muted/80">
                  #{tag}
                </span>
              ))}
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(note.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
        </div>
      </div>
    </Card>
  );
}
