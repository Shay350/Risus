import * as React from "react";

import { cn } from "@/lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  change?: string;
  helper?: string;
  tone?: "default" | "accent" | "warning" | "danger";
}

const changeTone = {
  default: "text-[var(--muted)]",
  accent: "text-[var(--accent)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

export function MetricCard({
  className,
  label,
  value,
  change,
  helper,
  tone = "default",
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "app-panel rounded-2xl p-5",
        className,
      )}
      {...props}
    >
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {value}
          </p>
          {change ? (
            <p className={cn("text-sm font-medium", changeTone[tone])}>{change}</p>
          ) : null}
        </div>
        {helper ? (
          <p className="text-sm leading-6 text-[var(--muted)]">{helper}</p>
        ) : null}
      </div>
    </div>
  );
}
