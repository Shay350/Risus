import { Video } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type { Participant, Session } from "@/lib/types";

interface ParticipantContextRailProps {
  participants: Participant[];
  session?: Session;
}

export function ParticipantContextRail({
  participants,
  session,
}: ParticipantContextRailProps) {
  return (
    <div className="space-y-4">
      {session ? (
        <div className="app-panel rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Session context
          </p>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {session.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {session.sourceLanguage.toUpperCase()} to{" "}
            {session.targetLanguages.map((language) => language.toUpperCase()).join(", ")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="accent" pulse={session.status === "live"}>
              {session.status}
            </StatusBadge>
            <StatusBadge tone="neutral">{session.durationMinutes} min block</StatusBadge>
          </div>
        </div>
      ) : null}

      {participants.map((participant) => (
        <div
          key={participant.id}
          className="overflow-hidden rounded-3xl border border-[var(--border)] bg-slate-900 p-3 text-white"
        >
          <div className="flex aspect-[4/3] items-end justify-between rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),_transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.78),rgba(15,23,42,0.98))] p-3">
            <div>
              <p className="text-sm font-semibold">{participant.name}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
                {participant.role} • {participant.language.toUpperCase()}
              </p>
            </div>
            <Video className="h-4 w-4 text-slate-300" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
              {participant.videoEnabled ? "Video live" : "Profile"}
            </span>
            <StatusBadge
              pulse={participant.isSpeaking}
              tone={participant.isSpeaking ? "accent" : "neutral"}
              className={participant.isSpeaking ? "" : "bg-white/10 text-white"}
            >
              {participant.isSpeaking ? "Speaking" : "Listening"}
            </StatusBadge>
          </div>
        </div>
      ))}
    </div>
  );
}
