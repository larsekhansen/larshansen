# 0051. Props are of their place, asked three questions, and drawn as the ground is

Decided 2026-11-17 by the planner (order 28, "the last flat things"), with Lars away and his standing instruction: "keep looking
for more assets that should have increased details. and consider them with the rest of the game. interaction, fit, thematics,
etc. ... remember to write docs too btw." Carried out by the order 28 implementer. Within [0049](0049-the-ground-is-textured.md)
(the textured set and its band), [0044](0044-paint-says-where-to-go.md) (what the paint, the cyan and the red mean) and
[0050](0050-the-glamour.md) (neon is the glamour's).

## Context
Orders 23 to 27 redrew everything that moves, everything picked up, the ground and the invaders. What was left in rectangles was
listed in the roadmap: lamp posts, railings, panel doors, the sauna rafts, the sheds' plank walls, the rowing boat, carriers'
bodies, and the line map, which is the first thing a visitor sees after the card. The order asked that each be judged against
the whole game, not only drawn better.

## Decision
- **Three questions of every thing**, answered in a table before drawing (`apps/viking/tools/review/o28/before.md`):
  - *What he does with it.* A thing he stands on keeps ADR 0044's yellow paint, which the page puts on its top over whatever is
    drawn; a thing he uses keeps its cyan corners; a thing that hurts its red outline. More detail never makes a harmless thing
    look like one of those: no railing has a lit top over a shadow line (its rails are a line with a glint now and then), no
    prop is in a coin's amber or a rune's gold, nothing is shaped like a door that is not one, and every top he stands on is
    where it was, row for row.
  - *Does it fit its level.* A prop is of its place, with what is true of Oslo: the old town's cast-iron lantern on a fluted post
    (Gamlebyen, Vålerenga, Ekeberg's viewpoint), the square's lamp with its broad hat in cast iron (Rådhuset), a park's lantern
    in the bridge's wrought iron (Vigelandsparken), plain galvanised steel at the harbour (ready in the kit, `lamp("harbour")`,
    for a level that has one); a tube railing at Ekeberg's viewpoint (the railing in Munch's Scream), cast-iron bars on Rådhuset's
    balcony and the terrace at Vålerenga, a twisted rope at Vigelandsparken's broken span; tarred planks on the sauna rafts, a
    clinker boat, a mesh fence and a corrugated container at Bjørvika's site, the island ferry's plates and red band.
    Place names are fine; no addresses (ADR 0014).
  - *Should the glamour touch it.* Props are Oslo, and Oslo is natural: no prop uses a neon of the glamour's family. The map's
    mirror balls are already the glamour's; they now hang from a bracket clamped to the rune stone instead of from nothing.
- **What the invaders throw is theirs.** Order 27 left shots un-glammed. Each now trails three pixels of its level's first neon
  (the lean, as its thrower's marks are), fading, drawn over the night's tint so it glows after dark, starting clear of its
  outline. The shot itself and its outline are untouched, so it is at least as visible as before, and the neon is one of the
  family the palette test already holds ten or more off every field of every level. None once the shield has spent it (it
  falls, harmless), none inside the rune's ring of daylight (the glamour is lifted there), none with reduced motion. Drawing
  only (`trails` in `render/feel.ts`). A frame of sheen on the shot itself was not chosen: shots are four to six pixels, and a
  sheen there would have taken their own colour from them.
- **Drawn as the ground is** (ADR 0049): a prop is a per-pixel piece in three to five tones of one material, lit on the left, a
  shadowed foot, its grain (planks' streaks and nails, iron's flutes and collars, concrete's formwork, rope's twist), painted
  once onto its own canvas and copied: one copy a prop a frame where it was two to twenty rectangles. The kit is
  `apps/viking/src/alive/props.ts` (in `feel`'s file); Langkaia, which is in the first script, reaches it through two hooks
  (`TEXTURED.walls`, `TEXTURED.prop`), and moving its old drawings out made the first script smaller (59.51 to 59.07 kB).
- **The line map is drawn as a level.** Each station's skyline is a piece of its own: the Barcode and the Opera's slope,
  Akershus's battlements and copper spire, Rådhuset's two brick towers and its clock, the palace's portico and flag, the jump at
  Holmenkollen, the mill and its fall, spruces with spires, the parliament's round hall, the restaurant on Ekeberg's brow,
  Vålerenga's wooden houses and the church's spire, Fram's hall and a dragon prow, the Monolith and its limes, the sledge run,
  the lake and its hide, a tower going up under a crane, the ruined church. Tall parts stand clear of the rune stone over the
  station. The viaduct's piers are concrete with a bracket under the deck and stand in the water (the fjord's colour over them
  below its surface); the decks have joints and bolts; the station marks are enamelled; the water darkens in bands.
- **Two debts closed.** The ground joined order 22's band with one of its own (`render/palette.test.ts`, "the lane's ground keeps
  a band of its own"): middle saturation at most 0.6, nine tenths at most 0.8, the middle eight tenths of its value within 0.35;
  and every material quiet in itself, the mean lightness between neighbouring pixels at most a sixth of the figures' contrast
  (6.4). Akershus's fortress (8.3) and Gamlebyen's quay planks (7.1) were over it: their joints were quietened (6.2, 6.0); the
  band was not widened. The worktree that measured the first script larger: see `apps/viking/tools/review/o28/after.md`.

## How it is held
`alive/props.test.ts`: every level draws its lamp posts, railings, walls, doors and boats from the kit (a table of what each level
must draw), and no level imports the kit's flat `lampPost` or `panelDoor` (the front page's, untouched); no prop colour within 8 of
the glamour's family; every material in order 26's band; and no level's props nearer any role than its flat props were, or than
10, whichever is less (role by role, every colour new to its props).

