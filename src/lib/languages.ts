import type { LanguageCode } from "@/lib/types";

export const SUPPORTED_LANGUAGE_OPTIONS: Array<{
  code: LanguageCode;
  label: string;
}> = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "ar", label: "Arabic" },
  { code: "uk", label: "Ukrainian" },
  { code: "so", label: "Somali" },
  { code: "tl", label: "Tagalog" },
  { code: "zh", label: "Chinese" },
];

const supportedLanguages = new Set(
  SUPPORTED_LANGUAGE_OPTIONS.map((language) => language.code),
);

export function getLanguageLabel(code: LanguageCode | string): string {
  return (
    SUPPORTED_LANGUAGE_OPTIONS.find((language) => language.code === code)?.label ??
    code
  );
}

export function getSupportedLanguage(
  value: string | null | undefined,
  fallback: LanguageCode = "en",
): LanguageCode {
  if (!value) {
    return fallback;
  }

  const normalized = value.toLowerCase();
  if (supportedLanguages.has(normalized as LanguageCode)) {
    return normalized as LanguageCode;
  }

  const [base] = normalized.split("-");
  if (supportedLanguages.has(base as LanguageCode)) {
    return base as LanguageCode;
  }

  return fallback;
}
