// The words the game says, in Norwegian for Norwegian browsers and English for everyone else.
// Place names stay Norwegian in both.

import { SCENE_WORDS, type Lang } from "@larshansen/pixelkit/i18n";

const NB_COUNT = ["Null", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti"];
const EN_COUNT = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

const STRINGS = {
  nb: {
    ...SCENE_WORDS.nb,
    help: "Piltastene for å gå, mellomrom for å hoppe, pil opp ved en dør for å gå inn. Eller klikk dit du vil.",
    /** The help line in a level: no clicking there (a click never walks him off an edge, but it is not how to play). */
    /** The help line in a level; `shield`, the shield's words for it (they come with the shield). */
    helpLevel: (pole: boolean, shield = "") => `Piltastene for å gå, mellomrom eller pil opp for å hoppe, pil opp ved en dør for å gå inn.${pole ? " Shift eller X for et rykk." : ""}${shield} R starter banen på nytt.`,
    blurb: "Du fant den hemmelige døra. Ta T-banen gjennom Oslo, finn runene i navnet, og tramp neonsynkvervingen av byen.",
    finishNew: "Ny bestetid.",
    finishBest: (t: string) => `Bestetida di er ${t}.`,
    goldFound: "Brakteaten: funnet.",
    goldMissed: "Brakteaten: ikke funnet. Den henger høyt.",
    lineTwoOpened: "Linje 2 har åpnet. Den går fra Stortinget.",
    restart: "Start banen på nytt",
    best: "best",
    runes: (n: number) => `${n} av 10 runer`,
    runesTwo: (n: number) => `${n} av 6 runer på linje 2`,
    runesAll: "Alle ti runene funnet",
    runeFound: (ch: string, name: string) => `Rune ${ch}, ${name}.`,
    goldAnnounce: "En gullbrakteat.",
    flagAnnounce: "Flagget er heist. Faller du, starter du her.",
    gold: (n: number) => `${n} gullbrakteater`,
    hearts: (n: number) => `${n} av 3 hjerter`,
    lives: (n: number) => (n === 1 ? "1 liv" : `${n} liv`),
    skilling: (n: number, of: number) => `${n} av ${of} skilling`,
    finishSkilling: (n: number, of: number) => `Skilling: ${n} av ${of}.`,
    finishClean: "Uten å miste et hjerte.",
    finishPole: "Du har fått skistaven: Shift eller X for et kort rykk, også i lufta.",
    finishPoleTouch: "Du har fått skistaven: Rykk-knappen gir et kort rykk, også i lufta.",
    /** The touch pad's button at a bench. */
    sitButton: "Sett deg",
    hurt: (n: number) => (n === 1 ? "Au. Ett hjerte igjen." : `Au. ${n} hjerter igjen.`),
    lifeLost: (n: number) => (n === 1 ? "Et liv mindre. Ett igjen." : `Et liv mindre. ${n} igjen.`),
    lifeWon: "Et liv til.",
    overTitle: "Game over",
    overLine: "Banen starter forfra, med tre liv. Runene du har, beholder du.",
    overLineBoss: "Du fortsetter fra benken før kampen, med tre liv. Det du har funnet, beholder du.",
    overAgain: "Prøv igjen",
    /** While a level's file is fetched, and when it could not be. */
    loading: (name: string) => `Toget til ${name} kommer …`,
    loadFailedTitle: "Innstilt",
    loadFailedLine: (name: string) => `Toget til ${name} kom ikke. Sjekk nettet, og prøv igjen.`,
    toMap: "Til kartet",
    sit: "sett deg",
    benchSat: "Du hviler. Hjertene er fulle, og benken husker deg.",
    dash: "Rykk",
    locked: "kommer snart",
    runesLeft: (n: number) => (n >= 10 ? "Ti av ti runer." : `${NB_COUNT[n] ?? n} av ti runer. Resten ligger langs linja.`),
    homeLine: "Ti av ti runer: LARS HANSEN. Oslo, fra ende til annen."
  },
  en: {
    ...SCENE_WORDS.en,
    help: "Arrow keys to walk, Space to jump, up at a door to go in. Or click where you want to go.",
    helpLevel: (pole: boolean, shield = "") => `Arrow keys to walk, Space or up to jump, up at a door to go in.${pole ? " Shift or X to dash." : ""}${shield} R starts the level again.`,
    blurb: "You found the secret door. Take the T-bane through Oslo, find the runes of the name, and stomp the neon glamour off the city.",
    finishNew: "A new best time.",
    finishBest: (t: string) => `Your best is ${t}.`,
    goldFound: "The bracteate: found.",
    goldMissed: "The bracteate: not found. It hangs high.",
    lineTwoOpened: "Line 2 has opened. It leaves from Stortinget.",
    restart: "Start the level again",
    best: "best",
    runes: (n: number) => `${n} of 10 runes`,
    runesTwo: (n: number) => `${n} of 6 runes on line 2`,
    runesAll: "All ten runes found",
    runeFound: (ch: string, name: string) => `Rune ${ch}, ${name}.`,
    goldAnnounce: "A gold bracteate.",
    flagAnnounce: "The flag is up. Fall, and you start here.",
    gold: (n: number) => `${n} gold bracteates`,
    hearts: (n: number) => `${n} of 3 hearts`,
    lives: (n: number) => (n === 1 ? "1 life" : `${n} lives`),
    skilling: (n: number, of: number) => `${n} of ${of} skilling`,
    finishSkilling: (n: number, of: number) => `Skilling: ${n} of ${of}.`,
    finishClean: "Without losing a heart.",
    finishPole: "You have the ski pole: Shift or X for a short dash, in the air too.",
    finishPoleTouch: "You have the ski pole: the Dash button for a short dash, in the air too.",
    sitButton: "Sit",
    hurt: (n: number) => (n === 1 ? "Ouch. One heart left." : `Ouch. ${n} hearts left.`),
    lifeLost: (n: number) => (n === 1 ? "A life lost. One left." : `A life lost. ${n} left.`),
    lifeWon: "One more life.",
    overTitle: "Game over",
    overLine: "The level starts over, with three lives. The runes you have, you keep.",
    overLineBoss: "You go on from the bench before the fight, with three lives. What you have found, you keep.",
    overAgain: "Try again",
    loading: (name: string) => `The train to ${name} is coming …`,
    loadFailedTitle: "Cancelled",
    loadFailedLine: (name: string) => `The train to ${name} did not come. Check the connection, and try again.`,
    toMap: "To the map",
    sit: "sit down",
    benchSat: "You rest. The hearts are full, and the bench will remember you.",
    dash: "Dash",
    locked: "coming soon",
    runesLeft: (n: number) => (n >= 10 ? "Ten of ten runes." : `${EN_COUNT[n] ?? n} of ten runes. The rest are along the line.`),
    homeLine: "Ten of ten runes: LARS HANSEN. Oslo, end to end."
  }
};

export type Strings = (typeof STRINGS)["en"];

export function strings(lang: Lang): Strings {
  return STRINGS[lang];
}