## Not chosen
- **A sheen or neon body on the shots**: they are small; their own colour is what tells a chip from a stone.
- **Glamming any prop**: neon would make a lamp post read as theirs, and the reading "neon is the spell" would blur.
- **Lighter tones for painted wood and grey metal**: a painted plank lit toward white came nearer his skin and the coins, a lit grey
  nearer his helmet; walls and doors keep no tone lighter than their paint, iron none lighter than the lamp's hat.
- **Redrawing the trains and the trams** as pieces: they are drawn a column at a time and clipped by the tunnels and the track,
  with doors, windows, stripes and bogies already; a kept piece would need the same clipping.
- **The kit's own lamp post and doors changed**: the front page shares them; everything here is the viking game's.

## Consequences
- A level author adds a prop from the kit (`lamp`, `railing`, `plankWall`, `panelDoor`, `post`, `ladder`, `leg`, `rowboat`) or
  draws one with `prop` in its file: DESIGN's "Props at arm's length".
- Rectangles a frame fell where the props were (each one copy); see `apps/viking/tools/review/o28/perf.md`.

## A second look (order 31, 21 November 2026)
Order 31 walked every level, the encore and the map again at both sizes by day and under each one's own sky, with the same three
questions (`apps/viking/tools/review/o31/before.md`), and drew the three things that most let their surroundings down: the blue tram
at Ekeberg and Vålerenga (it was a blue box with lamp-yellow windows by day; now one piece from the kit, `tramSide`, glass by day and
lit after dark, its doors, bellows and panel joints, held to what shows of it where it goes in under the ground or rises out of its
slot), Vigelandsparken's main gate (granite pillars in courses under a moulded cap, and wrought-iron lanterns where grey slabs and
dark boxes stood) and Korketrekkeren's lanterns (a grey post with a box on top; now the lit trail's tarred wooden pole with an arm
and a hood, as Oslo lights its ski trails). The rules above held: no neon, no lit band on a cap, nothing nearer a role than what it
replaced (`alive/props.test.ts`, whose table of the old drawings now has the tram's colours).

## The logs and the chairs (order 32, 21 November 2026)
The two things order 31's second look named as the flattest left in the lane are drawn so too: Akerselva's logs (one piece a variant,
round, lit along the top and shaded to the wet underside, bark in fissures with a knot or two, each end sawn with a ring in its lighter
face; only what is above the water shows as before) and Holmenkollen's chairlift chairs (the grip on the cable, the hanger tube, a back
of two red slats on its uprights, the seat of slats, the frame, a footrest on two rods). Both keep their boxes and their tops, which the
page paints yellow; `alive/props.test.ts` holds their colours against their old drawings'.
Order 33 (22 November 2026): the chairs' back of slats is the frame's painted steel; in the arena's red it was a field 6.1 from the
warning red, which is what hurts (ADR 0044, amended; `render/warning.test.ts`). The seat keeps its red, under the paint but for its foot.
