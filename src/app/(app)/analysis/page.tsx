import Link from "next/link";

import { GenerateProjections } from "@/components/workspace/generate-projections";
import { Button } from "@/components/ui/button";
import { activeSession, transcriptItems } from "@/lib/mock-data";

const transcriptString = transcriptItems
  .map((item) => `${item.speakerName}: ${item.translatedText ?? item.originalText}`)
  .join("\n");

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

      <GenerateProjections transcript={transcriptString} />
    </div>
  );
}

