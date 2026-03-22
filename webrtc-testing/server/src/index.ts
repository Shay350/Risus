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
const transcriptMessageSchema = z.object({
  id: z.string().min(1),
  senderName: z.string().min(1).max(80),
  text: z.string().min(1).max(2_000),
  sourceLanguage: z.string().min(2).max(16),
  createdAt: z.string().min(1),
});
const translateRequestSchema = z.object({
  text: z.string().min(1).max(4_000),
  sourceLang: z.string().min(2).max(16),
  targetLang: z.string().min(2).max(16),
});

const LANGUAGE_NAMES: Record<string, string> = {
  af: "Afrikaans", sq: "Albanian", am: "Amharic", ar: "Arabic", hy: "Armenian",
  az: "Azerbaijani", ba: "Bashkir", eu: "Basque", be: "Belarusian", bn: "Bengali",
  bs: "Bosnian", br: "Breton", bg: "Bulgarian", my: "Burmese", ca: "Catalan",
  zh: "Chinese (Mandarin)", hr: "Croatian", cs: "Czech", da: "Danish", nl: "Dutch",
  en: "English", et: "Estonian", fo: "Faroese", fi: "Finnish", fr: "French",
  gl: "Galician", ka: "Georgian", de: "German", el: "Greek", gu: "Gujarati",
  ht: "Haitian Creole", ha: "Hausa", he: "Hebrew", hi: "Hindi", hu: "Hungarian",
  is: "Icelandic", id: "Indonesian", it: "Italian", ja: "Japanese", jw: "Javanese",
  kn: "Kannada", kk: "Kazakh", km: "Khmer", ko: "Korean", lo: "Lao",
  lv: "Latvian", ln: "Lingala", lt: "Lithuanian", lb: "Luxembourgish", mk: "Macedonian",
  mg: "Malagasy", ms: "Malay", ml: "Malayalam", mt: "Maltese", mi: "Maori",
  mr: "Marathi", mn: "Mongolian", ne: "Nepali", no: "Norwegian", oc: "Occitan",
  ps: "Pashto", fa: "Persian", pl: "Polish", pt: "Portuguese", pa: "Punjabi",
  ro: "Romanian", ru: "Russian", sa: "Sanskrit", sr: "Serbian", nso: "Sepedi",
  si: "Sinhala", sk: "Slovak", sl: "Slovenian", so: "Somali", es: "Spanish",
  su: "Sundanese", sw: "Swahili", sv: "Swedish", tl: "Tagalog", tg: "Tajik",
  ta: "Tamil", tt: "Tatar", te: "Telugu", th: "Thai", tr: "Turkish",
  tk: "Turkmen", uk: "Ukrainian", ur: "Urdu", uz: "Uzbek", vi: "Vietnamese",
  cy: "Welsh", yo: "Yoruba", zu: "Zulu",
};

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

function languageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? code;
}

async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  if (sourceLang === targetLang) {
    return text;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                `You are a professional interpreter. Translate the user's text from ${languageName(sourceLang)} ` +
                `to ${languageName(targetLang)}. Return only the translation with no notes or quotation marks.`,
            },
          ],
        },
        contents: [
          {
            parts: [{ text }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Translation failed");
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };
  const translation = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!translation) {
    throw new Error("Translation response was empty");
  }

  return translation;
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

app.post("/translate", rateLimit, async (req, res) => {
  const parsed = translateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_translate_payload" });
    return;
  }

  try {
    const translation = await translateText(
      parsed.data.text,
      parsed.data.sourceLang,
      parsed.data.targetLang,
    );

    res.json({ translation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed";
    res.status(500).json({ error: message });
  }
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

  socket.on("transcript-message", (payload: unknown) => {
    const parsed = transcriptMessageSchema.safeParse(payload);
    if (!parsed.success) {
      safeEmitError(socket, "bad_transcript_payload", "Transcript payload is invalid");
      return;
    }

    const event = {
      ...parsed.data,
      role,
    };

    socket.emit("transcript-message", event);

    const target = getSocketByRole(io, otherRole(role));
    if (target) {
      target.emit("transcript-message", event);
    }
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

    console.log(JSON.stringify({ event: "disconnected", role: disconnectedContext.role, socketId: socket.id }));
    socketContexts.delete(socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Signal server listening on http://localhost:${port}`);
});
