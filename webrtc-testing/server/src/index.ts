import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { z } from "zod";

type Role = "alpha" | "beta";
type SocketContext = { role: Role };

const roleSchema = z.union([z.literal("alpha"), z.literal("beta")]);
const offerSchema = z.object({ sdp: z.string().min(1), type: z.literal("offer") });
const answerSchema = z.object({ sdp: z.string().min(1), type: z.literal("answer") });
const iceCandidateSchema = z.object({
  candidate: z.string(),
  sdpMid: z.string().nullable().optional(),
  sdpMLineIndex: z.number().nullable().optional(),
  usernameFragment: z.string().nullable().optional(),
});
const mediaStateSchema = z.object({
  micOn: z.boolean(),
  videoOn: z.boolean(),
});
const voiceLevelSchema = z.object({
  level: z.number().min(0).max(1),
});

const port = Number(process.env.PORT ?? 3000);
const allowedOrigin = process.env.CORS_ORIGIN ?? "*";

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

let alphaSocketId: string | undefined;
let betaSocketId: string | undefined;
let activeAt: number | undefined;
const socketContexts = new Map<string, SocketContext>();

function getSocketByRole(io: Server, role: Role): Socket | undefined {
  const socketId = role === "alpha" ? alphaSocketId : betaSocketId;
  return socketId ? io.sockets.sockets.get(socketId) : undefined;
}

function otherRole(role: Role): Role {
  return role === "alpha" ? "beta" : "alpha";
}

function safeEmitError(socket: Socket, code: string, message: string): void {
  socket.emit("signal-error", { code, message });
}

function occupancyStatus(): "empty" | "one_present" | "ready" | "active" {
  const hasAlpha = Boolean(alphaSocketId);
  const hasBeta = Boolean(betaSocketId);
  if (!hasAlpha && !hasBeta) {
    return "empty";
  }
  if (hasAlpha && hasBeta) {
    return activeAt ? "active" : "ready";
  }
  return "one_present";
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    status: occupancyStatus(),
    hasAlpha: Boolean(alphaSocketId),
    hasBeta: Boolean(betaSocketId),
  });
});

app.get("/status", rateLimit, (_req, res) => {
  res.json({
    status: occupancyStatus(),
    hasAlpha: Boolean(alphaSocketId),
    hasBeta: Boolean(betaSocketId),
    activeAt: activeAt ?? null,
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin === "*" ? true : allowedOrigin,
  },
});

const socketRateLog = new Map<string, number[]>();

io.use((socket, next) => {
  const ip = socket.handshake.address || "unknown";
  const now = Date.now();
  const windowed = (socketRateLog.get(ip) ?? []).filter((ts) => now - ts <= rateLimitWindowMs);
  if (windowed.length >= rateLimitMax) {
    next(new Error("too_many_socket_connections"));
    return;
  }
  windowed.push(now);
  socketRateLog.set(ip, windowed);

  const parsedRole = roleSchema.safeParse(socket.handshake.auth.role);
  if (!parsedRole.success) {
    next(new Error("invalid_role"));
    return;
  }
  const role = parsedRole.data;

  const occupantSocketId = role === "alpha" ? alphaSocketId : betaSocketId;
  if (occupantSocketId) {
    const occupant = io.sockets.sockets.get(occupantSocketId);
    if (occupant) {
      next(new Error(`role_occupied:${role}`));
      return;
    }
  }

  if (role === "alpha") {
    alphaSocketId = socket.id;
  } else {
    betaSocketId = socket.id;
  }
  socketContexts.set(socket.id, { role });
  socket.data.role = role;
  next();
});

io.on("connection", (socket) => {
  const context = socketContexts.get(socket.id);
  if (!context) {
    socket.disconnect(true);
    return;
  }

  const { role } = context;
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ event: "connected", role, socketId: socket.id }));

  socket.emit("joined", { role });
  const counterpart = getSocketByRole(io, otherRole(role));
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
    const target = getSocketByRole(io, otherRole(role));
    if (!target) {
      safeEmitError(socket, "peer_not_connected", "Peer is not connected");
      return;
    }
    activeAt = activeAt ?? Date.now();
    target.emit("offer", parsed.data);
  });

  socket.on("answer", (payload: unknown) => {
    const parsed = answerSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_answer_payload", "Answer payload is invalid");
      return;
    }
    const target = getSocketByRole(io, otherRole(role));
    if (!target) {
      safeEmitError(socket, "peer_not_connected", "Peer is not connected");
      return;
    }
    activeAt = activeAt ?? Date.now();
    target.emit("answer", parsed.data);
  });

  socket.on("ice-candidate", (payload: unknown) => {
    const parsed = iceCandidateSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_ice_payload", "ICE candidate payload is invalid");
      return;
    }
    const target = getSocketByRole(io, otherRole(role));
    if (!target) {
      return;
    }
    target.emit("ice-candidate", parsed.data);
  });

  socket.on("media-state", (payload: unknown) => {
    const parsed = mediaStateSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_media_state", "Media state payload is invalid");
      return;
    }
    const target = getSocketByRole(io, otherRole(role));
    if (!target) {
      return;
    }
    target.emit("peer-media-state", parsed.data);
  });

  socket.on("voice-level", (payload: unknown) => {
    const parsed = voiceLevelSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_voice_level", "Voice level payload is invalid");
      return;
    }
    const target = getSocketByRole(io, otherRole(role));
    if (!target) {
      return;
    }
    target.emit("peer-voice-level", parsed.data);
  });

  socket.on("leave", () => {
    socket.disconnect(true);
  });

  socket.on("disconnect", () => {
    const disconnectedContext = socketContexts.get(socket.id);
    if (!disconnectedContext) {
      return;
    }

    if (disconnectedContext.role === "alpha" && alphaSocketId === socket.id) {
      alphaSocketId = undefined;
    }
    if (disconnectedContext.role === "beta" && betaSocketId === socket.id) {
      betaSocketId = undefined;
    }
    if (!alphaSocketId && !betaSocketId) {
      activeAt = undefined;
    }

    const target = getSocketByRole(io, otherRole(disconnectedContext.role));
    if (target) {
      target.emit("peer-left", { role: disconnectedContext.role });
    }

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ event: "disconnected", role: disconnectedContext.role, socketId: socket.id }));
    socketContexts.delete(socket.id);
  });
});

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Signal server listening on http://localhost:${port}`);
});
