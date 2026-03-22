import { NextRequest, NextResponse } from "next/server";

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
  elevenlabsForm.append("file", audio, "recording.webm");
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
    console.error("ElevenLabs STT error:", error);
    return NextResponse.json({ error }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ transcript: data.text, detectedLanguage: data.language_code });
}
