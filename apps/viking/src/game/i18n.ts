// The words the game says, in Norwegian for Norwegian browsers and English for everyone else.
// Place names stay Norwegian in both.

import type { Lang } from "@larshansen/pixelkit/i18n";

/** The skies `?sky=` and the T key can show. */
export type SkyName = "day" | "evening" | "twilight" | "night" | "winter" | "17mai";

const STRINGS = {
  nb: {
    help: "Piltastene for å gå, mellomrom for å hoppe, pil opp for å gå inn en dør. Eller klikk dit du vil.",
    blurb: "Du fant den hemmelige døra. Finn de ti runene, eller ta en dør ut igjen.",
    signStart: ["Vikingfjorden. Du fant den hemmelige døra.", "Ti runer ligger strødd. De staver noe."],
    signJetty: ["Skipet går ingen steder.", "Det gjør ikke du heller, uten å hoppe."],
    signSmithy: ["Runesmia. Runer smidd mens du venter."],
    signBeacon: ["Varden.", "Tennes ved fare, eller når noen endelig kommer seg hit."],
    moundNoFeather: ["Noen runer henger for høyt.", "Det sies at haugbonden har en ravnefjær."],
    featherLine: "Haugbonden gir seg. Ravnefjæra er din: hopp en gang til i lufta.",
    boardStart: "Vikingfjorden",
    boardJetty: "Bryggja",
    boardSmithy: "Runesmia",
    boardBeacon: "Varden",
    finishTitle: "Alle ti runene!",
    finishNew: "Ny bestetid.",
    finishBest: (t: string) => `Bestetida di er ${t}.`,
    finishAgain: "Løp igjen",
    finishBack: "Tilbake til Gamle Oslo",
    close: "Lukk",
    restart: "Start på nytt",
    soundOff: "Lyd av",
    soundOn: "Lyd på",
    best: "best",
    runes: (n: number) => `${n} av 10 runer`,
    runesAll: "Alle ti runene funnet",
    runeAnnounce: (n: number) => `Rune ${n} av 10`,
    goIn: "gå inn",
    opening: (name: string) => `Åpner ${name}`,
    skies: { now: "Oslo akkurat nå", day: "Dag", evening: "Kveld", twilight: "Sommernatt", night: "Natt", winter: "Vinternatt", "17mai": "17. mai" } as Record<SkyName | "now", string>,
    left: "Gå til venstre",
    right: "Gå til høyre",
    jump: "Hopp",
    enter: "Gå inn"
  },
  en: {
    help: "Arrow keys to walk, Space to jump, up arrow to go through a door. Or click where you want to go.",
    blurb: "You found the secret door. Find the ten runes, or take a door back out.",
    signStart: ["Vikingfjorden. You found the secret door.", "Ten runes lie scattered. They spell something."],
    signJetty: ["The ship is going nowhere.", "Neither are you, unless you jump."],
    signSmithy: ["Runesmia. Runes forged while you wait."],
    signBeacon: ["The beacon.", "Lit in danger, or when someone finally makes it up here."],
    moundNoFeather: ["Some runes hang too high.", "They say the mound-dweller keeps a raven's feather."],
    featherLine: "The mound-dweller yields. The raven's feather is yours: jump once more in mid-air.",
    boardStart: "Vikingfjorden",
    boardJetty: "The jetty",
    boardSmithy: "Runesmia",
    boardBeacon: "The beacon",
    finishTitle: "All ten runes!",
    finishNew: "A new best time.",
    finishBest: (t: string) => `Your best is ${t}.`,
    finishAgain: "Run again",
    finishBack: "Back to Gamle Oslo",
    close: "Close",
    restart: "Start again",
    soundOff: "Sound off",
    soundOn: "Sound on",
    best: "best",
    runes: (n: number) => `${n} of 10 runes`,
    runesAll: "All ten runes found",
    runeAnnounce: (n: number) => `Rune ${n} of 10`,
    goIn: "go in",
    opening: (name: string) => `Opening ${name}`,
    skies: { now: "Oslo right now", day: "Day", evening: "Evening", twilight: "Summer night", night: "Night", winter: "Winter night", "17mai": "17 May" } as Record<SkyName | "now", string>,
    left: "Walk left",
    right: "Walk right",
    jump: "Jump",
    enter: "Go in"
  }
};

export type Strings = (typeof STRINGS)["en"];

export function strings(lang: Lang): Strings {
  return STRINGS[lang];
}
