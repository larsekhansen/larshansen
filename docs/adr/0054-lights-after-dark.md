# 0054. After dark a thing that gives light is its own colour over the dark, and nothing else glows

Decided 2026-11-21 by the planner (order 32, "lights after dark"), with Lars away and his standing words: "keep looking for more
assets that should have increased details. and consider them with the rest of the game. interaction, fit, thematics, etc. ...
remember to write docs too btw." Carried out by the order 32 implementer. Within [0023](0023-what-hurts-keeps-its-light-after-dusk.md)
(what hurts keeps its light), [0044](0044-paint-says-where-to-go.md) (what each colour means), [0050](0050-the-glamour.md) (neon is
the glamour's), [0051](0051-props-are-of-their-place.md) (props of their place) and [0036](0036-drawn-once-and-copied.md),
[0041](0041-off-the-screen-is-not-drawn.md) (cheap).

## Context
Order 31 found that Korketrekkeren's lamps did not come on after dark while Vigelandsparken's gate lanterns did. Nobody had asked
of the whole game whether, under dusk or night, every thing that gives light is lit and nothing glows that should not. Order 32
asked it of every level, the encore and the map (`apps/viking/tools/review/o32/before.md`): a census of every light each scene
registers and what is drawn over it (`src/render/lightcensus.ts`), pictures of every level at night at both sizes, and the code.

It found: the lit trail's lamps dimmed by the dusk drawn in front of them; Gamlebyen's lamps' and torches' light on the ground
registered behind the lane, so the cobbles covered it; a lamp's warm light over the braziers' and the grills' neon fire; the
encore's stage, its neon and its lights, tinted like its curtain; the invaders' neon signs unlit; the T sign unlit; the map's
skylines' windows dark while every level's are lit; Bygdøy's ferry's wheelhouse dark while Rådhuset's ferry is lit; and that
Vålerenga's night (the lane's dark behind the church, its lights through it, the Pi on the sill and its light, the paper cranes) had
not been drawn since order 15 moved the night out of `main.ts` and gave it to Nordmarka alone.

## Decision
- **A thing that gives light is its own colour over the dark.** A lamp, a lantern, a torch, a lit window, a tram's, a train's or a
  ferry's windows, a sign lit from inside, a stage's lights, a fire basket, a stove: its glass, flame or pane is registered as a
  light (`light()`), so after dusk it is drawn in its own colour over the night's tint, in the pass of the frame where nothing drawn
  after it dims it. What stands in front of it may hide it, as by day. A level's own dark (Nordmarka's forest) lets its lights through
  (`Art.lights`).
- **A small warm pool where it helps the player see the lane.** A lamp that stands at the lane lays its light on the ground under
  it: `pool` (the props kit: the kit's `lampPool`, only while it is on the screen) on flat ground, `poolAlong` on a slope
  (Korketrekkeren's run), registered in the level's `front`, after the tiles. A pool is a rectangle a column after dusk and a light is
  drawn whether it is on the screen or not, so a level registers only the pools in view. Where a level's own dark lies over the lane,
  the lamp's ring through the dark is its pool.
- **Nothing else glows.** What gives no light in the place (a sign board, a door, a coin, a prop, the paint) keeps only the light its
  role already has after dark (ADR 0023, 0040, 0044). An invader's light after dark is its own neon glow (`glows`, ADR 0050), not a
  lamp's warm light: the braziers and the grills lost theirs.
- **Warm and natural.** A light is the kit's lamp, window, soft or pool light, a flame, the sun, the moon's pale, a warning light on a
  crane: never a neon of the glamour (`ROLES.glamour`), but where the light is the glamour's own (the encore's stage, its stop on the
  map, the invaders' neon signs, the welder's sparks, which hurt); and never within 10 (CIEDE2000) of what he takes, where he stands
  or what he uses, but by name: the kit's lamp colour (ADR 0044: small panes and glass, never a top edge), the sun's disc, a torch's
  hot core, the white of the T sign and of the map's ticks. The torches' flame and the market hall's firelight at Gamlebyen were made
  a little yellower for it (they came within 8 of the laser orange).
- **Reduced motion** holds a light's flicker still, as every flicker (order 30, 31): the reduced-motion test records every light a
  path registers.
- **Cheap.** A light is one rectangle after dusk; a pool one a column (two on a slope). No place more than 150 rectangles a frame over
  before: the encore's beams were tried as lights and cost too much for a haze (their lenses are the lights), and Vålerenga's lane's
  dark (above) is left for a decision.

## How it is held
`src/render/lights.test.ts`, on `src/render/lightcensus.ts` (every scene drawn as a browser draws it, at night and under its own sky):
each scene lights exactly what its row names, so a new light or one gone out is a decision; nothing drawn after a light on the
street dims it; a pool never lies under the tiles; a light's colour is off the glamour's neon and off what he takes, stands on and
uses, but by name. `tools/glance/lights.ts` prints the census as a table.

## Consequences
- Vålerenga's Pi and its light and the paper cranes are drawn again (its `Art.night`). Its lane's own dark is not: drawn again it costs
  about 1,580 rectangles a frame there, over this order's limit, and it is left for a decision (`apps/viking/tools/review/o32/after.md`).
  Nordmarka's dark draws its invaders with `overTheDark` (`alive/glamour.ts`), which a second level's dark can share.
- A level author adding a light: register the lit part as a light where it is drawn; if it stands at the lane, give it a pool in the
  level's `front`; then add its row to `lights.test.ts`. DESIGN's "Lights after dark".

## Not chosen
- **Lighting the T sign's blue disc**: lit, its blue comes within 6 of his tunic. The white T alone says "T-bane".
- **Pools under every lamp**: a lamp far behind the lane or high on a wall lights nothing he needs to see.
- **A warm light for the invaders' fire**: their fire is the glamour's; its neon glow is its light.
- **A new colour for the kit's lamp light** (7.7 from the paint's yellow): the front page shares it, and ADR 0044 named it by shape.
