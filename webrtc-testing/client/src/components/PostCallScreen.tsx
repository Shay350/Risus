import { Phone, RotateCcw } from "lucide-react";

type PostCallScreenProps = {
  role: "alpha" | "beta";
  durationLabel: string;
  onRejoin: () => void;
  onReturnHome: () => void;
};

export default function PostCallScreen({
  role,
  durationLabel,
  onRejoin,
  onReturnHome,
}: PostCallScreenProps) {
  return (
    <main className="min-h-screen bg-appBg text-white font-inter antialiased p-4 md:p-6 flex items-center justify-center">
      <section className="w-full max-w-lg border border-[#3b3f42] rounded-2xl p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.08em] text-gray-400">{role}</p>
        <h1 className="text-2xl font-semibold mt-2 text-gray-100">Call ended</h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          Your session has ended. You can reconnect with the same role link whenever you are ready.
        </p>

        <div className="mt-6 border border-[#3b3f42] rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-300">Total duration</span>
          <span className="text-base font-medium text-gray-100">{durationLabel}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRejoin}
            className="h-11 rounded-xl border border-[#2d8f6f] bg-activeGreen text-[#0b1d16] font-semibold inline-flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            Rejoin
          </button>
          <button
            type="button"
            onClick={onReturnHome}
            className="h-11 rounded-xl border border-[#4a4f52] bg-panelBg text-gray-100 inline-flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Home
          </button>
        </div>
      </section>
    </main>
  );
}
