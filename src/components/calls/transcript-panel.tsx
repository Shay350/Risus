"use client";

import { Languages } from "lucide-react";
import { useEffect, useRef } from "react";

import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TranscriptItem } from "@/lib/types";

interface TranscriptPanelProps {
  items: TranscriptItem[];
  localSpeakerId: string;
  translationLabel: string;
  emptyState?: string;
  live?: boolean;
  statusLabel?: string;
}

export function TranscriptPanel({
  items,
  localSpeakerId,
  translationLabel,
  emptyState = "Translated dialogue will appear here once the session is live.",
  live = false,
  statusLabel = "Ready",
}: TranscriptPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [items]);

  return (
    <CardPanel title="Translation" className="flex flex-col rounded-[28px]" style={{ height: "calc(100vh - 12rem)" }}>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <Languages className="h-4 w-4 text-[var(--accent)]" />
          <span>{translationLabel}</span>
        </div>
        <StatusBadge pulse={live} tone={live ? "accent" : "neutral"}>
          {statusLabel}
        </StatusBadge>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1" ref={scrollContainerRef}>
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] px-8 text-center">
            <p className="max-w-xs text-sm leading-6 text-[var(--muted)]">{emptyState}</p>
          </div>
        ) : null}

        {items.map((item) => {
          if (item.type !== "speech") {
            return (
              <article key={item.id} className="flex justify-center px-3">
                <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-xs text-[var(--muted)]">
                  {item.translatedText ?? item.originalText}
                </div>
              </article>
            );
          }

          const isLocalSpeaker = item.speakerId === localSpeakerId;
          const displayText = item.originalText || item.translatedText;

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
                  <p>{displayText}</p>
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
