interface PreferenceRowProps {
  label: string;
  helper: string;
  value: string;
}

export function PreferenceRow({ label, helper, value }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
        <p className="text-sm text-[var(--muted)]">{helper}</p>
      </div>
      <div className="rounded-full border border-[var(--border)] bg-[var(--background-elevated)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

