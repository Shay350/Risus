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
    transcript: `Sofia Chen: Hi Amina, thanks for joining today. Can you walk me through your current situation?
Amina Hassan: Of course. I came to Minneapolis from Mogadishu three years ago on a refugee resettlement visa. My monthly income is $2,480 — I work as a hotel housekeeper. Rent is $1,650 per month, which is very tight.
Sofia Chen: So after rent you have about $830 left. What are your other fixed monthly costs?
Amina Hassan: Utilities are around $180. Transport $120. Groceries $350. Childcare $200 per month. I also send about $150 home to my mother in Somalia every month through a hawala broker because wire transfers to Somalia are almost impossible — the US banks closed most of those corridors.
Sofia Chen: That puts total monthly outgoings at roughly $2,650 — a shortfall of about $170 even before the Somalia remittance. The hawala transfer is also a real risk; those brokers can charge 8–12% and there's no guarantee of delivery. If the rent support subsidy of $400 is approved, you'd move into a small surplus.
Amina Hassan: Yes. And if I get the full-time position, income would be $3,100. I expect to hear within two weeks.
Sofia Chen: We also need to watch your visa status — your refugee travel document expires in eight months and renewal with USCIS is taking up to six months right now. A lapse could affect your employment eligibility and therefore the subsidy application. Biggest risks I see: the missing paystub, the April 30th filing deadline, childcare eligibility if employment status changes, and the hawala dependency for Somalia remittances.
Amina Hassan: My total income this year should be around $34,000 if I get the full-time role. I also want to start saving — but I am afraid to put money in a bank account because I worry it could affect my benefits eligibility.
Sofia Chen: That's a common misconception we can address — SNAP and housing assistance have asset limits but a basic savings account under $2,000 won't disqualify you in Minnesota. Priority actions: get the paystub this week, file subsidy claim by April 25th, and I'll connect you with a nonprofit that offers free remittance services to East Africa at under 3%.`,
  },
  bakery: {
    label: "Bakery Business · Mexico City",
    transcript: `Consultant: Thanks for joining today, María. Can you walk me through your current business?
María García: Sure. I run a small artisan bakery — pan dulce and specialty pastries — in Colonia Condesa, Mexico City. We do about 160,000 pesos a month in revenue, mostly walk-in and weekend market stalls. At today's exchange rate that's roughly $8,000 USD, but the peso has weakened lately so our dollar-equivalent income keeps shifting.
Consultant: What are your main costs?
María García: Ingredients are about 50,000 pesos. Rent is 36,000 — rents in Condesa have spiked since the foreign remote-worker wave. Two part-time staff cost around 22,000 pesos combined after social security contributions to IMSS, which we are legally required to pay. Total costs roughly 108,000 pesos, leaving about 52,000 profit — around $2,600 USD at current rates.
Consultant: What's your growth vision?
María García: Year one I want to add corporate catering — there are many international tech companies nearby. Year two, a second location in Roma Norte. Year three, maybe exporting branded pan dulce to the US, where there is huge demand in cities with Mexican diaspora.
Consultant: What holds you back operationally?
María García: Oven capacity — 85% utilised at peak. All delivery is manual. And the SAT tax authority — Mexico's IRS — requires me to issue a digital CFDI invoice for every transaction over 600 pesos. Doing that manually takes hours. If I switch to the catering market, corporate clients will require formal CFDI invoices with RFC numbers, which I need an accountant to set up properly.
Consultant: What are your biggest risks?
María García: Peso depreciation — if I import equipment I pay in dollars, and the peso has dropped 12% this year. The IMSS payroll obligations go up with minimum wage increases, which have been 20% per year for the last three years. And finding staff is hard — trained bakers in Condesa expect 18,000–22,000 pesos a month, which is above what I can currently pay full-time. Average Mexico City minimum wage is only about 8,700 pesos a month, so I do attract interest, but skilled bakers know their market value.`,
  },
  nonprofit: {
    label: "Community Clinic · Lagos",
    transcript: `Program Officer: Dr. Okafor, can you describe the current state of your community health clinic in Lagos?
Dr. James Okafor: We operate two clinics in Mushin and Agege — both low-income areas on the Lagos mainland. We serve about 200 patients per month combined. About 70% have no health insurance; the NHIA government scheme covers only a fraction of our population here. We have 3 full-time nurses and 1 part-time physician.
Program Officer: What does your waitlist look like?
Dr. James Okafor: 340 people waiting for an initial appointment, six-week average wait. We turn away about 80 new patients a month. The Mushin area alone has a population of over 600,000 with almost no primary care infrastructure.
Program Officer: Tell me about your funding and financials.
Dr. James Okafor: Our main funding is a USD-denominated grant from a UK charity — about $4,000 a month equivalent. But all our costs are in naira. The naira has lost nearly 60% of its value against the dollar in the past 18 months, so our effective purchasing power has nearly halved. Medical supplies — syringes, gloves, diagnostic strips — are mostly imported and priced in dollars or euros. A box of glucometer strips that cost 4,000 naira two years ago now costs 11,000. Salaries are in naira so staff are relatively affordable, but they are asking for adjustments to keep up with 33% inflation.
Program Officer: What are the biggest operational challenges?
Dr. James Okafor: Power outages — we run a generator 8–10 hours a day at about 80,000 naira per month in diesel. Internet for the EHR system we want to implement is unreliable. Our CAC registration as an NGO is current but the FIRS — Federal Inland Revenue Service — has started auditing health NGOs and we are unclear on our tax-exempt status for imported medical equipment. If we lose that exemption, import duties of 20% on medical supplies would be catastrophic.
Program Officer: What outcomes are you tracking?
Dr. James Okafor: Blood pressure control at goal: 58% versus 70% benchmark. Diabetes control: 52% versus 65%. We want to expand to 320 patients a month within six months if we can hire two more nurses. Average nurse salary in Lagos is about 120,000–180,000 naira per month — call it $80–120 USD at current rates, which is low by any international standard but competitive locally.`,
  },
  clothing: {
    label: "Clothing Brand · India–Canada",
    transcript: `Consultant: Tell me about your brand and where you are right now.
Priya Nair: I launched an ethical womenswear brand 18 months ago — everything is made by artisan cooperatives in Thrissur district, Kerala. I'm based in Toronto. Revenue is about CAD $18,000 a month, mostly Instagram and two pop-up markets. Average order value CAD $150, around 900 repeat customers.
Consultant: What are your costs?
Priya Nair: Production is the biggest — I pay the Kerala cooperatives in Indian rupees, roughly INR 550,000 a month, which at current rates is about CAD $8,800. But the rupee has been volatile — when it weakened last quarter my production cost dropped 9% in Canadian dollar terms without any actual price change. Shipping from Kerala to Toronto: CAD $1,800. Canada customs duties on apparel from India are 18% under MFN tariff, but I applied for CETA — wait, that's the EU deal. Under CUSMA I only cover the US side. For India I'm not covered by any FTA so I pay full duties. That adds CAD $1,580 per shipment that I hadn't properly modelled at launch.
Consultant: What's your biggest growth opportunity?
Priya Nair: Wholesale to Canadian boutiques — three in Toronto have approached me. Also corporate gifting — custom embroidered sets, CAD $6,000–12,000 per order. And I've had UK interest but I genuinely don't know how to handle VAT, UK customs post-Brexit, and the UKGT tariff schedule.
Consultant: What's holding back growth?
Priya Nair: Kerala artisans need 8 weeks for a large order — I can't do flash sales. Also I have no help — design, marketing, fulfilment, customer service, all me. The GST/HST situation in Canada: I crossed the CAD $30,000 threshold so I'm now required to register and collect HST, which I haven't done yet and I'm six months overdue. That's a real compliance risk.
Consultant: Risks?
Priya Nair: INR/CAD exchange rate risk — if the rupee strengthens 10% my margin drops almost to zero. Losing a key artisan family — two families produce 60% of volume. Instagram algorithm risk — we get 40% of traffic from one account. And the overdue HST registration; the CRA can assess penalties retroactively.`,
  },
  logistics: {
    label: "Logistics Co-op · South Africa",
    transcript: `Advisor: Can you walk me through how the co-op currently operates?
Marcus Dlamini: We're a worker-owned last-mile delivery co-op — 22 drivers, all equity members — operating in Soweto and parts of the Johannesburg south corridor. We run contracts with three regional grocery chains. Monthly revenue is about R1.2 million — roughly $65,000 USD. Each driver takes home around R18,000 a month, which is above the national minimum wage of R27.58 per hour but still tight given Joburg living costs.
Advisor: What does your cost structure look like?
Marcus Dlamini: Fuel is our biggest cost — about R240,000 a month. South Africa's fuel price is regulated by DMRE and linked to the Brent crude price in dollars, so rand depreciation directly hits us — every 10 cents the rand weakens against the dollar adds roughly R18,000 to our monthly fuel bill. Vehicle maintenance is R90,000. Insurance R115,000 — commercial fleet insurance here is expensive because of the hijacking risk on some routes; we've had two vehicle incidents this year. Admin and dispatch software is R28,000. That leaves about R727,000 for driver payouts and retained earnings — but driver payouts are R396,000, so retained earnings are only R331,000 a month before any capital expenditure.
Advisor: What's the operational picture?
Marcus Dlamini: About 1,400 deliveries a week. Route utilisation 71% — 29% idle or repositioning. On-time delivery rate 88%; our contracts require 93% or we face penalties. We've paid R78,000 in penalties over the last two months. The Soweto routes are the hardest — road quality and informal settlements mean our average delivery time is 40% longer per drop than our Sandton routes.
Advisor: Where do you want to take the co-op?
Marcus Dlamini: A fourth grocery contract in negotiation — worth about R320,000 a month. We also want to bring on 6 more driver-members. And we're exploring two electric delivery vehicles to cut fuel costs, but EV financing in South Africa is difficult — the banks want a 30% deposit and interest rates are at 11.75% following the SARB rate cycle. We've applied to the IDC's green economy fund but approval takes 9–12 months.
Advisor: What are the biggest risks?
Marcus Dlamini: The rand. If it weakens another 8–10% against the dollar, fuel costs go into territory that breaks our driver payout model. One grocery contract renews in four months and they want a 7% rate cut. And our BEE scorecard — one of the grocery chains requires a Level 2 B-BBEE supplier rating for contract renewal. We're currently Level 4, which puts the renewal at risk.`,
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
  const yAxisWidth = Math.min(
    120,
    Math.max(60, ...section.data.map((d) => String(d[config.labelKey] ?? "").length * 5.5))
  );
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 space-y-3">
      <SectionLabel>{config.title}</SectionLabel>
      <p className="text-xs italic text-[var(--muted)] leading-relaxed">{section.summary}</p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={section.data} layout="vertical" barCategoryGap="30%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER_RGBA} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: MUTED_HEX, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
          <YAxis type="category" dataKey={config.labelKey} width={yAxisWidth}
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

// ─── PDF download ─────────────────────────────────────────────────
function buildPdfHtml(data: ProjectionsData, sessionTitle: string): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const metricRows = data.metrics.map(m =>
    `<tr><td>${m.label}</td><td><strong>${m.value}</strong></td><td>${m.change}</td></tr>`
  ).join("");

  const sectionBlocks = data.sections.map(key => {
    const section = data[key as keyof ProjectionsData] as { summary: string; data: Record<string, number | string>[] } | undefined;
    if (!section) return "";
    const titles: Record<string, string> = {
      financial: "Financial Forecast", market: "Market Opportunity",
      risk: "Risk Assessment", operations: "Operational Metrics",
      impact: "Community Impact", team: "Team Capacity",
    };
    const rows = section.data.map((row) =>
      `<tr>${Object.entries(row).map(([, v]) => `<td>${v}</td>`).join("")}</tr>`
    ).join("");
    const headers = section.data[0]
      ? `<tr>${Object.keys(section.data[0]).map(k => `<th>${k}</th>`).join("")}</tr>`
      : "";
    return `<h3>${titles[key] ?? key}</h3><p class="summary">${section.summary}</p><table>${headers}${rows}</table>`;
  }).join("");

  const stepRows = data.nextSteps.steps.map(s =>
    `<tr><td>${s.timeframe}</td><td>${s.priority}</td><td><strong>${s.action}</strong><br/><span class="sub">${s.detail}</span></td></tr>`
  ).join("");

  const teamRows = data.nextSteps.recommendedTeam.map(t =>
    `<tr><td><strong>${t.role}</strong></td><td>${t.reason}</td></tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${sessionTitle} — AI Projections</title>
<style>
  body { font-family: system-ui, sans-serif; font-size: 12px; color: #1a1a1a; margin: 40px; line-height: 1.5; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 11px; margin-bottom: 28px; }
  h2 { font-size: 14px; font-weight: 700; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 28px; }
  h3 { font-size: 12px; font-weight: 700; margin: 18px 0 4px; color: #0f766e; }
  .summary { font-style: italic; color: #555; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  .sub { color: #666; font-size: 11px; }
  @media print { body { margin: 20px; } }
</style></head><body>
<h1>${sessionTitle}</h1>
<div class="meta">AI Projections · Generated ${date}</div>

<h2>Key Metrics</h2>
<table><tr><th>Metric</th><th>Value</th><th>Context</th></tr>${metricRows}</table>

${sectionBlocks}

<h2>Next Steps</h2>
<p class="summary">${data.nextSteps.summary}</p>
<table><tr><th>Timeframe</th><th>Priority</th><th>Action</th></tr>${stepRows}</table>

<h2>Recommended Team</h2>
<table><tr><th>Role</th><th>Reason</th></tr>${teamRows}</table>
</body></html>`;
}

export interface SavedDocument {
  id: string;
  title: string;
  savedAt: string;
  data: ProjectionsData;
}

const SAVED_DOCS_KEY = "risus_saved_documents";

function saveToLocalStorage(doc: SavedDocument) {
  try {
    const existing: SavedDocument[] = JSON.parse(localStorage.getItem(SAVED_DOCS_KEY) ?? "[]");
    localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify([doc, ...existing].slice(0, 20)));
  } catch { /* ignore */ }
}

export function openDocumentPdf(data: ProjectionsData, title: string) {
  const html = buildPdfHtml(data, title);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

function downloadPdf(data: ProjectionsData, sessionTitle: string) {
  const doc: SavedDocument = {
    id: crypto.randomUUID(),
    title: sessionTitle,
    savedAt: new Date().toISOString(),
    data,
  };
  saveToLocalStorage(doc);
  openDocumentPdf(data, sessionTitle);
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
        <div className="flex items-center gap-2">
          {status === "done" && data && (
            <Button variant="outline" size="sm" onClick={() => downloadPdf(data, activeTranscript.split("\n")[0].split(":")[0] ?? "Session")}>
              ↓ Download PDF
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={generate} disabled={isLoading}>
            {isLoading ? <><LoadingDots /> Analyzing…</> : <>✦ {hasGenerated.current ? "Regenerate" : "Generate Projections"}</>}
          </Button>
        </div>
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
