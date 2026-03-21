import Link from "next/link";
import { CalendarClock, Languages, MapPin, Play, Sparkles } from "lucide-react";

import { AvatarGroup } from "@/components/ui/avatar-group";
import { Button } from "@/components/ui/button";
import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Session } from "@/lib/types";

interface SessionCardProps {
  session: Session;
}

function statusTone(status: Session["status"]) {
  switch (status) {
    case "live":
      return "accent";
    case "completed":
      return "success";
    case "processing":
      return "warning";
    default:
      return "neutral";
  }
}

export function SessionCard({ session }: SessionCardProps) {
  const primaryHref =
    session.status === "live"
      ? "/calls/live"
      : session.status === "completed"
        ? "/summaries"
        : "/calls/new";

  return (
    <CardPanel
      title={session.title}
      description={`${session.orgName} • ${session.consultantOwner}`}
      action={
        <StatusBadge pulse={session.status === "live"} tone={statusTone(session.status)}>
          {session.status}
        </StatusBadge>
      }
      className="h-full"
    >
      <div className="space-y-5">
        <div className="grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>
              {session.startedAt
                ? `Started ${session.startedAt.slice(11, 16)}`
                : `Scheduled ${session.scheduledFor?.slice(11, 16) ?? "TBD"}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <span>
              {session.sourceLanguage.toUpperCase()} to{" "}
              {session.targetLanguages.map((lang) => lang.toUpperCase()).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{session.locationLabel ?? "Remote session"}</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Agenda
            </p>
            <ul className="mt-3 space-y-3 text-sm text-[var(--foreground)]">
              {session.agenda.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Participants
            </p>
            <AvatarGroup
              className="mt-3"
              items={session.participants.map((participant) => ({
                id: participant.id,
                name: participant.name,
              }))}
            />
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {session.participants.length} participants in this session workspace.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant={session.status === "live" ? "secondary" : "default"}>
            <Link href={primaryHref}>
              <Play className="h-4 w-4" />
              {session.nextActionLabel ?? "Open Session"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/workspace">
              <Sparkles className="h-4 w-4" />
              Review insights
            </Link>
          </Button>
        </div>
      </div>
    </CardPanel>
  );
}

