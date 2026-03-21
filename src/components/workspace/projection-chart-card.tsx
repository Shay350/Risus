import { CardPanel } from "@/components/ui/card-panel";
import type { ProjectionPoint } from "@/lib/types";

interface ProjectionChartCardProps {
  points: ProjectionPoint[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProjectionChartCard({ points }: ProjectionChartCardProps) {
  const maxRevenue = Math.max(...points.map((point) => point.revenue));
  const maxVariance = Math.max(...points.map((point) => Math.abs(point.profitLoss)));

  return (
    <CardPanel
      title="Projected scenarios"
      description="Scenario modeling based on the live transcript, prior notes, and the active support constraints."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_320px]">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--background-elevated)] p-5">
          <div className="space-y-4">
            {points.map((point) => {
              const revenueWidth = `${(point.revenue / maxRevenue) * 100}%`;
              const varianceWidth = `${(Math.abs(point.profitLoss) / maxVariance) * 100}%`;
              const positive = point.profitLoss >= 0;

              return (
                <div key={point.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{point.label}</p>
                      <p className="text-[var(--muted)]">{formatCurrency(point.revenue)} revenue</p>
                    </div>
                    <p
                      className={positive ? "text-[var(--success)]" : "text-[var(--danger)]"}
                    >
                      {positive ? "+" : ""}
                      {formatCurrency(point.profitLoss)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 rounded-full bg-white">
                      <div
                        className="h-3 rounded-full bg-[var(--accent)]"
                        style={{ width: revenueWidth }}
                      />
                    </div>
                    <div className="h-3 rounded-full bg-white">
                      <div
                        className={positive ? "h-3 rounded-full bg-emerald-600" : "h-3 rounded-full bg-rose-600"}
                        style={{ width: varianceWidth }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Readout
          </p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--foreground)]">
            <p>
              The support-bridge scenario is the only modeled path that produces a positive monthly balance.
            </p>
            <p>
              The delayed filing case sharply worsens the gap and should be treated as the downside case for deadline planning.
            </p>
            <p>
              Reduced-hours support narrows the shortfall but still leaves the client exposed without document completion.
            </p>
          </div>
        </div>
      </div>
    </CardPanel>
  );
}

