import * as React from "react";

import { cn } from "@/lib/utils";

interface CardPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardPanel({
  className,
  title,
  description,
  action,
  children,
  ...props
}: CardPanelProps) {
  return (
    <section
      className={cn(
        "app-panel rounded-3xl p-5 md:p-6",
        className,
      )}
      {...props}
    >
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 border-b border-[var(--border)] pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {title ? (
              <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
