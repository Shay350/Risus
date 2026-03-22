"use client";

import { useMemo } from "react";

import { GenerateProjections } from "@/components/workspace/generate-projections";
import {
  getFallbackTranscript,
  loadStoredTranscript,
  transcriptToAnalysisText,
} from "@/lib/live-session";

interface AnalysisRuntimeProps {
  sessionId: string;
}

export function AnalysisRuntime({ sessionId }: AnalysisRuntimeProps) {
  const fallbackTranscript = useMemo(
    () => transcriptToAnalysisText(getFallbackTranscript(sessionId)),
    [sessionId],
  );
  const transcript = useMemo(() => {
    const storedTranscript = loadStoredTranscript(sessionId);
    return storedTranscript.length > 0
      ? transcriptToAnalysisText(storedTranscript)
      : fallbackTranscript;
  }, [fallbackTranscript, sessionId]);

  return <GenerateProjections transcript={transcript} />;
}
