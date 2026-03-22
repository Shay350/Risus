import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import CallPage from "./CallPage";
import PreCallScreen from "./components/PreCallScreen";
import PostCallScreen from "./components/PostCallScreen";
import SelfReconnectScreen from "./components/SelfReconnectScreen";

type Role = "alpha" | "beta";
type JoinConfig = {
  role: Role | null;
  serverUrl: string;
  stableMode: boolean;
  turnUrls: string[];
  turnUsername: string;
  turnCredential: string;
};
type UiState = "pre_call" | "active" | "peer_reconnecting" | "self_reconnecting" | "post_call";
type PreCallBusyState = "idle" | "joining" | "waiting";

const DEFAULT_SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";
const SERVER_URL_STORAGE_KEY = "webrtcDemoServerUrl";
const STABLE_MODE_STORAGE_KEY = "webrtcDemoStableMode";
const TURN_URLS_STORAGE_KEY = "webrtcDemoTurnUrls";
const TURN_USERNAME_STORAGE_KEY = "webrtcDemoTurnUsername";
const TURN_CREDENTIAL_STORAGE_KEY = "webrtcDemoTurnCredential";
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

function createDeterministicJoinLink(role: Role, config: Omit<JoinConfig, "role">): string {
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
  const [serverInput, setServerInput] = useState(getStoredString(SERVER_URL_STORAGE_KEY, DEFAULT_SERVER_URL));
  const [activeServerUrl, setActiveServerUrl] = useState(
    getStoredString(SERVER_URL_STORAGE_KEY, DEFAULT_SERVER_URL),
  );
  const [stableMode, setStableMode] = useState(getStoredBool(STABLE_MODE_STORAGE_KEY, true));
  const [turnUrlsInput, setTurnUrlsInput] = useState(getStoredString(TURN_URLS_STORAGE_KEY, DEFAULT_TURN_URLS));
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
  }, [activeServerUrl, stableMode, turnCredentialInput, turnUrlsInput, turnUsernameInput]);

  const saveConnectionSettings = () => {
    try {
      const normalized = normalizeServerUrl(serverInput);
      window.localStorage.setItem(SERVER_URL_STORAGE_KEY, normalized);
      window.localStorage.setItem(STABLE_MODE_STORAGE_KEY, stableMode ? "1" : "0");
      window.localStorage.setItem(TURN_URLS_STORAGE_KEY, turnUrlsInput.trim());
      window.localStorage.setItem(TURN_USERNAME_STORAGE_KEY, turnUsernameInput.trim());
      window.localStorage.setItem(TURN_CREDENTIAL_STORAGE_KEY, turnCredentialInput.trim());
      setActiveServerUrl(normalized);
      setServerInput(normalized);
      setError(null);
    } catch {
      setError("Settings are invalid. Example URL: https://your-tunnel.trycloudflare.com");
    }
  };

  return (
    <main className="shell">
      <section className="card intro reveal">
        <p className="eyebrow">WebRTC Two-Role Demo</p>
        <h1>Deterministic role links</h1>
        <p className="lead">
          This demo has fixed links only: one for Alpha and one for Beta. No sessions, no per-click token generation.
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
            <input type="checkbox" checked={stableMode} onChange={(event) => setStableMode(event.target.checked)} />
            Demo stable mode (lower video quality, prefer TURN relay)
          </label>
          <label htmlFor="turn-urls">TURN URLs (comma-separated, optional)</label>
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
          <button className="secondary" onClick={saveConnectionSettings} type="button">
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
  const maxReconnectAttempts = 8;

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
  }, [hasTurn, joinConfig.turnCredential, joinConfig.turnUrls, joinConfig.turnUsername]);

  const [statusMessage, setStatusMessage] = useState(
    role ? "Check your camera and microphone, then start." : "Invalid route. Use /join/alpha or /join/beta.",
  );
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [localVoiceLevel, setLocalVoiceLevel] = useState(0);
  const [remoteVoiceLevel, setRemoteVoiceLevel] = useState(0);
  const [micSamples, setMicSamples] = useState<number[]>(Array.from({ length: 20 }, () => 0));
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [endedDurationLabel, setEndedDurationLabel] = useState("00:00:00");
  const [uiState, setUiState] = useState<UiState>("pre_call");
  const [preCallBusyState, setPreCallBusyState] = useState<PreCallBusyState>("idle");
  const [reconnectAttempt, setReconnectAttempt] = useState(1);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceIntervalRef = useRef<number | null>(null);
  const callTimerIntervalRef = useRef<number | null>(null);
  const callStartRef = useRef<number | null>(null);
  const elapsedSecondsRef = useRef(0);
  const isMutedRef = useRef(false);
  const isVideoOffRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef(false);
  const hasStartedCallRef = useRef(false);
  const hasBeenActiveRef = useRef(false);
  const isEndingCallRef = useRef(false);
  const isPostCallRef = useRef(false);

  const emitMediaState = useCallback((micOn: boolean, videoOn: boolean) => {
    socketRef.current?.emit("media-state", { micOn, videoOn });
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isVideoOffRef.current = isVideoOff;
  }, [isVideoOff]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    isPostCallRef.current = uiState === "post_call";
  }, [uiState]);

  const cleanupRealtimePipelines = useCallback(() => {
    if (voiceIntervalRef.current !== null) {
      window.clearInterval(voiceIntervalRef.current);
      voiceIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (callTimerIntervalRef.current !== null) {
      window.clearInterval(callTimerIntervalRef.current);
      callTimerIntervalRef.current = null;
    }
  }, []);

  const disconnectSocket = useCallback(() => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.emit("leave");
    socketRef.current.disconnect();
    socketRef.current = null;
  }, []);

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    remoteStreamRef.current = null;
    pendingIceRef.current = [];
    setRemoteMicOn(true);
    setRemoteVideoOn(false);
    setRemoteVoiceLevel(0);
    setMicSamples(Array.from({ length: 20 }, () => 0));
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
      const current = peerRef.current;
      if (!current) {
        return;
      }
      if (current.connectionState === "connected") {
        setUiState("active");
        setStatusMessage("Peer connected.");
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

  const initializeMediaPipelines = useCallback(() => {
    if (!localStreamRef.current || audioContextRef.current) {
      return;
    }
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(localStreamRef.current);
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
      const level = isMutedRef.current ? 0 : Math.min(1, smoothedLevel * 7.5);
      setLocalVoiceLevel(level);
      socketRef.current?.emit("voice-level", { level });
    }, 120);
  }, []);

  const changeAudioDevice = useCallback(async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    if (!localStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false,
      });
      const newAudioTrack = stream.getAudioTracks()[0];
      if (!newAudioTrack) return;

      const oldTrack = localStreamRef.current.getAudioTracks()[0];
      if (oldTrack) {
        localStreamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
      }

      newAudioTrack.enabled = !isMutedRef.current;
      localStreamRef.current.addTrack(newAudioTrack);

      if (peerRef.current) {
        const sender = peerRef.current.getSenders().find((s) => s.track?.kind === "audio");
        if (sender) {
          sender.replaceTrack(newAudioTrack).catch(() => {});
        }
      }

      if (audioContextRef.current) {
        if (voiceIntervalRef.current !== null) {
          window.clearInterval(voiceIntervalRef.current);
          voiceIntervalRef.current = null;
        }
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
      initializeMediaPipelines();
    } catch (error) {
      console.error("Failed to switch audio device", error);
    }
  }, [initializeMediaPipelines]);

  const startCall = useCallback(async () => {
    if (!role || socketRef.current) {
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access requires HTTPS or localhost.");
      }
      if (!localStreamRef.current) {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: stableMode
            ? {
                width: { ideal: 640, max: 960 },
                height: { ideal: 360, max: 540 },
                frameRate: { ideal: 15, max: 20 },
              }
            : true,
          audio: true,
        });
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      initializeMediaPipelines();
      setUiState("pre_call");
      setPreCallBusyState("joining");
      setStatusMessage("Connecting to signaling server...");

      const socket = io(serverUrl, {
        autoConnect: true,
        auth: { role },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 800,
        reconnectionDelayMax: 2500,
        transports: ["websocket"],
      });
      socketRef.current = socket;
      hasStartedCallRef.current = true;

      socket.on("joined", (payload: { role: Role }) => {
        setStatusMessage(`Joined as ${payload.role.toUpperCase()}.`);
        setFatalError(null);
        setReconnectAttempt(1);
        setUiState("pre_call");
        setPreCallBusyState("joining");
        setIsMuted(false);
        setIsVideoOff(false);
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = true));
          localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = true));
        }
        isMutedRef.current = false;
        isVideoOffRef.current = false;
        emitMediaState(true, true);
      });

      socket.on("waiting", () => {
        if (isEndingCallRef.current || isPostCallRef.current) {
          return;
        }
        setUiState("pre_call");
        setPreCallBusyState("waiting");
        setStatusMessage("Waiting for the other role to join...");
      });

      socket.on("peer-ready", async () => {
        if (isEndingCallRef.current || isPostCallRef.current) {
          return;
        }
        setUiState("active");
        setPreCallBusyState("idle");
        hasBeenActiveRef.current = true;
        setStatusMessage("Peer ready. Negotiating connection...");
        emitMediaState(!isMutedRef.current, !isVideoOffRef.current);
        const peer = ensurePeer();
        if (role !== "alpha" || makingOfferRef.current) {
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
        if (isEndingCallRef.current || isPostCallRef.current) {
          return;
        }
        if (hasBeenActiveRef.current) {
          setUiState("peer_reconnecting");
          setStatusMessage("Peer disconnected. Waiting for them to return...");
        } else {
          setUiState("pre_call");
          setPreCallBusyState("waiting");
          setStatusMessage("Waiting for the other role to join...");
        }
      });

      socket.on("call-ended", () => {
        isEndingCallRef.current = true;
        setEndedDurationLabel(formatDuration(elapsedSecondsRef.current));
        setStatusMessage("The other participant ended the call.");
        hasBeenActiveRef.current = false;
        disconnectSocket();
        closePeer();
        cleanupRealtimePipelines();
        callStartRef.current = null;
        setElapsedSeconds(0);
        setUiState("post_call");
        setPreCallBusyState("idle");
      });

      socket.on("peer-media-state", (payload: { micOn: boolean; videoOn: boolean }) => {
        setRemoteMicOn(payload.micOn);
        setRemoteVideoOn(payload.videoOn);
        if (!payload.micOn) {
          setRemoteVoiceLevel(0);
        }
      });

      socket.on("peer-voice-level", (payload: { level: number }) => {
        const next = Number.isFinite(payload.level) ? Math.max(0, Math.min(1, payload.level)) : 0;
        setRemoteVoiceLevel(next);
      });

      socket.on("signal-error", (payload: { code: string; message: string }) => {
        if (isEndingCallRef.current || isPostCallRef.current) {
          return;
        }
        setFatalError(`${payload.code}: ${payload.message}`);
        setPreCallBusyState("idle");
      });

      socket.io.on("reconnect_attempt", (attempt) => {
        if (isEndingCallRef.current || isPostCallRef.current) {
          return;
        }
        setUiState("self_reconnecting");
        setReconnectAttempt(attempt);
      });

      socket.io.on("reconnect_failed", () => {
        if (isEndingCallRef.current || isPostCallRef.current) {
          return;
        }
        setFatalError("Could not reconnect. You can retry or leave.");
      });

      socket.on("disconnect", (reason) => {
        if (reason === "io client disconnect") {
          return;
        }
        if (isEndingCallRef.current || isPostCallRef.current) {
          return;
        }
        if (hasBeenActiveRef.current) {
          setUiState("self_reconnecting");
        } else {
          setUiState("pre_call");
          setPreCallBusyState("joining");
        }
      });
    } catch (error) {
      setUiState("pre_call");
      setPreCallBusyState("idle");
      setFatalError(error instanceof Error ? error.message : "Failed to start call.");
    }
  }, [
    cleanupRealtimePipelines,
    closePeer,
    disconnectSocket,
    emitMediaState,
    ensurePeer,
    initializeMediaPipelines,
    role,
    serverUrl,
    stableMode,
  ]);

  useEffect(() => {
    if (!role) {
      return;
    }
    let active = true;
    const initPreview = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access requires HTTPS or localhost.");
        }
        if (!localStreamRef.current) {
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: stableMode
              ? {
                  width: { ideal: 640, max: 960 },
                  height: { ideal: 360, max: 540 },
                  frameRate: { ideal: 15, max: 20 },
                }
              : true,
            audio: true,
          });
        }
        if (!active) {
          return;
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        initializeMediaPipelines();
        setPreCallBusyState((current) => (current === "joining" ? "joining" : "idle"));
      } catch (error) {
        setFatalError(error instanceof Error ? error.message : "Failed to initialize preview.");
        setPreCallBusyState("idle");
      }
    };
    void initPreview();
    return () => {
      active = false;
      disconnectSocket();
      closePeer();
      cleanupRealtimePipelines();
      isEndingCallRef.current = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [closePeer, cleanupRealtimePipelines, disconnectSocket, initializeMediaPipelines, role, stableMode]);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setAudioDevices((prev) => {
          if (prev.length !== audioInputs.length) return audioInputs;
          const isSame = prev.every((p, i) => p.deviceId === audioInputs[i].deviceId && p.label === audioInputs[i].label);
          return isSame ? prev : audioInputs;
        });
      } catch {
        // ignore
      }
    };
    void fetchDevices();
    const intervalId = window.setInterval(fetchDevices, 2000);
    return () => window.clearInterval(intervalId);
  }, []);

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
    setEndedDurationLabel(formatDuration(elapsedSecondsRef.current));
    isEndingCallRef.current = true;
    socketRef.current?.emit("end-call", {});
    window.setTimeout(() => {
      disconnectSocket();
      closePeer();
      cleanupRealtimePipelines();
    }, 100);
    hasBeenActiveRef.current = false;
    callStartRef.current = null;
    setElapsedSeconds(0);
    setUiState("post_call");
    setPreCallBusyState("idle");
    setStatusMessage("Call ended.");
  }, [cleanupRealtimePipelines, closePeer, disconnectSocket]);

  useEffect(() => {
    if (uiState === "active") {
      if (callStartRef.current === null) {
        callStartRef.current = Date.now();
      }
      hasBeenActiveRef.current = true;
      if (callTimerIntervalRef.current === null) {
        callTimerIntervalRef.current = window.setInterval(() => {
          const start = callStartRef.current ?? Date.now();
          setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
        }, 1000);
      }
      return;
    }
    if (callTimerIntervalRef.current !== null) {
      window.clearInterval(callTimerIntervalRef.current);
      callTimerIntervalRef.current = null;
    }
  }, [uiState]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [uiState]);

  useEffect(() => {
    if (!audioContextRef.current || !localStreamRef.current) {
      return;
    }
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.55;
    const source = audioContextRef.current.createMediaStreamSource(localStreamRef.current);
    source.connect(analyser);
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const meterId = window.setInterval(() => {
      analyser.getByteFrequencyData(bins);
      const next = Array.from({ length: 20 }, (_, index) => {
        const from = Math.floor((index / 20) * bins.length);
        const to = Math.floor(((index + 1) / 20) * bins.length);
        let sum = 0;
        let count = 0;
        for (let i = from; i < to; i += 1) {
          sum += bins[i] ?? 0;
          count += 1;
        }
        const avg = count > 0 ? sum / count : 0;
        const normalized = Math.max(0, (avg - 10) / 95);
        return isMutedRef.current ? 0 : Math.min(1, normalized);
      });
      setMicSamples(next);
    }, 90);

    return () => {
      window.clearInterval(meterId);
      source.disconnect();
      analyser.disconnect();
      setMicSamples(Array.from({ length: 20 }, () => 0));
    };
  }, [uiState]);

  const effectiveLocalLevel = isMuted ? 0 : localVoiceLevel;
  const effectiveRemoteLevel = remoteMicOn ? remoteVoiceLevel : 0;
  const localSpeaking =
    effectiveLocalLevel > voiceThreshold && effectiveLocalLevel > effectiveRemoteLevel + voiceDelta;
  const remoteSpeaking =
    effectiveRemoteLevel > voiceThreshold && effectiveRemoteLevel > effectiveLocalLevel + voiceDelta;
  const callDurationLabel = formatDuration(elapsedSeconds);

  const handleRetryNow = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  const handleReturnHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  const handleStartCall = useCallback(() => {
    void startCall();
  }, [startCall]);

  if (!role) {
    return (
      <main className="shell">
        <section className="card intro reveal">
          <h1>Invalid route</h1>
          <p className="lead">Use /join/alpha or /join/beta.</p>
        </section>
      </main>
    );
  }

  if (uiState === "post_call") {
    return (
      <PostCallScreen
        role={role}
        durationLabel={endedDurationLabel}
        onRejoin={() => {
          isEndingCallRef.current = false;
          setUiState("pre_call");
          setPreCallBusyState("idle");
          hasBeenActiveRef.current = false;
          setFatalError(null);
        }}
        onReturnHome={handleReturnHome}
      />
    );
  }

  if (uiState === "self_reconnecting" && hasBeenActiveRef.current && hasStartedCallRef.current) {
    return (
      <SelfReconnectScreen
        attempt={reconnectAttempt}
        maxAttempts={maxReconnectAttempts}
        onRetryNow={handleRetryNow}
        onLeave={hangup}
      />
    );
  }

  if (uiState === "pre_call") {
    return (
      <PreCallScreen
        localVideoRef={localVideoRef}
        role={role}
        micSamples={micSamples}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        statusMessage={fatalError ?? statusMessage}
        busyState={preCallBusyState}
        audioDevices={audioDevices}
        selectedAudioDevice={selectedAudioDevice}
        onChangeAudioDevice={changeAudioDevice}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onStartCall={handleStartCall}
        startDisabled={Boolean(fatalError) || preCallBusyState !== "idle"}
      />
    );
  }

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
      peerReconnecting={uiState === "peer_reconnecting"}
      onToggleMute={toggleMute}
      onToggleVideo={toggleVideo}
      onHangup={hangup}
      localName={role === "alpha" ? "Alpha" : "Beta"}
      remoteName={role === "alpha" ? "Beta" : "Alpha"}
      callDurationLabel={callDurationLabel}
    />
  );
}

export default App;
