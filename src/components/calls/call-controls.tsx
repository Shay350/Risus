import { Languages, Mic, MicOff, PhoneOff, Sparkles, Video, VideoOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CallControlsProps {
  micMuted: boolean;
  cameraOff: boolean;
  translationEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleTranslation: () => void;
  onEndCall: () => void;
  showPrimaryAction?: boolean;
  primaryActionHref?: string;
  primaryActionLabel?: string;
}

export function CallControls({
  micMuted,
  cameraOff,
  translationEnabled,
  onToggleMic,
  onToggleCamera,
  onToggleTranslation,
  onEndCall,
  showPrimaryAction = false,
  primaryActionHref = "/analysis",
  primaryActionLabel = "Generate insights",
}: CallControlsProps) {
  return (
    <div className="app-panel-strong sticky bottom-4 rounded-[24px] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleMic} size="sm" variant={micMuted ? "outline" : "secondary"}>
            {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {micMuted ? "Unmute" : "Mute"}
          </Button>
          <Button
            onClick={onToggleCamera}
            size="sm"
            variant={cameraOff ? "outline" : "secondary"}
          >
            {cameraOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {cameraOff ? "Camera on" : "Camera off"}
          </Button>
          <Button
            onClick={onToggleTranslation}
            size="sm"
            variant={translationEnabled ? "secondary" : "outline"}
          >
            <Languages className="h-4 w-4" />
            {translationEnabled ? "Translation on" : "Translation off"}
          </Button>
          <Button onClick={onEndCall} size="sm" variant="danger">
            <PhoneOff className="h-4 w-4" />
            End
          </Button>
        </div>

        {showPrimaryAction ? (
          <Button asChild variant="secondary">
            <Link href={primaryActionHref}>
              <Sparkles className="h-4 w-4" />
              {primaryActionLabel}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
