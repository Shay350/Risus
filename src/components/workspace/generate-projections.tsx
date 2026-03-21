"use client";

import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, TooltipProps,
} from "recharts";

import { CardPanel } from "@/components/ui/card-panel";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";

// ─── Test transcripts ─────────────────────────────────────────────
const TEST_TRANSCRIPTS: Record<string, { label: string; transcript: string }> = {
  housing: {
    label: "Housing Intake",
    transcript: `Sofia Chen: Hi Amina, thanks for joining today. Can you walk me through your current financial situation?
Amina Hassan: My monthly income is $2,480. Rent is $1,650 per month, which makes things very tight.
Sofia Chen: So after rent you have about $830 left. What are your other fixed monthly costs?
Amina Hassan: Utilities are around $180. Transport $120. Groceries $350. I also have childcare costs of $200 per month.
Sofia Chen: That puts total costs at roughly $2,500 — leaving a monthly shortfall of about $320. If the rent support subsidy of $400 is approved, you'd have a small surplus of $80. What does your income look like over the next year?
Amina Hassan: If my hours are reduced it could drop to $1,900 a month. But if I get the full-time position that was promised, it would be $3,100.
Sofia Chen: Let me model three scenarios. Current income of $2,480 with the $320 gap. Reduced hours at $1,900 widening the gap to $600. And the full-time outcome at $3,100 giving a $600 surplus. The biggest risks I see are the missing paystub, the April 30th filing deadline, and childcare eligibility if your employment status changes.
Amina Hassan: I expect to hear about the job within two weeks. If I get it, my total income this year should be around $34,000.
Sofia Chen: I'll prepare the rent support application using the current $2,480 figure, flag the paystub as pending, and add a note about the potential income change. Priority actions: get the paystub from your employer this week, confirm the April 30th deadline in writing, and we'll file the subsidy claim by April 25th.`,
  },
  bakery: {
    label: "Bakery Business",
    transcript: `Consultant: Thanks for joining today. Can you walk me through your current business?
Maria Garcia: Sure. I run a small bakery in Detroit. We do about $8,000 a month in revenue right now, mostly walk-in customers. I want to expand into catering and maybe open a second location.
Consultant: What are your main costs right now?
Maria Garcia: Ingredients are about $2,500, rent is $1,800, staff is two part-time people at around $2,200 combined. So maybe $6,500 total costs, leaving about $1,500 profit a month.
Consultant: And what's your vision for growth over the next three years?
Maria Garcia: Year one I want catering to add another $3,000 a month. Year two I want to open that second location and hopefully double overall revenue. Year three I'm thinking about franchising or at least a third location.
Consultant: What markets are you targeting for catering?
Maria Garcia: Corporate offices are the biggest opportunity — I think we could do $4,000 a month there. Weddings and events another $2,500. Schools maybe $1,500. Right now we only do about $500 in off-site orders.
Consultant: What's holding you back operationally?
Maria Garcia: Our oven capacity is the main bottleneck — we're at 85% capacity during peak hours. Delivery is completely manual, no system. And I'm doing all the social media myself which takes 8 hours a week away from baking.
Consultant: What's your biggest risk right now?
Maria Garcia: Supply chain honestly. And finding reliable staff. Health permits in Detroit take forever — last time it took 4 months.`,
  },
  nonprofit: {
    label: "Community Clinic",
    transcript: `Program Officer: Dr. Okafor, can you describe the current state of your community health clinic?
Dr. James Okafor: We currently serve about 200 patients per month across our two locations in the east side. About 60% are uninsured or underinsured. We have 3 full-time nurses and 1 part-time physician. We desperately need at least 2 more nurses and a full-time doctor to meet demand.
Program Officer: What does your waitlist look like?
Dr. James Okafor: We have 340 people waiting for an initial appointment. Average wait time is 6 weeks. We're turning away about 80 new patients a month because we simply don't have capacity.
Program Officer: Can you tell me about your outcomes and impact?
Dr. James Okafor: We track blood pressure control, diabetes management, and preventive screening rates. Currently 58% of our hypertensive patients are at goal — the national benchmark is 70%. Diabetes control is at 52%, benchmark is 65%. Preventive screening completion is 41%, we want to get to 75%.
Program Officer: What would expanded capacity let you achieve?
Dr. James Okafor: If we hire the 2 nurses we need, we could serve 320 patients a month within six months and clear the waitlist within a year. The physician hire would let us open a mental health intake program we've had designed but unfunded for two years.
Program Officer: What are the biggest operational challenges?
Dr. James Okafor: Medical records are still paper-based — we're losing about 12 hours a week to admin that a basic EHR system would solve. Grant reporting takes another 8 hours and is mostly manual. And our community outreach is entirely word-of-mouth; we have no digital presence at all.`,
  },
  clothing: {
    label: "Clothing Brand",
    transcript: `Consultant: Tell me about your brand and where you are right now.
Priya Nair: I launched an ethical womenswear brand 18 months ago — everything is made by artisans in Kerala. We do about $14,000 a month in revenue, mostly through Instagram and two pop-up markets a month. Our average order value is $120 and we have about 900 repeat customers.
Consultant: What are your costs like?
Priya Nair: Production is our biggest cost — about $6,500 a month. Shipping and packaging is $1,200. I spend $800 on paid social ads. Then my own salary is $2,000, so total outgoings are around $10,500, leaving roughly $3,500 profit.
Consultant: Where do you see the biggest growth opportunity?
Priya Nair: Wholesale is completely untapped for us. I've had three boutiques in Toronto reach out but I've been nervous about the margin hit. I also think there's a corporate gifting angle — custom embroidered sets for company offsites — that could be $5,000 to $10,000 per order.
Consultant: What markets are you currently reaching and where could you expand?
Priya Nair: Right now it's about 70% Ontario, 20% BC, 10% scattered US. I think the US Pacific Northwest is a natural fit given the values alignment. And I've had enquiries from the UK but I have no idea how to handle duties and fulfilment there.
Consultant: What's holding back faster growth?
Priya Nair: Honestly production lead times. My artisans need 8 weeks to fulfil a large order. I can't run flash sales or respond to trends quickly. I also have no one helping me — I do design, marketing, customer service, and fulfilment myself. I'm burning out.
Consultant: What are the risks you're most worried about?
Priya Nair: Currency risk on the Kerala production costs since I pay in rupees. Losing a key artisan family — two of them make 60% of our volume. And if Instagram changes its algorithm again we could lose 40% of our traffic overnight.`,
  },
  logistics: {
    label: "Logistics Co-op",
    transcript: `Advisor: Can you walk me through how the co-op currently operates?
Marcus Webb: We're a worker-owned delivery co-op — 22 drivers, all equity members. We run last-mile delivery contracts for three local grocery chains in Baltimore. Monthly revenue is about $68,000. Each driver earns around $2,800 a month after the co-op takes its operating cut.
Advisor: What does your cost structure look like?
Marcus Webb: Fuel is our biggest line — about $14,000 a month and rising. Vehicle maintenance across the fleet runs $6,000. Insurance is $8,500. Dispatch software and admin is $2,200. That leaves around $37,300 for driver payouts and retained earnings.
Advisor: What's the operational picture — routes, utilisation, efficiency?
Marcus Webb: We're running about 1,400 deliveries a week. Average route utilisation is 71% — meaning drivers are idle or repositioning about 29% of the time. Our on-time delivery rate is 88%, and the grocery contracts require 93% or we face penalties. We've paid $4,200 in penalties in the last two months.
Advisor: Where do you want to take the co-op over the next two years?
Marcus Webb: We want to add a fourth grocery contract — one is in negotiation right now, worth about $18,000 a month. We also want to bring on 6 more drivers. And we've been talking about buying two electric vans to cut fuel costs, but we need financing for that.
Advisor: What are the biggest risks?
Marcus Webb: The on-time rate penalty exposure is immediate. One of our grocery contracts is up for renewal in four months and the client has been hinting they want a 7% rate cut. And if fuel prices spike another 15% we go into the red unless we renegotiate.`,
  },
};

