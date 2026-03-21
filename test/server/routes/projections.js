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
  '  "timeline": {\n' +
  '    "summary": "one sentence insight",\n' +
  '    "milestones": [\n' +
  '      { "month": "Month X", "label": "milestone", "type": "foundation|growth|scale" }\n' +
  '    ]\n' +
  '  }\n' +
  '}';

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
      model: 'gemini-2.5-flash-preview-04-17',
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
