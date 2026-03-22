import { NextRequest, NextResponse } from "next/server";
import { sanitizeConversationalText } from "@/lib/transcript-safety";

function parseUpstreamError(raw: string) {
  const normalized = raw.trim();
  if (!normalized) {
    return "Speech-to-text request failed.";
  }

  try {
    const parsed = JSON.parse(normalized);

    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error.trim();
    }

    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }

    if (
      typeof parsed.detail === "object" &&
      parsed.detail !== null &&
      "message" in parsed.detail &&
      typeof parsed.detail.message === "string" &&
      parsed.detail.message.trim()
    ) {
      return parsed.detail.message.trim();
    }
  } catch {
    return normalized;
  }

  return normalized;
}

function resolveUploadFilename(audio: File) {
  if (audio.name?.trim()) {
    return audio.name.trim();
  }

  const mimeType = audio.type.toLowerCase();
  if (mimeType.includes("mp4")) {
    return "recording.mp4";
  }
  if (mimeType.includes("ogg")) {
    return "recording.ogg";
  }
  if (mimeType.includes("mpeg")) {
    return "recording.mp3";
  }
  if (mimeType.includes("wav")) {
    return "recording.wav";
  }
  return "recording.webm";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  const sourceLang = formData.get("sourceLang") as string | null;

  if (!audio) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  const elevenlabsForm = new FormData();
  elevenlabsForm.append("file", audio, resolveUploadFilename(audio));
  elevenlabsForm.append("model_id", "scribe_v1");
  if (sourceLang) {
    elevenlabsForm.append("language_code", sourceLang);
  }

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: elevenlabsForm,
  });

  if (!res.ok) {
    const error = await res.text();
    const message = parseUpstreamError(error);
    console.error("ElevenLabs STT error:", message);
    return NextResponse.json({ error: message }, { status: res.status });
  }

  const data = await res.json();
  const transcript = sanitizeConversationalText(data.text ?? "");

  return NextResponse.json({
    transcript,
    detectedLanguage: data.language_code,
    ignoredReason: transcript ? null : "non-speech",
  });
}
