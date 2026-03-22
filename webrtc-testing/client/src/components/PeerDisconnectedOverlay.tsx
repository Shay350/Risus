import { LoaderCircle } from "lucide-react";

export default function PeerDisconnectedOverlay() {
  return (
    <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-center px-4">
      <LoaderCircle className="animate-spin text-activeGreen" size={26} />
      <p className="mt-3 text-sm font-medium text-gray-100">Reconnecting to peer...</p>
      <p className="mt-1 text-xs text-gray-300">Waiting for them to return</p>
    </div>
  );
}
