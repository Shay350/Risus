const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

const SYSTEM_INSTRUCTION =
  'You are a financial analyst for a pro-bono consulting firm helping underserved entrepreneurs. ' +
  'Analyze the consulting call transcript and return ONLY valid JSON (no markdown, no backticks) ' +
  'with the exact structure below.\n\n' +
  '{\n' +
  '  "financial": {\n' +
  '    "summary": "one sentence insight",\n' +
  '    "data": [\n' +
  '      { "year": "Year 1", "revenue": 0, "costs": 0, "profit": 0 },\n' +
  '      { "year": "Year 2", "revenue": 0, "costs": 0, "profit": 0 },\n' +
  '      { "year": "Year 3", "revenue": 0, "costs": 0, "profit": 0 }\n' +
  '    ]\n' +
  '  },\n' +
  '  "market": {\n' +
  '    "summary": "one sentence insight",\n' +
  '    "data": [\n' +
  '      { "segment": "label", "current": 0, "projected": 0 }\n' +
  '    ]\n' +
  '  },\n' +
  '  "risk": {\n' +
  '    "summary": "one sentence insight",\n' +
  '    "data": [\n' +
  '      { "risk": "short label", "score": 0 }\n' +
  '    ]\n' +
  '  },\n' +
  '  "nextSteps": {\n' +
  '    "summary": "one sentence insight about the overall action plan",\n' +
  '    "steps": [\n' +
  '      {\n' +
  '        "timeframe": "Month 1-2",\n' +
  '        "action": "concise action title (5-8 words)",\n' +
  '        "detail": "2-3 sentences explaining what specifically to do, why it matters for this business, and what a successful outcome looks like",\n' +
  '        "category": "foundation|growth|scale",\n' +
  '        "priority": "high|medium|low"\n' +
  '      }\n' +
  '    ]\n' +
  '  }\n' +
  '}\n\n' +
  'Generate 4-6 next steps ordered chronologically. Use real numbers and specifics from the transcript wherever possible.';

router.post('/', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'transcript string is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is the consulting call transcript:\n\n${transcript}`,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    let raw = result.text;

    // Strip any accidental ```json ... ``` fences
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const parsed = JSON.parse(raw);
    return res.json(parsed);
  } catch (err) {
    console.error('Projections error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate projections' });
  }
});

module.exports = router;
