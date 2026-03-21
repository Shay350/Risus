import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { SummaryRecord } from "@/lib/types";

interface RecentSummariesListProps {
  summaries: SummaryRecord[];
}

function statusTone(status: SummaryRecord["status"]) {
  switch (status) {
    case "shared":
      return "success";
    case "draft":
      return "warning";
    default:
      return "accent";
  }
}

export function RecentSummariesList({ summaries }: RecentSummariesListProps) {
  return (
    <CardPanel
      title="Recent summaries"
      description="Post-call outputs ready for review or delivery."
      className="h-full"
    >
      <div className="space-y-3">
        {summaries.map((summary) => (
          <Link
            key={summary.id}
            href="/summaries"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white/75 p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-white"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <FileText className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {summary.title}
                </p>
                <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
                  {summary.overview}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge tone={statusTone(summary.status)}>{summary.status}</StatusBadge>
              <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
            </div>
          </Link>
        ))}
      </div>
    </CardPanel>
  );
}

