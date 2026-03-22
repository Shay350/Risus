"use client";

import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import type { RefObject } from "react";

import { StatusBadge } from "@/components/ui/status-badge";

interface SessionVideoPanelProps {
  name: string;
  subtitle: string;
  badgeLabel: string;
  featured?: boolean;
  videoRef?: RefObject<HTMLVideoElement | null>;
  muted?: boolean;
  showVideo: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isSpeaking?: boolean;
  placeholder: string;
  overlayMessage?: string;
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SessionVideoPanel({
  name,
  subtitle,
  badgeLabel,
  featured = false,
  videoRef,
  muted = false,
  showVideo,
  audioEnabled,
  videoEnabled,
  isSpeaking = false,
  placeholder,
  overlayMessage,
}: SessionVideoPanelProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-slate-900 text-white",
        featured ? "min-h-[440px]" : "min-h-[220px]",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),_transparent_35%),linear-gradient(160deg,rgba(15,23,42,0.82),rgba(15,23,42,0.98))]" />

      <video
        ref={videoRef}
        autoPlay
        className={showVideo ? "absolute inset-0 h-full w-full object-cover" : "hidden"}
        muted={muted}
        playsInline
      />

      {!showVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10 text-2xl font-semibold text-white">
            {initialsFromName(name)}
          </div>
          <p className="max-w-sm text-sm text-slate-200">{placeholder}</p>
        </div>
      ) : null}

      {overlayMessage ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/58 px-8 text-center backdrop-blur-sm">
          <p className="max-w-xs text-sm font-medium text-white">{overlayMessage}</p>
        </div>
      ) : null}

      <div
        className={[
          "relative flex h-full flex-col justify-between p-4",
          featured ? "min-h-[440px]" : "min-h-[220px]",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <StatusBadge
              className={isSpeaking ? "" : "bg-white/10 text-white"}
              pulse={isSpeaking}
              tone={isSpeaking ? "accent" : "neutral"}
            >
              {badgeLabel}
            </StatusBadge>
            <div>
              <p className="text-lg font-semibold tracking-tight">{name}</p>
              <p className="text-sm text-slate-300">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-200">
          <div className="flex items-center gap-2">
            {audioEnabled ? (
              <Mic className="h-3.5 w-3.5" />
            ) : (
              <MicOff className="h-3.5 w-3.5" />
            )}
            <span>{audioEnabled ? "Mic live" : "Mic muted"}</span>
          </div>
          <div className="flex items-center gap-2">
            {videoEnabled ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <VideoOff className="h-3.5 w-3.5" />
            )}
            <span>{videoEnabled ? "Camera live" : "Camera off"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
