// Colour says what a thing is (order 18, ADR 0039; order 22, ADR 0044). This file names the roles and owns their
// colours, so a level cannot quietly use a role's colour for something else: the viking game's palette test holds
// every role's colours apart from every other role's and from every field any level paints, by day and under the
// evening, twilight and night tints. Each role's own file holds its colours; this is the index over them.
//
//   him      his tunic, skin and helmet: his alone
//   enemy    what can hurt him and moves (swatches/enemy.ts): outlined in the warning red, by day and after dark
//   hurt     what can hurt him and is not an enemy: the same warning red, as a stripe on its edge
//   calm     what moves and cannot hurt him (sheep, the moose, the heron, a watched statue, a calm swan, the troll
//            asleep, the plough parked, the parade): outlined in one pale blue-white, by day and after dark
//   stand    what he can stand on (swatches/stand.ts): yellow paint on its top edge, two pixels thick
//   take     what he picks up: copper and a deep amber gold with a pale glint (swatches/coin.ts)
//   now      what a boss shows before it acts, and where to hit it: one violet, at all three bosses
//   speech   the white bubbles and the dark plate of a place's name (the kit's text.ts)
//   use      things to use, up at them (doors, benches, signs): one cyan, their corner marks and the arrow bubble's frame
// Part of the palette: import it from there, as ROLES.

import * as COIN from "./coin";
import * as ENEMY from "./enemy";
import * as STAND from "./stand";

/**
 * Him, as `person.ts` draws him: the tunic, the skin, the iron helmet; and the viking game's ramps of his frames
 * (order 23): the tunic lit at the front and shaded at the back, the skin lit and shaded.
 */
export const him = { tunic: "#2b4c8c", skin: "#f1c27d", helmet: "#6b7480", tunicLit: "#2850c8", tunicShade: "#24448f", skinLit: "#fbd0a8", skinShade: "#d29a70" };
/** What he picks up: the skilling's copper, the bracteate's gold, and the glint on both. */
export const take = { copper: COIN.face, copperDark: COIN.rim, glint: COIN.shine, gold: COIN.gold, goldDark: COIN.goldDark };
/** What can hurt him: the outline round every enemy, and the stripe along the dangerous edge of what is not one, broken by the near-black. */
export const hurt = { edge: ENEMY.warning, stripe: ENEMY.line };
/** What moves and cannot hurt him: its outline (order 22). It was the rim round enemies after dark; a thing that turns on him turns from this to the warning red. */
export const calm = "#b4c8ff";
/** What a boss shows before it acts (the troll's raised club, the plough's raised blade, the serpent's swelling throat and its ring) and where to hit it (the dawn's pool, the dazed head). */
export const now = "#cc33ff";
/** The speech bubbles' white and the banner's dark plate. */
export const speech = { bubble: "#ffffff", plate: "#141622" };
/** Things to use, up at them (order 19): doors, benches and signs have their corners marked in it, and the bubble that says which key frames itself in it. */
export const use = "#1ad9ff";

/** Every role's colours that must stand apart, by role (eyes, the near-black of lines and the line under a platform are contrast, not role, colours). */
export const COLOURS: Record<string, readonly string[]> = {
  him: Object.values(him),
  enemy: [ENEMY.red, ENEMY.plum, ENEMY.plumLight, ENEMY.plumDark, ENEMY.orange, ENEMY.orangeLight, ENEMY.amber, ENEMY.poison, ENEMY.poisonLight, ENEMY.pink, ENEMY.white, ENEMY.whiteShade],
  calm: [calm],
  stand: [STAND.top, STAND.body, STAND.bodyLight, STAND.bodyDark],
  take: Object.values(take),
  now: [now],
  use: [use]
};
