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
    <div className="flex items-end gap-1 h-10" aria-hidden="true">
      {Array.from({ length: 20 }, (_, index) => {
        const sample = Math.max(0, Math.min(1, samples[index] ?? 0));
        const barHeight = 22 + sample * 78;
        return (
          <div
            key={index}
            className="w-1 rounded-sm bg-activeGreen/90"
            style={{ height: `${barHeight}%` }}
          />
        );
      })}
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
    <main className="min-h-screen bg-appBg text-white font-inter antialiased p-4 md:p-6">
      <section className="max-w-6xl mx-auto h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex flex-col">
        <header className="flex items-center justify-between border-b border-[#3b3f42] pb-4">
          <h1 className="text-lg md:text-xl font-semibold tracking-wide">Pre-Call Setup</h1>
          <span className="text-xs md:text-sm text-gray-300 uppercase tracking-[0.08em]">{role}</span>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4 pt-4 min-h-0">
          <article className="border border-[#3b3f42] rounded-2xl p-3 md:p-4 flex flex-col">
            <div className="relative w-full aspect-video rounded-xl border border-[#41464a] overflow-hidden">
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
                  <span className="h-6 w-6 rounded-full border-2 border-activeGreen border-t-transparent animate-spin" />
                  <p className="text-sm text-gray-100 font-medium">{overlayMessage}</p>
                </div>
              )}

              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-[#202325] border border-[#3b3f42] text-xs tracking-wide">
                Camera preview
              </div>
            </div>
          </article>

          <aside className="border border-[#3b3f42] rounded-2xl p-4 md:p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Connection</p>
              <p className="text-sm text-gray-200 mt-1 leading-relaxed">{statusMessage}</p>
            </div>

            <div className="border border-[#3b3f42] rounded-xl p-4">
              <p className="text-sm font-medium text-gray-200">Microphone preview</p>
              <div className="mt-3">
                <MicMeter samples={isMuted ? Array.from({ length: 20 }, () => 0) : micSamples} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onToggleMute}
                className="h-12 rounded-xl border border-[#4b5155] bg-panelBg text-gray-100 flex items-center justify-center"
                aria-label={isMuted ? "Enable microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="button"
                onClick={onToggleVideo}
                className="h-12 rounded-xl border border-[#4b5155] bg-panelBg text-gray-100 flex items-center justify-center"
                aria-label={isVideoOff ? "Enable camera" : "Disable camera"}
              >
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
            </div>

            <div className="pt-1 flex justify-center lg:justify-end">
              <button
                type="button"
                onClick={onStartCall}
                disabled={startDisabled}
                aria-label="Start call"
                className="w-14 h-14 rounded-full border border-[#2d8f6f] bg-activeGreen text-[#0b1d16] flex items-center justify-center disabled:opacity-55 disabled:cursor-not-allowed"
              >
                <Phone size={22} />
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
