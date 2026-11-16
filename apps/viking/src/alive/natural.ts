import { ENEMY } from "@larshansen/pixelkit/palette";

// What an invader is under the glamour (order 27, section 2; ADR 0050). Its natural self is the same map as its glammed
// self, without its marks, in a ramp of its own real colours: a brown rat, a grey pigeon, a white gull, a red fox, a guard
// in navy. A stomp breaks the glamour and it turns to this and leaves (a rat scurries off, a bird flies up, a guard walks
// away shaking his head); a rune's ring turns whatever is still in view. It is harmless and leaving, so the palette test's
// distance from the backdrops does not bind it, but it is never neon (the glamour's family is held off it: `natural.test`)
// and never an enemy's outline: the calm pale.
//
// A ramp maps the enemy palette's colours, as the look is drawn, to its natural ones; the near-black, the eyes and the pale
// of claws and teeth stay as they are, and so does anything already natural (a nest's twigs, granite).

/** How a natural self leaves: runs off along the ground, flies up and away, walks off shaking its head, swims or dives, rolls away, or stays (a statue, a fire). */
export type Leave = "run" | "fly" | "walk" | "swim" | "dive" | "roll" | "stay";

export interface Natural {
  ink: Record<string, string>;
  leave: Leave;
}

const E = ENEMY;
/** Ramps shared by kinds alike. */
const SKIN = { light: "#f0c8a0", mid: "#e0b090", shade: "#c08a66" };
const GREY_BIRD = { [E.plum]: "#7d8290", [E.plumDark]: "#575c68", [E.plumLight]: "#a6abb6", [E.orange]: "#c86a3a", [E.orangeLight]: "#c89040", [E.pink]: "#c88070", [E.poison]: "#4f8a64", [E.poisonLight]: "#86b394" };
const WHITE_BIRD = { [E.white]: "#f4f4ef", [E.whiteShade]: "#b9c0c6", [E.orange]: "#d0b048", [E.orangeLight]: "#d8c070", [E.pink]: "#d89070", [E.plum]: "#8a909a", [E.plumLight]: "#a8aeb6", [E.plumDark]: "#6a707a" };
const BROWN_FUR = { [E.plum]: "#6e5a4c", [E.plumDark]: "#4d3e34", [E.plumLight]: "#8e7866", [E.pink]: "#d8a090" };
const GRANITE = { [E.plum]: "#9a948a", [E.plumLight]: "#bab4aa", [E.plumDark]: "#6e6a62", [E.poison]: "#8a9a6a", [E.poisonLight]: "#a8b48a", [E.pink]: "#a8a298", [E.orange]: "#9a948a", [E.orangeLight]: "#bab4aa" };
const BRONZE = { [E.orange]: "#6f6a3e", [E.orangeLight]: "#8f8a52", [E.plumDark]: "#45432a", [E.plum]: "#5a5634", [E.plumLight]: "#7e7a4a", [E.poison]: "#5e9a86", [E.poisonLight]: "#86b8a4", [E.pink]: "#6f6a3e" };
/** Fire as it burns with the glamour broken: an ordinary orange. */
const FIRE = { [E.orange]: "#e05a20", [E.orangeLight]: "#ffcf80", [E.magenta]: "#e05a20", [E.lime]: "#ffcf80", [E.hotPink]: "#e05a20" };
const IRON = { [E.plum]: "#4a4446", [E.plumDark]: "#2e2a2c", [E.plumLight]: "#6a6466" };

