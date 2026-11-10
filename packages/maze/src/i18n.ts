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
    start3: "Flaks: ingen ormer her. Bare jern.",
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
    leaving: "Ut av haugen"
  },
  en: {
    start1: "Guide yourself through the mound. Don't touch the walls.",
    curse1: "Hah. The iron curse got you. Again?",
    start2: "Oh, you actually made it? Well. Mind the snakes.",
    curse2Wall: "Really? The wall?",
    curse2Snake: "The snakes eat your sort. Try again.",
    start3: "Lucky you: no snakes here. Only iron.",
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
    leaving: "Out of the mound"
  }
};

export type Strings = (typeof STRINGS)["en"];

export function strings(lang: Lang): Strings {
  return STRINGS[lang];
}
