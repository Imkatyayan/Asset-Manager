export type NoteCategory =
  | "analysis"
  | "thoughts"
  | "todo"
  | "bucket_list"
  | "pointers";

export type NoteSentiment = "bullish" | "bearish" | "neutral";

export type NoteColor =
  | "emerald"
  | "red"
  | "blue"
  | "amber"
  | "purple"
  | "default";

export interface Note {
  id: string;
  userId?: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags?: string | null;
  symbol?: string | null;
  sentiment?: NoteSentiment | null;
  pinned: boolean;
  color?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const CATEGORY_CONFIG: Record<
  NoteCategory,
  {
    label: string;
    icon: string;
    description: string;
    badgeClass: string;
    borderClass: string;
  }
> = {
  analysis: {
    label: "Analysis",
    icon: "Brain",
    description: "Deep fundamental & technical stock thesis",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    borderClass: "hover:border-blue-500/50",
  },
  thoughts: {
    label: "Thoughts",
    icon: "Lightbulb",
    description: "Market sentiment, macro insights & instincts",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    borderClass: "hover:border-amber-500/50",
  },
  todo: {
    label: "To-Do",
    icon: "CheckSquare",
    description: "Portfolio actions, rebalancing tasks & checklists",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    borderClass: "hover:border-emerald-500/50",
  },
  bucket_list: {
    label: "Bucket List",
    icon: "Target",
    description: "Wishlist stocks, target entry prices & dip alerts",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    borderClass: "hover:border-purple-500/50",
  },
  pointers: {
    label: "Pointers",
    icon: "Bookmark",
    description: "Trading rules of thumb & risk management rules",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    borderClass: "hover:border-rose-500/50",
  },
};

export const COLOR_CONFIG: Record<string, { label: string; bg: string; border: string }> = {
  emerald: {
    label: "Green",
    bg: "border-l-market-up",
    border: "border-market-up/30",
  },
  blue: {
    label: "Blue",
    bg: "border-l-blue-500",
    border: "border-blue-500/30",
  },
  amber: {
    label: "Amber",
    bg: "border-l-amber-500",
    border: "border-amber-500/30",
  },
  purple: {
    label: "Purple",
    bg: "border-l-purple-500",
    border: "border-purple-500/30",
  },
  red: {
    label: "Red",
    bg: "border-l-market-down",
    border: "border-market-down/30",
  },
  default: {
    label: "Subtle",
    bg: "border-l-market-border",
    border: "border-market-border",
  },
};
