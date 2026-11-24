import type { Lang } from "@larshansen/pixelkit/i18n";
import { formatTime } from "../game/play";
import type { Progress } from "../game/progress";
import { STORY } from "../game/story";
import { BUILT, LINE_1, LINE_2, ORDER } from "../levels/index";
import type { LevelDef } from "../levels/types";

// The card at a level's end, filled in (order 42): the time, the best, the bracteate, the skilling, a clean run, and the last line that
// counts honestly. It comes with `feel`'s file, which every scene waits for; the first script puts the card up with its title and its
// button (`showCard` in main.ts), so without that file the card still says where he was and takes him to the map. Its words came from
// `game/i18n.ts`, unchanged.

const NB_COUNT = ["Null", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti"];
const EN_COUNT = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** What the card after a rune says, in both languages. */
export const FINISH_WORDS = {
  nb: {
    finishNew: "Ny bestetid.",
    finishBest: (t: string) => `Bestetida di er ${t}.`,
    goldFound: "Brakteaten: funnet.",
    goldMissed: "Brakteaten: ikke funnet. Den henger høyt.",
    lineTwoOpened: "Linje 2 har åpnet. Den går fra Stortinget.",
    finishSkilling: (n: number, of: number) => `Skilling: ${n} av ${of}.`,
    finishClean: "Uten å miste et hjerte.",
    finishPole: "Du har fått skistaven: Shift eller X for et kort rykk, også i lufta.",
    finishPoleTouch: "Du har fått skistaven: Rykk-knappen gir et kort rykk, også i lufta.",
    runesLeft: (n: number) => (n >= 10 ? "Ti av ti runer." : `${NB_COUNT[n] ?? n} av ti runer. Resten ligger langs linja.`),
    homeLine: "Ti av ti runer: LARS HANSEN. Oslo, fra ende til annen."
  },
  en: {
    finishNew: "A new best time.",
    finishBest: (t: string) => `Your best is ${t}.`,
    goldFound: "The bracteate: found.",
    goldMissed: "The bracteate: not found. It hangs high.",
    lineTwoOpened: "Line 2 has opened. It leaves from Stortinget.",
    finishSkilling: (n: number, of: number) => `Skilling: ${n} of ${of}.`,
    finishClean: "Without losing a heart.",
    finishPole: "You have the ski pole: Shift or X for a short dash, in the air too.",
    finishPoleTouch: "You have the ski pole: the Dash button for a short dash, in the air too.",
    runesLeft: (n: number) => (n >= 10 ? "Ten of ten runes." : `${EN_COUNT[n] ?? n} of ten runes. The rest are along the line.`),
    homeLine: "Ten of ten runes: LARS HANSEN. Oslo, end to end."
  }
};

/** What a level's clear gave, for its card. */
export interface CardResult {
  ms: number;
  newBest: boolean;
  gold: boolean;
  found: number;
  total: number;
  clean: boolean;
  pole: boolean;
  /** This rune was the tenth: the card says so, once. */
  home: boolean;
  /** Line 2 opened with this clear (Nabolaget's first): the card says so. */
  opened: boolean;
}

const el = (id: string) => document.getElementById(id)!;

/**
 * Fills the card at a level's end under its title (the time, the best, the bracteate if the level has one, the skilling, a clean run, the
 * last line); returns what a screen reader is told, and whether a line's glamour was lifted with it (its sting is feel's to play).
 */
export function fillFinish(r: CardResult, def: LevelDef, progress: Progress, lang: Lang, touch: boolean, bracteate: boolean, toMap: string): { say: string; lifted: boolean } {
  const t = FINISH_WORDS[lang];
  el("finish-line").textContent = `${formatTime(r.ms)} · ${r.newBest ? t.finishNew : t.finishBest(formatTime(progress.best[def.id] ?? r.ms))}`;
  const gold = el("finish-gold");
  gold.hidden = !bracteate;
  gold.textContent = r.gold ? t.goldFound : t.goldMissed;
  const coins = el("finish-coins");
  coins.hidden = r.total === 0;
  coins.textContent = t.finishSkilling(r.found, r.total);
  const clean = el("finish-clean");
  clean.hidden = !r.clean && !r.pole;
  clean.textContent = [r.clean ? t.finishClean : "", r.pole ? (touch ? t.finishPoleTouch : t.finishPole) : ""].filter(Boolean).join(" ");
  // The last line counts honestly: the runes he has, on the last level built of each line; with the
  // tenth, the name, plainly, in both languages; and when Nabolaget opens line 2, that it has.
  const more = el("finish-more");
  const of = (ids: string[]) => ids.filter((id) => progress.cleared.includes(id)).length;
  const lastOfTwo = BUILT.filter((l) => l.line === 2).at(-1)?.id;
  more.hidden = !r.home && !r.opened && def.id !== "nabolaget" && !def.cardLine;
  more.classList.toggle("home", r.home);
  more.textContent = "";
  if (r.home) {
    const other = FINISH_WORDS[lang === "nb" ? "en" : "nb"];
    for (const line of [t.homeLine, other.homeLine, ...(r.opened ? [t.lineTwoOpened] : [])]) more.appendChild(document.createElement("span")).textContent = line;
  } else if (r.opened) more.textContent = t.lineTwoOpened;
  else if (def.id === "nabolaget") more.textContent = t.runesLeft(of(LINE_1));
  else more.textContent = def.cardLine?.[lang](of(LINE_2), ORDER.length - progress.bracteates.length) ?? "";
  // The story's end (order 27): line 1 is lifted with the tenth rune, all of Oslo with the last of line 2.
  const end = r.home ? STORY[lang].endOne : def.id === lastOfTwo && of(LINE_2) === LINE_2.length ? STORY[lang].endTwo : "";
  if (end) {
    more.hidden = false;
    more.appendChild(document.createElement("span")).textContent = ` ${end}`;
  }
  return { say: `${def.name}. ${formatTime(r.ms)}. ${r.newBest ? t.finishNew : ""} ${toMap}.`, lifted: !!end };
}
