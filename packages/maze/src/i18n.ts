// The raven's voice and the few other words of the maze, in Norwegian for Norwegian browsers and
// English for everyone else. Place names stay Norwegian in both.

import type { Lang } from "@larshansen/pixelkit/i18n";

const STRINGS = {
  nb: {
    start1: "Kom deg gjennom haugen. Ikke rør veggene.",
    curse1: "Ha. Jernforbannelsen tok deg. En gang til?",
    start2: "Å, du kom deg hit? Jaja. Pass deg for ormene.",
    curse2Wall: "Seriøst? Veggen?",
    curse2Snake: "Ormene spiser sånne som deg. Prøv igjen.",
    start3: "Ingen ormer her. Bare jern, og en port som vil ha en nøkkel.",
    key: "Der gikk porten opp. Et sted.",
    start4: "Gulvet er eldre enn deg. Ikke stå stille.",
    curse4Pit: "Det var et hull der. Nå er det et hull der med deg i.",
    start5: "Veggene flytter seg. De blunker før de biter.",
    curse5: "Du ble vegg.",
    start6: "Noen har slukket lyset. Det var meg.",
    start7: "Haugbonden sitter innerst. Han er ikke morgenfugl.",
    curse7: "Så nær. Altså, ikke egentlig.",
    curse3: "Jernveggene forbanner deg til et liv uten fritid!",
    stone: "Steinen husker deg.",
    end: "Haugbonden gir seg. Ravnefjæra er din: hopp en gang til i lufta.",
    endStandalone: "Fjæra venter i Vikingfjorden.",
    help: "Styr med musa, fingeren eller piltastene. Shift for små skritt. Esc for å gå ut.",
    back: "Vikingfjorden",
    levelOf: (n: number, of: number) => `Nivå ${n} av ${of}`,
    deaths: (n: number) => `× ${n}`,
    cursesLabel: "Forbannelser",
    cleared: (n: number) => `Nivå ${n} klart`,
    leaving: "Ut av haugen",
    levelsTitle: "Velg nivå",
    levelsButton: "Velg nivå",
    levelsClose: "Lukk",
    notReached: "Ikke nådd ennå",
    best: (time: string) => `Best ${time}`,
    record: (time: string, deaths: number) => `${time} · × ${deaths}`
  },
  en: {
    start1: "Guide yourself through the mound. Don't touch the walls.",
    curse1: "Hah. The iron curse got you. Again?",
    start2: "Oh, you actually made it? Well. Mind the snakes.",
    curse2Wall: "Really? The wall?",
    curse2Snake: "The snakes eat your sort. Try again.",
    start3: "No snakes here. Only iron, and a gate that wants a key.",
    key: "A gate just opened. Somewhere.",
    start4: "The floor is older than you. Don't stand still.",
    curse4Pit: "There was a hole there. Now there is a hole with you in it.",
    start5: "The walls move. They blink before they bite.",
    curse5: "You became wall.",
    start6: "Someone put the lights out. It was me.",
    start7: "The mound-dweller sits at the far end. Not a morning person.",
    curse7: "So close. Well, not really.",
    curse3: "The iron walls curse you with no free time, ever!",
    stone: "The stone remembers you.",
    end: "The mound-dweller yields. The raven's feather is yours: jump once more in mid-air.",
    endStandalone: "The feather waits in Vikingfjorden.",
    help: "Steer with the mouse, a finger or the arrow keys. Shift for small steps. Esc to leave.",
    back: "Vikingfjorden",
    levelOf: (n: number, of: number) => `Level ${n} of ${of}`,
    deaths: (n: number) => `× ${n}`,
    cursesLabel: "Curses",
    cleared: (n: number) => `Level ${n} cleared`,
    leaving: "Out of the mound",
    levelsTitle: "Choose a level",
    levelsButton: "Choose a level",
    levelsClose: "Close",
    notReached: "Not reached yet",
    best: (time: string) => `Best ${time}`,
    record: (time: string, deaths: number) => `${time} · × ${deaths}`
  }
};

export type Strings = (typeof STRINGS)["en"];

export function strings(lang: Lang): Strings {
  return STRINGS[lang];
}
