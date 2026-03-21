import { useEffect, useMemo, useRef, useState } from "react";
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

const DEFAULT_SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";
const SERVER_URL_STORAGE_KEY = "webrtcDemoServerUrl";
const iceServers: RTCIceServer[] = [
  {
    urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
  },
];

function normalizeServerUrl(value: string): string {
  const parsed = new URL(value.trim());
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function getStoredServerUrl(): string {
  const stored = window.localStorage.getItem(SERVER_URL_STORAGE_KEY);
  return stored && stored.length > 0 ? stored : DEFAULT_SERVER_URL;
}

function parseJoinConfig(): { token: string | null; serverUrl: string } {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const serverFromQuery = params.get("server");
  const serverUrl = serverFromQuery && serverFromQuery.length > 0 ? serverFromQuery : getStoredServerUrl();
  return {
    token: token && token.length > 0 ? token : null,
    serverUrl,
  };
}

function createLocalJoinLink(serverJoinLink: string, serverUrl: string): string {
  const parsed = new URL(serverJoinLink);
  const token = parsed.searchParams.get("token");
  if (!token) {
    return `${window.location.origin}/join`;
  }
  const params = new URLSearchParams();
  params.set("token", token);
  params.set("server", serverUrl);
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
  const [serverInput, setServerInput] = useState(getStoredServerUrl());
  const [activeServerUrl, setActiveServerUrl] = useState(getStoredServerUrl());

  const saveServerUrl = () => {
    try {
      const normalized = normalizeServerUrl(serverInput);
      window.localStorage.setItem(SERVER_URL_STORAGE_KEY, normalized);
      setActiveServerUrl(normalized);
      setServerInput(normalized);
      setError(null);
    } catch {
      setError("Server URL is invalid. Example: https://your-tunnel.ngrok-free.app");
    }
  };

  const createSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const normalizedServerUrl = normalizeServerUrl(activeServerUrl);
      const response = await fetch(`${normalizedServerUrl}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to create session (${response.status})`);
      }
      const payload = (await response.json()) as SessionCreateResponse;
      setData({
        ...payload,
        alphaLink: createLocalJoinLink(payload.alphaLink, normalizedServerUrl),
        betaLink: createLocalJoinLink(payload.betaLink, normalizedServerUrl),
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
          Create one session and share one link with Alpha and one with Beta. The signaling
          server enforces one participant per role.
        </p>
        <div className="server-controls">
          <label htmlFor="server-url">Signaling Server URL</label>
          <div className="server-row">
            <input
              id="server-url"
              value={serverInput}
              onChange={(event) => setServerInput(event.target.value)}
              placeholder="https://your-tunnel.ngrok-free.app"
            />
            <button className="secondary" onClick={saveServerUrl} type="button">
              Save
            </button>
          </div>
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

  const ensurePeer = () => {
    if (peerRef.current) {
      return peerRef.current;
    }
    const peer = new RTCPeerConnection({ iceServers });
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
        peer.addTrack(track, stream);
      }
    }
    peerRef.current = peer;
    return peer;
  };

  const closePeer = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    pendingIceRef.current = [];
  };

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

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
  }, [token, serverUrl]);

  return (
    <main className="shell">
      <section className="card intro reveal">
        <p className="eyebrow">Join Session</p>
        <h1>Two-client WebRTC call</h1>
        <p className="lead">
          {role ? `You are ${role.toUpperCase()} in session ${sessionId}.` : "Validating link..."}
        </p>
        <p className="mono">Signaling: {serverUrl}</p>
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
