import { Check, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PreferenceToggleProps {
  label: string;
  description: string;
  enabled?: boolean;
  detail?: string;
}

export function PreferenceToggle({
  label,
  description,
  enabled = false,
  detail,
}: PreferenceToggleProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p className="font-medium text-[var(--foreground)]">{label}</p>
        <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
        {detail ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{detail}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "inline-flex min-w-[104px] items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium",
            enabled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600",
          )}
        >
          {enabled ? <Check className="h-4 w-4" /> : null}
          <span>{enabled ? "Enabled" : "Disabled"}</span>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background-elevated)] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Configure {label}</span>
        </button>
      </div>
    </div>
  );
}

