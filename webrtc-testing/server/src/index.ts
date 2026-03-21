import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

type Role = "alpha" | "beta";
type SessionStatus = "empty" | "one_present" | "ready" | "active" | "ended";

type Session = {
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  activeAt?: number;
  alphaSocketId?: string;
  betaSocketId?: string;
};

type SocketContext = {
  sessionId: string;
  role: Role;
};

const roleSchema = z.union([z.literal("alpha"), z.literal("beta")]);
const tokenPayloadSchema = z.object({
  sessionId: z.string().min(1),
  role: roleSchema,
  typ: z.literal("join"),
});

const offerSchema = z.object({
  sdp: z.string().min(1),
  type: z.literal("offer"),
});

const answerSchema = z.object({
  sdp: z.string().min(1),
  type: z.literal("answer"),
});

const iceCandidateSchema = z.object({
  candidate: z.string(),
  sdpMid: z.string().nullable().optional(),
  sdpMLineIndex: z.number().nullable().optional(),
  usernameFragment: z.string().nullable().optional(),
});

const sessions = new Map<string, Session>();
const socketContexts = new Map<string, SocketContext>();

const port = Number(process.env.PORT ?? 3000);
const clientBaseUrl = process.env.CLIENT_BASE_URL ?? "http://172.18.0.1:5173";
const tokenSecret = process.env.TOKEN_SECRET ?? "dev-only-secret-change-me";
const tokenTtlSeconds = Number(process.env.TOKEN_TTL_SECONDS ?? 60 * 60);
const sessionTtlMs = Number(process.env.SESSION_TTL_MS ?? 30 * 60 * 1000);
const allowedOrigin = process.env.CORS_ORIGIN ?? "*";

const encodedSecret = new TextEncoder().encode(tokenSecret);

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
  }),
);
app.use(express.json());

const rateLimitWindowMs = 60_000;
const rateLimitMax = 60;
const requestLog = new Map<string, number[]>();

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const timestamps = requestLog.get(key) ?? [];
  const recent = timestamps.filter((value) => now - value <= rateLimitWindowMs);
  if (recent.length >= rateLimitMax) {
    res.status(429).json({ error: "too_many_requests" });
    return;
  }
  recent.push(now);
  requestLog.set(key, recent);
  next();
}

function getSessionStatus(session: Session): SessionStatus {
  const hasAlpha = Boolean(session.alphaSocketId);
  const hasBeta = Boolean(session.betaSocketId);
  if (!hasAlpha && !hasBeta) {
    return "empty";
  }
  if (hasAlpha && hasBeta) {
    return session.activeAt ? "active" : "ready";
  }
  return "one_present";
}

function markUpdated(sessionId: string): Session {
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.updatedAt = Date.now();
    return existing;
  }
  const created: Session = {
    sessionId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.set(sessionId, created);
  return created;
}

