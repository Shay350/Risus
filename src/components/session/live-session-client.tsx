"use client";

import { BarChart2, Clock3, Languages, Mic, Video } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { CallControls } from "@/components/calls/call-controls";
import { TranscriptPanel } from "@/components/calls/transcript-panel";
import { SessionVideoPanel } from "@/components/session/session-video-panel";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDuration,
  formatSessionTimestamp,
  getLanguageLabel,
  getParticipantBySessionRole,
  getPeerRole,
  getSessionConnectionConfig,
  loadStoredTranscript,
  saveStoredTranscript,
} from "@/lib/live-session";
import { organization } from "@/lib/mock-data";
import { isAmbientTranscript, sanitizeConversationalText } from "@/lib/transcript-safety";
import type {
  LanguageCode,
  LiveTranscriptSegment,
  Session,
  SessionRole,
  SessionUiState,
} from "@/lib/types";

const STUN_SERVERS: RTCIceServer = {
  urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
};

const MIN_TRANSCRIPT_CHUNK_BYTES = 6000;
const REMOTE_SPEAKING_THRESHOLD = 0.05;
const TRANSCRIPT_ACTIVITY_THRESHOLD = 0.08;
const TRANSCRIPT_INITIAL_SILENCE_MS = 2800;
const TRANSCRIPT_SILENCE_DEBOUNCE_MS = 1800;
const TRANSCRIPT_MAX_SEGMENT_MS = 9000;
const TRANSCRIPT_MIME_TYPE_PREFERENCES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;
const LANGUAGE_OPTIONS: LanguageCode[] = ["en", "fr", "es", "ar", "uk", "so", "tl", "zh"];

function getPreferredTranscriptMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  return (
    TRANSCRIPT_MIME_TYPE_PREFERENCES.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) ?? ""
  );
}

function getAudioExtension(mimeType: string) {
  const normalized = mimeType.toLowerCase();
  if (normalized.includes("mp4")) {
    return "mp4";
  }
  if (normalized.includes("ogg")) {
    return "ogg";
  }
  if (normalized.includes("mpeg")) {
    return "mp3";
  }
  if (normalized.includes("wav")) {
    return "wav";
  }
  return "webm";
}

interface LiveSessionClientProps {
  session: Session;
  role: SessionRole;
}

function stateLabel(uiState: SessionUiState) {
  switch (uiState) {
    case "prejoin":
      return "Ready";
    case "connecting":
      return "Connecting";
    case "waiting":
      return "Waiting";
    case "active":
      return "Live";
    case "reconnecting":
      return "Reconnecting";
    case "ended":
      return "Ended";
    case "error":
      return "Error";
  }
}

