// The words the game says, in Norwegian for Norwegian browsers and English for everyone else.
// Place names stay Norwegian in both.

import { SCENE_WORDS, type Lang } from "@larshansen/pixelkit/i18n";

const STRINGS = {
  nb: {
    ...SCENE_WORDS.nb,
    help: "Piltastene for å gå, mellomrom for å hoppe, pil opp for å gå inn en dør. Eller klikk dit du vil.",
    blurb: "Du fant den hemmelige døra. Ta T-banen gjennom Oslo og finn de ti runene i navnet.",
    lineSub: "Linje 1, ti stopp",
    building: "Under bygging",
    closed: (before: string) => `Stengt til ${before} er tatt.`,
    notBuilt: "Den stasjonen er ikke bygd ennå.",
    moundNoFeather: ["Det sies at haugbonden har en ravnefjær.", "Gullet henger høyt uten den."],
    featherLine: "Haugbonden gir seg. Ravnefjæra er din: hopp en gang til i lufta.",
    finishOn: "Videre",
    finishAgain: "En gang til",
    finishNew: "Ny bestetid.",
    finishBest: (t: string) => `Bestetida di er ${t}.`,
    goldFound: "Brakteaten: funnet.",
    goldMissed: "Brakteaten: ikke funnet. Den henger høyt.",
    moreToBuild: "Tre av ti runer. Resten av byen er under bygging.",
    restart: "Start banen på nytt",
    best: "best",
    runes: (n: number) => `${n} av 10 runer`,
    runesAll: "Alle ti runene funnet",
    runeFound: (ch: string, name: string) => `Rune ${ch}, ${name}.`,
    goldAnnounce: "En gullbrakteat.",
    flagAnnounce: "Flagget er heist. Faller du, starter du her.",
    gold: (n: number) => `${n} gullbrakteater`
  },
  en: {
    ...SCENE_WORDS.en,
    help: "Arrow keys to walk, Space to jump, up arrow to go through a door. Or click where you want to go.",
    blurb: "You found the secret door. Take the T-bane through Oslo and find the ten runes of the name.",
    lineSub: "Line 1, ten stops",
    building: "Being built",
    closed: (before: string) => `Closed until ${before} is done.`,
    notBuilt: "That station is not built yet.",
    moundNoFeather: ["They say the mound-dweller keeps a raven's feather.", "The gold hangs high without it."],
    featherLine: "The mound-dweller yields. The raven's feather is yours: jump once more in mid-air.",
    finishOn: "Onward",
    finishAgain: "Once more",
    finishNew: "A new best time.",
    finishBest: (t: string) => `Your best is ${t}.`,
    goldFound: "The bracteate: found.",
    goldMissed: "The bracteate: not found. It hangs high.",
    moreToBuild: "Three of ten runes. The rest of the city is being built.",
    restart: "Start the level again",
    best: "best",
    runes: (n: number) => `${n} of 10 runes`,
    runesAll: "All ten runes found",
    runeFound: (ch: string, name: string) => `Rune ${ch}, ${name}.`,
    goldAnnounce: "A gold bracteate.",
    flagAnnounce: "The flag is up. Fall, and you start here.",
    gold: (n: number) => `${n} gold bracteates`
  }
};

export type Strings = (typeof STRINGS)["en"];

export function strings(lang: Lang): Strings {
  return STRINGS[lang];
}
