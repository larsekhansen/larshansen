// The few words the game says, in Norwegian for Norwegian browsers and English for everyone else.

import { SCENE_WORDS, type Lang } from "@larshansen/pixelkit/i18n";

const STRINGS = {
  nb: {
    ...SCENE_WORDS.nb,
    goStraightTo: "Gå rett til",
    soon: "kommer snart",
    locked: "kommer snart",
    homeSoon: "CV-en min flytter inn her snart",
    quintleSoon: "Quintle flytter inn når det er ute på Google Play",
    secret: "Du kom deg helt opp på Operaen!",
    help: "Piltastene for å gå, mellomrom for å hoppe, pil opp for å gå inn en dør. Eller klikk på et hus.",
    maze: "Labyrint",
    game: "Spill: en tur gjennom Gamle Oslo"
  },
  en: {
    ...SCENE_WORDS.en,
    goStraightTo: "Go straight to",
    soon: "coming soon",
    locked: "coming soon",
    homeSoon: "My CV is moving in here soon",
    quintleSoon: "Quintle moves in once it is out on Google Play",
    secret: "You made it all the way up the Opera!",
    help: "Arrow keys to walk, Space to jump, up arrow to go through a door. Or click a house.",
    maze: "Maze",
    game: "Game: a walk through Gamle Oslo"
  }
};

export type Strings = (typeof STRINGS)["en"];

export function strings(lang: Lang): Strings {
  return STRINGS[lang];
}
