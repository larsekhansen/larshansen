// The few words the game says, in Norwegian for Norwegian browsers and English for everyone else.

const NORWEGIAN = /^(nb|nn|no)\b/i;

export type Lang = "nb" | "en";

/** The first of the visitor's languages that the game speaks, in their order of preference. */
export function pickLang(languages: readonly string[]): Lang {
  for (const l of languages) {
    if (NORWEGIAN.test(l)) return "nb";
    if (/^en\b/i.test(l)) return "en";
  }
  return "en";
}

/** The labels of the mute button, the same on every page. */
export function soundWords(lang: Lang): { on: string; off: string } {
  return lang === "nb" ? { on: "Lyd på", off: "Lyd av" } : { on: "Sound on", off: "Sound off" };
}
