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
    help: "Piltastene for å gå, mellomrom for å hoppe, pil opp for å gå inn en dør",
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
    help: "Arrow keys to walk, Space to jump, up arrow to go through a door",
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
