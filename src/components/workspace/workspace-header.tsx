import Link from "next/link";
import { ArrowLeft, FileOutput, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Session } from "@/lib/types";

interface WorkspaceHeaderProps {
  session: Session;
}

export function WorkspaceHeader({ session }: WorkspaceHeaderProps) {
  return (
    <div className="space-y-4">
      <Button asChild size="sm" variant="ghost">
        <Link href="/calls/live">
          <ArrowLeft className="h-4 w-4" />
          Back to live call
        </Link>
      </Button>

      <PageHeader
        eyebrow="Consultant Workspace"
        title={session.title}
        description="AI-assisted analysis generated from the live consultation. Use this view to validate projections, flag risks, and launch deliverables while the session is still active."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/summaries">Open summary draft</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/documents">
                <FileOutput className="h-4 w-4" />
                Generate documents
              </Link>
            </Button>
          </>
        }
        meta={
          <>
            <StatusBadge tone="accent" pulse>
              Insights refreshed 10:24
            </StatusBadge>
            <StatusBadge tone="warning">
              2 risks require review
            </StatusBadge>
            <StatusBadge tone="neutral">
              {session.sourceLanguage.toUpperCase()} source
            </StatusBadge>
            <StatusBadge tone="neutral">
              {session.targetLanguages.map((item) => item.toUpperCase()).join(" / ")} outputs
            </StatusBadge>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="app-panel rounded-3xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Session objective
              </p>
              <p className="max-w-3xl text-sm leading-6 text-[var(--foreground)]">
                Validate rent-support eligibility, clarify the filing deadline, and produce bilingual follow-up documents before the case worker handoff.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3 text-sm">
              <p className="font-medium text-[var(--foreground)]">AI status</p>
              <div className="mt-2 flex items-center gap-2 text-[var(--muted)]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Recommendations and projections are based on the latest transcript segment.
              </div>
            </div>
          </div>
        </div>
        <div className="app-panel rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Delivery path
          </p>
          <div className="mt-3 space-y-3 text-sm text-[var(--foreground)]">
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-3">
              1. Validate revenue assumptions and risks.
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-3">
              2. Generate bilingual evidence checklist.
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-3">
              3. Export summary packet for case worker review.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

