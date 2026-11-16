// What can hurt him (order 18, ADR 0039; order 22, ADR 0044). Every enemy, what it throws and a boss while it
// can hurt is outlined in one warning red (`red`), by day and after dark; that red is the warning and nothing
// else is drawn in it, so no enemy's body is red. The bodies come from the colours below, held off every
// level's fields and off the outline: plum, orange, poison green, pink and a white, each kind as near what the
// animal or person looks like as the fields allow (a white gull, an orange fox, pink feet and tails). No
// greys, no stone, no muted browns (they are the bricks', the wood's and the copper's), no sky or water blues.
// Part of the palette: import it from there, as ENEMY.

/** The warning red: the outline round every enemy, what it throws and a boss while it hurts; the stripe on what hurts and is not an enemy. Never a body. */
export const red = "#e8262e";
/** Magenta-plum: rats, cats, crows, coats, a hedgehog's spines. */
export const plum = "#c23a8f";
export const plumLight = "#f07ccb";
/** Orange: foxes, squirrels, owls, breasts, beaks, a brazier's flames. */
export const orange = "#ff7a1a";
export const orangeLight = "#ff9a30";
/**
 * Amber: a wasp's bands between its black ones (order 26: in poison green a wasp read as green). The nearest to a wasp's
 * yellow that stands off every field, the red outline, the paint's yellow and every other role (`tools/glance/tones.ts`).
 */
export const amber = "#ffb020";
/** Poison green: what slithers, hops and flies at him; a scooter. */
export const poison = "#9ae62a";
export const poisonLight = "#d8ff8a";
/** Pink: feet, tails, tongues, a crab's shell, a snowball's shadow. */
export const pink = "#ff8f87";
/** White, a little cool: gulls, swans, geese, a penguin's front (a white cooler than the clouds and the snow). */
export const white = "#d2ffe6";
/**
 * The shades of a drawing's ramps (order 23: frames drawn pixel by pixel, three to five tones a material): the dark
 * side of a plum body, under a white wing. Held off every field, off the outline and off every other role as the
 * bodies are. Orange, green and pink have no darker shade that stands off them all (a dark orange is the copper's,
 * a dark green or pink comes near the red outline without telling red from green): those ramps go from their light
 * to the near-black.
 */
export const plumDark = "#7a2a78";
/** A white's shade: under a gull's wing, a swan's fold. */
export const whiteShade = "#c0f0c8";
/**
 * The glamour's neons (order 27, ADR 0050): the Neon Invaders have put a spell on Oslo, and everything under it is
 * glammed up in neon. The bodies above were already the glamour's warm end (the plum is its magenta, the orange its
 * laser orange, the poison its acid green); these are the rest of the family: the glam marks (shades' glint, a crest, a
 * headband, leg warmers), the two-neon sheen on a figure's lit side, a level's lean, the fire that hurts. Each stands off
 * every field, the red outline and every role as a body does (`render/palette.test.ts`, `tools/glance/tones.ts`). Three sit
 * near a role and are held apart by shape as well as by hue: the purple and the magenta (the "now" violet, 13 and 12) and
 * the electric blue (his tunic, 11), each an accent, never a quarter of a figure. Nothing natural, nothing he takes and nothing he stands on
 * uses them.
 */
export const hotPink = "#ff2d95";
export const magenta = "#ff00cc";
export const purple = "#8a2be2";
export const purpleDark = "#5b1d9a";
export const blue = "#2a2aff";
/** Lime: the tongues and tips of a fire that hurts (magenta with lime); held 20 off the paint's yellow. */
export const lime = "#c8ff2a";
/** The near-black: pupils, bands, a wasp's stripes, the black of the warning stripe. */
export const line = "#1a0f14";
/** Eyes: the one pixel that shines after dark. Used for nothing else. */
export const eye = "#fffbe6";
/** Teeth, claws, beaks' tips, a snowball's white. */
export const pale = "#fff0cc";
/** The family's warning colour: the outline, and the dangerous edge of what hurts and is not an enemy (rebar, braziers, spikes, the third rail). */
export const warning = red;
