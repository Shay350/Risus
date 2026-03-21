import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION =
  "You are a financial analyst for a pro-bono consulting firm helping underserved entrepreneurs. " +
  "Analyze the consulting call transcript and return ONLY valid JSON (no markdown, no backticks) " +
  "with the exact structure below.\n\n" +
  "{\n" +
  '  "financial": {\n' +
  '    "summary": "one sentence insight",\n' +
  '    "data": [\n' +
  '      { "year": "Year 1", "revenue": 0, "costs": 0, "profit": 0 },\n' +
  '      { "year": "Year 2", "revenue": 0, "costs": 0, "profit": 0 },\n' +
  '      { "year": "Year 3", "revenue": 0, "costs": 0, "profit": 0 }\n' +
  "    ]\n" +
  "  },\n" +
  '  "market": {\n' +
  '    "summary": "one sentence insight",\n' +
  '    "data": [\n' +
  '      { "segment": "label", "current": 0, "projected": 0 }\n' +
  "    ]\n" +
  "  },\n" +
  '  "risk": {\n' +
  '    "summary": "one sentence insight",\n' +
  '    "data": [\n' +
  '      { "risk": "short label", "score": 0 }\n' +
  "    ]\n" +
  "  },\n" +
  '  "nextSteps": {\n' +
  '    "summary": "one sentence insight about the overall action plan",\n' +
  '    "steps": [\n' +
  "      {\n" +
  '        "timeframe": "Month 1-2",\n' +
  '        "action": "concise action title (5-8 words)",\n' +
  '        "detail": "2-3 sentences explaining what specifically to do, why it matters for this business, and what a successful outcome looks like",\n' +
  '        "category": "foundation|growth|scale",\n' +
  '        "priority": "high|medium|low"\n' +
  "      }\n" +
  "    ]\n" +
  "  }\n" +
  "}\n\n" +
  "Generate 4-6 next steps ordered chronologically. Use real numbers and specifics from the transcript wherever possible.";

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();

  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { error: "transcript string is required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Here is the consulting call transcript:\n\n${transcript}`,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    let raw = result.text ?? "";
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate projections";
    console.error("Projections error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
