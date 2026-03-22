import { activeSession, transcriptItems } from "@/lib/mock-data";
export { isAmbientTranscript } from "@/lib/transcript-safety";
import type {
  LanguageCode,
  LiveTranscriptSegment,
  Session,
  SessionConnectionConfig,
  SessionRole,
  TranscriptItem,
} from "@/lib/types";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
  uk: "Ukrainian",
  so: "Somali",
  tl: "Tagalog",
  zh: "Chinese",
};

const STORAGE_PREFIX = "risus-live-transcript:";

export const DEMO_SESSION_ID = activeSession.id;
export const DEFAULT_SIGNAL_SERVER_URL =
  process.env.NEXT_PUBLIC_SIGNAL_SERVER_URL?.trim() || "http://localhost:3001";

export function getLanguageLabel(code: string) {
  return LANGUAGE_NAMES[code] ?? code.toUpperCase();
}

export function getPeerRole(role: SessionRole): SessionRole {
  return role === "consultant" ? "client" : "consultant";
}

export function resolveSession(sessionId: string): Session {
  if (sessionId === activeSession.id) {
    return activeSession;
  }

  return {
    ...activeSession,
    id: sessionId,
    title: activeSession.title,
  };
}

export function getParticipantBySessionRole(
  session: Session,
  role: SessionRole,
) {
  return (
    session.participants.find((participant) => participant.role === role) ??
    session.participants[0]
  );
}

export function getSessionConnectionConfig(
  session: Session,
  role: SessionRole,
): SessionConnectionConfig {
  const localParticipant = getParticipantBySessionRole(session, role);
  const remoteParticipant = getParticipantBySessionRole(session, getPeerRole(role));

  return {
    sessionId: session.id,
    role,
    signalServerUrl: DEFAULT_SIGNAL_SERVER_URL,
    sourceLanguage: localParticipant.language,
    targetLanguage: remoteParticipant.language,
  };
}

export function transcriptStorageKey(sessionId: string) {
  return `${STORAGE_PREFIX}${sessionId}`;
}

export function loadStoredTranscript(sessionId: string): LiveTranscriptSegment[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(transcriptStorageKey(sessionId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LiveTranscriptSegment[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredTranscript(
  sessionId: string,
  items: LiveTranscriptSegment[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(transcriptStorageKey(sessionId), JSON.stringify(items));
  } catch {
    return;
  }
}

function roleFromTranscriptItem(item: TranscriptItem): SessionRole {
  const consultantId =
    activeSession.participants.find((participant) => participant.role === "consultant")
      ?.id ?? "";

  return item.speakerId === consultantId ? "consultant" : "client";
}

export function getFallbackTranscript(sessionId: string): LiveTranscriptSegment[] {
  return transcriptItems.map((item) => ({
    ...item,
    sessionId,
    speakerRole: roleFromTranscriptItem(item),
    targetLanguage: (item.targetLanguage ?? item.sourceLanguage) as LanguageCode,
    translatedText: item.translatedText ?? item.originalText,
  }));
}

export function transcriptToAnalysisText(items: LiveTranscriptSegment[]) {
  return items
    .filter((item) => item.type === "speech")
    .map((item) => `${item.speakerName}: ${item.translatedText ?? item.originalText}`)
    .join("\n");
}

export function formatDuration(totalSeconds: number) {
  const normalized = Math.max(0, totalSeconds);
  const hours = Math.floor(normalized / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((normalized % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(normalized % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function formatSessionTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
