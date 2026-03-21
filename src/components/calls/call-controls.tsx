import { Camera, Captions, Languages, Mic, PhoneOff, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CallControls() {
  return (
    <div className="app-panel-strong sticky bottom-4 rounded-[24px] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline">
            <Mic className="h-4 w-4" />
            Mic
          </Button>
          <Button size="sm" variant="outline">
            <Camera className="h-4 w-4" />
            Camera
          </Button>
          <Button size="sm" variant="outline">
            <Captions className="h-4 w-4" />
            Captions
          </Button>
          <Button size="sm" variant="outline">
            <Languages className="h-4 w-4" />
            Translate
          </Button>
          <Button size="sm" variant="danger">
            <PhoneOff className="h-4 w-4" />
            End
          </Button>
        </div>

        <Button asChild variant="secondary">
          <Link href="/analysis">
            <Sparkles className="h-4 w-4" />
            Generate insights
          </Link>
        </Button>
      </div>
    </div>
  );
}
