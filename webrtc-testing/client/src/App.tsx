import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import "./App.css";

type Role = "alpha" | "beta";
type SessionCreateResponse = {
  sessionId: string;
  alphaLink: string;
  betaLink: string;
  expiresInSeconds: number;
};

type JoinState = "idle" | "connecting" | "waiting" | "ready" | "connected" | "error";
type JoinConfig = {
  token: string | null;
  serverUrl: string;
  stableMode: boolean;
  turnUrls: string[];
  turnUsername: string;
  turnCredential: string;
};

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

function parseJoinConfig(): JoinConfig {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
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
    token: token && token.length > 0 ? token : null,
    serverUrl,
    stableMode,
    turnUrls,
    turnUsername,
    turnCredential,
  };
}

function createLocalJoinLink(serverJoinLink: string, config: Omit<JoinConfig, "token">): string {
  const parsed = new URL(serverJoinLink);
  const token = parsed.searchParams.get("token");
  if (!token) {
    return `${window.location.origin}/join`;
  }
  const params = new URLSearchParams();
  params.set("token", token);
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
  return `${window.location.origin}/join?${params.toString()}`;
}

function isJoinRoute(): boolean {
  return window.location.pathname.startsWith("/join");
}

function App() {
  return isJoinRoute() ? <JoinPage /> : <HomePage />;
}

function HomePage() {
  const [data, setData] = useState<SessionCreateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverInput, setServerInput] = useState(getStoredString(SERVER_URL_STORAGE_KEY, DEFAULT_SERVER_URL));
  const [activeServerUrl, setActiveServerUrl] = useState(
    getStoredString(SERVER_URL_STORAGE_KEY, DEFAULT_SERVER_URL),
  );
  const [stableMode, setStableMode] = useState(getStoredBool(STABLE_MODE_STORAGE_KEY, true));
  const [turnUrlsInput, setTurnUrlsInput] = useState(
    getStoredString(TURN_URLS_STORAGE_KEY, DEFAULT_TURN_URLS),
  );
  const [turnUsernameInput, setTurnUsernameInput] = useState(
    getStoredString(TURN_USERNAME_STORAGE_KEY, DEFAULT_TURN_USERNAME),
  );
  const [turnCredentialInput, setTurnCredentialInput] = useState(
    getStoredString(TURN_CREDENTIAL_STORAGE_KEY, DEFAULT_TURN_CREDENTIAL),
  );

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

  const createSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const normalizedServerUrl = normalizeServerUrl(activeServerUrl);
      const turnUrls = parseTurnUrls(turnUrlsInput);
      const response = await fetch(`${normalizedServerUrl}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to create session (${response.status})`);
      }
      const payload = (await response.json()) as SessionCreateResponse;
      const linkConfig: Omit<JoinConfig, "token"> = {
        serverUrl: normalizedServerUrl,
        stableMode,
        turnUrls,
        turnUsername: turnUsernameInput.trim(),
        turnCredential: turnCredentialInput.trim(),
      };
      setData({
        ...payload,
        alphaLink: createLocalJoinLink(payload.alphaLink, linkConfig),
        betaLink: createLocalJoinLink(payload.betaLink, linkConfig),
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <section className="card intro reveal">
        <p className="eyebrow">WebRTC Two-Role Demo</p>
        <h1>Role-based browser-to-browser video call</h1>
        <p className="lead">
          Create one session and share one link with Alpha and one with Beta. The signaling server
          enforces one participant per role.
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

        <button className="primary" onClick={createSession} disabled={loading}>
          {loading ? "Creating..." : "Create Session"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      {data && (
        <section className="card reveal delay-1">
          <h2>Session Ready</h2>
          <p className="mono">Session: {data.sessionId}</p>
          <div className="links">
            <article>
              <h3>Alpha Link</h3>
              <a href={data.alphaLink}>{data.alphaLink}</a>
            </article>
            <article>
              <h3>Beta Link</h3>
              <a href={data.betaLink}>{data.betaLink}</a>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}

function JoinPage() {
  const joinConfig = useMemo(() => parseJoinConfig(), []);
  const token = joinConfig.token;
  const serverUrl = joinConfig.serverUrl;
  const stableMode = joinConfig.stableMode;
  const hasTurn = joinConfig.turnUrls.length > 0;
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

  const [joinState, setJoinState] = useState<JoinState>(token ? "idle" : "error");
  const [statusMessage, setStatusMessage] = useState<string>(
    token ? "Open your camera to begin." : "Missing token in URL.",
  );
  const [role, setRole] = useState<Role | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef(false);
  const roleRef = useRef<Role | null>(null);

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
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
    if (!token) {
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
        setStatusMessage("Local media ready. Connecting to signaling server...");
        setJoinState("connecting");

        const socket = io(serverUrl, {
          autoConnect: true,
          auth: { token },
          reconnection: true,
          reconnectionAttempts: 5,
          transports: ["websocket"],
        });
        socketRef.current = socket;

        socket.on("joined", (payload: { role: Role; sessionId: string }) => {
          setRole(payload.role);
          roleRef.current = payload.role;
          setSessionId(payload.sessionId);
          setStatusMessage(`Joined as ${payload.role.toUpperCase()}.`);
          setJoinState("connecting");
          setFatalError(null);
        });

        socket.on("waiting", () => {
          setJoinState("waiting");
          setStatusMessage("Waiting for the other role to join...");
        });

        socket.on("peer-ready", async () => {
          setJoinState("ready");
          setStatusMessage("Peer ready. Negotiating connection...");
          const peer = ensurePeer();
          if (roleRef.current !== "alpha") {
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
          closePeer();
        });

        socket.on("signal-error", (payload: { code: string; message: string }) => {
          setJoinState("error");
          setFatalError(`${payload.code}: ${payload.message}`);
        });

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
      closePeer();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      roleRef.current = null;
    };
  }, [token, serverUrl, stableMode, hasTurn, iceServers, ensurePeer, closePeer]);

  return (
    <main className="shell">
      <section className="card intro reveal">
        <p className="eyebrow">Join Session</p>
        <h1>Two-client WebRTC call</h1>
        <p className="lead">
          {role ? `You are ${role.toUpperCase()} in session ${sessionId}.` : "Validating link..."}
        </p>
        <p className="mono">Signaling: {serverUrl}</p>
        <p className="mono">
          Mode: {stableMode ? "Stable" : "Standard"} {stableMode && !hasTurn ? "(no TURN configured)" : ""}
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
