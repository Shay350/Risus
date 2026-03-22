import { Mic, MicOff, Phone, Video, VideoOff } from "lucide-react";
import type { RefObject } from "react";
import AvatarFallback from "./AvatarFallback";

type PreCallScreenProps = {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  role: "alpha" | "beta";
  micSamples: number[];
  isMuted: boolean;
  isVideoOff: boolean;
  statusMessage: string;
  busyState: "idle" | "joining" | "waiting";
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onStartCall: () => void;
  startDisabled: boolean;
};

function MicMeter({ samples }: { samples: number[] }) {
  return (
    <div className="h-12 w-full border border-[#3b3f42] rounded-lg px-3 py-2">
      <div className="h-full grid grid-cols-20 items-end gap-1" aria-hidden="true">
        {Array.from({ length: 20 }, (_, index) => {
          const sample = Math.max(0, Math.min(1, samples[index] ?? 0));
          const barHeight = 15 + sample * 85;
          return (
            <div
              key={index}
              className="rounded-sm bg-activeGreen"
              style={{ height: `${barHeight}%`, minHeight: "3px" }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PreCallScreen({
  localVideoRef,
  role,
  micSamples,
  isMuted,
  isVideoOff,
  statusMessage,
  busyState,
  onToggleMute,
  onToggleVideo,
  onStartCall,
  startDisabled,
}: PreCallScreenProps) {
  const overlayMessage =
    busyState === "joining"
      ? "Joining call..."
      : busyState === "waiting"
        ? "Waiting for the other participant..."
        : null;

  return (
    <main className="min-h-screen bg-appBg text-white font-inter antialiased">
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 md:py-6 min-h-screen flex flex-col">
        <header className="h-14 flex items-center justify-between border-b border-[#3b3f42]">
          <h1 className="text-xl font-semibold tracking-wide">Pre-Call Setup</h1>
          <span className="text-xs md:text-sm text-gray-300 uppercase tracking-[0.08em]">{role}</span>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] items-center gap-6 md:gap-8 py-6">
          <div className="space-y-4">
            <article className="relative w-full aspect-video rounded-2xl border border-[#41464a] overflow-hidden bg-[#191b1d]">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 h-full w-full object-cover ${isVideoOff ? "hidden" : "block"}`}
              />
              {isVideoOff && <AvatarFallback name={role === "alpha" ? "Alpha" : "Beta"} />}

              {overlayMessage && (
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3">
                  <span className="h-7 w-7 rounded-full border-2 border-activeGreen border-t-transparent animate-spin" />
                  <p className="text-sm text-gray-100 font-medium">{overlayMessage}</p>
                </div>
              )}

              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#202325] border border-[#3b3f42] text-xs tracking-wide">
                Camera preview
              </div>
            </article>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={onToggleMute}
                className="h-12 w-12 rounded-full border border-[#4b5155] bg-panelBg text-gray-100 flex items-center justify-center"
                aria-label={isMuted ? "Enable microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="button"
                onClick={onToggleVideo}
                className="h-12 w-12 rounded-full border border-[#4b5155] bg-panelBg text-gray-100 flex items-center justify-center"
                aria-label={isVideoOff ? "Enable camera" : "Disable camera"}
              >
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-[540px]">
                <MicMeter samples={isMuted ? Array.from({ length: 20 }, () => 0) : micSamples} />
              </div>
            </div>
          </div>

          <aside className="w-full max-w-[420px] justify-self-center lg:justify-self-start border border-[#3b3f42] rounded-2xl p-6 md:p-7 flex flex-col gap-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-100">Deep Work Call</h2>
              <p className="text-sm text-gray-300 mt-2">No one else is here yet.</p>
            </div>

            <div className="border border-[#3b3f42] rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Connection</p>
              <p className="text-sm text-gray-200 mt-2 leading-relaxed">{statusMessage}</p>
            </div>

            <button
              type="button"
              onClick={onStartCall}
              disabled={startDisabled}
              aria-label="Start call"
              className="h-12 rounded-xl border border-[#2d8f6f] bg-activeGreen text-[#0b1d16] font-semibold flex items-center justify-center disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <Phone size={20} />
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