// ─── Types ────────────────────────────────────────────────────────
type SectionKey = "financial" | "market" | "risk" | "operations" | "impact" | "team";
type MetricTone = "positive" | "warning" | "critical" | "neutral";
type MetricCardTone = "default" | "accent" | "warning" | "danger";

interface AiMetric { label: string; value: string; change: string; tone: MetricTone }
interface FinancialSection { summary: string; data: { year: string; revenue: number; costs: number; profit: number }[] }
interface DualBarSection { summary: string; data: Record<string, number | string>[] }
interface RiskSection { summary: string; data: { risk: string; score: number }[] }
interface NextStep { timeframe: string; startMonth: number; endMonth: number; action: string; detail: string; category: "foundation" | "growth" | "scale"; priority: "high" | "medium" | "low" }
interface TeamMember { role: string; reason: string }

interface ProjectionsData {
  sections: SectionKey[];
  metrics: AiMetric[];
  financial?: FinancialSection;
  market?: DualBarSection;
  operations?: DualBarSection;
  impact?: DualBarSection;
  team?: DualBarSection;
  risk?: RiskSection;
  nextSteps: { summary: string; steps: NextStep[]; recommendedTeam: TeamMember[] };
}

// ─── Colour constants ─────────────────────────────────────────────
const ACCENT    = "#0f766e";
const BLUE      = "#0284c7";
const DANGER    = "#b42318";
const GOLD      = "#a16207";
const MUTED_HEX = "#5f6b7a";
const BORDER_RGBA = "rgba(15,23,42,0.1)";

