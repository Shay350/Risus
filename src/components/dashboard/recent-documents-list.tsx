import { FileStack, Globe2 } from "lucide-react";

import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DocumentRecord } from "@/lib/types";

interface RecentDocumentsListProps {
  documents: DocumentRecord[];
}

function statusTone(status: DocumentRecord["status"]) {
  switch (status) {
    case "ready":
      return "success";
    case "extracting":
    case "translating":
      return "warning";
    case "error":
      return "danger";
    default:
      return "neutral";
  }
}

export function RecentDocumentsList({ documents }: RecentDocumentsListProps) {
  return (
    <CardPanel
      title="Recent documents"
      description="Translated, extracted, and generated files from active sessions."
      className="h-full"
    >
      <div className="space-y-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white/80 p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <FileStack className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {document.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  <span>{document.type}</span>
                  <span>•</span>
                  <span>{document.pageCount ?? 1} pages</span>
                  <span>•</span>
                  <span>{document.updatedAt.slice(11, 16)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>
                    {document.sourceLanguage.toUpperCase()}
                    {document.targetLanguage
                      ? ` to ${document.targetLanguage.toUpperCase()}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
            <StatusBadge tone={statusTone(document.status)}>{document.status}</StatusBadge>
          </div>
        ))}
      </div>
    </CardPanel>
  );
}

