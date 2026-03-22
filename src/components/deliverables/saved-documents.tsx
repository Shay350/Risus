"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2 } from "lucide-react";

import { type SavedDocument, openDocumentPdf } from "@/components/workspace/generate-projections";

const SAVED_DOCS_KEY = "risus_saved_documents";

export function SavedDocuments() {
  const [docs, setDocs] = useState<SavedDocument[]>([]);

  useEffect(() => {
    try {
      setDocs(JSON.parse(localStorage.getItem(SAVED_DOCS_KEY) ?? "[]"));
    } catch { /* ignore */ }
  }, []);

  function remove(id: string) {
    const updated = docs.filter((d) => d.id !== id);
    setDocs(updated);
    localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(updated));
  }

  if (docs.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Saved AI Reports
      </p>
      <div className="space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <FileText className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{doc.title}</p>
              <p className="font-mono text-xs text-[var(--muted)]">
                {new Date(doc.savedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openDocumentPdf(doc.data, doc.title)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-gray-50 transition-colors"
              >
                View PDF
              </button>
              <button
                onClick={() => remove(doc.id)}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
