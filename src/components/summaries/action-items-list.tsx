import type { SummaryActionItem } from "@/lib/types";

interface ActionItemsListProps {
  items: SummaryActionItem[];
}

export function ActionItemsList({ items }: ActionItemsListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-[var(--border)] bg-white/80 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">{item.text}</p>
            <div className="rounded-full bg-[var(--background-elevated)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {item.owner}
            </div>
          </div>
          {item.due ? (
            <p className="mt-2 text-sm text-[var(--muted)]">Due {item.due}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

