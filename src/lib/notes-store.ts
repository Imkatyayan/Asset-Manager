"use client";

import { useState, useEffect, useCallback } from "react";
import { Note } from "@/types/note";

const NOTES_CHANGED_EVENT = "portfolioiq_notes_updated";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      // Clean up legacy guest storage if present
      if (typeof window !== "undefined") {
        localStorage.removeItem("portfolioiq_guest_notes");
      }

      const res = await fetch("/api/notes");

      if (res.status === 401) {
        setIsAuthenticated(false);
        setNotes([]);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load notes");
      }

      setIsAuthenticated(true);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Error loading notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    const handleNotesChanged = () => {
      fetchNotes();
    };

    window.addEventListener(NOTES_CHANGED_EVENT, handleNotesChanged);
    return () => {
      window.removeEventListener(NOTES_CHANGED_EVENT, handleNotesChanged);
    };
  }, [fetchNotes]);

  function notifyChange() {
    window.dispatchEvent(new Event(NOTES_CHANGED_EVENT));
  }

  const createNote = async (newNoteData: Partial<Note>): Promise<Note> => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNoteData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create note");
    }

    const { note } = await res.json();
    notifyChange();
    return note;
  };

  const updateNote = async (
    id: string,
    updates: Partial<Note>
  ): Promise<Note | null> => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update note");
    }

    const { note } = await res.json();
    notifyChange();
    return note;
  };

  const deleteNote = async (id: string): Promise<void> => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete note");
    }

    notifyChange();
  };

  const togglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await updateNote(id, { pinned: !note.pinned });
  };

  const toggleTodoItem = async (noteId: string, lineIndex: number) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const lines = note.content.split("\n");
    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    if (line.includes("- [ ] ")) {
      lines[lineIndex] = line.replace("- [ ] ", "- [x] ");
    } else if (line.includes("- [x] ")) {
      lines[lineIndex] = line.replace("- [x] ", "- [ ] ");
    } else if (line.includes("[ ] ")) {
      lines[lineIndex] = line.replace("[ ] ", "[x] ");
    } else if (line.includes("[x] ")) {
      lines[lineIndex] = line.replace("[x] ", "[ ] ");
    } else {
      return;
    }

    await updateNote(noteId, { content: lines.join("\n") });
  };

  return {
    notes,
    loading,
    isAuthenticated,
    refreshNotes: fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleTodoItem,
  };
}
