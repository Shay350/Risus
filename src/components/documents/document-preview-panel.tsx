import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DocumentRecord } from "@/lib/types";

interface DocumentPreviewPanelProps {
  document: DocumentRecord;
}

export function DocumentPreviewPanel({ document }: DocumentPreviewPanelProps) {
  return (
    <CardPanel
      title="Preview"
      description="Representative content view for the currently selected file."
      action={<StatusBadge tone={document.status === "ready" ? "success" : "warning"}>{document.status}</StatusBadge>}
      className="h-full"
    >
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--background-elevated)] p-5">
        <div className="space-y-2 border-b border-[var(--border)] pb-4">
          <p className="text-lg font-semibold text-[var(--foreground)]">{document.title}</p>
          <p className="text-sm text-[var(--muted)]">
            {document.sourceLanguage.toUpperCase()}
            {document.targetLanguage ? ` to ${document.targetLanguage.toUpperCase()}` : ""}
          </p>
        </div>
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-white p-4 text-sm leading-7 text-[var(--foreground)] shadow-[var(--shadow-sm)]">
            {document.previewText}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {["Translate", "Generate", "Export"].map((action) => (
              <button
                key={action}
                type="button"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-slate-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </CardPanel>
  );
}

