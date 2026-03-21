import { FileOutput, FileText, Files } from "lucide-react";

import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DeliverableRecord } from "@/lib/types";

interface OutputListProps {
  items: DeliverableRecord[];
}

function iconForKind(kind: DeliverableRecord["kind"]) {
  switch (kind) {
    case "summary":
      return FileText;
    case "packet":
      return Files;
    default:
      return FileOutput;
  }
}

function toneForStatus(status: DeliverableRecord["status"]) {
  switch (status) {
    case "ready":
      return "success";
    case "processing":
      return "warning";
    default:
      return "neutral";
  }
}

export function OutputList({ items }: OutputListProps) {
  return (
    <CardPanel title="Output queue" className="h-full">
      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = iconForKind(item.kind);

          return (
            <div
              key={item.id}
              className={[
                "rounded-2xl border px-4 py-4",
                index === 0
                  ? "border-[var(--border-strong)] bg-[var(--background-elevated)]"
                  : "border-[var(--border)] bg-white/85",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {item.kind} • {item.languageLabel}
                    </p>
                  </div>
                </div>
                <StatusBadge tone={toneForStatus(item.status)}>{item.status}</StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {item.summary}
              </p>
            </div>
          );
        })}
      </div>
    </CardPanel>
  );
}

