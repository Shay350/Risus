import { ArrowUpRight, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DocumentRecord } from "@/lib/types";

interface DocumentTableProps {
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

export function DocumentTable({ documents }: DocumentTableProps) {
  return (
    <CardPanel
      title="Document queue"
      description="Track extraction, translation, and deliverable generation across sessions."
      action={<Button variant="outline">Export list</Button>}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              <th className="px-3">Document</th>
              <th className="px-3">Languages</th>
              <th className="px-3">Status</th>
              <th className="px-3">Updated</th>
              <th className="px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="rounded-2xl bg-white/80">
                <td className="rounded-l-2xl border border-r-0 border-[var(--border)] px-3 py-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {document.title}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {document.type} • {document.pageCount ?? 1} pages
                      </p>
                    </div>
                  </div>
                </td>
                <td className="border border-x-0 border-[var(--border)] px-3 py-4 text-sm text-[var(--foreground)]">
                  {document.sourceLanguage.toUpperCase()}
                  {document.targetLanguage
                    ? ` to ${document.targetLanguage.toUpperCase()}`
                    : " source only"}
                </td>
                <td className="border border-x-0 border-[var(--border)] px-3 py-4">
                  <StatusBadge tone={statusTone(document.status)}>{document.status}</StatusBadge>
                </td>
                <td className="border border-x-0 border-[var(--border)] px-3 py-4 text-sm text-[var(--muted)]">
                  {document.updatedAt.slice(0, 16).replace("T", " ")}
                </td>
                <td className="rounded-r-2xl border border-l-0 border-[var(--border)] px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      Translate
                    </Button>
                    <Button size="sm" variant="ghost">
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardPanel>
  );
}

