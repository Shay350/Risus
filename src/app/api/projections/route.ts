import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `You are a strategic analyst for a pro-bono consulting firm helping underserved individuals and entrepreneurs.

Read the transcript carefully and return ONLY valid JSON (no markdown, no backticks) with the structure below.

STEP 1 — Choose 1–4 analytical sections from this list that are genuinely relevant. Do NOT force financial charts onto a non-financial conversation:
- "financial"  → Income, expenses, pricing, or profitability. Data: revenue/costs/profit over 3 years.
- "market"     → Customer segments, market sizing, competition, or growth opportunities. Data: current vs projected per segment.
- "risk"       → Risks, blockers, legal exposure, or uncertainties. Data: risk score 0–10 per risk area (4–6 risks).
- "operations" → Processes, efficiency, capacity, throughput, or bottlenecks. Data: current vs target per operational metric.
- "impact"     → Community outcomes, social value, beneficiaries, or non-financial goals. Data: current vs projected per impact category.
- "team"       → Staffing, roles, hiring, org structure, or capacity gaps. Data: current vs needed headcount per role.

STEP 2 — Always generate: 4 metric cards, 4–6 next steps, 2–4 recommended team members.

JSON structure (only include keys for chosen sections; always include "metrics" and "nextSteps"):
{
  "sections": ["section1", "section2"],
  "metrics": [
    { "label": "short label (3-5 words)", "value": "formatted value e.g. $2,480 or 78%", "change": "brief context note", "tone": "positive|warning|critical|neutral" },
    { "label": "...", "value": "...", "change": "...", "tone": "..." },
    { "label": "...", "value": "...", "change": "...", "tone": "..." },
    { "label": "...", "value": "...", "change": "...", "tone": "..." }
  ],
  "financial":  { "summary": "one sentence insight", "data": [{ "year": "Year 1", "revenue": 0, "costs": 0, "profit": 0 }, { "year": "Year 2", "revenue": 0, "costs": 0, "profit": 0 }, { "year": "Year 3", "revenue": 0, "costs": 0, "profit": 0 }] },
  "market":     { "summary": "one sentence insight", "data": [{ "segment": "label", "current": 0, "projected": 0 }] },
  "risk":       { "summary": "one sentence insight", "data": [{ "risk": "short label", "score": 0 }] },
  "operations": { "summary": "one sentence insight", "data": [{ "metric": "label", "current": 0, "target": 0 }] },
  "impact":     { "summary": "one sentence insight", "data": [{ "category": "label", "current": 0, "projected": 0 }] },
  "team":       { "summary": "one sentence insight", "data": [{ "role": "label", "current": 0, "needed": 0 }] },
  "nextSteps": {
    "summary": "one sentence about the overall action plan",
    "steps": [
      {
        "timeframe": "Month 1-2",
        "startMonth": 1,
        "endMonth": 2,
        "action": "concise action title (5-8 words)",
        "detail": "2-3 sentences: what to do, why it matters, what success looks like",
        "category": "foundation|growth|scale",
        "priority": "high|medium|low"
      }
    ],
    "recommendedTeam": [
      { "role": "role title", "reason": "one sentence on why this person is needed" }
    ]
  }
}

Use real numbers and specifics from the transcript wherever possible.`;

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();

  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json({ error: "transcript string is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
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
