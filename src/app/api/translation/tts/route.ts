import { NextRequest, NextResponse } from "next/server";
import { sanitizeConversationalText } from "@/lib/transcript-safety";

// Adam — premade ElevenLabs voice, works with eleven_turbo_v2_5 multilingual model
const VOICE_ID = "pNInz6obpgDQGcFmaJgB";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  }

  const { text } = await req.json();
  const sanitizedText = sanitizeConversationalText(typeof text === "string" ? text : "");

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (!sanitizedText) {
    return NextResponse.json(
      { error: "TTS skipped for non-speech content." },
      { status: 422 },
    );
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: sanitizedText,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("ElevenLabs TTS error:", error);
    return NextResponse.json({ error }, { status: res.status });
  }

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
