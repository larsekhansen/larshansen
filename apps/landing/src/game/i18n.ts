// The few words the game says, in Norwegian for Norwegian browsers and English for everyone else.

import type { Lang } from "@larshansen/pixelkit/i18n";

/** The skies `?sky=` and the T key can show. */
export type SkyName = "day" | "evening" | "twilight" | "night" | "winter" | "17mai";

const STRINGS = {
  nb: {
    goStraightTo: "Gå rett til",
    soon: "kommer snart",
    goIn: "gå inn",
    locked: "kommer snart",
    homeSoon: "CV-en min flytter inn her snart",
    quintleSoon: "Quintle flytter inn når det er ute på Google Play",
    secret: "Du kom deg helt opp på Operaen!",
    opening: (name: string) => `Åpner ${name}`,
    help: "Piltastene for å gå, mellomrom for å hoppe, pil opp for å gå inn en dør. Eller bare klikk på et hus.",
    skies: { now: "Oslo akkurat nå", day: "Dag", evening: "Kveld", twilight: "Sommernatt", night: "Natt", winter: "Vinternatt", "17mai": "17. mai" } as Record<SkyName | "now", string>,
    left: "Gå til venstre",
    right: "Gå til høyre",
    jump: "Hopp",
    enter: "Gå inn",
    maze: "Labyrint",
    game: "Spill: en tur gjennom Gamle Oslo"
  },
  en: {
    goStraightTo: "Go straight to",
    soon: "coming soon",
    goIn: "go in",
    locked: "coming soon",
    homeSoon: "My CV is moving in here soon",
    quintleSoon: "Quintle moves in once it is out on Google Play",
    secret: "You made it all the way up the Opera!",
    opening: (name: string) => `Opening ${name}`,
    help: "Arrow keys to walk, Space to jump, up arrow to go through a door. Or just click a house.",
    skies: { now: "Oslo right now", day: "Day", evening: "Evening", twilight: "Summer night", night: "Night", winter: "Winter night", "17mai": "17 May" } as Record<SkyName | "now", string>,
    left: "Walk left",
    right: "Walk right",
    jump: "Jump",
    enter: "Go in",
    maze: "Maze",
    game: "Game: a walk through Gamle Oslo"
  }
};

export type Strings = (typeof STRINGS)["en"];

export function strings(lang: Lang): Strings {
  return STRINGS[lang];
}
