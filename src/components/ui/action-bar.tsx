import * as React from "react";

import { cn } from "@/lib/utils";

interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function ActionBar({
  className,
  title,
  description,
  actions,
  children,
  ...props
}: ActionBarProps) {
  return (
    <div
      className={cn(
        "app-panel-strong sticky bottom-4 z-20 rounded-2xl p-4",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {title ? (
            <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
          ) : null}
          {description ? (
            <p className="text-sm text-[var(--muted)]">{description}</p>
          ) : null}
          {children}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
