import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        neutral:
          "border-[var(--border)] bg-white text-[var(--muted)]",
        accent:
          "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]",
        success:
          "border-transparent bg-emerald-50 text-[var(--success)]",
        warning:
          "border-transparent bg-amber-50 text-[var(--warning)]",
        danger:
          "border-transparent bg-rose-50 text-[var(--danger)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface StatusBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

export function StatusBadge({
  className,
  tone,
  pulse = false,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div className={cn(badgeVariants({ tone }), className)} {...props}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          pulse ? "animate-pulse" : "",
        )}
      />
      <span>{children}</span>
    </div>
  );
}
