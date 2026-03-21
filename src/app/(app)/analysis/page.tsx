import Link from "next/link";

import { InsightSection } from "@/components/workspace/insight-section";
import { RiskCard } from "@/components/workspace/risk-card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { activeSession, workspaceInsight } from "@/lib/mock-data";

const toneMap = {
  neutral: "default",
  positive: "accent",
  warning: "warning",
  critical: "danger",
} as const;

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Analysis
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {activeSession.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Focused insight review from the current session.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/session">Back to session</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/deliverables">Generate document</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workspaceInsight.metrics.slice(0, 4).map((metric) => (
          <MetricCard
            key={metric.id}
            change={metric.change}
            label={metric.label}
            tone={toneMap[metric.tone ?? "neutral"]}
            value={metric.value}
          />
        ))}
      </section>

      <InsightSection title="Revenue">
        <p className="text-sm leading-7 text-[var(--foreground)]">
          {workspaceInsight.revenueSummary}
        </p>
      </InsightSection>

      <InsightSection title="Risks">
        <div className="grid gap-4">
          {workspaceInsight.risks.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </div>
      </InsightSection>

      <InsightSection title="Questions">
        <div className="space-y-3">
          {workspaceInsight.openQuestions.map((question) => (
            <div
              key={question.id}
              className="rounded-2xl border border-[var(--border)] bg-white/85 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {question.question}
                </p>
                <span className="rounded-full bg-[var(--background-elevated)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                  {question.priority}
                </span>
              </div>
              {question.context ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {question.context}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </InsightSection>

      <InsightSection title="Recommendation">
        <div className="space-y-4">
          <p className="text-sm leading-7 text-[var(--foreground)]">
            {workspaceInsight.profitLossSummary}
          </p>
          <ul className="space-y-2 text-sm leading-6 text-[var(--foreground)]">
            {workspaceInsight.recommendations.slice(0, 3).map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </InsightSection>
    </div>
  );
}