/** Every look's natural self, by its name in the census (`lookName`). */
export const NATURAL: Record<string, Natural> = {
  pigeon: { ink: GREY_BIRD, leave: "fly" },
  pigeonfly: { ink: GREY_BIRD, leave: "fly" },
  gull: { ink: WHITE_BIRD, leave: "fly" },
  "gull (thrower)": { ink: WHITE_BIRD, leave: "fly" },
  nester: { ink: WHITE_BIRD, leave: "fly" },
  goose: { ink: WHITE_BIRD, leave: "run" },
  swan: { ink: { ...WHITE_BIRD, [E.orange]: "#d8602a" }, leave: "swim" },
  crow: { ink: { [E.plum]: "#33313a", [E.plumDark]: "#1f1d24", [E.plumLight]: "#4a4852" }, leave: "fly" },
  magpie: { ink: { [E.plumDark]: "#1e2030", [E.plum]: "#2a2c40", [E.plumLight]: "#3a3e58", [E.white]: "#f0f0ea", [E.whiteShade]: "#c0c4c8", [E.poison]: "#2f5a52", [E.poisonLight]: "#4a7a70" }, leave: "fly" },
  coot: { ink: { [E.plumDark]: "#1e1e22", [E.plum]: "#2e2e34", [E.plumLight]: "#46464e", [E.white]: "#f0f0ea", [E.poison]: "#7a8a4a" }, leave: "swim" },
  duck: { ink: { [E.whiteShade]: "#a8a49c", [E.white]: "#d4d0c8", [E.poison]: "#2f6b3a", [E.poisonLight]: "#4f8f5a", [E.plum]: "#7a4a3a", [E.plumLight]: "#9a6450", [E.orange]: "#c87a3a", [E.orangeLight]: "#d0b048" }, leave: "run" },
  penguin: { ink: { [E.plumDark]: "#1e2228", [E.plum]: "#2e343c", [E.plumLight]: "#4a5058", [E.white]: "#f0f0ea", [E.whiteShade]: "#c8ccd0", [E.orange]: "#c87a3a", [E.orangeLight]: "#d0b048" }, leave: "run" },
  owl: { ink: { [E.orange]: "#8a6a4a", [E.orangeLight]: "#b0906a" }, leave: "fly" },
  bat: { ink: { [E.plumDark]: "#2e2630", [E.plum]: "#4a3c48", [E.plumLight]: "#6a5a66" }, leave: "fly" },
  wasp: { ink: { [E.amber]: "#d0b048", [E.white]: "#e4eaee", [E.orange]: "#b86a30", [E.orangeLight]: "#d0b048" }, leave: "fly" },
  rat: { ink: BROWN_FUR, leave: "run" },
  trackrat: { ink: BROWN_FUR, leave: "run" },
  dog: { ink: { ...BROWN_FUR, [E.plum]: "#7a5a40", [E.plumLight]: "#9a7656" }, leave: "run" },
  fox: { ink: { [E.orange]: "#c8642a", [E.orangeLight]: "#d07040" }, leave: "run" },
  cat: { ink: { [E.orange]: "#c87a3a", [E.orangeLight]: "#d8b060", [E.pink]: "#e0a0a0" }, leave: "run" },
  hedgehog: { ink: { [E.plum]: "#6b5646", [E.plumDark]: "#4a3a2e", [E.plumLight]: "#9a8470", [E.orange]: "#b89070", [E.orangeLight]: "#d4b494", [E.pink]: "#d8a090" }, leave: "run" },
  squirrel: { ink: { [E.orange]: "#b85a2a", [E.orangeLight]: "#d07a40", [E.plum]: "#704a30", [E.plumDark]: "#5a3a24", [E.plumLight]: "#8a6040" }, leave: "run" },
  crab: { ink: { [E.orangeLight]: "#a85a3a", [E.orange]: "#7a3e2a", [E.pink]: "#c08070" }, leave: "run" },
  salmon: { ink: { [E.pink]: "#c87f74", [E.plum]: "#5d6f7c", [E.plumLight]: "#8a98a4", [E.white]: "#d8dfe4", [E.whiteShade]: "#a8b4bc" }, leave: "dive" },
  scooter: { ink: { [E.poison]: "#3a4046", [E.poisonLight]: "#5e666e", [E.plum]: "#1e1e22", [E.plumLight]: "#3a3a40", [E.pink]: "#c8c8c8" }, leave: "roll" },
  trolley: { ink: { [E.pink]: "#b8bcc4", [E.plum]: "#6a6e78", [E.plumDark]: "#4a4e58", [E.plumLight]: "#9aa0aa", [E.orange]: "#b8403a", [E.orangeLight]: "#d06050" }, leave: "roll" },
  umbrella: { ink: { [E.pink]: "#3a4a6a", [E.plumLight]: "#5a6a8a", [E.plum]: "#2a3650", [E.orangeLight]: "#8a6a4a", [E.orange]: "#6a4e34" }, leave: "fly" },
  anthill: { ink: { [E.orangeLight]: "#a07a4a", [E.orange]: "#7a5a38" }, leave: "stay" },
  brazier: { ink: { ...IRON, ...FIRE }, leave: "stay" },
  grill: { ink: { ...IRON, [E.plum]: "#2a2a2e", [E.plumDark]: "#18181a", [E.plumLight]: "#48484e", ...FIRE }, leave: "stay" },
  hotdog: { ink: { [E.plum]: "#b8bcc4", [E.plumDark]: "#7a7e88", [E.plumLight]: "#d8dce2", [E.pink]: "#c8403a", [E.orange]: "#b8703a", [E.orangeLight]: "#e0b070", [E.white]: "#f0f0ea", [E.whiteShade]: "#c8ccd0", [E.poison]: "#f4f4f0", [E.poisonLight]: "#ffffff", [E.amber]: "#d0a83a", [E.pale]: "#f2d2b0" }, leave: "roll" },
  statue: { ink: GRANITE, leave: "stay" },
  ringer: { ink: GRANITE, leave: "stay" },
  bronze: { ink: BRONZE, leave: "stay" },
  boy: { ink: BRONZE, leave: "stay" },
  guard: { ink: { [E.plum]: "#2d3446", [E.plumDark]: "#1f2433", [E.plumLight]: "#46506a", [E.orangeLight]: SKIN.light, [E.orange]: SKIN.mid, [E.poisonLight]: "#e8e4dc", [E.poison]: "#c8c4bc", [E.white]: "#e8e4dc", [E.whiteShade]: "#b8b4ac" }, leave: "walk" },
  "guard (the bishop's)": { ink: { [E.pink]: "#a8a4a0", [E.plum]: "#6a3a3a", [E.plumLight]: "#8a5050", [E.plumDark]: "#3a2626", [E.orange]: SKIN.mid, [E.orangeLight]: SKIN.light, [E.whiteShade]: "#c8c4bc", [E.white]: "#e8e4dc" }, leave: "walk" },
  archer: { ink: { [E.pink]: "#8a7a5a", [E.orange]: SKIN.mid, [E.orangeLight]: SKIN.light, [E.plumDark]: "#3a2e24", [E.plum]: "#5a4a36", [E.plumLight]: "#7a6a52", [E.white]: "#e8e4d8", [E.whiteShade]: "#c0bcb0" }, leave: "walk" },
  slinger: { ink: { [E.plum]: "#6a5040", [E.plumDark]: "#4a382c", [E.plumLight]: "#8a6a52", [E.pink]: "#8a7a5a", [E.orange]: SKIN.mid, [E.orangeLight]: SKIN.light }, leave: "walk" },
  riveter: { ink: { [E.orange]: "#d8602a", [E.orangeLight]: "#d07040", [E.plumDark]: "#2a3040", [E.plum]: "#3a4250", [E.plumLight]: "#5a6270", [E.poisonLight]: "#e8e0d0", [E.poison]: "#c8c0b0", [E.white]: "#f0f0ea", [E.whiteShade]: "#c0c4c8" }, leave: "walk" },
  kid: { ink: { [E.plum]: "#3a6e9e", [E.plumLight]: "#5a8ebe", [E.plumDark]: "#2a3a52", [E.orange]: "#c0504a", [E.orangeLight]: "#d8706a", [E.poison]: "#b8403a", [E.poisonLight]: "#d86a5a", [E.pink]: "#c88070", [E.white]: "#f4f4f2", [E.whiteShade]: "#c8ccd4", [E.pale]: "#f2d2b0" }, leave: "walk" },
  sledger: { ink: { [E.pink]: "#c0504a", [E.plum]: "#3a6e9e", [E.plumLight]: "#5a8ebe", [E.plumDark]: "#2a4e72", [E.orange]: "#8a5a34", [E.orangeLight]: "#b07a4a", [E.poison]: "#e8e0d0", [E.poisonLight]: "#f4f0e6", [E.white]: "#f4f4f2", [E.whiteShade]: "#c8ccd4" }, leave: "walk" }
};

/** A look's natural colour for one it is drawn in: its ramp's, or the colour itself (the near-black, its eyes, what is already natural). */
export const naturalOf = (look: string, c: string): string => NATURAL[look]?.ink[c] ?? c;
