import { Mic, MicOff, MonitorPlay, Pin } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type { Participant } from "@/lib/types";

interface VideoTileProps {
  participant: Participant;
  featured?: boolean;
}

export function VideoTile({ participant, featured = false }: VideoTileProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-slate-900 p-4 text-white",
        featured ? "min-h-[460px]" : "",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),_transparent_35%),linear-gradient(160deg,rgba(15,23,42,0.82),rgba(15,23,42,0.98))]" />
      <div
        className={[
          "relative flex h-full flex-col justify-between",
          featured ? "min-h-[428px]" : "min-h-[208px]",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <StatusBadge
              pulse={participant.isSpeaking}
              tone={participant.isSpeaking ? "accent" : "neutral"}
              className={participant.isSpeaking ? "" : "bg-white/10 text-white"}
            >
              {participant.isSpeaking ? "Speaking" : participant.role}
            </StatusBadge>
            <div>
              <p className="text-lg font-semibold tracking-tight">{participant.name}</p>
              <p className="text-sm text-slate-300">
                {participant.language.toUpperCase()} •{" "}
                {participant.videoEnabled ? "Video on" : "Audio only"}
              </p>
            </div>
          </div>
          {participant.isPinned ? <Pin className="h-4 w-4 text-teal-300" /> : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-end gap-1">
            {[32, 16, 44, 18, 36, 14, 28, 20, 40].map((height, index) => (
              <span
                key={`${participant.id}-${index}`}
                className="w-2 rounded-full bg-teal-300/80"
                style={{ height }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-300">
            <div className="flex items-center gap-2">
              {participant.audioEnabled ? (
                <Mic className="h-3.5 w-3.5" />
              ) : (
                <MicOff className="h-3.5 w-3.5" />
              )}
              <span>{participant.audioEnabled ? "Mic live" : "Muted"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-3.5 w-3.5" />
              <span>{participant.videoEnabled ? "Camera live" : "Profile view"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
