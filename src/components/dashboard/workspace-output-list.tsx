import Link from "next/link";
import { FileCog, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { WorkspaceOutput } from "@/lib/types";

const iconByKind = {
  projection: TrendingUp,
  note: Sparkles,
  risk: ShieldAlert,
  document: FileCog,
} as const;

interface WorkspaceOutputListProps {
  outputs: WorkspaceOutput[];
}

function toneForOutput(status: WorkspaceOutput["status"]) {
  switch (status) {
    case "fresh":
      return "accent";
    case "review":
      return "warning";
    default:
      return "success";
  }
}

export function WorkspaceOutputList({ outputs }: WorkspaceOutputListProps) {
  return (
    <CardPanel
      title="Recent workspace outputs"
      description="Keep generated projections, flagged risks, and deliverables moving through review."
      action={
        <Link href="/workspace" className="text-sm font-medium text-[var(--accent)]">
          Go to workspace
        </Link>
      }
      className="h-full"
    >
      <div className="space-y-3">
        {outputs.map((output) => {
          const Icon = iconByKind[output.kind];

          return (
            <div
              key={output.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white/80 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--foreground)]">
                    {output.title}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {output.kind} • {output.updatedAt}
                  </p>
                </div>
              </div>
              <StatusBadge tone={toneForOutput(output.status)}>
                {output.status}
              </StatusBadge>
            </div>
          );
        })}
      </div>
    </CardPanel>
  );
}