const CATEGORY_COLOR: Record<string, string> = { foundation: "var(--accent)", growth: BLUE, scale: "var(--warning)" };
const CATEGORY_HEX: Record<string, string>   = { foundation: ACCENT, growth: BLUE, scale: GOLD };
const PRIORITY_COLOR: Record<string, string> = { high: "var(--danger)", medium: "var(--warning)", low: "var(--muted)" };
const TONE_MAP: Record<MetricTone, MetricCardTone> = { positive: "accent", warning: "warning", critical: "danger", neutral: "default" };

// ─── Shared UI ────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{children}</p>;
}

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

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 shadow-md text-sm">
      <p className="mb-1 font-medium text-[var(--foreground)]">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-[var(--foreground)]">
            {typeof p.value === "number" && p.value > 999 ? `$${(p.value / 1000).toFixed(0)}k` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Variable section panels ──────────────────────────────────────
function FinancialPanel({ section }: { section: FinancialSection }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Financial Forecast</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{section.summary}</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={section.data} barCategoryGap="25%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER_RGBA} vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: MUTED_HEX, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: MUTED_HEX, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
          <Bar dataKey="revenue" name="Revenue" fill={ACCENT} radius={[3, 3, 0, 0]} />
          <Bar dataKey="costs"   name="Costs"   fill={DANGER} radius={[3, 3, 0, 0]} />
          <Bar dataKey="profit"  name="Profit"  fill={GOLD}   radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: ACCENT, label: "Revenue" }, { color: DANGER, label: "Costs" }, { color: GOLD, label: "Profit" }]} />
    </div>
  );
}

interface DualBarConfig { title: string; labelKey: string; aKey: string; bKey: string; aLabel: string; bLabel: string; aColor: string; bColor: string }

function DualBarPanel({ section, config }: { section: DualBarSection; config: DualBarConfig }) {
  const height = Math.max(240, section.data.length * 60);
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>{config.title}</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{section.summary}</p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={section.data} layout="vertical" barCategoryGap="30%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER_RGBA} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: MUTED_HEX, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
          <YAxis type="category" dataKey={config.labelKey} width={80}
            tick={{ fontSize: 10, fill: MUTED_HEX, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
          <Bar dataKey={config.aKey} name={config.aLabel} fill={config.aColor} radius={[0, 3, 3, 0]} />
          <Bar dataKey={config.bKey} name={config.bLabel} fill={config.bColor} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: config.aColor, label: config.aLabel }, { color: config.bColor, label: config.bLabel }]} />
    </div>
  );
}

function RiskPanel({ section }: { section: RiskSection }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Risk Assessment</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{section.summary}</p>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={section.data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <PolarGrid stroke={BORDER_RGBA} />
          <PolarAngleAxis dataKey="risk" tick={{ fontSize: 10, fill: MUTED_HEX, fontFamily: "var(--font-mono)" }} />
          <Radar name="Score" dataKey="score" stroke={DANGER} fill={DANGER} fillOpacity={0.12} dot={{ r: 3, fill: DANGER }} />
        </RadarChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: DANGER, label: "Risk score (0–10)" }]} />
    </div>
  );
}

const DUAL_BAR_CONFIG: Record<string, DualBarConfig> = {
  market:     { title: "Market Opportunity",  labelKey: "segment",  aKey: "current", bKey: "projected", aLabel: "Current",  bLabel: "Projected", aColor: BLUE,  bColor: ACCENT },
  operations: { title: "Operational Metrics", labelKey: "metric",   aKey: "current", bKey: "target",    aLabel: "Current",  bLabel: "Target",    aColor: BLUE,  bColor: ACCENT },
  impact:     { title: "Community Impact",    labelKey: "category", aKey: "current", bKey: "projected", aLabel: "Current",  bLabel: "Projected", aColor: BLUE,  bColor: ACCENT },
  team:       { title: "Team Capacity",       labelKey: "role",     aKey: "current", bKey: "needed",    aLabel: "Current",  bLabel: "Needed",    aColor: BLUE,  bColor: ACCENT },
};

