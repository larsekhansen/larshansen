# 0049. The ground is drawn from a textured set, in a band quieter than the figures

Decided 2026-11-16 by the planner (order 26, "the ground under him"), after Lars chose way 3 for the pixels
([0045](0045-the-grain-same-grid-better-drawn.md)) and orders 23 to 25 drew everything that moves or is picked up that
way. Carried out by the order 26 implementer. Within [0036](0036-drawn-once-and-copied.md) and
[0041](0041-off-the-screen-is-not-drawn.md) (drawn once and copied), [0039](0039-colour-says-what-a-thing-is.md) and
[0044](0044-paint-says-where-to-go.md) (colour says what a thing is; the paint on top as it was).

## Context
What he stands on and walks past was still flat rectangles a tile: a fill, a top band, a pebble. The research record
(`docs/games/research/2026-11-16-reference-games.md`, section 1, "Tiles") found that the games with our grain texture
every tile: a lit top edge, a shadowed bottom edge, moss, cracks. The risk the order named: textured ground makes the
figures harder to see.

## Decision
- **One textured set** (`apps/viking/src/alive/ground.ts`, in `feel`'s file). A material (`Grain`) is three to five
  tones of one hue (its ramp, darkest first: joint, shade, face, light, a highlight) laid one of ten ways (`kind`:
  blocks, planks, earth under its top band, rock in facets, snow in layers, ice, steel plates, concrete, a crate, a
  girder), with small accents in another colour on a few pixels (moss in a wall's shadowed joints, salt at a quay's
  waterline, grass tufts over the edge of earth, rivets, a sparkle in snow, a flower).
- **A tile's piece** is picked by a hash of its column and row (four variants: the same every visit, so the pictures
  are stable) and by its edges as the map has them: lit a pixel lighter (or its kerb, or snow under a winter sky) where
  the sky reaches its top; an open end closed by a dark line; a shadowed foot where it meets something else below; an
  overhang's underside dark; the shadow of a step in its corner; rounded corners where rock, earth or snow meets the sky.
- **Drawn once and copied.** Each piece is painted once onto a 512-pixel sheet and copied: a solid tile is one copy
  where it was two to eighteen rectangles. Props (the sign boards, the T-bane's entrance, plank doors) are pieces of
  their own size, copied. Vålerenga's slate roofs are kept in strips.
- **The paint sits on top exactly as before.** One-way ledges are drawn by the kit as before and their teal body under
  the paint's two rows is a textured piece; crates and the lips of fatal drops get their paint as before.
- **The shared letters** (the ground and the bed under water, quay, marble, fortress, brick, jetty, rock, crate, the
  stern) are drawn through a hook in `render/tiles.ts` that `feel`'s file fills (until it has come, as before); a
  level's own surfaces through the set in its own file (`tile`, `edgesAt`, `EDGE`). The front page is untouched.
- **The band.** Every material: three to five tones; of the tones with colour enough to have a hue, none more than 40
  degrees (CIELAB hue) from another; its darkest to its lightest at most 40 (CIEDE2000) and below the figures' own
  contrast (the least of an enemy's body against its dark line, and his tunic against his skin: 38.7). And no tone
  the set added to a level's ground (a field, 0.4 % or more of what its tiles paint) comes nearer any role's colours
  than that level's ground came before order 26. Where a new tone did, it was replaced by one the level already
  painted: a lighter earth came near the copper of a coin, so earth has no lighter tone and its pebbles are lit in its
  top's own dark.

## How it is held
`alive/ground.test.ts`: every solid tile of every level is drawn from the set, but the named few that are not ground
(Vålerenga's houses, tower, chimney and shed, drawn by its back art, whose roofs' slate is textured there; the hulls of
Fram and the longship and the loft over Bygdøy's passage, kept in strips; a rowing boat; Gamlebyen's rising stones,
under Vigelandsparken's bridge, the snow's and the lake bed's layers drawn pixel by pixel since order 20, Stortinget's
kept rock, Holmenkollen's padded rail, Rådhuset's lantern), each with its reason; every material holds the band.
`render/palette.test.ts`: no new tone of a level's ground nearer a role than before (`alive/ground-before.json`, measured
on `d4ccf99` by `tools/glance/ground.ts`); and everything it held before, unchanged.

## Consequences
- Rectangles a frame fell at every place of every level against order 23's table (the least fall 75, the most 7,454; the most any
  place draws 10,063), copies rose (up to 1,361 a frame): `apps/viking/tools/review/o26/perf.md`.
- The surfaces are busier: the mean difference of lightness between neighbouring pixels of a surface went from 2.4 to
  3.6 (CIE L*); a figure's dark line against the ground is 30 to 85. Where it rose most (Gamlebyen's and Ekeberg's walls,
  Stortinget's cabinet, the river's rock) is listed in `o26/after.md`, with the figures' distances to the ground before and after.
- `feel`'s file grew from 20.6 to 27.8 kB gzipped (the set); the first script from 58.86 to 59.04 kB (the hooks).
- A level author adds a surface by naming a material in the level's file and drawing its tiles with `tile` (DESIGN's
  "The ground under him").

## Also in order 26 (sections 3b to 3d, Lars's words the same evening)
- **A small flag is Norway's at a glance**: 7 x 5 at the least (from the pole red, white, the blue upright, white, three red;
  red, white, the blue arm, white, red from the top), the game's own 13 x 9 rippling cloth where there is room; the kit's flag
  (the front page's) is untouched. Every hand flag, roof flag and wall flag in the game, and the map's.
- **A spruce ends in a spire**: a pixel, a pixel, then wider, over its top tier, in every level and layer that draws one.
- **An amber joins the enemy palette** (`ENEMY.amber`, `#ffb020`), for a wasp's bands between its black ones: the nearest to a
  wasp's yellow that stands off every field, the red outline, the paint's yellow and every other role, as every body must
  (amends [0044](0044-paint-says-where-to-go.md)'s list of bodies; no exception named). The rat's tail is as long as its body.

## Not chosen
- **Textures drawn per frame in rectangles**: a textured tile is 30 to 90 runs; a phone's view holds a thousand tiles.
- **One texture per level, no variants**: repeats show at once on a long wall.
- **Lighter earth, lighter brick**: their tones came nearer the copper, the enemies' orange and white than the ground
  was (the palette test's rule above); the set keeps to tones of the level's own where a new one would.
- **The kit's drawings changed** (crate, ledge, ground, stonework): the front page shares them; everything here is the
  viking game's own.
