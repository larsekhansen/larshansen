// Colour says what a thing is (order 18, ADR 0039). This file names the roles and owns their colours, so a
// level cannot quietly use a role's colour for something else: the viking game's palette test holds every
// role's colours apart from every other role's and from every field any level paints, by day and under the
// evening, twilight and night tints. Each role's own file holds its colours; this is the index over them.
//
//   him      his tunic, skin and helmet: his alone
//   enemy    what can hurt him and moves (swatches/enemy.ts), outlined
//   hurt     what can hurt him and is not an enemy: the enemy palette's warning red, as a stripe on its edge
//   stand    what he can stand on (swatches/stand.ts): a mint top two pixels thick
//   take     what he picks up: copper and gold with a pale glint (swatches/coin.ts, the gold in metal.ts)
//   now      what a boss shows before it acts, and where to hit it: one violet, at all three bosses
//   speech   the white bubbles and the dark plate of a place's name (the kit's text.ts)
//   use      things to use, up at them (doors, benches, signs): one cyan, their corner marks and the arrow bubble's frame
// Part of the palette: import it from there, as ROLES.

import * as COIN from "./coin";
import * as ENEMY from "./enemy";
import * as METAL from "./metal";
import * as STAND from "./stand";

/** Him, as `person.ts` draws him: the tunic, the skin, the iron helmet. */
export const him = { tunic: "#2b4c8c", skin: "#f1c27d", helmet: "#6b7480" };
/** What he picks up: the skilling's copper, the bracteate's gold, and the glint on both. */
export const take = { copper: COIN.face, copperDark: COIN.rim, glint: COIN.shine, gold: METAL.gold, goldLight: METAL.goldLight, goldDark: METAL.goldDark };
/** What hurts and is not an enemy: the warning red along its dangerous edge, broken by the outline's black. */
export const hurt = { edge: ENEMY.warning, stripe: ENEMY.outline };
/** What a boss shows before it acts (the troll's raised club, the plough's raised blade, the serpent's swelling throat and its ring) and where to hit it (the dawn's pool, the dazed head). */
export const now = "#cc33ff";
/** The speech bubbles' white and the banner's dark plate. */
export const speech = { bubble: "#ffffff", plate: "#141622" };
/** Things to use, up at them (order 19): doors, benches and signs have their corners marked in it, and the bubble that says which key frames itself in it. */
export const use = "#1ad9ff";

/** Every role's colours that must stand apart, by role (outlines, eyes and the line under a platform are contrast, not role, colours). */
export const COLOURS: Record<string, readonly string[]> = {
  him: Object.values(him),
  enemy: [ENEMY.red, ENEMY.redLight, ENEMY.orange, ENEMY.orangeLight, ENEMY.plum, ENEMY.plumLight, ENEMY.poison, ENEMY.poisonLight],
  stand: [STAND.top, STAND.body, STAND.bodyLight, STAND.bodyDark, STAND.moving, STAND.warn],
  take: Object.values(take),
  now: [now],
  use: [use]
};
