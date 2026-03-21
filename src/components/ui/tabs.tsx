"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsItem {
  value: string;
  label: string;
  count?: string | number;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TabsItem[];
  value: string;
  onValueChange: (value: string) => void;
}

export function Tabs({
  className,
  items,
  value,
  onValueChange,
  ...props
}: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-2xl border border-[var(--border)] bg-white p-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-slate-900 text-white"
                : "text-[var(--muted)] hover:bg-slate-50 hover:text-[var(--foreground)]",
            )}
            onClick={() => onValueChange(item.value)}
            type="button"
          >
            <span>{item.label}</span>
            {item.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
