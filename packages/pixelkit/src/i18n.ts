// The few words the game says, in Norwegian for Norwegian browsers and English for everyone else.

import type { SkyName } from "./oslo";
export type { SkyName };

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

/** The language of the visitor's browser, as `pickLang` reads it. */
export function browserLang(): Lang {
  return pickLang(navigator.languages?.length ? navigator.languages : [navigator.language]);
}


/** The words every side-view scene says the same way: the door hint, the touch pad, the skies of the T key. */
export const SCENE_WORDS = {
  nb: {
    goIn: "gå inn",
    opening: (name: string) => `Åpner ${name}`,
    skies: { now: "Oslo akkurat nå", day: "Dag", evening: "Kveld", twilight: "Sommernatt", night: "Natt", winter: "Vinternatt", "17mai": "17. mai" } as Record<SkyName | "now", string>,
    left: "Gå til venstre",
    right: "Gå til høyre",
    jump: "Hopp",
    enter: "Gå inn"
  },
  en: {
    goIn: "go in",
    opening: (name: string) => `Opening ${name}`,
    skies: { now: "Oslo right now", day: "Day", evening: "Evening", twilight: "Summer night", night: "Night", winter: "Winter night", "17mai": "17 May" } as Record<SkyName | "now", string>,
    left: "Walk left",
    right: "Walk right",
    jump: "Jump",
    enter: "Go in"
  }
};
