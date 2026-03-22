import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { z } from "zod";
const authSchema = z.object({
    sessionId: z.string().min(1),
    role: z.union([
        z.literal("consultant"),
        z.literal("client"),
        z.literal("alpha"),
        z.literal("beta"),
    ]),
});
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
const transcriptSegmentSchema = z.object({
    id: z.string().min(1),
    sessionId: z.string().min(1),
    speakerRole: z.union([z.literal("consultant"), z.literal("client")]),
    speakerId: z.string().min(1),
    speakerName: z.string().min(1),
    sourceLanguage: z.string().min(1),
    targetLanguage: z.string().min(1),
    originalText: z.string().min(1),
    translatedText: z.string().min(1),
    timestamp: z.string().min(1),
    confidence: z.number().min(0).max(1),
    type: z.union([z.literal("speech"), z.literal("system"), z.literal("action")]),
});
const port = Number(process.env.PORT ?? 3001);
const allowedOrigin = process.env.CORS_ORIGIN ?? "*";
const app = express();
const httpServer = createServer(app);
app.use(cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
}));
app.use(express.json());
const rateLimitWindowMs = 60_000;
const rateLimitMax = 60;
const requestLog = new Map();
const rooms = new Map();
const socketContexts = new Map();
function rateLimit(req, res, next) {
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
function normalizeRole(role) {
    if (role === "alpha") {
        return "consultant";
    }
    if (role === "beta") {
        return "client";
    }
    return role;
}
function otherRole(role) {
    return role === "consultant" ? "client" : "consultant";
}
function safeEmitError(socket, code, message) {
    socket.emit("signal-error", { code, message });
}
function getRoom(sessionId) {
    const room = rooms.get(sessionId);
    if (room) {
        return room;
    }
    const nextRoom = {};
    rooms.set(sessionId, nextRoom);
    return nextRoom;
}
function getSocketByRole(io, sessionId, role) {
    const room = rooms.get(sessionId);
    const socketId = room?.[role];
    return socketId ? io.sockets.sockets.get(socketId) : undefined;
}
function roomStatus(room) {
    const hasConsultant = Boolean(room.consultant);
    const hasClient = Boolean(room.client);
    if (!hasConsultant && !hasClient) {
        return "empty";
    }
    if (hasConsultant && hasClient) {
        return room.activeAt ? "active" : "ready";
    }
    return "one_present";
}
function pruneStaleRole(sessionId, role, io) {
    const room = rooms.get(sessionId);
    if (!room) {
        return;
    }
    const socketId = room[role];
    if (!socketId) {
        return;
    }
    if (!io.sockets.sockets.has(socketId)) {
        delete room[role];
    }
    if (!room.consultant && !room.client) {
        rooms.delete(sessionId);
    }
}
function getRoomSnapshots() {
    return Array.from(rooms.entries())
        .map(([sessionId, room]) => ({
        sessionId,
        consultant: Boolean(room.consultant),
        client: Boolean(room.client),
        activeAt: room.activeAt ?? null,
        status: roomStatus(room),
    }))
        .sort((left, right) => left.sessionId.localeCompare(right.sessionId));
}
function aggregateStatus() {
    const snapshots = getRoomSnapshots();
    if (snapshots.length === 0) {
        return "empty";
    }
    if (snapshots.some((snapshot) => snapshot.status === "active")) {
        return "active";
    }
    if (snapshots.some((snapshot) => snapshot.status === "ready")) {
        return "ready";
    }
    return "one_present";
}
app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        status: aggregateStatus(),
        roomCount: rooms.size,
        rooms: getRoomSnapshots(),
    });
});
app.get("/status", rateLimit, (_req, res) => {
    res.json({
        status: aggregateStatus(),
        roomCount: rooms.size,
        rooms: getRoomSnapshots(),
    });
});
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigin === "*" ? true : allowedOrigin,
    },
});
const socketRateLog = new Map();
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
    const parsedAuth = authSchema.safeParse(socket.handshake.auth);
    if (!parsedAuth.success) {
        next(new Error("invalid_session_or_role"));
        return;
    }
    const sessionId = parsedAuth.data.sessionId.trim();
    const role = normalizeRole(parsedAuth.data.role);
    const room = getRoom(sessionId);
    pruneStaleRole(sessionId, role, io);
    if (room[role]) {
        next(new Error(`role_occupied:${role}`));
        return;
    }
    room[role] = socket.id;
    socketContexts.set(socket.id, { sessionId, role });
    socket.data.sessionId = sessionId;
    socket.data.role = role;
    next();
});
io.on("connection", (socket) => {
    const context = socketContexts.get(socket.id);
    if (!context) {
        socket.disconnect(true);
        return;
    }
    const { sessionId, role } = context;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ event: "connected", role, sessionId, socketId: socket.id }));
    socket.emit("joined", { sessionId, role });
    const counterpart = getSocketByRole(io, sessionId, otherRole(role));
    if (counterpart) {
        socket.emit("peer-ready", { sessionId, role });
        counterpart.emit("peer-ready", { sessionId, role: otherRole(role) });
    }
    else {
        socket.emit("waiting", {
            sessionId,
            message: "Waiting for the other role to connect",
        });
    }
    socket.on("offer", (payload) => {
        const parsed = offerSchema.safeParse(payload);
        if (!parsed.success) {
            safeEmitError(socket, "bad_offer_payload", "Offer payload is invalid");
            return;
        }
        const target = getSocketByRole(io, sessionId, otherRole(role));
        if (!target) {
            safeEmitError(socket, "peer_not_connected", "Peer is not connected");
            return;
        }
        const room = getRoom(sessionId);
        room.activeAt = room.activeAt ?? Date.now();
        target.emit("offer", parsed.data);
    });
    socket.on("answer", (payload) => {
        const parsed = answerSchema.safeParse(payload);
        if (!parsed.success) {
            safeEmitError(socket, "bad_answer_payload", "Answer payload is invalid");
            return;
        }
        const target = getSocketByRole(io, sessionId, otherRole(role));
        if (!target) {
            safeEmitError(socket, "peer_not_connected", "Peer is not connected");
            return;
        }
        const room = getRoom(sessionId);
        room.activeAt = room.activeAt ?? Date.now();
        target.emit("answer", parsed.data);
    });
    socket.on("ice-candidate", (payload) => {
        const parsed = iceCandidateSchema.safeParse(payload);
        if (!parsed.success) {
            safeEmitError(socket, "bad_ice_payload", "ICE candidate payload is invalid");
            return;
        }
        const target = getSocketByRole(io, sessionId, otherRole(role));
        if (!target) {
            return;
        }
        target.emit("ice-candidate", parsed.data);
    });
    socket.on("media-state", (payload) => {
        const parsed = mediaStateSchema.safeParse(payload);
        if (!parsed.success) {
            safeEmitError(socket, "bad_media_state", "Media state payload is invalid");
            return;
        }
        const target = getSocketByRole(io, sessionId, otherRole(role));
        if (!target) {
            return;
        }
        target.emit("peer-media-state", parsed.data);
    });
    socket.on("voice-level", (payload) => {
        const parsed = voiceLevelSchema.safeParse(payload);
        if (!parsed.success) {
            safeEmitError(socket, "bad_voice_level", "Voice level payload is invalid");
            return;
        }
        const target = getSocketByRole(io, sessionId, otherRole(role));
        if (!target) {
            return;
        }
        target.emit("peer-voice-level", parsed.data);
    });
    socket.on("transcript-segment", (payload) => {
        const parsed = transcriptSegmentSchema.safeParse(payload);
        if (!parsed.success) {
            safeEmitError(socket, "bad_transcript_segment_payload", "Transcript segment payload is invalid");
            return;
        }
        socket.emit("transcript-segment", parsed.data);
        const target = getSocketByRole(io, sessionId, otherRole(role));
        if (!target) {
            return;
        }
        target.emit("transcript-segment", parsed.data);
    });
    socket.on("leave", () => {
        socket.disconnect(true);
    });
    socket.on("disconnect", () => {
        const disconnectedContext = socketContexts.get(socket.id);
        if (!disconnectedContext) {
            return;
        }
        const room = rooms.get(disconnectedContext.sessionId);
        if (room && room[disconnectedContext.role] === socket.id) {
            delete room[disconnectedContext.role];
        }
        if (room && !room.consultant && !room.client) {
            rooms.delete(disconnectedContext.sessionId);
        }
        const target = getSocketByRole(io, disconnectedContext.sessionId, otherRole(disconnectedContext.role));
        if (target) {
            target.emit("peer-left", {
                sessionId: disconnectedContext.sessionId,
                role: disconnectedContext.role,
            });
        }
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({
            event: "disconnected",
            role: disconnectedContext.role,
            sessionId: disconnectedContext.sessionId,
            socketId: socket.id,
        }));
        socketContexts.delete(socket.id);
    });
});
httpServer.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Signal server listening on http://localhost:${port}`);
});
