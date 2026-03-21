import { CalendarDays, Clock3, Globe2, MapPin } from "lucide-react";

import type { Session } from "@/lib/types";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { VideoTile } from "@/components/calls/video-tile";

const languageLabel: Record<Session["sourceLanguage"], string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
  uk: "Ukrainian",
  so: "Somali",
  tl: "Tagalog",
  zh: "Chinese",
};

interface LiveCallStageProps {
  session: Session;
  timerLabel: string;
}

export function LiveCallStage({ session, timerLabel }: LiveCallStageProps) {
  const featuredParticipant =
    session.participants.find((participant) => participant.isPinned) ??
    session.participants[0];
  const secondaryParticipants = session.participants.filter(
    (participant) => participant.id !== featuredParticipant.id,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white/75 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="accent" pulse>
              Call in progress
            </StatusBadge>
            <StatusBadge tone="neutral">
              {languageLabel[session.sourceLanguage]} to{" "}
              {session.targetLanguages.map((language) => languageLabel[language]).join(", ")}
            </StatusBadge>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {session.title}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Multilingual consultation with live transcript capture, translation support,
              and immediate AI insight generation.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
            <Clock3 className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Call timer
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{timerLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
            <Globe2 className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Translation
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Live relay active
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)]">
        <VideoTile featured participant={featuredParticipant} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {secondaryParticipants.map((participant) => (
            <VideoTile key={participant.id} participant={participant} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <CardPanel
          description="Agenda and participant context remain visible during the consultation."
          title="Session focus"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <ol className="space-y-3">
              {session.agenda.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-[var(--foreground)]">{item}</p>
                </li>
              ))}
            </ol>

            <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--accent)]" />
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {session.locationLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                <p className="text-sm text-[var(--muted)]">
                  Consultant owner: {session.consultantOwner}
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Participants
                </p>
                <AvatarGroup
                  items={session.participants.map((participant) => ({
                    id: participant.id,
                    name: participant.name,
                  }))}
                />
                <p className="text-sm text-[var(--muted)]">
                  {session.participants.length} people in room
                </p>
              </div>
            </div>
          </div>
        </CardPanel>

        <CardPanel
          description="The AI workspace can be launched without leaving the call."
          title="Next best actions"
        >
          <div className="space-y-3">
            {[
              "Flag the missing paystub as a document-generation dependency.",
              "Preserve the deadline update in the translated transcript.",
              "Prepare a bilingual checklist before ending the call.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--foreground)]"
              >
                {item}
              </div>
            ))}
          </div>
        </CardPanel>
      </div>
    </section>
  );
}

