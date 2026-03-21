import type { InsightRisk } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface RiskCardProps {
  risk: InsightRisk;
}

function severityTone(severity: InsightRisk["severity"]) {
  switch (severity) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    default:
      return "neutral";
  }
}

export function RiskCard({ risk }: RiskCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">{risk.title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {risk.description}
          </p>
        </div>
        <StatusBadge tone={severityTone(risk.severity)}>{risk.severity}</StatusBadge>
      </div>
      <div className="mt-4 rounded-2xl bg-[var(--background-elevated)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Mitigation
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
          {risk.mitigation}
        </p>
      </div>
    </article>
  );
}

