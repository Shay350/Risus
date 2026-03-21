import type { DeliverableRecord } from "@/lib/types";
import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";

interface OutputPreviewProps {
  item: DeliverableRecord;
}

export function OutputPreview({ item }: OutputPreviewProps) {
  return (
    <CardPanel
      title="Preview"
      action={<StatusBadge tone={item.status === "ready" ? "success" : "warning"}>{item.status}</StatusBadge>}
      className="h-full"
    >
      <div className="space-y-4 rounded-[28px] border border-[var(--border)] bg-[var(--background-elevated)] p-5">
        <div className="space-y-2 border-b border-[var(--border)] pb-4">
          <p className="text-lg font-semibold text-[var(--foreground)]">{item.title}</p>
          <p className="text-sm text-[var(--muted)]">
            {item.kind} • {item.languageLabel}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 text-sm leading-7 text-[var(--foreground)] shadow-[var(--shadow-sm)]">
          {item.summary}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white/85 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Included now
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--foreground)]">
              <li>Translated call highlights</li>
              <li>Consultant recommendation</li>
              <li>Current evidence state</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/85 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Next edit
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
              Replace mock content with backend-generated output and real file selection.
            </p>
          </div>
        </div>
      </div>
    </CardPanel>
  );
}

