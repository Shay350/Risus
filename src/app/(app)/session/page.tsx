import { BarChart2, Clock3, Languages } from "lucide-react";
import Link from "next/link";

import { CallControls } from "@/components/calls/call-controls";
import { TranscriptPanel } from "@/components/calls/transcript-panel";
import { VideoTile } from "@/components/calls/video-tile";
import { StatusBadge } from "@/components/ui/status-badge";
import { activeSession, organization, transcriptItems } from "@/lib/mock-data";

export default function SessionPage() {
  const remoteParticipant =
    activeSession.participants.find((participant) => participant.role === "client") ??
    activeSession.participants[0];
  const localParticipant =
    activeSession.participants.find((participant) => participant.role === "consultant") ??
    activeSession.participants[1] ??
    activeSession.participants[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_400px]">
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {organization.workspace}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {activeSession.title}
            </h1>
            <StatusBadge tone="accent" pulse>
              Live
            </StatusBadge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--accent)]" />
              46m
            </span>
            <span className="inline-flex items-center gap-2">
              <Languages className="h-4 w-4 text-[var(--accent)]" />
              SO to EN
            </span>
            <span>1:1 call</span>
          </div>
        </div>

        <div className="app-panel rounded-[32px] p-5 md:p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
            <VideoTile featured participant={remoteParticipant} />
            <VideoTile participant={localParticipant} />
          </div>
        </div>

        <CallControls />

        <Link
          href="/analysis"
          className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-5 py-4 transition-colors hover:border-[var(--accent)] hover:bg-white group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <BarChart2 className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">AI Projections &amp; Analysis</p>
              <p className="text-xs text-[var(--muted)]">Financial forecasts, risk assessment, and next steps generated from this transcript.</p>
            </div>
          </div>
          <span className="text-sm text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">View →</span>
        </Link>
      </section>

      <TranscriptPanel
        items={transcriptItems}
        localSpeakerId={localParticipant.id}
        translationLabel="Somali to English"
      />
    </div>
  );
}
