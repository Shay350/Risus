import { Clock3, FileOutput, Languages, MessageSquareText } from "lucide-react";

import { CardPanel } from "@/components/ui/card-panel";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { activeSession, deliverablesQueue, transcriptItems } from "@/lib/mock-data";

export default function ClientDashboardPage() {
  const client =
    activeSession.participants.find((participant) => participant.role === "client") ??
    activeSession.participants[0];
  const consultant =
    activeSession.participants.find((participant) => participant.role === "consultant") ??
    activeSession.participants[1] ??
    activeSession.participants[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client View"
        title={client.name}
        description="A simple view of your session, translated updates, and the files being prepared for you."
        meta={
          <>
            <StatusBadge tone="accent" pulse>
              Session active
            </StatusBadge>
            <StatusBadge tone="neutral">Translated updates on</StatusBadge>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <div className="space-y-6">
          <CardPanel title="Current session">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Clock3 className="h-4 w-4 text-[var(--accent)]" />
                  <span>Time</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">46m</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Languages className="h-4 w-4 text-[var(--accent)]" />
                  <span>Language</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">Somali to English</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <MessageSquareText className="h-4 w-4 text-[var(--accent)]" />
                  <span>Consultant</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                  {consultant.name}
                </p>
              </div>
            </div>
          </CardPanel>

          <CardPanel title="Translated conversation">
            <div className="space-y-3">
              {transcriptItems.map((item) => {
                const isClient = item.speakerId === client.id;

                return (
                  <div
                    key={item.id}
                    className={isClient ? "flex justify-end" : "flex justify-start"}
                  >
                    <div className="max-w-[88%] space-y-2">
                      <div
                        className={[
                          "rounded-[22px] px-4 py-3 text-sm leading-6",
                          isClient
                            ? "bg-slate-900 text-white"
                            : "border border-[var(--border)] bg-white/90 text-[var(--foreground)]",
                        ].join(" ")}
                      >
                        <p>{item.translatedText ?? item.originalText}</p>
                      </div>
                      <div
                        className={[
                          "flex items-center gap-2 px-1 text-xs text-[var(--muted)]",
                          isClient ? "justify-end" : "justify-start",
                        ].join(" ")}
                      >
                        <span>{item.speakerName}</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardPanel>
        </div>

        <div className="space-y-6">
          <CardPanel title="What happens next">
            <div className="space-y-3 text-sm leading-6 text-[var(--foreground)]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
                Your consultant is reviewing the income details from this session.
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4">
                A translated checklist and support note will be prepared after the call.
              </div>
            </div>
          </CardPanel>

          <CardPanel title="Your files">
            <div className="space-y-3">
              {deliverablesQueue.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--border)] bg-white/85 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.languageLabel}
                      </p>
                    </div>
                    <StatusBadge tone={item.status === "ready" ? "success" : "warning"}>
                      {item.status}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </CardPanel>

          <CardPanel title="Need help?">
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] p-4 text-sm leading-6 text-[var(--foreground)]">
              <FileOutput className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              <p>
                This client dashboard is intentionally barebones. It shows live progress and file status without internal consultant controls.
              </p>
            </div>
          </CardPanel>
        </div>
      </div>
    </div>
  );
}

