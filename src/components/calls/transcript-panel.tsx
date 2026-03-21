"use client";

import { Languages } from "lucide-react";

import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TranscriptItem } from "@/lib/types";

interface TranscriptPanelProps {
  items: TranscriptItem[];
  localSpeakerId: string;
  translationLabel: string;
}

export function TranscriptPanel({
  items,
  localSpeakerId,
  translationLabel,
}: TranscriptPanelProps) {
  return (
    <CardPanel title="Translation" className="flex flex-col rounded-[28px]" style={{ height: "calc(100vh - 12rem)" }}>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <Languages className="h-4 w-4 text-[var(--accent)]" />
          <span>{translationLabel}</span>
        </div>
        <StatusBadge pulse tone="accent">
          Live
        </StatusBadge>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => {
          const isLocalSpeaker = item.speakerId === localSpeakerId;

          return (
            <article
              key={item.id}
              className={isLocalSpeaker ? "flex justify-end" : "flex justify-start"}
            >
              <div className="max-w-[88%] space-y-2">
                <div
                  className={[
                    "rounded-[22px] px-4 py-3 text-sm leading-6",
                    isLocalSpeaker
                      ? "bg-slate-900 text-white"
                      : "border border-[var(--border)] bg-white/90 text-[var(--foreground)]",
                  ].join(" ")}
                >
                  <p>{item.translatedText ?? item.originalText}</p>
                </div>
                <div
                  className={[
                    "flex items-center gap-2 px-1 text-xs text-[var(--muted)]",
                    isLocalSpeaker ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  <span>{item.speakerName}</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </CardPanel>
  );
}
