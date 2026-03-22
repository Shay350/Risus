import Link from "next/link";

import { AnalysisRuntime } from "@/components/workspace/analysis-runtime";
import { Button } from "@/components/ui/button";
import { resolveSession } from "@/lib/live-session";
import { activeSession } from "@/lib/mock-data";

interface AnalysisPageProps {
  searchParams: Promise<{
    sessionId?: string;
  }>;
}

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
  const { sessionId } = await searchParams;
  const resolvedSessionId =
    typeof sessionId === "string" && sessionId.length > 0
      ? sessionId
      : activeSession.id;
  const session = resolveSession(resolvedSessionId);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Analysis
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {session.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Focused insight review from the current session.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href={`/session/${resolvedSessionId}?role=consultant`}>Back to session</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/deliverables?sessionId=${resolvedSessionId}`}>Generate document</Link>
          </Button>
        </div>
      </header>

      <AnalysisRuntime sessionId={resolvedSessionId} />
    </div>
  );
}