export function LiveSessionClient({ session, role }: LiveSessionClientProps) {
  const localParticipantBase = useMemo(
    () => getParticipantBySessionRole(session, role),
    [role, session],
  );
  const remoteParticipantBase = useMemo(
    () => getParticipantBySessionRole(session, getPeerRole(role)),
    [role, session],
  );
  const [localLanguage, setLocalLanguage] = useState<LanguageCode>(
    localParticipantBase.language,
  );
  const [remoteLanguage, setRemoteLanguage] = useState<LanguageCode>(
    remoteParticipantBase.language,
  );
  const localParticipant = useMemo(
    () => ({
      ...localParticipantBase,
      language: localLanguage,
    }),
    [localLanguage, localParticipantBase],
  );
  const remoteParticipant = useMemo(
    () => ({
      ...remoteParticipantBase,
      language: remoteLanguage,
    }),
    [remoteLanguage, remoteParticipantBase],
  );
  const connectionConfig = useMemo(
    () => ({
      ...getSessionConnectionConfig(session, role),
      sourceLanguage: localLanguage,
      targetLanguage: remoteLanguage,
    }),
    [localLanguage, remoteLanguage, role, session],
  );
  const translationLabel = useMemo(
    () =>
      `${getLanguageLabel(localParticipant.language)} / ${getLanguageLabel(
        remoteParticipant.language,
      )}`,
    [localParticipant.language, remoteParticipant.language],
  );

  const [uiState, setUiState] = useState<SessionUiState>("prejoin");
  const [statusMessage, setStatusMessage] = useState(
    "Check your camera and microphone, then join the session.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [mediaReady, setMediaReady] = useState(false);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(session.durationMinutes * 60);
  const [transcriptItems, setTranscriptItems] = useState<LiveTranscriptSegment[]>(
    [],
  );
  const [chatItems, setChatItems] = useState<LiveTranscriptSegment[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const voiceIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptSegmentSilenceTimeoutRef = useRef<number | null>(null);
  const transcriptSegmentMaxTimeoutRef = useRef<number | null>(null);
  const transcriptMimeTypeRef = useRef("audio/webm");
  const transcriptQueueRef = useRef<Blob[]>([]);
  const transcriptProcessingRef = useRef(false);
  const transcriptCounterRef = useRef(0);
  const lastTranscriptActivityAtRef = useRef(0);
  const lastSystemMessageRef = useRef<{
    message: string;
    timestamp: number;
  } | null>(null);
  const micMutedRef = useRef(false);
  const cameraOffRef = useRef(false);
  const translationEnabledRef = useRef(true);
  const transcriptCaptureEnabledRef = useRef(false);
  const endedRef = useRef(false);

  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);

  useEffect(() => {
    cameraOffRef.current = cameraOff;
  }, [cameraOff]);

  useEffect(() => {
    translationEnabledRef.current = translationEnabled;
  }, [translationEnabled]);

  useEffect(() => {
    transcriptCaptureEnabledRef.current =
      uiState === "active" && translationEnabled && !micMuted;
  }, [micMuted, translationEnabled, uiState]);

  useEffect(() => {
    setLocalLanguage(localParticipantBase.language);
    setRemoteLanguage(remoteParticipantBase.language);
  }, [localParticipantBase.language, remoteParticipantBase.language, session.id]);

  const appendTranscriptItem = useCallback(
    (item: LiveTranscriptSegment) => {
      setChatItems((current) => {
        if (current.some((entry) => entry.id === item.id)) {
          return current;
        }

        return [...current, item];
      });

      setTranscriptItems((current) => {
        if (current.some((entry) => entry.id === item.id)) {
          return current;
        }

        const next = [...current, item];
        saveStoredTranscript(session.id, next);
        return next;
      });
    },
    [session.id],
  );

  const upsertTranscriptItem = useCallback(
    (item: LiveTranscriptSegment) => {
      setChatItems((current) => {
        const existingIndex = current.findIndex((entry) => entry.id === item.id);
        if (existingIndex === -1) {
          return [...current, item];
        }

        const next = [...current];
        next[existingIndex] = item;
        return next;
      });

      setTranscriptItems((current) => {
        const existingIndex = current.findIndex((entry) => entry.id === item.id);
        if (existingIndex === -1) {
          const next = [...current, item];
          saveStoredTranscript(session.id, next);
          return next;
        }

        const next = [...current];
        next[existingIndex] = item;
        saveStoredTranscript(session.id, next);
        return next;
      });
    },
    [session.id],
  );

  const appendSystemMessage = useCallback(
    (message: string) => {
      const now = Date.now();
      if (
        lastSystemMessageRef.current?.message === message &&
        now - lastSystemMessageRef.current.timestamp < 8000
      ) {
        return;
      }

      lastSystemMessageRef.current = {
        message,
        timestamp: now,
      };

      appendTranscriptItem({
        id: `${session.id}-system-${now}`,
        sessionId: session.id,
        speakerId: `system-${role}`,
        speakerName: "System",
        speakerRole: role,
        originalText: message,
        translatedText: message,
        sourceLanguage: localParticipant.language,
        targetLanguage: localParticipant.language,
        timestamp: formatSessionTimestamp(),
        confidence: 1,
        type: "system",
      });
    },
    [appendTranscriptItem, localParticipant.language, role, session.id],
  );

  const readErrorMessage = useCallback(
    async (response: Response, fallback: string) => {
      const raw = await response.text();
      if (!raw.trim()) {
        return fallback;
      }

      try {
        const parsed = JSON.parse(raw) as { error?: string; message?: string };
        if (typeof parsed.error === "string" && parsed.error.trim()) {
          return parsed.error.trim();
        }
        if (typeof parsed.message === "string" && parsed.message.trim()) {
          return parsed.message.trim();
        }
      } catch {
        return raw.trim();
      }

      return raw.trim();
    },
    [],
  );

  const resetRemoteSurface = useCallback(() => {
    setRemoteMicOn(true);
    setRemoteVideoOn(false);
    setRemoteSpeaking(false);
    remoteStreamRef.current = null;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const stopVoiceMonitor = useCallback(() => {
    if (voiceIntervalRef.current !== null) {
      window.clearInterval(voiceIntervalRef.current);
      voiceIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {
        return;
      });
      audioContextRef.current = null;
    }
    setLocalSpeaking(false);
  }, []);

  const scheduleTranscriptSegmentStop = useCallback((delayMs: number) => {
    if (transcriptSegmentSilenceTimeoutRef.current !== null) {
      window.clearTimeout(transcriptSegmentSilenceTimeoutRef.current);
    }

    transcriptSegmentSilenceTimeoutRef.current = window.setTimeout(() => {
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === "recording") {
        recorder.stop();
      }
    }, delayMs);
  }, []);

  const stopTranscriptCapture = useCallback(() => {
    if (transcriptSegmentSilenceTimeoutRef.current !== null) {
      window.clearTimeout(transcriptSegmentSilenceTimeoutRef.current);
      transcriptSegmentSilenceTimeoutRef.current = null;
    }

    if (transcriptSegmentMaxTimeoutRef.current !== null) {
      window.clearTimeout(transcriptSegmentMaxTimeoutRef.current);
      transcriptSegmentMaxTimeoutRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    lastTranscriptActivityAtRef.current = 0;
  }, []);

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    pendingIceCandidatesRef.current = [];
    resetRemoteSurface();
  }, [resetRemoteSurface]);

  const disconnectSocket = useCallback(() => {
    if (!socketRef.current) {
      return;
    }

    socketRef.current.emit("leave");
    socketRef.current.disconnect();
    socketRef.current = null;
  }, []);

  const replacePeerTracks = useCallback(async (nextStream: MediaStream) => {
    if (!peerRef.current) {
      return;
    }

    const senders = peerRef.current.getSenders();
    for (const track of nextStream.getTracks()) {
      const sender = senders.find((candidate) => candidate.track?.kind === track.kind);
      if (sender) {
        await sender.replaceTrack(track);
      } else {
        peerRef.current.addTrack(track, nextStream);
      }
    }
  }, []);

  const syncTrackState = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !micMutedRef.current;
    });
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOffRef.current;
    });
  }, []);

  const loadAudioInputs = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter((device) => device.kind === "audioinput");
    setAudioDevices(inputs);

    const activeAudioTrack = localStreamRef.current?.getAudioTracks()[0];
    const activeDeviceId = activeAudioTrack?.getSettings().deviceId;
    if (activeDeviceId) {
      setSelectedAudioDevice(activeDeviceId);
      return;
    }
    if (!selectedAudioDevice && inputs[0]?.deviceId) {
      setSelectedAudioDevice(inputs[0].deviceId);
    }
  }, [selectedAudioDevice]);

  const startVoiceMonitor = useCallback(() => {
    stopVoiceMonitor();

    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }

    const AudioContextCtor = window.AudioContext;
    if (!AudioContextCtor) {
      return;
    }

    try {
      const audioContext = new AudioContextCtor();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const bins = new Uint8Array(analyser.fftSize);
      let smoothedLevel = 0;

      voiceIntervalRef.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(bins);
        let sum = 0;
        for (const sample of bins) {
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / bins.length);
        smoothedLevel = smoothedLevel * 0.72 + rms * 0.28;
        const level = micMutedRef.current ? 0 : Math.min(1, smoothedLevel * 7.5);
        const speaking = level > REMOTE_SPEAKING_THRESHOLD;
        if (level > TRANSCRIPT_ACTIVITY_THRESHOLD) {
          lastTranscriptActivityAtRef.current = Date.now();
          if (mediaRecorderRef.current?.state === "recording") {
            scheduleTranscriptSegmentStop(TRANSCRIPT_SILENCE_DEBOUNCE_MS);
          }
        }

        setLocalSpeaking(speaking);
        socketRef.current?.emit("voice-level", { level });
      }, 120);
    } catch {
      return;
    }
  }, [scheduleTranscriptSegmentStop, stopVoiceMonitor]);

  const ensureLocalMedia = useCallback(
    async (audioDeviceId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaReady(false);
        setErrorMessage("Camera and microphone access require a secure browser context.");
        return;
      }

      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        });

        const previousStream = localStreamRef.current;
        localStreamRef.current = nextStream;
        syncTrackState();

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = nextStream;
        }

        if (audioDeviceId) {
          setSelectedAudioDevice(audioDeviceId);
        }

        await replacePeerTracks(nextStream);
        await loadAudioInputs();
        await startVoiceMonitor();

        previousStream?.getTracks().forEach((track) => {
          track.stop();
        });

        setMediaReady(true);
        setErrorMessage(null);
      } catch {
        setMediaReady(false);
        setErrorMessage("Allow camera and microphone access to join this session.");
      }
    },
    [loadAudioInputs, replacePeerTracks, startVoiceMonitor, syncTrackState],
  );

  const playRemoteTranslationAudio = useCallback(async (text: string) => {
    if (!translationEnabledRef.current || !text.trim() || isAmbientTranscript(text)) {
      return;
    }

    try {
      const response = await fetch("/api/translation/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const player = audioPlaybackRef.current;
      if (!player) {
        URL.revokeObjectURL(audioUrl);
        return;
      }

      player.src = audioUrl;
      try {
        await player.play();
      } catch {
        return;
      } finally {
        window.setTimeout(() => {
          URL.revokeObjectURL(audioUrl);
        }, 30_000);
      }
    } catch {
      return;
    }
  }, []);

  const processTranscriptQueue = useCallback(async () => {
    if (transcriptProcessingRef.current || !translationEnabledRef.current) {
      return;
    }

    const nextChunk = transcriptQueueRef.current.shift();
    if (!nextChunk) {
      return;
    }

    transcriptProcessingRef.current = true;

    try {
      const sttForm = new FormData();
      const audioMimeType = nextChunk.type || transcriptMimeTypeRef.current || "audio/webm";
      const audioExtension = getAudioExtension(audioMimeType);
      const audioFile = new File(
        [nextChunk],
        `segment-${session.id}-${Date.now()}.${audioExtension}`,
        {
          type: audioMimeType,
        },
      );

      sttForm.append("audio", audioFile, audioFile.name);
      sttForm.append("sourceLang", connectionConfig.sourceLanguage);

      const sttResponse = await fetch("/api/translation/stt", {
        method: "POST",
        body: sttForm,
      });

      if (!sttResponse.ok) {
        const detail = await readErrorMessage(
          sttResponse,
          "Speech-to-text failed for the latest segment.",
        );
        throw new Error(`Speech-to-text failed: ${detail}`);
      }

      const sttPayload = (await sttResponse.json()) as {
        transcript?: string;
        detectedLanguage?: string;
      };
      const originalText = sanitizeConversationalText(sttPayload.transcript ?? "");

      if (!originalText) {
        transcriptProcessingRef.current = false;
        void processTranscriptQueue();
        return;
      }

      const segmentId = `${session.id}-${role}-${transcriptCounterRef.current + 1}`;
      const baseSegment: LiveTranscriptSegment = {
        id: segmentId,
        sessionId: session.id,
        speakerId: localParticipant.id,
        speakerName: localParticipant.name,
        speakerRole: role,
        originalText,
        translatedText: originalText,
        sourceLanguage: (
          sttPayload.detectedLanguage ?? connectionConfig.sourceLanguage
        ) as LiveTranscriptSegment["sourceLanguage"],
        targetLanguage: connectionConfig.targetLanguage,
        timestamp: formatSessionTimestamp(),
        confidence: 0.9,
        type: "speech",
      };

      transcriptCounterRef.current += 1;
      appendTranscriptItem(baseSegment);

      const translateResponse = await fetch("/api/translation/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: originalText,
          sourceLang: sttPayload.detectedLanguage ?? connectionConfig.sourceLanguage,
          targetLang: connectionConfig.targetLanguage,
        }),
      });

      if (!translateResponse.ok) {
        const detail = await readErrorMessage(
          translateResponse,
          "Translation failed for the latest segment.",
        );
        throw new Error(`Translation failed: ${detail}`);
      }

      const translatePayload = (await translateResponse.json()) as {
        translation?: string;
      };
      const translatedText =
        sanitizeConversationalText(translatePayload.translation ?? "") || originalText;

      if (!translatedText || isAmbientTranscript(translatedText)) {
        transcriptProcessingRef.current = false;
        void processTranscriptQueue();
        return;
      }

      const nextSegment: LiveTranscriptSegment = {
        ...baseSegment,
        translatedText,
      };

      upsertTranscriptItem(nextSegment);
      socketRef.current?.emit("transcript-segment", nextSegment);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Translation is temporarily unavailable.";
      appendSystemMessage(message);
    } finally {
      transcriptProcessingRef.current = false;
      if (transcriptQueueRef.current.length > 0) {
        void processTranscriptQueue();
      }
    }
  }, [
    appendSystemMessage,
    appendTranscriptItem,
    connectionConfig.sourceLanguage,
    connectionConfig.targetLanguage,
    localParticipant.id,
    localParticipant.name,
    readErrorMessage,
    role,
    session.id,
    upsertTranscriptItem,
  ]);

  const startTranscriptCapture = useCallback(() => {
    if (
      !translationEnabledRef.current ||
      micMutedRef.current ||
      !localStreamRef.current ||
      mediaRecorderRef.current
    ) {
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      appendSystemMessage("This browser does not support live translation capture.");
      return;
    }

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) {
      return;
    }

    try {
      const captureTrack = audioTrack.clone();
      const captureStream = new MediaStream([captureTrack]);
      const preferredMimeType = getPreferredTranscriptMimeType();
      const recorder = preferredMimeType
        ? new MediaRecorder(captureStream, { mimeType: preferredMimeType })
        : new MediaRecorder(captureStream);

      lastTranscriptActivityAtRef.current = 0;
      transcriptMimeTypeRef.current =
        recorder.mimeType || preferredMimeType || "audio/webm";

      recorder.ondataavailable = (event) => {
        if (
          event.data.size < MIN_TRANSCRIPT_CHUNK_BYTES ||
          !translationEnabledRef.current ||
          micMutedRef.current ||
          lastTranscriptActivityAtRef.current === 0
        ) {
          return;
        }

        transcriptQueueRef.current.push(event.data);
        void processTranscriptQueue();
      };

      recorder.onstop = () => {
        if (transcriptSegmentSilenceTimeoutRef.current !== null) {
          window.clearTimeout(transcriptSegmentSilenceTimeoutRef.current);
          transcriptSegmentSilenceTimeoutRef.current = null;
        }

        if (transcriptSegmentMaxTimeoutRef.current !== null) {
          window.clearTimeout(transcriptSegmentMaxTimeoutRef.current);
          transcriptSegmentMaxTimeoutRef.current = null;
        }

        captureTrack.stop();
        mediaRecorderRef.current = null;

        if (!transcriptCaptureEnabledRef.current || !localStreamRef.current) {
          return;
        }

        window.setTimeout(() => {
          void startTranscriptCapture();
        }, 40);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      scheduleTranscriptSegmentStop(TRANSCRIPT_INITIAL_SILENCE_MS);
      transcriptSegmentMaxTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, TRANSCRIPT_MAX_SEGMENT_MS);
    } catch {
      appendSystemMessage("Translation capture could not start on this browser.");
    }
  }, [appendSystemMessage, processTranscriptQueue, scheduleTranscriptSegmentStop]);

  const ensurePeer = useCallback(() => {
    if (peerRef.current) {
      return peerRef.current;
    }

    const peer = new RTCPeerConnection({
      iceServers: [STUN_SERVERS],
    });

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        peer.addTrack(track, localStreamRef.current);
      }
    }

    peer.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      socketRef.current?.emit("ice-candidate", event.candidate.toJSON());
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) {
        return;
      }

      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteVideoOn(stream.getVideoTracks().some((track) => track.enabled));
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        setUiState("active");
        setStatusMessage("Live session active.");
      }

      if (peer.connectionState === "disconnected" || peer.connectionState === "failed") {
        setUiState("reconnecting");
        setStatusMessage("Reconnecting to the other participant...");
      }
    };

    peerRef.current = peer;
    return peer;
  }, []);

  const connectToSession = useCallback(async () => {
    if (socketRef.current) {
      return;
    }

    if (!localStreamRef.current) {
      await ensureLocalMedia(selectedAudioDevice || undefined);
    }

    if (!localStreamRef.current) {
      setUiState("error");
      setStatusMessage("Camera and microphone access are required to join.");
      return;
    }

    setUiState("connecting");
    setStatusMessage("Connecting to the live session...");
    setErrorMessage(null);
    endedRef.current = false;

    const socket = io(connectionConfig.signalServerUrl, {
      autoConnect: true,
      auth: {
        sessionId: connectionConfig.sessionId,
        role,
      },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      reconnectionDelayMax: 2500,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("joined", () => {
      setUiState("connecting");
      setStatusMessage("Connected to signaling. Waiting for the other participant...");
      socket.emit("media-state", {
        micOn: !micMutedRef.current,
        videoOn: !cameraOffRef.current,
      });
    });

    socket.on("waiting", () => {
      setUiState("waiting");
      setStatusMessage("Waiting for the other participant to join...");
    });

    socket.on("peer-ready", async () => {
      setUiState("active");
      setStatusMessage("Connecting media...");
      const peer = ensurePeer();
      socket.emit("media-state", {
        micOn: !micMutedRef.current,
        videoOn: !cameraOffRef.current,
      });

      if (role !== "consultant") {
        return;
      }

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("offer", offer);
    });

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      const peer = ensurePeer();
      await peer.setRemoteDescription(offer);

      for (const pendingCandidate of pendingIceCandidatesRef.current) {
        await peer.addIceCandidate(pendingCandidate);
      }
      pendingIceCandidatesRef.current = [];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      const peer = ensurePeer();
      await peer.setRemoteDescription(answer);
      for (const pendingCandidate of pendingIceCandidatesRef.current) {
        await peer.addIceCandidate(pendingCandidate);
      }
      pendingIceCandidatesRef.current = [];
    });

    socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
      const peer = ensurePeer();
      if (!peer.remoteDescription) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      await peer.addIceCandidate(candidate);
    });

    socket.on("peer-media-state", (payload: { micOn: boolean; videoOn: boolean }) => {
      setRemoteMicOn(payload.micOn);
      setRemoteVideoOn(payload.videoOn);
    });

    socket.on("peer-voice-level", (payload: { level: number }) => {
      setRemoteSpeaking(payload.level > REMOTE_SPEAKING_THRESHOLD);
    });

    socket.on("transcript-segment", (segment: LiveTranscriptSegment) => {
      if (segment.type !== "speech") {
        upsertTranscriptItem(segment);
        return;
      }

      const originalText = sanitizeConversationalText(segment.originalText);
      const translatedText =
        sanitizeConversationalText(segment.translatedText ?? segment.originalText) ||
        originalText;

      if (!originalText || !translatedText) {
        return;
      }

      const sanitizedSegment: LiveTranscriptSegment = {
        ...segment,
        originalText,
        translatedText,
      };

      upsertTranscriptItem(sanitizedSegment);
      if (segment.speakerId !== localParticipant.id) {
        void playRemoteTranslationAudio(translatedText);
      }
    });

    socket.on("peer-left", () => {
      closePeer();
      setUiState("waiting");
      setStatusMessage("The other participant left. Waiting for them to return...");
      appendSystemMessage("The other participant disconnected.");
    });

    socket.on("signal-error", (payload: { message?: string }) => {
      setUiState("error");
      setStatusMessage(payload.message ?? "The session signaling channel failed.");
    });

    socket.on("connect_error", () => {
      if (endedRef.current) {
        return;
      }
      setUiState("error");
      setStatusMessage("Could not reach the live session server.");
    });

    socket.on("disconnect", () => {
      if (endedRef.current) {
        return;
      }
      setUiState("reconnecting");
      setStatusMessage("Reconnecting to the live session...");
    });
  }, [
    appendSystemMessage,
    closePeer,
    connectionConfig.sessionId,
    connectionConfig.signalServerUrl,
    ensureLocalMedia,
    ensurePeer,
    localParticipant.id,
    playRemoteTranslationAudio,
    role,
    selectedAudioDevice,
    upsertTranscriptItem,
  ]);

  const handleToggleMic = useCallback(() => {
    setMicMuted((current) => {
      const next = !current;
      localStreamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
      socketRef.current?.emit("media-state", {
        micOn: !next,
        videoOn: !cameraOffRef.current,
      });
      return next;
    });
  }, []);

  const handleToggleCamera = useCallback(() => {
    setCameraOff((current) => {
      const next = !current;
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = !next;
      });
      socketRef.current?.emit("media-state", {
        micOn: !micMutedRef.current,
        videoOn: !next,
      });
      return next;
    });
  }, []);

  const handleEndCall = useCallback(() => {
    endedRef.current = true;
    stopTranscriptCapture();
    stopVoiceMonitor();
    closePeer();
    disconnectSocket();
    setUiState("ended");
    setStatusMessage("Call ended.");
  }, [closePeer, disconnectSocket, stopTranscriptCapture, stopVoiceMonitor]);

  useEffect(() => {
    const storedItems = loadStoredTranscript(session.id);
    setTranscriptItems(storedItems);
    setChatItems(storedItems);
  }, [session.id]);

  useEffect(() => {
    void ensureLocalMedia();

    const mediaDevices = navigator.mediaDevices;
    const handleDeviceChange = () => {
      void loadAudioInputs();
    };

    mediaDevices?.addEventListener?.("devicechange", handleDeviceChange);

    return () => {
      mediaDevices?.removeEventListener?.("devicechange", handleDeviceChange);
      stopTranscriptCapture();
      stopVoiceMonitor();
      closePeer();
      disconnectSocket();
      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [
    closePeer,
    disconnectSocket,
    ensureLocalMedia,
    loadAudioInputs,
    stopTranscriptCapture,
    stopVoiceMonitor,
  ]);

  useEffect(() => {
    if (uiState === "prejoin" || uiState === "ended" || uiState === "error") {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (timerIntervalRef.current !== null) {
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [uiState]);

  useEffect(() => {
    if (uiState === "active" && translationEnabled && !micMuted) {
      startTranscriptCapture();
      return;
    }

    transcriptQueueRef.current = [];
    stopTranscriptCapture();
  }, [micMuted, startTranscriptCapture, stopTranscriptCapture, translationEnabled, uiState]);

  const remoteOverlayMessage =
    uiState === "connecting"
      ? "Connecting to the other participant..."
      : uiState === "waiting"
        ? "Waiting for the other participant..."
        : uiState === "reconnecting"
          ? "Reconnecting the session..."
          : uiState === "ended"
            ? "Call ended."
            : undefined;

  const sessionEyebrow =
    role === "consultant" ? organization.workspace : session.orgName;
  const sessionStatusTone =
    uiState === "error"
      ? "danger"
      : uiState === "active"
        ? "accent"
        : uiState === "ended"
          ? "warning"
          : "neutral";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_400px]">
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {sessionEyebrow}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {session.title}
            </h1>
            <StatusBadge pulse={uiState === "active"} tone={sessionStatusTone}>
              {stateLabel(uiState)}
            </StatusBadge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--accent)]" />
              {formatDuration(elapsedSeconds)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Languages className="h-4 w-4 text-[var(--accent)]" />
              {localParticipant.language.toUpperCase()} to{" "}
              {remoteParticipant.language.toUpperCase()}
            </span>
            <span>1:1 call</span>
          </div>
        </div>

        {uiState === "prejoin" ? (
          <div className="app-panel rounded-[32px] p-5 md:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
              <SessionVideoPanel
                audioEnabled={!micMuted}
                badgeLabel={role === "consultant" ? "Consultant preview" : "Client preview"}
                featured
                name={localParticipant.name}
                placeholder="Your camera preview appears here before you join."
                showVideo={mediaReady && !cameraOff}
                subtitle={`${getLanguageLabel(localParticipant.language)} • local preview`}
                videoEnabled={!cameraOff}
                videoRef={localVideoRef}
                muted
              />

              <div className="space-y-4 rounded-[28px] border border-[var(--border)] bg-[var(--background-elevated)] p-5">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Join session
                  </p>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    Confirm your media settings, then enter the live consultation.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Your language
                    </span>
                    <select
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      onChange={(event) =>
                        setLocalLanguage(event.target.value as LanguageCode)
                      }
                      value={localLanguage}
                    >
                      {LANGUAGE_OPTIONS.map((language) => (
                        <option key={language} value={language}>
                          {getLanguageLabel(language)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Translate to
                    </span>
                    <select
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      onChange={(event) =>
                        setRemoteLanguage(event.target.value as LanguageCode)
                      }
                      value={remoteLanguage}
                    >
                      {LANGUAGE_OPTIONS.map((language) => (
                        <option key={language} value={language}>
                          {getLanguageLabel(language)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Audio input
                  </span>
                  <select
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    onChange={(event) => {
                      void ensureLocalMedia(event.target.value);
                    }}
                    value={selectedAudioDevice}
                  >
                    {audioDevices.length === 0 ? (
                      <option value="">Default microphone</option>
                    ) : (
                      audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || "Microphone"}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={handleToggleMic} type="button" variant="outline">
                    <Mic className="h-4 w-4" />
                    {micMuted ? "Unmute mic" : "Mute mic"}
                  </Button>
                  <Button onClick={handleToggleCamera} type="button" variant="outline">
                    <Video className="h-4 w-4" />
                    {cameraOff ? "Camera on" : "Camera off"}
                  </Button>
                </div>

                <Button
                  disabled={!mediaReady}
                  onClick={() => {
                    void connectToSession();
                  }}
                  size="lg"
                  type="button"
                  variant="secondary"
                >
                  Join live session
                </Button>

                <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {statusMessage}
                  </p>
                  {errorMessage ? (
                    <p className="mt-2 text-sm text-[var(--danger)]">{errorMessage}</p>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Signal server: {connectionConfig.signalServerUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="app-panel rounded-[32px] p-5 md:p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                <SessionVideoPanel
                  audioEnabled={remoteMicOn}
                  badgeLabel={remoteSpeaking ? "Speaking" : remoteParticipant.role}
                  featured
                  isSpeaking={remoteSpeaking}
                  name={remoteParticipant.name}
                  overlayMessage={remoteOverlayMessage}
                  placeholder={`Waiting for ${remoteParticipant.name} to connect.`}
                  showVideo={remoteVideoOn}
                  subtitle={`${getLanguageLabel(remoteParticipant.language)} • remote`}
                  videoEnabled={remoteVideoOn}
                  videoRef={remoteVideoRef}
                />
                <SessionVideoPanel
                  audioEnabled={!micMuted}
                  badgeLabel="You"
                  isSpeaking={localSpeaking}
                  muted
                  name={localParticipant.name}
                  placeholder="Your camera preview stays visible throughout the session."
                  showVideo={mediaReady && !cameraOff}
                  subtitle={`${getLanguageLabel(localParticipant.language)} • local`}
                  videoEnabled={!cameraOff}
                  videoRef={localVideoRef}
                />
              </div>
            </div>

            <CallControls
              cameraOff={cameraOff}
              micMuted={micMuted}
              onEndCall={handleEndCall}
              onToggleCamera={handleToggleCamera}
              onToggleMic={handleToggleMic}
              onToggleTranslation={() => setTranslationEnabled((current) => !current)}
              primaryActionHref={`/analysis?sessionId=${session.id}`}
              primaryActionLabel="Generate insights"
              showPrimaryAction={role === "consultant"}
              translationEnabled={translationEnabled}
            />

            {role === "consultant" ? (
              <Link
                className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)] px-5 py-4 transition-colors hover:border-[var(--accent)] hover:bg-white"
                href={`/analysis?sessionId=${session.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                    <BarChart2 className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Generate insights
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Open analysis using the latest translated transcript.
                    </p>
                  </div>
                </div>
                <span className="text-sm text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                  View →
                </span>
              </Link>
            ) : null}
          </>
        )}
      </section>

      <TranscriptPanel
        emptyState="Live translated dialogue appears here once both participants are connected."
        items={chatItems}
        live={uiState === "active"}
        localSpeakerId={localParticipant.id}
        statusLabel={stateLabel(uiState)}
        translationLabel={translationLabel}
      />

      <audio className="hidden" ref={audioPlaybackRef} />
    </div>
  );
}
