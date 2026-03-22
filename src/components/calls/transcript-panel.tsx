"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

import { CardPanel } from "@/components/ui/card-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TranscriptItem } from "@/lib/types";
import type { LanguageCode } from "@/lib/types";
import {
  SUPPORTED_LANGUAGE_OPTIONS,
  getLanguageLabel,
  getSupportedLanguage,
} from "@/lib/languages";

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
  const [viewerLanguage, setViewerLanguage] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return getSupportedLanguage(window.localStorage.getItem("risusViewerLanguage"));
  });
  const [translatedTextById, setTranslatedTextById] = useState<Record<string, string>>({});
  const [translationStateById, setTranslationStateById] = useState<
    Record<string, "ready" | "translating" | "error">
  >({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const browserLanguage = getSupportedLanguage(window.navigator.language);
    const storedLanguage = getSupportedLanguage(
      window.localStorage.getItem("risusViewerLanguage"),
      browserLanguage,
    );
    setViewerLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("risusViewerLanguage", viewerLanguage);
  }, [viewerLanguage]);

  useEffect(() => {
    let cancelled = false;

    setTranslatedTextById((current) => {
      const next: Record<string, string> = {};
      for (const item of items) {
        if (item.sourceLanguage === viewerLanguage) {
          next[item.id] = item.originalText;
          continue;
        }

        if (item.targetLanguage === viewerLanguage && item.translatedText) {
          next[item.id] = item.translatedText;
          continue;
        }

        next[item.id] = current[item.id] ?? item.originalText;
      }
      return next;
    });

    setTranslationStateById(() => {
      const next: Record<string, "ready" | "translating" | "error"> = {};
      for (const item of items) {
        next[item.id] =
          item.sourceLanguage === viewerLanguage ||
          (item.targetLanguage === viewerLanguage && Boolean(item.translatedText))
            ? "ready"
            : "translating";
      }
      return next;
    });

    const run = async () => {
      for (const item of items) {
        const hasInlineTranslation =
          item.targetLanguage === viewerLanguage && Boolean(item.translatedText);
        const needsTranslation =
          item.sourceLanguage !== viewerLanguage && !hasInlineTranslation;

        if (!needsTranslation) {
          continue;
        }

        try {
          const response = await fetch("/api/translation/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: item.originalText,
              sourceLang: item.sourceLanguage,
              targetLang: viewerLanguage,
            }),
          });

          if (!response.ok) {
            throw new Error("Translation failed");
          }

          const payload = (await response.json()) as { translation?: string };
          if (cancelled) {
            return;
          }

          setTranslatedTextById((current) => ({
            ...current,
            [item.id]: payload.translation?.trim() || item.originalText,
          }));
          setTranslationStateById((current) => ({
            ...current,
            [item.id]: "ready",
          }));
        } catch {
          if (cancelled) {
            return;
          }

          setTranslatedTextById((current) => ({
            ...current,
            [item.id]: current[item.id] ?? item.originalText,
          }));
          setTranslationStateById((current) => ({
            ...current,
            [item.id]: "error",
          }));
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [items, viewerLanguage]);

  return (
    <CardPanel title="Translation" className="flex flex-col rounded-[28px]" style={{ height: "calc(100vh - 12rem)" }}>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <Languages className="h-4 w-4 text-[var(--accent)]" />
          <div className="space-y-1">
            <span className="block">{translationLabel}</span>
            <label className="flex items-center gap-2 text-xs">
              <span>Show chat in</span>
              <select
                value={viewerLanguage}
                onChange={(event) =>
                  setViewerLanguage(
                    getSupportedLanguage(event.target.value, viewerLanguage),
                  )
                }
                className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs text-[var(--foreground)] outline-none"
              >
                {SUPPORTED_LANGUAGE_OPTIONS.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
                  <p>{translatedTextById[item.id] ?? item.translatedText ?? item.originalText}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.16em] opacity-60">
                    {translationStateById[item.id] === "translating"
                      ? `Translating to ${getLanguageLabel(viewerLanguage)}`
                      : translationStateById[item.id] === "error"
                        ? `Showing original ${getLanguageLabel(item.sourceLanguage)}`
                        : getLanguageLabel(viewerLanguage)}
                  </p>
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
