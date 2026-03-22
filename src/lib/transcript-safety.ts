const AMBIENT_TRANSCRIPT_PATTERNS = [
  /^\(?\s*background noise\s*\)?$/i,
  /^\(?\s*quiet background noise\s*\)?$/i,
  /^\(?\s*ambient noise\s*\)?$/i,
  /^\(?\s*noise\s*\)?$/i,
  /^\(?\s*silence\s*\)?$/i,
  /^\(?\s*music\s*\)?$/i,
  /^\(?\s*laughter\s*\)?$/i,
  /^\(?\s*applause\s*\)?$/i,
  /^\(?\s*inaudible\s*\)?$/i,
  /^\(?\s*unintelligible\s*\)?$/i,
  /^\(?\s*crosstalk\s*\)?$/i,
  /^\(?\s*static\s*\)?$/i,
  /^\(?\s*rustling\s*\)?$/i,
  /^\(?\s*breathing\s*\)?$/i,
  /^\(?\s*keyboard (?:typing|clicking|clicks)\s*\)?$/i,
  /^\(?\s*mouse clicks?\s*\)?$/i,
  /^\(?\s*door (?:opening|closing|slamming)\s*\)?$/i,
  /^\(?\s*phone ringing\s*\)?$/i,
  /^\(?\s*cat meow(?:ing)?\s*\)?$/i,
  /^\(?\s*dog bark(?:ing)?\s*\)?$/i,
  /^\(?\s*cough(?:ing)?\s*\)?$/i,
  /^\(?\s*sneez(?:e|ing)\s*\)?$/i,
];

const AMBIENT_KEYWORDS =
  /\b(background noise|ambient noise|noise|silence|music|laughter|applause|inaudible|unintelligible|crosstalk|static|rustling|breathing|keyboard|typing|clicking|mouse click|door opening|door closing|door slamming|phone ringing|cat meow|dog bark|coughing|sneezing)\b/i;
const BRACKETED_STAGE_DIRECTION = /^[([{].*[)\]}]$/;

export function normalizeTranscriptText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function isAmbientTranscript(text: string) {
  const normalized = normalizeTranscriptText(text);
  if (!normalized) {
    return true;
  }

  if (AMBIENT_TRANSCRIPT_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  return BRACKETED_STAGE_DIRECTION.test(normalized) && AMBIENT_KEYWORDS.test(normalized);
}

export function sanitizeConversationalText(text: string) {
  const normalized = normalizeTranscriptText(text);
  if (!normalized || isAmbientTranscript(normalized)) {
    return "";
  }

  return normalized;
}
