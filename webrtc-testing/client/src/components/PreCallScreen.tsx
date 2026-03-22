import { ChevronDown, Mic, MicOff, Phone, Video, VideoOff } from "lucide-react";
import { useState, type RefObject, useRef, useEffect } from "react";
import AvatarFallback from "./AvatarFallback";

type PreCallScreenProps = {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  role: "alpha" | "beta";
  micSamples: number[];
  isMuted: boolean;
  isVideoOff: boolean;
  statusMessage: string;
  busyState: "idle" | "joining" | "waiting";
  audioDevices: MediaDeviceInfo[];
  selectedAudioDevice: string;
  onChangeAudioDevice: (deviceId: string) => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onStartCall: () => void;
  startDisabled: boolean;
};

function MicMeter({ samples }: { samples: number[] }) {
  return (
    <div className="flex items-center justify-between gap-[3px] h-full w-full">
      {Array.from({ length: 20 }, (_, index) => {
        const sample = Math.max(0, Math.min(1, samples[index] ?? 0));
        const barHeight = Math.max(12, sample * 100);
        return (
          <div
            key={index}
            className="flex-1 rounded-full bg-activeGreen transition-all duration-[90ms] ease-out"
            style={{ height: `${barHeight}%`, minHeight: "4px" }}
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
  audioDevices,
  selectedAudioDevice,
  onChangeAudioDevice,
  onToggleMute,
  onToggleVideo,
  onStartCall,
  startDisabled,
}: PreCallScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const overlayMessage =
    busyState === "joining"
      ? "Joining call..."
      : busyState === "waiting"
        ? "Waiting for the other participant..."
        : null;

  return (
    <main className="min-h-screen bg-appBg text-white font-inter antialiased flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Header / Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide text-gray-100">Ready to join?</h1>
          <p className="text-sm text-gray-400 uppercase tracking-[0.1em] mt-2 font-medium">{role}</p>
        </div>

        {/* Camera Preview */}
        <div className="relative w-full aspect-video rounded-2xl border border-[#41464a] overflow-hidden bg-[#191b1d] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover ${isVideoOff ? "hidden" : "block"}`}
          />
          {isVideoOff && <AvatarFallback name={role === "alpha" ? "Alpha" : "Beta"} />}

          {overlayMessage && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
              <span className="h-8 w-8 rounded-full border-[3px] border-activeGreen border-t-transparent animate-spin" />
              <p className="text-sm text-gray-100 font-medium tracking-wide">{overlayMessage}</p>
            </div>
          )}
        </div>

        {/* Mic Meter - Sleek horizontal bar */}
        <div className="w-full max-w-sm h-6 mt-8">
          <MicMeter samples={isMuted ? Array.from({ length: 20 }, () => 0) : micSamples} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center">
          {/* Mic Split Button */}
          <div ref={menuRef} className="relative flex items-center bg-panelBg rounded-full border border-[#4b5155] shadow-lg">
            <button
              type="button"
              onClick={onToggleMute}
              className="flex items-center justify-center h-14 w-16 hover:bg-white/10 rounded-l-full transition-colors text-gray-100"
              aria-label={isMuted ? "Enable microphone" : "Mute microphone"}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <div className="w-px h-8 bg-[#4b5155]" />
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center h-14 w-12 hover:bg-white/10 rounded-r-full transition-colors text-gray-400 hover:text-gray-200"
              aria-label="Select microphone"
            >
              <ChevronDown size={18} />
            </button>

            {menuOpen && (
              <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 bg-[#2a2d2e] border border-[#4b5155] rounded-xl overflow-hidden py-1.5 z-50 shadow-2xl">
                {audioDevices.length > 0 ? (
                  audioDevices.map((d) => (
                    <button
                      key={d.deviceId}
                      onClick={() => {
                        onChangeAudioDevice(d.deviceId);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 truncate transition-colors ${
                        selectedAudioDevice === d.deviceId ? "text-activeGreen font-medium" : "text-gray-200"
                      }`}
                    >
                      {d.label || "Unknown Microphone"}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">No devices found</div>
                )}
              </div>
            )}
          </div>

          {/* Video Button */}
          <button
            type="button"
            onClick={onToggleVideo}
            className="flex items-center justify-center h-14 w-14 rounded-full border border-[#4b5155] bg-panelBg text-gray-100 hover:bg-white/10 transition-colors shadow-lg"
            aria-label={isVideoOff ? "Enable camera" : "Disable camera"}
          >
            {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>

          {/* Start Call Button */}
          <button
            type="button"
            onClick={onStartCall}
            disabled={startDisabled}
            aria-label="Start call"
            className="flex items-center justify-center h-14 w-32 ml-0 sm:ml-4 rounded-full border border-[#2d8f6f] bg-activeGreen text-[#0b1d16] hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-activeGreen/20"
          >
            <Phone size={24} className="fill-[#0b1d16]" />
          </button>
        </div>

        {/* Status Message */}
        <div className="mt-8 text-center h-6">
          <p className="text-sm text-gray-400 font-medium">{statusMessage}</p>
        </div>
      </div>
    </main>
  );
}
