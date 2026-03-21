import Link from "next/link";
import { Globe2, MapPin, MoveRight, Timer } from "lucide-react";

import { AvatarGroup } from "@/components/ui/avatar-group";
import { Button } from "@/components/ui/button";
import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Session } from "@/lib/types";

interface ActiveSessionCardProps {
  session: Session;
}

function formatLanguages(session: Session) {
  return [session.sourceLanguage.toUpperCase(), ...session.targetLanguages.map((item) => item.toUpperCase())].join(" / ");
}

export function ActiveSessionCard({ session }: ActiveSessionCardProps) {
  return (
    <CardPanel
      title="Active session"
      description="Resume the live consultation, check agenda coverage, or move into the analysis workspace."
      action={<StatusBadge tone="accent" pulse>In progress</StatusBadge>}
      className="h-full"
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {session.title}
            </h3>
            <StatusBadge tone="success">{session.orgName}</StatusBadge>
          </div>
          <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-2">
              <Timer className="h-4 w-4" />
              <span>{session.durationMinutes} min live</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-2">
              <Globe2 className="h-4 w-4" />
              <span>{formatLanguages(session)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-2">
              <MapPin className="h-4 w-4" />
              <span>{session.locationLabel ?? "Remote"}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Current agenda
            </p>
            <ul className="mt-4 space-y-3">
              {session.agenda.map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-[var(--foreground)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-white/80 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Participants
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <AvatarGroup
                  items={session.participants.map((participant) => ({
                    id: participant.id,
                    name: participant.name,
                  }))}
                />
                <p className="text-sm text-[var(--muted)]">
                  {session.participants.length} in room
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
              <p className="text-sm font-medium text-[var(--foreground)]">Consultant owner</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{session.consultantOwner}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/calls/live">Resume live call</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/workspace">
                  Open workspace
                  <MoveRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardPanel>
  );
}

