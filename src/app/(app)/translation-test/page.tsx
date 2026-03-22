"use client";

import { useEffect, useRef, useState } from "react";

// All languages supported by ElevenLabs Scribe, sorted alphabetically
const LANGUAGES: { code: string; name: string }[] = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "ba", name: "Bashkir" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "br", name: "Breton" },
  { code: "bg", name: "Bulgarian" },
  { code: "my", name: "Burmese" },
  { code: "ca", name: "Catalan" },
  { code: "zh", name: "Chinese (Mandarin)" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "et", name: "Estonian" },
  { code: "fo", name: "Faroese" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "jw", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "ko", name: "Korean" },
  { code: "lo", name: "Lao" },
  { code: "lv", name: "Latvian" },
  { code: "ln", name: "Lingala" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Maori" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "oc", name: "Occitan" },
  { code: "ps", name: "Pashto" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sa", name: "Sanskrit" },
  { code: "sr", name: "Serbian" },
  { code: "nso", name: "Sepedi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "es", name: "Spanish" },
  { code: "su", name: "Sundanese" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "tl", name: "Tagalog" },
  { code: "tg", name: "Tajik" },
  { code: "ta", name: "Tamil" },
  { code: "tt", name: "Tatar" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "tk", name: "Turkmen" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "yo", name: "Yoruba" },
  { code: "zu", name: "Zulu" },
];

const LANG_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.name]));

function langName(code: string) {
  return LANG_MAP[code] ?? code;
}

// Searchable language picker
function LanguagePicker({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? LANGUAGES.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()))
    : LANGUAGES;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="flex-1" ref={containerRef}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="w-full flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span>{langName(value)}</span>
        <span className="text-gray-400 text-xs ml-2">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setQuery(""); }
                if (e.key === "Enter" && filtered.length > 0) select(filtered[0].code);
              }}
              placeholder="Search language…"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No results</li>
            ) : (
              filtered.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    onClick={() => select(l.code)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      l.code === value ? "font-medium text-gray-900 bg-gray-50" : "text-gray-700"
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="text-xs text-gray-300 font-mono">{l.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

type PipelineStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "translating"
  | "speaking"
  | "done"
  | "error";

interface Timing {
  stt?: number;
  translate?: number;
  tts?: number;
}

export default function TranslationTestPage() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [timing, setTiming] = useState<Timing>({});
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function startRecording() {
    setError("");
    setTranscript("");
    setTranslation("");
    setTiming({});

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied.");
      setStatus("error");
      return;
    }

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.start();
    setStatus("recording");
  }

  async function stopRecording() {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    await new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        mediaRecorder.stream.getTracks().forEach((t) => t.stop());
        await runPipeline(audioBlob);
        resolve();
      };
      mediaRecorder.stop();
    });
  }

  async function runPipeline(audioBlob: Blob) {
    try {
      // Step 1: STT
      setStatus("transcribing");
      const t0 = Date.now();

      const sttForm = new FormData();
      sttForm.append("audio", audioBlob, "recording.webm");
      sttForm.append("sourceLang", sourceLang);

      const sttRes = await fetch("/api/translation/stt", { method: "POST", body: sttForm });
      if (!sttRes.ok) {
        const { error } = await sttRes.json();
        throw new Error(error ?? "STT failed");
      }
      const { transcript: text } = await sttRes.json();
      setTranscript(text);
      setTiming((prev) => ({ ...prev, stt: Date.now() - t0 }));

      // Step 2: Translate
      setStatus("translating");
      const t1 = Date.now();

      const translateRes = await fetch("/api/translation/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });
      if (!translateRes.ok) {
        const { error } = await translateRes.json();
        throw new Error(error ?? "Translation failed");
      }
      const { translation: translated } = await translateRes.json();
      setTranslation(translated);
      setTiming((prev) => ({ ...prev, translate: Date.now() - t1 }));

      // Step 3: TTS
      setStatus("speaking");
      const t2 = Date.now();

      const ttsRes = await fetch("/api/translation/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translated }),
      });
      if (!ttsRes.ok) {
        const { error } = await ttsRes.json();
        throw new Error(error ?? "TTS failed");
      }
      const ttsBlob = await ttsRes.blob();
      setTiming((prev) => ({ ...prev, tts: Date.now() - t2 }));

      const audioUrl = URL.createObjectURL(ttsBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  function swapLanguages() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }

  const isRecording = status === "recording";
  const isProcessing = ["transcribing", "translating", "speaking"].includes(status);
  const totalMs =
    timing.stt && timing.translate && timing.tts
      ? timing.stt + timing.translate + timing.tts
      : null;

  const statusLabel: Record<PipelineStatus, string> = {
    idle: "Click to start recording",
    recording: "Recording… click to stop",
    transcribing: "Transcribing audio…",
    translating: "Translating…",
    speaking: "Generating speech…",
    done: "Done — speak again to try another",
    error: error,
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Translation Lab</h1>
        <p className="text-sm text-gray-400 mt-1 font-mono">
          ElevenLabs Scribe → Gemini 2.5 Flash → ElevenLabs TTS
        </p>
      </div>

      {/* Language bar */}
      <div className="relative flex items-end gap-3 mb-8">
        <LanguagePicker
          label="From"
          value={sourceLang}
          onChange={setSourceLang}
          disabled={isRecording || isProcessing}
        />

        <button
          onClick={swapLanguages}
          disabled={isRecording || isProcessing}
          className="mb-0.5 px-3 py-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors text-lg"
          title="Swap languages"
        >
          ⇄
        </button>

        <LanguagePicker
          label="To"
          value={targetLang}
          onChange={setTargetLang}
          disabled={isRecording || isProcessing}
        />
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full font-medium text-sm transition-all duration-150 select-none ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white scale-105 shadow-lg shadow-red-200"
              : isProcessing
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-gray-900 hover:bg-gray-700 text-white shadow-md hover:shadow-lg hover:scale-105"
          }`}
        >
          {isRecording ? (
            <span className="flex flex-col items-center gap-1">
              <span className="text-lg">■</span>
              <span>Stop</span>
            </span>
          ) : (
            <span className="flex flex-col items-center gap-1">
              <span className="text-lg">●</span>
              <span>Speak</span>
            </span>
          )}
        </button>

        <p className={`text-sm ${status === "error" ? "text-red-500" : "text-gray-500"}`}>
          {statusLabel[status]}
        </p>
      </div>

      {/* Pipeline timing */}
      {(timing.stt || timing.translate || timing.tts) && (
        <div className="flex gap-5 justify-center mb-6 font-mono text-xs">
          {timing.stt && (
            <span className="text-gray-400">STT <span className="text-gray-700">{timing.stt}ms</span></span>
          )}
          {timing.translate && (
            <span className="text-gray-400">LLM <span className="text-gray-700">{timing.translate}ms</span></span>
          )}
          {timing.tts && (
            <span className="text-gray-400">TTS <span className="text-gray-700">{timing.tts}ms</span></span>
          )}
          {totalMs && (
            <span className="text-gray-400 border-l border-gray-200 pl-5">
              Total <span className="text-gray-900 font-semibold">{totalMs}ms</span>
            </span>
          )}
        </div>
      )}

      {/* Transcript + Translation panels */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Original · {langName(sourceLang)}
          </p>
          <div className="min-h-36 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 bg-gray-50 leading-relaxed">
            {transcript || <span className="text-gray-300">Transcript will appear here…</span>}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Translation · {langName(targetLang)}
          </p>
          <div className="min-h-36 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 bg-gray-50 leading-relaxed">
            {translation || <span className="text-gray-300">Translation will appear here…</span>}
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
