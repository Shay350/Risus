import { CheckCircle2, Clock3, FileText, Globe2, Users2 } from "lucide-react";
import Link from "next/link";

import type { Session } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";

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

interface StagingChecklistProps {
  session: Session;
}

export function StagingChecklist({ session }: StagingChecklistProps) {
  return (
    <div className="space-y-4">
      <CardPanel
        title="Session readiness"
        description="Validate language routing, participant context, and prepared deliverables before joining the room."
      >
        <div className="space-y-3">
          {[
            {
              label: "Language routing",
              description: `${languageLabel[session.sourceLanguage]} source with ${session.targetLanguages.length} live translation channel`,
              icon: Globe2,
            },
            {
              label: "Participants",
              description: `${session.participants.length} attendees staged with consultant and interpreter roles`,
              icon: Users2,
            },
            {
              label: "Call packet",
              description: "Agenda and evidence review notes attached to this session",
              icon: FileText,
            },
            {
              label: "Timing",
              description: `${session.durationMinutes} minute block reserved for guided consultation`,
              icon: Clock3,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {item.label}
                    </p>
                    <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                  </div>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardPanel>

      <CardPanel
        title="Agenda preview"
        description="The consultant can reference these prompts as soon as the call begins."
        action={<StatusBadge tone="accent">Staged</StatusBadge>}
      >
        <ol className="space-y-3">
          {session.agenda.map((item, index) => (
            <li key={item} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-[var(--foreground)]">{item}</p>
            </li>
          ))}
        </ol>
      </CardPanel>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link href="/calls/live">Open live room</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/documents">Review staged documents</Link>
        </Button>
      </div>
    </div>
  );
}
