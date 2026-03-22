import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import CallPage from "./CallPage";
import {
  getLanguageName,
  getSupportedLanguageCode,
} from "./languages";

type Role = "alpha" | "beta";
type JoinState =
  | "idle"
  | "connecting"
  | "waiting"
  | "ready"
  | "connected"
  | "error";
type JoinConfig = {
  role: Role | null;
  serverUrl: string;
  stableMode: boolean;
  turnUrls: string[];
  turnUsername: string;
  turnCredential: string;
};

const DEFAULT_SERVER_URL =
  import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";
const SERVER_URL_STORAGE_KEY = "webrtcDemoServerUrl";
const STABLE_MODE_STORAGE_KEY = "webrtcDemoStableMode";
const TURN_URLS_STORAGE_KEY = "webrtcDemoTurnUrls";
const TURN_USERNAME_STORAGE_KEY = "webrtcDemoTurnUsername";
const TURN_CREDENTIAL_STORAGE_KEY = "webrtcDemoTurnCredential";
const SPOKEN_LANGUAGE_STORAGE_KEY = "webrtcDemoSpokenLanguage";
const TRANSCRIPT_LANGUAGE_STORAGE_KEY = "webrtcDemoTranscriptLanguage";
const DEFAULT_TURN_URLS = import.meta.env.VITE_TURN_URLS ?? "";
const DEFAULT_TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME ?? "";
const DEFAULT_TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL ?? "";

const stunServer: RTCIceServer = {
  urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
};