// ─── Always-present panels ────────────────────────────────────────
function NextStepsPanel({ steps, summary, recommendedTeam }: { steps: NextStep[]; summary: string; recommendedTeam: TeamMember[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Next Steps</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{summary}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, i) => {
          const catColor = CATEGORY_COLOR[step.category] ?? "var(--muted)";
          const priColor = PRIORITY_COLOR[step.priority] ?? "var(--muted)";
          return (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-white p-3 space-y-2"
              style={{ borderLeftWidth: 3, borderLeftColor: catColor }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs" style={{ color: catColor }}>{step.timeframe}</span>
                <span className="rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide border"
                  style={{ color: priColor, borderColor: `color-mix(in srgb, ${priColor} 30%, transparent)` }}>
                  {step.priority}
                </span>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">{step.action}</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{step.detail}</p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: catColor }} />
                <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">{step.category}</span>
              </div>
            </div>
          );
        })}
      </div>

      {recommendedTeam?.length > 0 && (
        <div className="space-y-2 pt-1">
          <SectionLabel>Recommended Team</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {recommendedTeam.map((member, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-mono text-xs font-semibold text-[var(--accent)]">
                  {member.role.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{member.role}</p>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{member.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GanttChart({ steps }: { steps: NextStep[] }) {
  const totalMonths = Math.max(...steps.map((s) => s.endMonth ?? 1), 3);
  const monthLabels = Array.from({ length: totalMonths }, (_, i) => `M${i + 1}`);
  return (
    <div className="space-y-2">
      <div className="flex" style={{ paddingLeft: 268 }}>
        {monthLabels.map((m) => (
          <div key={m} className="flex-1 text-center font-mono text-[10px] text-[var(--muted)]">{m}</div>
        ))}
      </div>
      <div className="space-y-1.5">
        {steps.map((step, i) => {
          const color = CATEGORY_HEX[step.category] ?? MUTED_HEX;
          const start = Math.max((step.startMonth ?? 1) - 1, 0);
          const end = Math.min(step.endMonth ?? step.startMonth ?? 1, totalMonths);
          const leftPct = (start / totalMonths) * 100;
          const widthPct = ((end - start) / totalMonths) * 100;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="shrink-0 truncate text-right font-mono text-[10px] text-[var(--muted)]"
                style={{ width: 260 }} title={step.action}>
                {step.action.length > 44 ? step.action.slice(0, 44) + "…" : step.action}
              </div>
              <div className="relative flex-1 h-5 rounded-full bg-[var(--background-elevated)] border border-[var(--border)]">
                <div className="absolute top-0 h-full rounded-full flex items-center px-2"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: color, opacity: 0.85, minWidth: 8 }}>
                  <span className="font-mono text-[9px] text-white truncate leading-none">{step.timeframe}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChartLegend items={[{ color: ACCENT, label: "Foundation" }, { color: BLUE, label: "Growth" }, { color: GOLD, label: "Scale" }]} />
    </div>
  );
}

function TimelinePanel({ steps }: { steps: NextStep[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>Timeline</SectionLabel>
      <div className="rounded-xl border border-[var(--border)] bg-white p-3">
        <GanttChart steps={steps} />
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────
interface GenerateProjectionsProps { transcript: string }

const TRANSCRIPT_KEY = "risus_active_transcript";
const cacheKey = (scenario: string) => `risus_projections_cache:${scenario}`;

function readCache(scenario: string): ProjectionsData | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(scenario));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function GenerateProjections({ transcript: propTranscript }: GenerateProjectionsProps) {
  const [activeScenario, setActiveScenario] = useState<string>(() => {
    if (typeof window === "undefined") return "live";
    return sessionStorage.getItem(TRANSCRIPT_KEY) ?? "live";
  });

  const activeTranscript =
    activeScenario === "live"
      ? propTranscript
      : TEST_TRANSCRIPTS[activeScenario]?.transcript ?? propTranscript;

  const [data, setData] = useState<ProjectionsData | null>(() => {
    if (typeof window === "undefined") return null;
    const scenario = sessionStorage.getItem(TRANSCRIPT_KEY) ?? "live";
    return readCache(scenario);
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    () => (typeof window !== "undefined" && readCache(sessionStorage.getItem(TRANSCRIPT_KEY) ?? "live") ? "done" : "idle")
  );
  const [errorMsg, setErrorMsg] = useState("");
  const hasGenerated = useRef(!!data);

  const switchScenario = (key: string) => {
    sessionStorage.setItem(TRANSCRIPT_KEY, key);
    setActiveScenario(key);
    const cached = readCache(key);
    if (cached) {
      setData(cached);
      setStatus("done");
      hasGenerated.current = true;
    } else {
      setData(null);
      setStatus("idle");
      hasGenerated.current = false;
    }
  };

  const generate = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/projections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: activeTranscript }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      const json: ProjectionsData = await res.json();
      sessionStorage.setItem(cacheKey(activeScenario), JSON.stringify(json));
      setData(json);
      setStatus("done");
      hasGenerated.current = true;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const isLoading = status === "loading";
  const scenarios = [
    { key: "live",      label: "Live Session" },
    { key: "housing",   label: TEST_TRANSCRIPTS.housing.label },
    { key: "bakery",    label: TEST_TRANSCRIPTS.bakery.label },
    { key: "nonprofit", label: TEST_TRANSCRIPTS.nonprofit.label },
    { key: "clothing",  label: TEST_TRANSCRIPTS.clothing.label },
    { key: "logistics", label: TEST_TRANSCRIPTS.logistics.label },
  ];

  return (
    <CardPanel
      title="AI Projections"
      description="Gemini reads the transcript and surfaces only the analytical sections relevant to this call."
      action={
        <Button variant="secondary" size="sm" onClick={generate} disabled={isLoading}>
          {isLoading ? <><LoadingDots /> Analyzing…</> : <>✦ {hasGenerated.current ? "Regenerate" : "Generate Projections"}</>}
        </Button>
      }
    >
      {/* Transcript selector */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">Transcript</span>
        {scenarios.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchScenario(key)}
            className="rounded-lg border px-3 py-1 font-mono text-xs transition-colors"
            style={{
              background: activeScenario === key ? "var(--accent)" : "transparent",
              color: activeScenario === key ? "var(--accent-foreground)" : "var(--muted)",
              borderColor: activeScenario === key ? "var(--accent)" : "var(--border-strong)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {status === "error" && (
        <p className="rounded-xl border border-[var(--danger)] bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {errorMsg}
        </p>
      )}

      {status === "idle" && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            Click <strong className="text-[var(--foreground)]">Generate Projections</strong> to analyse
            the transcript — Gemini will choose which sections are relevant to this call.
          </p>
        </div>
      )}

      {status === "done" && data && (
        <div className="space-y-4">
          {/* AI-generated metric cards */}
          {data.metrics?.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.metrics.slice(0, 4).map((m, i) => (
                <MetricCard
                  key={i}
                  label={m.label}
                  value={m.value}
                  change={m.change}
                  tone={TONE_MAP[m.tone] ?? "default"}
                />
              ))}
            </div>
          )}

          {/* All panels in a single masonry-style 2-col column flow */}
          <div className="columns-1 lg:columns-2 gap-4 space-y-0">
            {data.sections?.length > 0 && data.sections.map((key) => {
              let panel: React.ReactNode = null;
              if (key === "financial" && data.financial)
                panel = <FinancialPanel key={key} section={data.financial} />;
              else if (key === "risk" && data.risk)
                panel = <RiskPanel key={key} section={data.risk} />;
              else {
                const config = DUAL_BAR_CONFIG[key];
                const section = data[key as keyof ProjectionsData] as DualBarSection | undefined;
                if (config && section)
                  panel = <DualBarPanel key={key} section={section} config={config} />;
              }
              if (!panel) return null;
              return <div key={key} className="break-inside-avoid mb-4">{panel}</div>;
            })}
            <div className="break-inside-avoid mb-4">
              <TimelinePanel steps={data.nextSteps.steps} />
            </div>
            <div className="break-inside-avoid mb-4">
              <NextStepsPanel
                steps={data.nextSteps.steps}
                summary={data.nextSteps.summary}
                recommendedTeam={data.nextSteps.recommendedTeam}
              />
            </div>
          </div>
        </div>
      )}
    </CardPanel>
  );
}
