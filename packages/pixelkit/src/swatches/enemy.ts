// What can hurt him (order 18, ADR 0039): every enemy's body and what it throws is drawn from this
// family and nothing else is. Saturated, warm or acid colours that no background uses as a field: so a
// colour from here means danger, and a colour not from here means it does not bite. No greys, no stone,
// no muted browns, no sky or water blues. Each colour has a lighter shade for a highlight; the shading
// is the outline, a pixel of near-black drawn round every enemy (see `outlined` in the viking game).
// Part of the palette: import it from there, as ENEMY.

/** Signal red: guards' coats, crabs, the rat's back. */
export const red = "#e8262e";
export const redLight = "#ff7b70";
/** Orange: breasts, foxes, sparks of a brazier. */
export const orange = "#ff7a1a";
export const orangeLight = "#ffb35c";
/** Magenta-plum: rats, cats, dogs, the wasp's sting. */
export const plum = "#c23a8f";
export const plumLight = "#f07ccb";
/** Poison green: what slithers, hops and flies at him; the gull's eye-ring. */
export const poison = "#9ae62a";
export const poisonLight = "#d8ff8a";
/** The outline round every enemy, and its pupils and bands. */
export const outline = "#1a0f14";
/** Eyes: the one pixel that shines after dark. Used for nothing else. */
export const eye = "#fffbe6";
/** Teeth, claws, beaks' tips, a snowball's white. */
export const pale = "#fff0cc";
/** The family's warning colour, on the dangerous edge of what hurts and is not an enemy (rebar, braziers, spikes, the third rail). */
export const warning = red;
