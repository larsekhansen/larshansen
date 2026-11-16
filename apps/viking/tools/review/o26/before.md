# Order 26, section 1: the surfaces of the lane before, and what each became

Read from the code on `origin/main` at `d4ccf99` (after order 25) and looked at in the pictures. Every solid letter of every
level's map is listed (`legend.solid`), with the one-way ledges, the bed under the water and the props he passes at arm's
length. "Rectangles" is how many a tile drew each frame before; "kept" and "stamped" are ADR 0036 and 0041's copies.

The pictures: every surface drawn outside the page by `tools/glance/groundsheet.ts` (the tile nearest the middle of the level
whose top the sky reaches, with the tiles round it, as the street layer draws them: by day, and under the level's own sky with
the night's tint and the paint's light over it), on a checkout of `d4ccf99` and on the branch; `groundsheet.py` lays each level
out before and after, at three times (`/tmp/shots-ground/surfaces-3x/`) and four times (`surfaces-4x/`). They are not in the
repository.

## What every level shares (`render/tiles.ts`)

| Letter | What | Before | After (order 26) |
|---|---|---|---|
| `#` | the ground: the level's top band (`ground(c)`) over earth | a fill and a pebble (2 rectangles), the top band and its dots (2 to 6) | `earthOf`: earth in three tones, strata, pebbles lit in the top's own dark, a root; the top band laid as grass with tufts over its edge, sand, paving, setts, gravel, moss, snow or reed (`Surface.kind`) |
| `#` under water | the bed of a harbour or a moat | 2 to 4 rectangles and weed | `BED`: dark, sand on top where the water is over it, stones |
| `#` under the map | the bottom row going on down on a tall screen | a fill (`groundFill`) | the level's own ground drawn as if buried, a variant a row |
| `Q` | quay granite (Langkaia, Akershus, Rådhuset, Bygdøy) | small stones kept in 128-px squares, a kerb (2), a bollard (2) | `QUAY`: dressed blocks in courses each lit on its top, a kerb of worn granite with chips, moss in the shadowed joints, salt over the waterline; the bollard a piece |
| `M` | the Opera's marble (Langkaia) | 3 to 5 | `MARBLE`: big slabs, fine seams, a vein |
| `W` | the fortress (Akershus) | kept stonework, its outline, a worn top, moss (5 to 7) | `FORTRESS`: rough stone in small courses, a block split now and then, moss in its lower joints and tufts on its worn top |
| `X` | brick (Rådhuset's towers) | about 16 | `BRICKS`: bricks in courses, chipped corners, a darker one here and there, the outline and lit top as before |
| `P` | a jetty's planks (Langkaia, Bygdøy) | 4 to 8, its posts and the water under | `JETTY`: boards lit on top, grain, nail heads by each board's end, a knot |
| `H` | the longship's stern (Langkaia) | the kit's wooden ledge | `JETTY` |
| `K` | rock (Akershus, Holmenkollen) | 3 and an outline, grass on top | `ROCK`: facets, the cracks between them dark, each facet's upper edge lit; grass on top |
| `B` | a crate (Langkaia, Akershus) | about 20 (its brace a pixel at a time) | `CRATE`: a frame of darker boards, boards with grain, the brace lit on its top, nails; the paint on its top as before |
| one-way | every ledge in the platform palette | the kit's `ledge` (about 8) | the kit's `ledge` as before (its paint and joints), then its teal body under the paint textured: lit under the paint, rivets by each joint, a scuff |

## Each level's own surfaces

| Level | Letter: what | Drawn by, before | How, before | After |
|---|---|---|---|---|
| Langkaia | (all shared) `M`, `Q`, `P`, `B`, `H`, `#` sand | `render/tiles.ts` | as above | as above; `#` laid as sand |
| Akershus | (all shared) `Q`, `W`, `K`, `B`, `#` grass | `render/tiles.ts` | as above | as above |
| Rådhuset | `#` the promenade's paving over the quay's granite | shared top; `quayStone` | rectangles; the granite stamped a tile (order 20) | the top band laid as paving; `rh-quay` blocks lit on their tops |
| | `X`, `Q` | shared | | shared |
| | `N` the clock tower's lantern | `lantern` | rectangles | not changed: a building's walls and lit window (named in the test) |
| Slottet | `#` Karl Johan's paving over setts; `U` the ground under the slopes | shared top; `under` | rectangles; the setts kept a tile (order 21) | paving; `sl-under` setts, rounded, in four steps darker deeper down |
| | `P` the terrace under the palace | `terraceStone` | 5 to 9 | `sl-terrace` dressed blocks |
| Holmenkollen | `#` snow | `snowTile` | 5 to 8, a shade by depth | `hk-snow` in four steps of depth: wind layers, a white crust with sparkles, the blue shadow side at an open right end |
| | `I` ice | `iceTile` | 7 | `hk-ice`: streaks of light, a crack, bubbles, its dark foot, snow under |
| | `V` under the inrun | 1 or 2 | | `hk-under` packed snow in layers |
| | `H` the padded red rail | `railTile` | 8 | not changed: a thing, not ground (named) |
| | `K` | shared | | `ROCK`, snow on its top under the winter sky |
| Akerselva | `#` grass | shared, and `grassTop`'s tufts and flowers | | shared, its tufts and flowers kept |
| | `K` wet rock by the river | `rockTile` | 6 to 12 | `ak-rock` facets with grass and leaves on top and lichen; `ak-rock under` blue-dark under the water; the waterline as before |
| Nordmarka | `#` the forest floor | `floorTile` | 2 to 10 | `nm-floor`: moss with needles over its edge, roots, earth with stones |
| | `K` granite | `graniteTile` | 5 to 8 | `nm-granite` facets with lichen, moss on top, rounded where a boulder meets the air |
| Stortinget | `#` the platforms' stone; concrete under | `floorTile` | 4 to 9 | `st-floor` slabs, speckled, lit; `st-concrete` (formwork, tie holes, a stain, pits); the yellow line and lips as before |
| | `#` the trench's floor (rails, the third rail) | `trenchFloor` | 9 and sparks | concrete from the set under the rails, sleepers and the live rail as before |
| | `W` concrete faces of halls and tunnels | `concreteTile` | 4 to 8 | `st-concrete`, its underside dark; the beam's warning stripes as before |
| | `W` the rock over the halls | `shaleTile` | kept (order 21) | not changed (named) |
| | `E` the escalators' casing | in `tile` | 6 to 17 | `st-casing` steel plates, rivets |
| | `G` a ticket gate | `gateTile` | 6 | `st-gate` a steel post with its rivets; its panel and glass flap as before |
| | `Z` the signal cabinet | `cabinetTile` | 6 to 8 | `st-cabinet` steel plates; vents |
| Ekeberg | `#` grass on the hill over soil | `grassTile` | 4 to 9 | `ek-grass` with tufts and a white flower now and then, soil in strata with stones |
| | `K` the quarry's cut faces | `rockTile` | 5 to 8 | `ek-quarry` blocks split by the drill, lit on their tops, grass on top |
| | `A` granite; `D` granite steps | in `tile` | 3 to 4 | `ek-granite`, `ek-step` dressed blocks, the top lit |
| Vålerenga | `#` the street: snow over cobbles | `streetTile` | 2 to 6 | `nb-street`: snow with sparkles on top, setts in courses under it |
| | `B` a snow bank | `bankTile` | 3 | `nb-bank` packed snow in layers, rounded ends, its shadow side |
| | `W` two crates in the yard | in `tile` | 3 | `CRATE` with snow on its lid; the rest of `W` (the shed) is the back art's (named) |
| | `K` the gravestones behind the church | in `tile` | 4 | `nb-grave` dressed stone, snow on its top, its cross cut in |
| | the roofs he walks | `roofOf` in the back art | a rectangle a column | slate in courses under snow, kept in strips |
| | `R`, `T`, `H` the houses, the tower, the chimney | back art | | not changed (named): the back art's walls |
| Bygdøy | `#` the beach's sand, the halls' slabs, grass | shared, `hallFloor` | 2 to 6 | sand; `by-hall` polished slabs; grass |
| | `K` the rock in the fjord | `rock` | 3 to 6 | `by-rock` facets, its top lit with moss at the waterline; `by-rock under` |
| | `Q`, `P` | shared | | shared |
| | `B` a rowing boat on the beach; `H` the hulls of Fram and the longship; `L` the loft | `rowboat`; kept strips | | not changed (named): things and buildings, not ground |
| Vigelandsparken | `#` the gravel path, the lawn under its edge, soil deeper down | `lawn` | 6 to 14 | `vg-path` gravel over a lawn of blades, its roses kept; `vg-soil` in four steps |
| | `G` granite: the bridge's deck, walls, the plateau | `granite` | 4 to 6 | `vg-granite` in four steps of shade down a tall wall, the reliefs and the lime band kept; under the bridge's deck nothing (named) |
| Korketrekkeren | `#` the snow's crust | in `tile` | 4 to 7 | `kt-crust` snow with sparkles, the drift on top kept |
| | `#` the snow under it | `snowBody` | stamped (order 20) | not changed (named): already pixel by pixel, with its stone, root and lens of ice |
| Østensjøvannet | `#` the banks and the island | `bank` | 10 to 12 | `ov-bank` reed stubble over its edge, mud with roots |
| | `#` the old bed under them | `bank` | stamped (order 20) | not changed (named) |
| | `P` the boardwalk | `boardwalk` | 3 to 4, its posts | `ov-boards` planks, grain, nails; its posts kept |
| | `K` stones in the water | `stone` | 2 to 5 | `ov-stone` facets, a lit edge, moss; `ov-stone under` |
| Bjørvika | `#` the quay's granite | `granite` | 5 to 7 | `bj-granite` big slabs lit on their tops, a kerb |
| | `U` concrete slabs and the towers' faces | `concrete`, `facade` | 6 to 12 | `bj-concrete` (its rebar kept); the faces' glass `bj-glass` panes, its slabs and lit windows kept |
| | `I` girders | `girder` | 7 to 9 | `bj-girder` flanges lit, the web shaded, bolts |
| Gamlebyen | `#` grass; cobbles past the gate | shared | | grass; setts |
| | `R` old stone | `oldStone` | 5 to 7 | `gb-stone` rubble in courses, mortar, moss in the joints and on top |
| | `J` the quay's planks | `quayPlank` | 4 to 5, the piles | `gb-planks` boards, grain, nails; the piles kept |
| | `Z`, `z` the stones that rise | `stoneTile` | from the play's state | not changed (named) |

The order's list of kinds, and where each is: planks (the jetties, the stern, the boardwalk, Gamlebyen's quay, the crates,
the doors, the sign boards); cobbles (Gamlebyen past the gate, Vålerenga under the snow, Slottet under the street); brick
(Rådhuset); granite (the quays, Bjørvika, Ekeberg, Vigelandsparken, Nordmarka, Slottet's terrace); concrete (Stortinget,
Bjørvika); snow (Holmenkollen, Korketrekkeren's crust, Vålerenga's banks and street); earth and grass (most levels); rock
(Akershus, Holmenkollen, Akerselva, Nordmarka, Ekeberg, Bygdøy, Østensjøvannet); roof tiles (Vålerenga's slate roofs, the
only roofs he walks); metal decks (Stortinget's casings, cabinet and gates; Bjørvika's girders; Stortinget's one-way steel
grating `-` is not done); ice (Holmenkollen).

