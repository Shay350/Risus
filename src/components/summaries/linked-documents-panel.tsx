import { FileText } from "lucide-react";

import type { DocumentRecord } from "@/lib/types";

interface LinkedDocumentsPanelProps {
  documents: DocumentRecord[];
}

export function LinkedDocumentsPanel({ documents }: LinkedDocumentsPanelProps) {
  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white/80 p-4"
        >
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <FileText className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {document.title}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {document.type} • {document.status} •{" "}
              {document.sourceLanguage.toUpperCase()}
              {document.targetLanguage ? ` to ${document.targetLanguage.toUpperCase()}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
