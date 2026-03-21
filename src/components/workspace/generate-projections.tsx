"use client";

import { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

import { CardPanel } from "@/components/ui/card-panel";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────
interface FinancialPoint {
  year: string;
  revenue: number;
  costs: number;
  profit: number;
}

interface MarketSegment {
  segment: string;
  current: number;
  projected: number;
}

interface RiskPoint {
  risk: string;
  score: number;
}

interface NextStep {
  timeframe: string;
  action: string;
  detail: string;
  category: "foundation" | "growth" | "scale";
  priority: "high" | "medium" | "low";
}

interface ProjectionsData {
  financial: { summary: string; data: FinancialPoint[] };
  market: { summary: string; data: MarketSegment[] };
  risk: { summary: string; data: RiskPoint[] };
  nextSteps: { summary: string; steps: NextStep[] };
}

// ─── Colour helpers (mapped to CSS vars) ─────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  foundation: "var(--accent)",
  growth: "#0284c7",
  scale: "var(--warning)",
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--muted)",
};

// ─── Chart tooltip ────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 shadow-md text-sm">
      <p className="mb-1 font-medium text-[var(--foreground)]">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-[var(--foreground)]">
            {typeof p.value === "number" && p.value > 999
              ? `$${(p.value / 1000).toFixed(0)}k`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Chart legend ─────────────────────────────────────────────────
function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-2">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: color }} />
          <span className="font-mono text-xs text-[var(--muted)]">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      {children}
    </p>
  );
}

// ─── Chart sub-panels ─────────────────────────────────────────────
function FinancialPanel({ data, summary }: { data: FinancialPoint[]; summary: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Financial Forecast</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{summary}</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="25%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
          <Bar dataKey="revenue" name="Revenue" fill="var(--accent)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="costs" name="Costs" fill="var(--danger)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="profit" name="Profit" fill="var(--warning)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[
        { color: "var(--accent)", label: "Revenue" },
        { color: "var(--danger)", label: "Costs" },
        { color: "var(--warning)", label: "Profit" },
      ]} />
    </div>
  );
}

function MarketPanel({ data, summary }: { data: MarketSegment[]; summary: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Market Opportunity</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{summary}</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" barCategoryGap="30%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
          <YAxis type="category" dataKey="segment" width={72}
            tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
          <Bar dataKey="current" name="Current" fill="#0284c7" radius={[0, 3, 3, 0]} />
          <Bar dataKey="projected" name="Projected" fill="var(--accent)" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[
        { color: "#0284c7", label: "Current" },
        { color: "var(--accent)", label: "Projected" },
      ]} />
    </div>
  );
}

function RiskPanel({ data, summary }: { data: RiskPoint[]; summary: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Risk Assessment</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{summary}</p>
      <ResponsiveContainer width="100%" height={180}>
        <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="risk"
            tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }} />
          <Radar name="Score" dataKey="score" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.12} dot={{ r: 3, fill: "var(--danger)" }} />
        </RadarChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: "var(--danger)", label: "Risk score (0–10)" }]} />
    </div>
  );
}

function NextStepsPanel({ steps, summary }: { steps: NextStep[]; summary: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Next Steps</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{summary}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, i) => {
          const catColor = CATEGORY_COLOR[step.category] ?? "var(--muted)";
          const priColor = PRIORITY_COLOR[step.priority] ?? "var(--muted)";
          return (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-white p-3 space-y-2"
              style={{ borderLeftWidth: 3, borderLeftColor: catColor }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs" style={{ color: catColor }}>
                  {step.timeframe}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide border"
                  style={{ color: priColor, borderColor: `color-mix(in srgb, ${priColor} 30%, transparent)` }}
                >
                  {step.priority}
                </span>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">
                {step.action}
              </p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {step.detail}
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: catColor }} />
                <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {step.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────
function LoadingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────
interface GenerateProjectionsProps {
  transcript: string;
}

export function GenerateProjections({ transcript }: GenerateProjectionsProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [data, setData] = useState<ProjectionsData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const hasGenerated = useRef(false);

  const generate = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/projections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      const json: ProjectionsData = await res.json();
      setData(json);
      setStatus("done");
      hasGenerated.current = true;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const isLoading = status === "loading";

  return (
    <CardPanel
      title="AI Projections"
      description="Financial forecasts, market opportunity, risk scores, and prioritised next steps derived from the live transcript."
      action={
        <Button
          variant="secondary"
          size="sm"
          onClick={generate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingDots />
              Analyzing…
            </>
          ) : (
            <>
              ✦ {hasGenerated.current ? "Regenerate" : "Generate Projections"}
            </>
          )}
        </Button>
      }
    >
      {status === "error" && (
        <p className="rounded-xl border border-[var(--danger)] bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {errorMsg}
        </p>
      )}

      {status === "idle" && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            Click <strong className="text-[var(--foreground)]">Generate Projections</strong> to analyse
            the live transcript and surface AI-driven financial and strategic insights.
          </p>
        </div>
      )}

      {status === "done" && data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <FinancialPanel data={data.financial.data} summary={data.financial.summary} />
          <MarketPanel data={data.market.data} summary={data.market.summary} />
          <RiskPanel data={data.risk.data} summary={data.risk.summary} />
          <NextStepsPanel steps={data.nextSteps.steps} summary={data.nextSteps.summary} />
        </div>
      )}
    </CardPanel>
  );
}