## Props at arm's length

| Prop | Where | Before | After |
|---|---|---|---|
| Sign boards and their posts | every level (doors' boards, sign posts) | the kit's `drawBoards`: 2 or 3 rectangles | two boards with grain, a nail at each end, the edge under; the post lit on its left (a piece a width) |
| The T-bane's entrance | every level's start | `tbaneDoor`: 8 | granite cheeks in courses lit on top, the steps' nosings; the round sign as before |
| Plank doors | Langkaia's shed, Nordmarka's mound | the kit's `plankDoor`: 6 to 10 | planks with grain and gaps, iron bands with rivets, a ring, the frame lit |
| Bollards | the quays (`Q`) | 2 | a piece: lit on its left, its cap |
| Crates | Langkaia, Akershus, Vålerenga | about 20 | the set's `CRATE` |
| Ticket gates, the signal cabinet | Stortinget | 6 to 8 | steel from the set |
| Gravestones | Vålerenga behind the church | 4 | dressed stone from the set |
| Panel doors | Stortinget's kiosk, Vålerenga's home | the kit's `panelDoor` | not done |
| Lamp posts | Rådhuset (the kit's), Vigelandsparken's and Gamlebyen's (their own) | rectangles | not done |
| Railings, ladders | Ekeberg's viewpoint rail; no ladders found | rectangles | not done |
| The sauna rafts | Langkaia (carriers) | rectangles | not done (a carrier's drawing; its standing top is the paint's) |
| Plank walls of sheds and houses | Langkaia's sheds (`walls`), Vålerenga's houses | a rectangle a plank line | not done |
| Holmenkollen's padded rail, Bygdøy's rowing boat | | rectangles | not done |
| Market stalls, ski racks | none found in the lane (the hot-dog cart is an enemy, drawn in order 24) | | |