function normalizeServerUrl(value: string): string {
  const parsed = new URL(value.trim());
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function parseTurnUrls(raw: string): string[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function getStoredString(key: string, fallback = ""): string {
  const value = window.localStorage.getItem(key);
  return value && value.length > 0 ? value : fallback;
}

function getStoredBool(key: string, fallback = false): boolean {
  const value = window.localStorage.getItem(key);
  if (!value) {
    return fallback;
  }
  return value === "1" || value.toLowerCase() === "true";
}

function parseRoleFromPath(): Role | null {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length !== 2 || parts[0] !== "join") {
    return null;
  }
  if (parts[1] === "alpha" || parts[1] === "beta") {
    return parts[1];
  }
  return null;
}

type TranscriptSocketMessage = {
  id: string;
  senderName: string;
  text: string;
  sourceLanguage: string;
  role: Role;
  createdAt: string;
};

type TranscriptMessage = {
  id: string;
  sender: string;
  originalText: string;
  text: string;
  sourceLanguage: string;
  translationState: "ready" | "translating" | "error";
  isSelf: boolean;
};

function createTranscriptId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDefaultLanguage(): string {
  if (typeof window === "undefined") {
    return "en";
  }
  return getSupportedLanguageCode(window.navigator.language);
}

function parseJoinConfig(): JoinConfig {
  const params = new URLSearchParams(window.location.search);
  const role = parseRoleFromPath();
  const serverFromQuery = params.get("server");
  const stableFromQuery = params.get("stable");
  const turnUrlsFromQuery = params.get("turnUrls");
  const turnUsernameFromQuery = params.get("turnUsername");
  const turnCredentialFromQuery = params.get("turnCredential");

  const serverUrl =
    serverFromQuery && serverFromQuery.length > 0
      ? serverFromQuery
      : getStoredString(SERVER_URL_STORAGE_KEY, DEFAULT_SERVER_URL);
  const stableMode =
    stableFromQuery !== null
      ? stableFromQuery === "1" || stableFromQuery.toLowerCase() === "true"
      : getStoredBool(STABLE_MODE_STORAGE_KEY, true);
  const turnUrls = parseTurnUrls(
    turnUrlsFromQuery && turnUrlsFromQuery.length > 0
      ? turnUrlsFromQuery
      : getStoredString(TURN_URLS_STORAGE_KEY, DEFAULT_TURN_URLS),
  );
  const turnUsername =
    turnUsernameFromQuery && turnUsernameFromQuery.length > 0
      ? turnUsernameFromQuery
      : getStoredString(TURN_USERNAME_STORAGE_KEY, DEFAULT_TURN_USERNAME);
  const turnCredential =
    turnCredentialFromQuery && turnCredentialFromQuery.length > 0
      ? turnCredentialFromQuery
      : getStoredString(TURN_CREDENTIAL_STORAGE_KEY, DEFAULT_TURN_CREDENTIAL);

  return {
    role,
    serverUrl,
    stableMode,
    turnUrls,
    turnUsername,
    turnCredential,
  };
}

function createDeterministicJoinLink(
  role: Role,
  config: Omit<JoinConfig, "role">,
): string {
  const params = new URLSearchParams();
  params.set("server", config.serverUrl);
  if (config.stableMode) {
    params.set("stable", "1");
  }
  if (config.turnUrls.length > 0) {
    params.set("turnUrls", config.turnUrls.join(","));
  }
  if (config.turnUsername) {
    params.set("turnUsername", config.turnUsername);
  }
  if (config.turnCredential) {
    params.set("turnCredential", config.turnCredential);
  }
  return `${window.location.origin}/join/${role}?${params.toString()}`;
}

function isJoinRoute(): boolean {
  return window.location.pathname.startsWith("/join/");
}

function formatDuration(totalSeconds: number): string {
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

function App() {
  return isJoinRoute() ? <JoinPage /> : <HomePage />;
}

function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [serverInput, setServerInput] = useState(
    getStoredString(SERVER_URL_STORAGE_KEY, DEFAULT_SERVER_URL),
  );
  const [activeServerUrl, setActiveServerUrl] = useState(
    getStoredString(SERVER_URL_STORAGE_KEY, DEFAULT_SERVER_URL),
  );
  const [stableMode, setStableMode] = useState(
    getStoredBool(STABLE_MODE_STORAGE_KEY, true),
  );
  const [turnUrlsInput, setTurnUrlsInput] = useState(
    getStoredString(TURN_URLS_STORAGE_KEY, DEFAULT_TURN_URLS),
  );
  const [turnUsernameInput, setTurnUsernameInput] = useState(
    getStoredString(TURN_USERNAME_STORAGE_KEY, DEFAULT_TURN_USERNAME),
  );
  const [turnCredentialInput, setTurnCredentialInput] = useState(
    getStoredString(TURN_CREDENTIAL_STORAGE_KEY, DEFAULT_TURN_CREDENTIAL),
  );

  const joinLinks = useMemo(() => {
    const config: Omit<JoinConfig, "role"> = {
      serverUrl: activeServerUrl,
      stableMode,
      turnUrls: parseTurnUrls(turnUrlsInput),
      turnUsername: turnUsernameInput.trim(),
      turnCredential: turnCredentialInput.trim(),
    };
    return {
      alphaLink: createDeterministicJoinLink("alpha", config),
      betaLink: createDeterministicJoinLink("beta", config),
    };
  }, [
    activeServerUrl,
    stableMode,
    turnCredentialInput,
    turnUrlsInput,
    turnUsernameInput,
  ]);

  const saveConnectionSettings = () => {
    try {
      const normalized = normalizeServerUrl(serverInput);
      window.localStorage.setItem(SERVER_URL_STORAGE_KEY, normalized);
      window.localStorage.setItem(
        STABLE_MODE_STORAGE_KEY,
        stableMode ? "1" : "0",
      );
      window.localStorage.setItem(TURN_URLS_STORAGE_KEY, turnUrlsInput.trim());
      window.localStorage.setItem(
        TURN_USERNAME_STORAGE_KEY,
        turnUsernameInput.trim(),
      );
      window.localStorage.setItem(
        TURN_CREDENTIAL_STORAGE_KEY,
        turnCredentialInput.trim(),
      );
      setActiveServerUrl(normalized);
      setServerInput(normalized);
      setError(null);
    } catch {
      setError(
        "Settings are invalid. Example URL: https://your-tunnel.trycloudflare.com",
      );
    }
  };

  return (
    <main className="shell">
      <section className="card intro reveal">
        <p className="eyebrow">WebRTC Two-Role Demo</p>
        <h1>Deterministic role links</h1>
        <p className="lead">
          This demo has fixed links only: one for Alpha and one for Beta. No
          sessions, no per-click token generation.
        </p>
        <div className="server-controls">
          <label htmlFor="server-url">Signaling Server URL</label>
          <div className="server-row">
            <input
              id="server-url"
              value={serverInput}
              onChange={(event) => setServerInput(event.target.value)}
              placeholder="https://your-tunnel.trycloudflare.com"
            />
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={stableMode}
              onChange={(event) => setStableMode(event.target.checked)}
            />
            Demo stable mode (lower video quality, prefer TURN relay)
          </label>

          <label htmlFor="turn-urls">
            TURN URLs (comma-separated, optional)
          </label>
          <input
            id="turn-urls"
            value={turnUrlsInput}
            onChange={(event) => setTurnUrlsInput(event.target.value)}
            placeholder="turn:your.turn.host:3478?transport=udp, turns:your.turn.host:443?transport=tcp"
          />

          <label htmlFor="turn-username">TURN Username (optional)</label>
          <input
            id="turn-username"
            value={turnUsernameInput}
            onChange={(event) => setTurnUsernameInput(event.target.value)}
            placeholder="TURN username"
          />

          <label htmlFor="turn-credential">TURN Credential (optional)</label>
          <input
            id="turn-credential"
            type="password"
            value={turnCredentialInput}
            onChange={(event) => setTurnCredentialInput(event.target.value)}
            placeholder="TURN credential"
          />

          <button
            className="secondary"
            onClick={saveConnectionSettings}
            type="button"
          >
            Save Connection Settings
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card reveal delay-1">
        <h2>Join Links</h2>
        <div className="links">
          <article>
            <h3>Alpha Link</h3>
            <a href={joinLinks.alphaLink}>{joinLinks.alphaLink}</a>
          </article>
          <article>
            <h3>Beta Link</h3>
            <a href={joinLinks.betaLink}>{joinLinks.betaLink}</a>
          </article>
        </div>
      </section>
    </main>
  );
}

function JoinPage() {
  const joinConfig = useMemo(() => parseJoinConfig(), []);
  const role = joinConfig.role;
  const serverUrl = joinConfig.serverUrl;
  const stableMode = joinConfig.stableMode;
  const hasTurn = joinConfig.turnUrls.length > 0;
  const voiceThreshold = 0.06;
  const voiceDelta = 0.015;
  const iceServers = useMemo<RTCIceServer[]>(() => {
    if (hasTurn) {
      return [
        {
          urls: joinConfig.turnUrls,
          username: joinConfig.turnUsername || undefined,
          credential: joinConfig.turnCredential || undefined,
        },
        stunServer,
      ];
    }
    return [stunServer];
  }, [
    hasTurn,
    joinConfig.turnCredential,
    joinConfig.turnUrls,
    joinConfig.turnUsername,
  ]);

  const [joinState, setJoinState] = useState<JoinState>(
    role ? "idle" : "error",
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    role
      ? "Open your camera to begin."
      : "Invalid route. Use /join/alpha or /join/beta.",
  );
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [localVoiceLevel, setLocalVoiceLevel] = useState(0);
  const [remoteVoiceLevel, setRemoteVoiceLevel] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [spokenLanguage, setSpokenLanguage] = useState(() =>
    getSupportedLanguageCode(
      getStoredString(SPOKEN_LANGUAGE_STORAGE_KEY, getDefaultLanguage()),
    ),
  );
  const [transcriptLanguage, setTranscriptLanguage] = useState(() =>
    getSupportedLanguageCode(
      getStoredString(
        TRANSCRIPT_LANGUAGE_STORAGE_KEY,
        getStoredString(SPOKEN_LANGUAGE_STORAGE_KEY, getDefaultLanguage()),
      ),
    ),
  );
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [transcriptStatus, setTranscriptStatus] = useState(
    "Waiting for speech to start.",
  );

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceIntervalRef = useRef<number | null>(null);
  const isMutedRef = useRef(false);
  const isVideoOffRef = useRef(false);
  const callStartRef = useRef<number | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef(false);
  const callTimerIntervalRef = useRef<number | null>(null);
  const transcriptMessagesRef = useRef<TranscriptMessage[]>([]);
  const transcriptLanguageRef = useRef(transcriptLanguage);
  const spokenLanguageRef = useRef(spokenLanguage);
  const transcriptRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptShouldListenRef = useRef(false);
  const lastTranscriptRef = useRef<{ signature: string; at: number }>({
    signature: "",
    at: 0,
  });

  const emitMediaState = useCallback((micOn: boolean, videoOn: boolean) => {
    socketRef.current?.emit("media-state", { micOn, videoOn });
  }, []);

  const updateTranscriptMessages = useCallback(
    (updater: (current: TranscriptMessage[]) => TranscriptMessage[]) => {
      setTranscriptMessages((current) => {
        const next = updater(current);
        transcriptMessagesRef.current = next;
        return next;
      });
    },
    [],
  );

  const translateTranscriptMessage = useCallback(
    async (message: TranscriptMessage, targetLanguage: string) => {
      if (message.sourceLanguage === targetLanguage) {
        updateTranscriptMessages((current) =>
          current.map((entry) =>
            entry.id === message.id
              ? {
                  ...entry,
                  text: entry.originalText,
                  translationState: "ready",
                }
              : entry,
          ),
        );
        return;
      }

      updateTranscriptMessages((current) =>
        current.map((entry) =>
          entry.id === message.id
            ? {
                ...entry,
                text: entry.originalText,
                translationState: "translating",
              }
            : entry,
        ),
      );

      try {
        const response = await fetch(`${serverUrl}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message.originalText,
            sourceLang: message.sourceLanguage,
            targetLang: targetLanguage,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? "Translation failed");
        }

        const payload = (await response.json()) as { translation?: string };
        if (transcriptLanguageRef.current !== targetLanguage) {
          return;
        }

        updateTranscriptMessages((current) =>
          current.map((entry) =>
            entry.id === message.id
              ? {
                  ...entry,
                  text: payload.translation?.trim() || entry.originalText,
                  translationState: "ready",
                }
              : entry,
          ),
        );
      } catch (error) {
        if (transcriptLanguageRef.current !== targetLanguage) {
          return;
        }

        updateTranscriptMessages((current) =>
          current.map((entry) =>
            entry.id === message.id
              ? {
                  ...entry,
                  text: entry.originalText,
                  translationState: "error",
                }
              : entry,
          ),
        );

        setTranscriptError(
          error instanceof Error ? error.message : "Translation failed",
        );
      }
    },
    [serverUrl, updateTranscriptMessages],
  );

  const handleTranscriptMessage = useCallback(
    (payload: TranscriptSocketMessage) => {
      const nextMessage: TranscriptMessage = {
        id: payload.id,
        sender: payload.senderName,
        originalText: payload.text,
        text: payload.text,
        sourceLanguage: payload.sourceLanguage,
        translationState:
          payload.sourceLanguage === transcriptLanguageRef.current
            ? "ready"
            : "translating",
        isSelf: payload.role === role,
      };

      updateTranscriptMessages((current) => [...current, nextMessage]);
      setTranscriptStatus(
        `Capturing live conversation. Showing ${getLanguageName(
          transcriptLanguageRef.current,
        )}.`,
      );
      setTranscriptError(null);

      if (payload.sourceLanguage !== transcriptLanguageRef.current) {
        void translateTranscriptMessage(
          nextMessage,
          transcriptLanguageRef.current,
        );
      }
    },
    [role, translateTranscriptMessage, updateTranscriptMessages],
  );

  const sendTranscriptMessage = useCallback(
    (text: string) => {
      const normalized = text.trim();
      if (!normalized || !socketRef.current || !role) {
        return;
      }

      const signature = `${spokenLanguageRef.current}:${normalized}`;
      const now = Date.now();
      if (
        signature === lastTranscriptRef.current.signature &&
        now - lastTranscriptRef.current.at < 4_000
      ) {
        return;
      }
      lastTranscriptRef.current = { signature, at: now };

      socketRef.current.emit("transcript-message", {
        id: createTranscriptId(),
        senderName: role === "alpha" ? "Alpha" : "Beta",
        text: normalized,
        sourceLanguage: spokenLanguageRef.current,
        createdAt: new Date().toISOString(),
      });
    },
    [role],
  );

  const stopTranscriptRecognition = useCallback(() => {
    const recognition = transcriptRecognitionRef.current;
    if (!recognition) {
      return;
    }
    transcriptRecognitionRef.current = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.stop();
  }, []);

  const startTranscriptRecognition = useCallback(() => {
    if (!role || isMutedRef.current || !transcriptShouldListenRef.current) {
      return;
    }
    if (transcriptRecognitionRef.current) {
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setTranscriptStatus(
        "Live captions are unavailable in this browser. Use Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = spokenLanguageRef.current;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result.isFinal) {
          continue;
        }

        const transcript = result[0]?.transcript?.trim();
        if (!transcript) {
          continue;
        }

        sendTranscriptMessage(transcript);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }

      setTranscriptError(`Captions unavailable: ${event.error}`);
      setTranscriptStatus("Live captions paused.");
    };
    recognition.onend = () => {
      transcriptRecognitionRef.current = null;
      if (transcriptShouldListenRef.current && !isMutedRef.current) {
        window.setTimeout(() => {
          startTranscriptRecognition();
        }, 250);
      }
    };

    transcriptRecognitionRef.current = recognition;
    setTranscriptStatus(
      `Listening in ${getLanguageName(spokenLanguageRef.current)}.`,
    );
    setTranscriptError(null);
    recognition.start();
  }, [role, sendTranscriptMessage]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isVideoOffRef.current = isVideoOff;
  }, [isVideoOff]);

  useEffect(() => {
    transcriptLanguageRef.current = transcriptLanguage;
    window.localStorage.setItem(
      TRANSCRIPT_LANGUAGE_STORAGE_KEY,
      transcriptLanguage,
    );
    setTranscriptStatus(
      transcriptMessagesRef.current.length > 0
        ? `Capturing live conversation. Showing ${getLanguageName(
            transcriptLanguage,
          )}.`
        : `Waiting for speech to start. Captions will appear in ${getLanguageName(
            transcriptLanguage,
          )}.`,
    );

    const snapshot = transcriptMessagesRef.current;
    updateTranscriptMessages(() =>
      snapshot.map((message) =>
        message.sourceLanguage === transcriptLanguage
          ? {
              ...message,
              text: message.originalText,
              translationState: "ready",
            }
          : {
              ...message,
              text: message.originalText,
              translationState: "translating",
            },
      ),
    );

    for (const message of snapshot) {
      if (message.sourceLanguage !== transcriptLanguage) {
        void translateTranscriptMessage(message, transcriptLanguage);
      }
    }
  }, [transcriptLanguage, translateTranscriptMessage, updateTranscriptMessages]);

  useEffect(() => {
    spokenLanguageRef.current = spokenLanguage;
    window.localStorage.setItem(SPOKEN_LANGUAGE_STORAGE_KEY, spokenLanguage);
    const recognition = transcriptRecognitionRef.current;
    if (recognition) {
      stopTranscriptRecognition();
      if (transcriptShouldListenRef.current) {
        startTranscriptRecognition();
      }
    }
  }, [spokenLanguage, startTranscriptRecognition, stopTranscriptRecognition]);

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    remoteStreamRef.current = null;
    setRemoteMicOn(true);
    setRemoteVideoOn(false);
    setRemoteVoiceLevel(0);
    callStartRef.current = null;
    setElapsedSeconds(0);
    pendingIceRef.current = [];
  }, []);

  const ensurePeer = useCallback(() => {
    if (peerRef.current) {
      return peerRef.current;
    }

    const peer = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: stableMode && hasTurn ? "relay" : "all",
    });

    peer.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current) {
        return;
      }
      socketRef.current.emit("ice-candidate", event.candidate.toJSON());
    };

    peer.onconnectionstatechange = () => {
      if (!peerRef.current) {
        return;
      }
      const state = peerRef.current.connectionState;
      if (state === "connected") {
        setJoinState("connected");
        setStatusMessage("Peer connected.");
      }
      if (state === "failed") {
        setJoinState("error");
        setFatalError("Connection failed. Reload this link to retry.");
      }
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream ?? null;
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    const stream = localStreamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) {
        const sender = peer.addTrack(track, stream);
        if (stableMode && track.kind === "video") {
          const parameters = sender.getParameters();
          parameters.encodings = parameters.encodings ?? [{}];
          parameters.encodings[0].maxBitrate = 350_000;
          parameters.encodings[0].maxFramerate = 15;
          void sender.setParameters(parameters).catch(() => {
            return;
          });
          track.contentHint = "motion";
        }
      }
    }

    peerRef.current = peer;
    return peer;
  }, [hasTurn, iceServers, stableMode]);

  useEffect(() => {
    if (!role) {
      return;
    }

    let active = true;

    const setup = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          const protocol = window.location.protocol;
          const host = window.location.host;
          throw new Error(
            `Camera access is unavailable on ${protocol}//${host}. Use HTTPS (or localhost) to enable getUserMedia.`,
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: stableMode
            ? {
                width: { ideal: 640, max: 960 },
                height: { ideal: 360, max: 540 },
                frameRate: { ideal: 15, max: 20 },
              }
            : true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const audioContext = new AudioContext();
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
          const level = isMutedRef.current ? 0 : Math.min(1, smoothedLevel * 6);
          setLocalVoiceLevel(level);
          socketRef.current?.emit("voice-level", { level });
        }, 120);

        setStatusMessage(
          "Local media ready. Connecting to signaling server...",
        );
        setJoinState("connecting");

        const socket = io(serverUrl, {
          autoConnect: true,
          auth: { role },
          reconnection: true,
          reconnectionAttempts: 5,
          transports: ["websocket"],
        });
        socketRef.current = socket;

        socket.on("joined", (payload: { role: Role }) => {
          setStatusMessage(`Joined as ${payload.role.toUpperCase()}.`);
          setJoinState("connecting");
          setFatalError(null);
          setRemoteMicOn(true);
          setRemoteVideoOn(false);
          setRemoteVoiceLevel(0);
          callStartRef.current = null;
          setElapsedSeconds(0);
          setIsMuted(false);
          setIsVideoOff(false);
          if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
              track.enabled = true;
            });
            localStreamRef.current.getVideoTracks().forEach((track) => {
              track.enabled = true;
            });
          }
          isMutedRef.current = false;
          isVideoOffRef.current = false;
          lastTranscriptRef.current = { signature: "", at: 0 };
          updateTranscriptMessages(() => []);
          setTranscriptError(null);
          setTranscriptStatus("Waiting for speech to start.");
          emitMediaState(true, true);
        });

        socket.on("waiting", () => {
          setJoinState("waiting");
          setStatusMessage("Waiting for the other role to join...");
        });

        socket.on("peer-ready", async () => {
          setJoinState("ready");
          setStatusMessage("Peer ready. Negotiating connection...");
          emitMediaState(!isMutedRef.current, !isVideoOffRef.current);
          const peer = ensurePeer();
          if (role !== "alpha") {
            return;
          }
          if (makingOfferRef.current) {
            return;
          }
          makingOfferRef.current = true;
          try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.emit("offer", offer);
          } finally {
            makingOfferRef.current = false;
          }
        });

        socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
          const peer = ensurePeer();
          await peer.setRemoteDescription(offer);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer", answer);
          for (const pending of pendingIceRef.current) {
            await peer.addIceCandidate(pending);
          }
          pendingIceRef.current = [];
        });

        socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
          const peer = ensurePeer();
          await peer.setRemoteDescription(answer);
          for (const pending of pendingIceRef.current) {
            await peer.addIceCandidate(pending);
          }
          pendingIceRef.current = [];
        });

        socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
          const peer = ensurePeer();
          if (!peer.remoteDescription) {
            pendingIceRef.current.push(candidate);
            return;
          }
          await peer.addIceCandidate(candidate);
        });

        socket.on("peer-left", () => {
          setJoinState("waiting");
          setStatusMessage("Peer disconnected. Waiting for them to return...");
          callStartRef.current = null;
          setElapsedSeconds(0);
          setTranscriptStatus("Peer left the call. Transcript will resume when they return.");
          closePeer();
        });

        socket.on("peer-media-state", (payload: { micOn: boolean; videoOn: boolean }) => {
          setRemoteMicOn(payload.micOn);
          setRemoteVideoOn(payload.videoOn);
          if (!payload.micOn) {
            setRemoteVoiceLevel(0);
          }
        });

        socket.on("peer-voice-level", (payload: { level: number }) => {
          const next = Number.isFinite(payload.level)
            ? Math.max(0, Math.min(1, payload.level))
            : 0;
          setRemoteVoiceLevel(next);
        });

        socket.on("transcript-message", (payload: TranscriptSocketMessage) => {
          handleTranscriptMessage(payload);
        });

        socket.on(
          "signal-error",
          (payload: { code: string; message: string }) => {
            setJoinState("error");
            setFatalError(`${payload.code}: ${payload.message}`);
          },
        );

        socket.on("connect_error", (error) => {
          setJoinState("error");
          setFatalError(error.message);
        });

        socket.on("reconnect_attempt", () => {
          setJoinState("connecting");
          setStatusMessage("Reconnecting to signaling server...");
          closePeer();
        });
      } catch (error) {
        setJoinState("error");
        setFatalError(
          error instanceof Error
            ? error.message
            : "Could not access camera or microphone. HTTPS or localhost is required.",
        );
      }
    };

    void setup();

    return () => {
      active = false;
      socketRef.current?.emit("leave");
      socketRef.current?.disconnect();
      stopTranscriptRecognition();
      closePeer();
      if (callTimerIntervalRef.current !== null) {
        window.clearInterval(callTimerIntervalRef.current);
        callTimerIntervalRef.current = null;
      }
      if (voiceIntervalRef.current !== null) {
        window.clearInterval(voiceIntervalRef.current);
        voiceIntervalRef.current = null;
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setLocalVoiceLevel(0);
      setRemoteVoiceLevel(0);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [
    role,
    serverUrl,
    stableMode,
    hasTurn,
    iceServers,
    ensurePeer,
    closePeer,
    emitMediaState,
    handleTranscriptMessage,
    stopTranscriptRecognition,
    updateTranscriptMessages,
  ]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    const nextMuted = !isMuted;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
    if (nextMuted) {
      setLocalVoiceLevel(0);
      socketRef.current?.emit("voice-level", { level: 0 });
    }
    emitMediaState(!nextMuted, !isVideoOff);
  }, [emitMediaState, isMuted, isVideoOff]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    const nextVideoOff = !isVideoOff;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);
    emitMediaState(!isMuted, !nextVideoOff);
  }, [emitMediaState, isMuted, isVideoOff]);

  const hangup = useCallback(() => {
    socketRef.current?.emit("leave");
    socketRef.current?.disconnect();
    socketRef.current = null;
    closePeer();
    if (voiceIntervalRef.current !== null) {
      window.clearInterval(voiceIntervalRef.current);
      voiceIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setLocalVoiceLevel(0);
    setRemoteVoiceLevel(0);
    callStartRef.current = null;
    setElapsedSeconds(0);
    setJoinState("waiting");
    setStatusMessage(
      "Call ended. Reopen your deterministic role link to rejoin.",
    );
    stopTranscriptRecognition();
  }, [closePeer, stopTranscriptRecognition]);

  const showCallPage = joinState === "ready" || joinState === "connected";

  const effectiveLocalLevel = isMuted ? 0 : localVoiceLevel;
  const effectiveRemoteLevel = remoteMicOn ? remoteVoiceLevel : 0;
  const localSpeaking =
    effectiveLocalLevel > voiceThreshold &&
    effectiveLocalLevel > effectiveRemoteLevel + voiceDelta;
  const remoteSpeaking =
    effectiveRemoteLevel > voiceThreshold &&
    effectiveRemoteLevel > effectiveLocalLevel + voiceDelta;

  useEffect(() => {
    if (joinState === "connected") {
      if (callStartRef.current === null) {
        callStartRef.current = Date.now();
      }
      if (callTimerIntervalRef.current === null) {
        callTimerIntervalRef.current = window.setInterval(() => {
          setElapsedSeconds((current) => {
            const start = callStartRef.current ?? Date.now();
            const next = Math.floor((Date.now() - start) / 1000);
            return next === current ? current : next;
          });
        }, 1000);
      }
      return;
    }

    if (callTimerIntervalRef.current !== null) {
      window.clearInterval(callTimerIntervalRef.current);
      callTimerIntervalRef.current = null;
    }
    if (joinState !== "ready") {
      callStartRef.current = null;
      setElapsedSeconds(0);
    }
  }, [joinState]);

  useEffect(() => {
    const shouldListen = showCallPage && !isMuted;
    transcriptShouldListenRef.current = shouldListen;

    if (shouldListen) {
      startTranscriptRecognition();
      return;
    }

    stopTranscriptRecognition();
  }, [isMuted, showCallPage, startTranscriptRecognition, stopTranscriptRecognition]);

  useEffect(() => {
    return () => {
      if (callTimerIntervalRef.current !== null) {
        window.clearInterval(callTimerIntervalRef.current);
        callTimerIntervalRef.current = null;
      }
      stopTranscriptRecognition();
    };
  }, [stopTranscriptRecognition]);

  const callDurationLabel = formatDuration(elapsedSeconds);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [showCallPage]);

  if (showCallPage && role) {
    return (
      <CallPage
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        remoteMicOn={remoteMicOn}
        remoteVideoOn={remoteVideoOn}
        localSpeaking={localSpeaking}
        remoteSpeaking={remoteSpeaking}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onHangup={hangup}
        localName={role === "alpha" ? "Alpha" : "Beta"}
        remoteName={role === "alpha" ? "Beta" : "Alpha"}
        callDurationLabel={callDurationLabel}
        transcript={transcriptMessages.map((message) => ({
          id: message.id,
          sender: message.sender,
          text: message.text,
          sourceLanguage: message.sourceLanguage,
          translationState: message.translationState,
          isSelf: message.isSelf,
        }))}
        spokenLanguage={spokenLanguage}
        transcriptLanguage={transcriptLanguage}
        transcriptStatus={transcriptStatus}
        transcriptError={transcriptError}
        onSpokenLanguageChange={setSpokenLanguage}
        onTranscriptLanguageChange={setTranscriptLanguage}
      />
    );
  }

  return (
    <main className="shell">
      <section className="card intro reveal">
        <p className="eyebrow">Join Role</p>
        <h1>Two-client WebRTC call</h1>
        <p className="lead">
          {role
            ? `You are ${role.toUpperCase()}.`
            : "Invalid route. Use /join/alpha or /join/beta."}
        </p>
        <p className="mono">Signaling: {serverUrl}</p>
        <p className="mono">
          Mode: {stableMode ? "Stable" : "Standard"}{" "}
          {stableMode && !hasTurn ? "(no TURN configured)" : ""}
        </p>
        <p className={`status status-${joinState}`}>{statusMessage}</p>
        {fatalError && <p className="error">{fatalError}</p>}
      </section>

      <section className="video-grid reveal delay-1">
        <article className="video-card">
          <h2>Your Camera</h2>
          <video ref={localVideoRef} autoPlay muted playsInline />
        </article>
        <article className="video-card">
          <h2>Peer Camera</h2>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </article>
      </section>
    </main>
  );
}

export default App;
