import { LoaderCircle, RefreshCcw, PhoneOff } from "lucide-react";

type SelfReconnectScreenProps = {
  attempt: number;
  maxAttempts: number;
  onRetryNow: () => void;
  onLeave: () => void;
};

export default function SelfReconnectScreen({
  attempt,
  maxAttempts,
  onRetryNow,
  onLeave,
}: SelfReconnectScreenProps) {
  const clampedAttempt = Math.min(Math.max(1, attempt), Math.max(1, maxAttempts));
  return (
    <main className="min-h-screen bg-appBg text-white font-inter antialiased p-4 md:p-6 flex items-center justify-center">
      <section className="w-full max-w-md border border-[#3b3f42] rounded-2xl p-6 md:p-7">
        <div className="inline-flex items-center gap-2 rounded-md border border-[#3b3f42] px-3 py-1 text-xs text-gray-300 uppercase tracking-[0.08em]">
          Network Recovery
        </div>
        <h1 className="text-2xl font-semibold mt-4 text-gray-100">Connection lost</h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          We are trying to reconnect your call now.
        </p>

        <div className="mt-5 border border-[#3b3f42] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-[0.08em]">Status</p>
            <p className="text-sm text-gray-100 mt-1">Attempt {clampedAttempt} of {maxAttempts}</p>
          </div>
          <LoaderCircle className="animate-spin text-activeGreen" size={22} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRetryNow}
            className="h-11 rounded-xl border border-[#2d8f6f] bg-activeGreen text-[#0b1d16] font-semibold inline-flex items-center justify-center gap-2"
          >
            <RefreshCcw size={16} />
            Retry now
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="h-11 rounded-xl border border-[#4a4f52] bg-panelBg text-gray-100 inline-flex items-center justify-center gap-2"
          >
            <PhoneOff size={16} />
            Leave
          </button>
        </div>
      </section>
    </main>
  );
}
