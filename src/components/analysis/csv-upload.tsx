"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CsvUploadProps {
  onUpload: (content: string, fileName: string) => void;
  loading?: boolean;
}

const ACCEPTED_TYPES = [
  "text/csv",
  "text/plain",
  "application/csv",
  "application/vnd.ms-excel",
  "application/octet-stream",
];

const ACCEPTED_EXTENSIONS = [".csv", ".txt"];

function isAcceptedFile(file: File): boolean {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_TYPES.includes(file.type);
}

async function readFileAsText(file: File): Promise<string> {
  // Try UTF-8 first
  const utf8 = await file.text();
  if (utf8 && !utf8.includes("\ufffd")) return utf8;

  // Fallback: read as ArrayBuffer and decode
  const buffer = await file.arrayBuffer();
  const utf8Decoder = new TextDecoder("utf-8", { fatal: false });
  const decoded = utf8Decoder.decode(buffer);
  if (decoded && decoded.trim()) return decoded;

  // Try UTF-16 LE (common Excel export on Windows)
  const utf16 = new TextDecoder("utf-16le", { fatal: false }).decode(buffer);
  return utf16;
}

export function CsvUpload({ onUpload, loading }: CsvUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!isAcceptedFile(file)) {
        setError("Please upload a .csv or .txt holdings file");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setError("File size must be under 4MB");
        return;
      }
      if (file.size === 0) {
        setError("File is empty");
        return;
      }

      try {
        const content = await readFileAsText(file);
        if (!content || !content.trim()) {
          setError("Could not read file content. Try exporting as CSV (UTF-8) from your broker.");
          return;
        }
        setFileName(file.name);
        onUpload(content, file.name);
      } catch {
        setError("Failed to read file. Try saving as CSV UTF-8 from Excel.");
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 text-center transition-all",
          dragOver
            ? "border-market-up bg-emerald-950/20"
            : "border-market-border bg-market-card hover:border-market-up/40",
          loading && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          disabled={loading}
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-market-surface">
          {fileName ? (
            <CheckCircle2 className="h-7 w-7 text-market-up" />
          ) : (
            <Upload className="h-7 w-7 text-market-accent" />
          )}
        </div>

        <p className="mt-4 text-sm font-medium text-market-text">
          {fileName ? fileName : "Import holdings statement"}
        </p>
        <p className="mt-1 text-xs text-market-muted">
          Drop CSV from CDSL · NSDL · Zerodha · Groww · any broker
        </p>

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-market-up">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-market-up border-t-transparent" />
            Parsing & analyzing...
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-market-down/30 bg-red-950/20 px-4 py-3 text-sm text-market-down">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { source: "CDSL", desc: "DP holding statement" },
          { source: "NSDL", desc: "CAS statement export" },
          { source: "Broker", desc: "Zerodha, Groww, etc." },
        ].map((item) => (
          <div
            key={item.source}
            className="flex items-center gap-3 rounded-lg border border-market-border bg-market-card p-3"
          >
            <FileSpreadsheet className="h-5 w-5 text-market-accent shrink-0" />
            <div>
              <p className="text-sm font-medium text-market-text">{item.source}</p>
              <p className="text-xs text-market-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