async function signJoinToken(sessionId: string, role: Role): Promise<string> {
  return new SignJWT({ sessionId, role, typ: "join" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${tokenTtlSeconds}s`)
    .sign(encodedSecret);
}

async function verifyJoinToken(token: string): Promise<{ sessionId: string; role: Role }> {
  const { payload } = await jwtVerify(token, encodedSecret);
  const parsed = tokenPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("invalid_token_payload");
  }
  return { sessionId: parsed.data.sessionId, role: parsed.data.role };
}

function otherRole(role: Role): Role {
  return role === "alpha" ? "beta" : "alpha";
}

function getSocketByRole(session: Session, role: Role): Socket | undefined {
  const socketId = role === "alpha" ? session.alphaSocketId : session.betaSocketId;
  if (!socketId) {
    return undefined;
  }
  return io.sockets.sockets.get(socketId);
}

function safeEmitError(socket: Socket, code: string, message: string): void {
  socket.emit("signal-error", { code, message });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, sessions: sessions.size });
});

app.post("/sessions", rateLimit, async (_req, res) => {
  const sessionId = randomUUID();
  const session = markUpdated(sessionId);
  const alphaToken = await signJoinToken(session.sessionId, "alpha");
  const betaToken = await signJoinToken(session.sessionId, "beta");
  const alphaLink = `${clientBaseUrl}/join?token=${encodeURIComponent(alphaToken)}`;
  const betaLink = `${clientBaseUrl}/join?token=${encodeURIComponent(betaToken)}`;

  res.status(201).json({
    sessionId,
    alphaLink,
    betaLink,
    expiresInSeconds: tokenTtlSeconds,
  });
});

app.get("/sessions/:id", rateLimit, (req, res) => {
  const idParam = req.params.id;
  const sessionId = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!sessionId) {
    res.status(400).json({ error: "invalid_session_id" });
    return;
  }
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ error: "session_not_found" });
    return;
  }
  res.json({
    sessionId: session.sessionId,
    status: getSessionStatus(session),
    hasAlpha: Boolean(session.alphaSocketId),
    hasBeta: Boolean(session.betaSocketId),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    activeAt: session.activeAt ?? null,
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin === "*" ? true : allowedOrigin,
  },
});

const socketRateLog = new Map<string, number[]>();

io.use(async (socket, next) => {
  try {
    const ip = socket.handshake.address || "unknown";
    const now = Date.now();
    const windowed = (socketRateLog.get(ip) ?? []).filter((ts) => now - ts <= rateLimitWindowMs);
    if (windowed.length >= rateLimitMax) {
      next(new Error("too_many_socket_connections"));
      return;
    }
    windowed.push(now);
    socketRateLog.set(ip, windowed);

    const token = socket.handshake.auth.token;
    if (typeof token !== "string" || token.length === 0) {
      next(new Error("missing_join_token"));
      return;
    }
    const { sessionId, role } = await verifyJoinToken(token);
    const session = markUpdated(sessionId);
    const currentSocketId = role === "alpha" ? session.alphaSocketId : session.betaSocketId;
    if (currentSocketId) {
      const occupant = io.sockets.sockets.get(currentSocketId);
      if (occupant) {
        next(new Error(`role_occupied:${role}`));
        return;
      }
    }

    if (role === "alpha") {
      session.alphaSocketId = socket.id;
    } else {
      session.betaSocketId = socket.id;
    }
    session.updatedAt = Date.now();
    socketContexts.set(socket.id, { sessionId, role });
    socket.data.sessionId = sessionId;
    socket.data.role = role;
    next();
  } catch {
    next(new Error("invalid_join_token"));
  }
});

io.on("connection", (socket) => {
  const context = socketContexts.get(socket.id);
  if (!context) {
    socket.disconnect(true);
    return;
  }

  const { sessionId, role } = context;
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ event: "connected", sessionId, role, socketId: socket.id }));
  const session = sessions.get(sessionId);
  if (!session) {
    socket.disconnect(true);
    return;
  }

  socket.emit("joined", { sessionId, role });
  const counterpart = getSocketByRole(session, otherRole(role));
  if (counterpart) {
    socket.emit("peer-ready", {});
    counterpart.emit("peer-ready", {});
  } else {
    socket.emit("waiting", { message: "Waiting for the other role to connect" });
  }

  socket.on("offer", (payload: unknown) => {
    const parsed = offerSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_offer_payload", "Offer payload is invalid");
      return;
    }
    const currentSession = sessions.get(sessionId);
    if (!currentSession) {
      safeEmitError(socket, "session_not_found", "Session no longer exists");
      return;
    }
    const target = getSocketByRole(currentSession, otherRole(role));
    if (!target) {
      safeEmitError(socket, "peer_not_connected", "Peer is not connected");
      return;
    }
    currentSession.activeAt = currentSession.activeAt ?? Date.now();
    currentSession.updatedAt = Date.now();
    target.emit("offer", parsed.data);
  });

  socket.on("answer", (payload: unknown) => {
    const parsed = answerSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_answer_payload", "Answer payload is invalid");
      return;
    }
    const currentSession = sessions.get(sessionId);
    if (!currentSession) {
      safeEmitError(socket, "session_not_found", "Session no longer exists");
      return;
    }
    const target = getSocketByRole(currentSession, otherRole(role));
    if (!target) {
      safeEmitError(socket, "peer_not_connected", "Peer is not connected");
      return;
    }
    currentSession.activeAt = currentSession.activeAt ?? Date.now();
    currentSession.updatedAt = Date.now();
    target.emit("answer", parsed.data);
  });

  socket.on("ice-candidate", (payload: unknown) => {
    const parsed = iceCandidateSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_ice_payload", "ICE candidate payload is invalid");
      return;
    }
    const currentSession = sessions.get(sessionId);
    if (!currentSession) {
      safeEmitError(socket, "session_not_found", "Session no longer exists");
      return;
    }
    const target = getSocketByRole(currentSession, otherRole(role));
    if (!target) {
      return;
    }
    currentSession.updatedAt = Date.now();
    target.emit("ice-candidate", parsed.data);
  });

  socket.on("leave", () => {
    socket.disconnect(true);
  });

  socket.on("disconnect", () => {
    const disconnectedContext = socketContexts.get(socket.id);
    if (!disconnectedContext) {
      return;
    }
    const disconnectedSession = sessions.get(disconnectedContext.sessionId);
    if (!disconnectedSession) {
      socketContexts.delete(socket.id);
      return;
    }
    if (disconnectedContext.role === "alpha" && disconnectedSession.alphaSocketId === socket.id) {
      disconnectedSession.alphaSocketId = undefined;
    }
    if (disconnectedContext.role === "beta" && disconnectedSession.betaSocketId === socket.id) {
      disconnectedSession.betaSocketId = undefined;
    }
    disconnectedSession.updatedAt = Date.now();
    if (!disconnectedSession.alphaSocketId && !disconnectedSession.betaSocketId) {
      disconnectedSession.activeAt = undefined;
    }
    const target = getSocketByRole(disconnectedSession, otherRole(disconnectedContext.role));
    if (target) {
      target.emit("peer-left", { role: disconnectedContext.role });
    }
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        event: "disconnected",
        sessionId: disconnectedContext.sessionId,
        role: disconnectedContext.role,
        socketId: socket.id,
      }),
    );
    socketContexts.delete(socket.id);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.alphaSocketId || session.betaSocketId) {
      continue;
    }
    if (now - session.updatedAt > sessionTtlMs) {
      sessions.delete(sessionId);
    }
  }
}, 30_000).unref();

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Signal server listening on http://localhost:${port}`);
});
