interface OperationalStatusStripProps {
  items: {
    id: string;
    label: string;
    value: string;
    helper: string;
  }[];
}

export function OperationalStatusStrip({ items }: OperationalStatusStripProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="app-panel rounded-2xl px-5 py-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {item.value}
              </p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">{item.helper}</p>
        </div>
      ))}
    </div>
  );
}

