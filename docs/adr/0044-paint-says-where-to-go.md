# 0044. Red round what hurts, pale round what does not, yellow paint where he can go

Decided 2026-11-16 by the planner (order 22, part A and A6), after Lars had seen orders 18 to 20 live: "i think
maybe red for enemies that can hurt you, in terms of the outline, is a smarter choice. the light blu you had for
rats can be for moving npcs that don't hurt. yellow paint is maybe the industry standard for "you can go here" when
that isnt clear so mayne theat for platforms instead. then that also means other uses of yellow had to be
reconsideren or simply changed." Carried out by the order 22 implementer. Amends
[0039](0039-colour-says-what-a-thing-is.md): its rule (a colour belongs to a role, and a role's colours belong to
nothing else) stands; the colours of three roles change, and one role is added.

## Decision
- **What hurts on touch and moves is outlined in one warning red** (`ENEMY.red`), by day and after dark: every
  enemy, what it throws, a boss while it can hurt. Between the body and the red a near-black line (`INNER` in
  `render/sprite.ts`, "out"): tried with and without at phone size, the red alone ran into orange and pink bodies
  and the dark line kept every shape. After dark the outline keeps its light: every outline copied onto the street
  in a frame is noted and copied again, alone, over the night's tint (`rings`). The pale rim of order 13 (ADR 0023)
  is gone; the eye-shine stays.
- **No body is that red.** The enemy palette's bodies are plum, orange, poison green, pink and a white a little
  cooler than the clouds, each held off every field (as before) and 20 or more (CIEDE2000) off the outline, 10 or
  more without telling red from green. Kinds went toward what they look like where the test let them: white gulls,
  swans, geese and nesting gulls, an orange squirrel, pink feet and tails, a plum coat on the fortress guard. A rat
  could not go brown: every brown is the bricks', the wood's or the copper coin's.
- **What moves and cannot hurt him is outlined in a pale blue-white** (`ROLES.calm`, the new role): sheep, the
  moose, the heron, the parade and the King's Guard at Slottet, a watched statue, a guard still stone, a calm swan,
  a sledger pulled off, the troll asleep, stuck, flinching or stone, the plough parked, revving, stuck or beaten,
  the serpent's neck and its dazed head (the "now" violet over it stays). A thing that turns on him turns from the
  pale to the red at that moment, and a "!" in the red springs up over it (a statue, a guard, a swan; still under
  reduced motion). The troll and the plough turn red as they set off, after the violet of their wind-up.
- **Yellow paint on what he stands on** (`STAND.top`, `#ffd400`): the top edge of every platform two pixels thick,
  its outer top pixel at each end worn (`STAND.worn`), the same in every level, keeping its light after dark. What
  moves has black marks leaning in the paint (a chevron wants three rows; in two they are the stripes of moving
  machinery), marching for two thirds of a second before it sets off; what gives way has its paint broken in dashes.
  The teal bodies stay: they keep a one-way ledge apart from the ground and from the paint, and the paint reads on
  them. The yellow also goes where the way is not a platform: the lip of every ledge of ground before a fatal drop
  (six pixels of paint over the dark band), a crane hook's block (yellow with black stripes), a statue's head while
  it is a step.
- **Nothing else is that yellow.** Every yellow and gold the game paints was listed (`tools/glance/yellows.ts`)
  and each decided: the gold of what he takes (bracteates, the gold count, the header's rune tiles, a cleared
  station's stone, the effects' rings) became a deep amber (`COIN.gold`) whose light is the glint's pale; the third
  rail's cover became the warning red (its sign says so); Holmenkollen's snow cannon and the map's crane a quieter
  ochre; Bjørvika's site sign orange and black; the line-2 gate's stripes red; the crowd's yellow hats red. Kept, by
  name: Rådhuset's bells and the clock hand (things he stands on, their tops painted), lamps and lit windows (lights,
  never a top edge). The palette test holds that no colour any level paints is within 10 of the paint but these.
- **The haze behind the lane** (A6): the far, mid and near layers wash toward the level's air (the sky's at the
  horizon; a grey-white in snow and mist: Holmenkollen, Korketrekkeren, Vålerenga, Østensjøvannet) at 0.5, 0.4 and
  0.3 (it was 0.35, 0.3 and 0.2 toward the horizon), and the street's own backdrop at 0.08; none under the ground or
  on the line map; Ekeberg keeps its own. The wash is the fill each far pass already made, now toward the air
  (`pass(…, air)` in the kit, opt-in); the street's backdrop pass gains one fill a frame. Folding the haze and the
  night's tint into one fill was built and taken out again for the first script's budget. The palette test holds what is behind the
  lane quieter than what he plays with: by day, nine tenths of its area at most 0.5 saturated and its middle at most
  0.3 (the figures' middle is 0.69), the middle eight tenths of its value within 0.5.

## Consequences
- `swatches/roles.ts` names the role `calm`; `palette.test.ts` holds it as it holds the others, the outline's
  red against every body, the outline each thing has against its state, the yellow paint's uniqueness and the
  backdrop's band. The colour-blind table names the shapes that tell red outline from yellow paint, calm from use.
- An enemy is a pixel larger all round than before (the dark line); its box is unchanged.
- First script 59.47 (after order 21) to 59.85 kB gzipped (the outline's second ring and the rings after dark, the
  paint's marks and worn ends, the lips, the haze's air), with the careful walk to a clicked spot moved to a small
  file fetched with the first click (0.57 kB) to make room.

## Not chosen
- A red outline with no dark line inside: tried; it read worse at phone size.
- Natural browns and greys for bodies: the fields test does not allow them, and the copper coin is brown.
- Dropping the teal under the paint: the paint alone on a level's own material reads as a stripe on a wall.

## Amended by order 31 (21 November 2026)
"Outlines keep their light after dark" did not reach under Nordmarka's own dark, which comes after the night's tint and covers
everything but the lamp's circle: there the invaders were their glow round a dark shape. The red outline alone is now copied again
over that dark (`overDark` in `levels/nordmarka.ts`, at 0.9 of its strength, as over the night's tint), on its own pixels only, so
the dark round it is as dark as before. Measured as the palette test measures fields, the outline against the forest's fields
under every depth of its dark: at the least 6.7 before, 33.8 after, against 29.2 by day (`render/palette.test.ts` holds it). The
calm outline is not copied over the dark: what cannot hurt him there (the moose, the troll asleep) stays the dark's.
