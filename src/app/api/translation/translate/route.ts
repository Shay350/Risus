import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { text, sourceLang, targetLang } = await req.json();

  if (!text || !targetLang) {
    return NextResponse.json({ error: "text and targetLang are required" }, { status: 400 });
  }

  const sourceName = LANGUAGE_NAMES[sourceLang] ?? sourceLang;
  const targetName = LANGUAGE_NAMES[targetLang] ?? targetLang;

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: `You are a professional interpreter. Translate the user's text from ${sourceName} to ${targetName}. Return ONLY the translation — no explanations, no quotes, no extra text.`,
      },
    });

    const translation = result.text?.trim() ?? "";
    return NextResponse.json({ translation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    console.error("Translation error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
