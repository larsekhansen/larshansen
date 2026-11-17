# Order 28, section 1: what was still flat, before

Looked at on `origin/main` at `dbfea3d` (after order 27): every level's walk (`../../glance/walk.ts --every=60`, 73 places) at
390 x 844 by day and under each level's own sky, two places a level at 1280 x 800 by day and under its own sky, and the line
map in four states (nothing cleared, three, line 1, all) by day and at night at both sizes; then each thing found in the code
that draws it. The pictures are outside the repository (`~/.cache/claude-scratch-larshansen/o28/shots/before/`).

"Flat" here means drawn as plain rectangles, a fill or one colour a part, with no lit side, no shadowed foot and no grain.
The three columns the order asks for: **what he does with it** (ADR 0044's roles: a thing he stands on keeps the yellow
paint the page puts on its top, a thing he uses keeps its cyan corners, a thing that hurts its red outline); **does it fit
its level** (is it of its place: Oslo's own lamp post, railing, boat); **should the glamour touch it** (ADR 0050: neon is
the invaders' spell; Oslo is natural).

## Props in the lane, line 1 then line 2

| Thing | Where | What he does with it | Fits its level? | Should the glamour touch it? | Decision |
|---|---|---|---|---|---|
| Harbour sheds' plank walls (red, ochre) | Langkaia, the quay (kit `walls`, `render/furniture.ts`) | passes; their doors he uses (cyan corners, plank doors done in order 26); their roofs are ledges he stands on (paint) | yes: Oslo's painted harbour sheds; but a fill with a line every 4 px | no: scenery | Draw plank by plank: joints, grain streaks, nails, a shadow under the eaves, a darker foot, trim lit on the left. No lit top under the roof's ledge (that is the ledge's). Through a hook (`TEXTURED.walls`): Langkaia is in the first script |
| Sauna rafts: cabin, pontoons, stove pipe | Langkaia, carriers 0, 2, 4 … | stands on the deck and the cabin's roof (both painted by the page); passes the cabin | yes: the floating saunas off Langkaia are tarred cabins on pontoons | no | Tarred planks with grain, the corner lit, a door of boards with a band and a knob, the window framed in wood with the stove's light, pontoons lit on top and wet under, the pipe lit. Deck and roof ledges untouched |
| The sauna club's hut | Langkaia, its pier | passes; its roof is a ledge | yes | no | Tarred plank wall from the same piece, a board door, the pipe |
| Posts under the club's deck | Langkaia | passes | yes | no | Old wood with grain, lit left, dark foot |
| Sørenga's diving tower: legs, ladder, railing | Langkaia | stands on its platforms (ledges, painted); passes the legs, the ladder and the rail | yes: Sørenga's white diving tower | no | Concrete legs lit on the left with formwork joints, wet at the waterline; a steel ladder with lit rungs; a tube rail with glints (never a lit top over a shadow: nothing to look standable) |
| The rowing boat at the longship's stern | Langkaia, carrier | stands on it (the page paints its top) | yes | no | Clinker strakes lit along their tops, each lap's shadow, the gunwale lit, a thwart, oarlocks, tar at the waterline; the top row where it was |
| The Opera's door Hjem | Langkaia | uses (cyan corners) | yes | no | Left alone: the stage tower's aluminium and its dark steel door already read; a door must not change shape |
| Fire baskets on the keep's walls | Akershus | passes (scenery fire, warm: ADR 0050) | yes | no: scenery fire stays warm | Iron basket: a lit rim, bars, a bowl |
| The hoist's platform and beam | Akershus, carrier | stands on it | yes | no | Left alone: timbers with a lit top, iron bands and chains already; within the order's time it was not the flattest |
| Lamp posts on the square | Rådhuset, seven (kit `lampPost`, the front page's) | passes; their light after dark | the shape (a broad hat) is the front page's, a fair city lamp; but flat | no | The square's lamp in cast iron: the same broad hat lit on its top, the glass, a fluted post with two collars, a stepped plinth with its shadow |
| The balcony's railing over the clock | Rådhuset, the east tower | passes (below him) | yes | no | Cast-iron bars under a rail, a knob on each, glints |
| The ferry | Rådhuset, carrier | stands on its roof (painted) | yes: the island ferries are white with a red band | no | Kept piece: hull plates and seams, a raked bow and stern (the water shows through, no painted triangles), the red band lit, the waterline's shade, framed windows, the funnel lit; the roof he rides where it was |
| The window-cleaner's gondola | Rådhuset, carrier | stands on its floor (painted) | yes | no | Steel plates lit on top, posts lit, the rail a line with glints, the bucket shaded |
| The bells, the clock hand | Rådhuset | stands on them (paint) | yes | no | Left alone: drawn in order 24's style, he stands on them, and their gold is named in the palette test |
| Balconies' balusters | Slottet, Karl Johan | passes; the ledge under is where he stands (paint) | yes | no | Each baluster turned: lit left, shaded right, a waist |
| The railing at the pond | Slottet | passes | yes | no | Cast-iron posts and rail as a tube rail |
| Crowd barriers' ends | Slottet, at the digs | passes | yes: 17 May barriers | no | Steel frame lit on the left, bars, the red bands, a foot |
| The platform roof's posts | Holmenkollen station | passes | yes | no | Cast-iron posts lit on the left, a cap, a foot |
| Chairlift chair, lift cage | Holmenkollen, carriers | stands on the seat / floor | yes | no | Left alone: lit top rows and wires already; small |
| Snow cannon | Holmenkollen | passes | yes | no | Left alone: drawn in its ochre (order 22) |
| Logs, the wheel's buckets | Akerselva, carriers | stands on them | yes | no | Left alone: lit tops, rings, ends and foam already |
| Footbridge, arch bridge | Akerselva | passes, some are ground | yes | no | Left alone (the ground under them is order 26's) |
| Ullevålseter's lamp | Nordmarka | passes; a light in the dark | yes | no | Left alone: it gutters (order 24); the dark covers the post |
| The kiosk's door (Quintle) | Stortinget | uses (cyan corners; padlocked) | yes | no | Painted panel door from the props kit: panels lit on top and left and shaded on bottom and right, grain, a brass knob with its glint, a keyhole, a kick rail; the padlock as before |
| The trains (the T-bane's doors) | Stortinget, carriers | rides their roofs (painted) | yes | no | Left alone: drawn a column at a time and clipped by the tunnels, with doors, windows, stripes and bogies already; a kept piece would have to be clipped the same way |
| The trams | Ekeberg, Vålerenga, carriers | rides their roofs (painted) | yes | no | Left alone for the same reason (columns clipped by the track) |
| The viewpoint's railing | Ekeberg | passes (in front of him) | yes: the railing at Ekeberg is the one in Munch's Scream | no | A tube railing in the hill's own grey-blue: glints, posts lit with a foot plate |
| The viewpoint's old lamp | Ekeberg | passes; lit once the level is cleared | yes | no | The old town's cast-iron lantern, lit by day once cleared |
| Tram stop shelter | Ekeberg | passes | yes | no | Left alone: far back on the street's backdrop |
| Lamps behind the church | Vålerenga, two | passes; light in the night | yes: an old wooden-house district | no | The old town's cast-iron lantern, lit |
| The yellow house's plank walls | Vålerenga, home | passes; its door he uses | yes | no | Plank walls from the props kit (painted ochre); the windows and the lamp as before |
| The home's door | Vålerenga | uses (cyan corners) | yes | no | Panel door from the props kit |
| The red house's walls, upper floor and terrace railing | Vålerenga | waits on the terrace (paint); passes the walls | yes | no | Plank walls, cast-iron bars under a rail |
| The washing line's poles | Vålerenga | passes (the plough brings them down) | yes | no | Steel posts lit on the left |
| Bygdøy's rowing boat on the beach | Bygdøy | stands on it (ground, named in order 26's test) | yes | no | Left alone: drawn by the level, a thing not ground, kept |
| The ferry at Bygdøy | Bygdøy | passes / scenery | yes | no | Left alone (behind the lane) |
| Lamps on the bridge's parapet | Vigelandsparken | passes | yes: the bridge's wrought-iron lamps | no | The park's lantern in the bridge's own iron: a ring foot, a slim post, a round lantern under a cap |
| The rope over the broken span | Vigelandsparken | passes (the slab under is a ledge) | yes | no | Twisted: strands catching the light |
| The gate's pillars and lanterns | Vigelandsparken | passes | yes | no | Left alone: granite blocks lit on top already |
| Lanterns along the run | Korketrekkeren | passes | yes | no | Left alone: lit after dusk, small |
| The bird hides, the boardwalk's posts | Østensjøvannet | stands on the boardwalk (ground, order 26) | yes | no | Left alone: the boardwalk is order 26's; the hides are back art |
| The site fence | Bjørvika, at the quay | passes | yes: a building site's mesh fence | no | Mesh panels: a tube frame lit on the left, the wires, concrete feet (the fence was a solid board) |
| The site hut | Bjørvika, the roof | passes; the bench inside he uses | yes: a blue container | no | Corrugated steel: each rib lit and shaded, corner castings, the top rail lit |
| Lamps in the town | Gamlebyen, three | passes; light on the cobbles | yes, now: Gamlebyen is the old town | no | The old town's cast-iron lantern on a fluted post |
| Torches on the quay | Gamlebyen | passes (scenery fire, warm) | yes | no | Left alone: they flicker and go out at dawn (orders 17, 24) |
| Sign boards' posts | every level | passes; the board he reads (cyan corners) | yes | no | Old wood with a grain, lit on its left, a dark foot (the boards were order 26's) |
| Windows at arm's length | Langkaia's sheds (kit `pane`), Rådhuset | passes | yes | no | Left alone: a frame, a cross and four panes that light one by one after dark already |
| Ladders | Langkaia's diving tower; none elsewhere in the lane | passes | yes | no | Drawn (see the tower) |

## The line map (`levels/kartArt.ts`)

| Thing | What he does with it | Fits? | Glamour? | Decision |
|---|---|---|---|---|
| The skylines behind the stations | passes; the first thing a visitor sees after the card | a few flat shapes a place: a grey box for Akershus, a flat yellow block for Slottet and Stortinget, three boxes for Vålerenga | no: Oslo | Each a piece of its own, drawn once: lit on the left, shaded on the right; windows, courses, battlements, spires, the palace's portico and flag, the Opera's slope and the Barcode, Rådhuset's clock, the mill and its fall, spruces with spires, the parliament's round hall, the restaurant on Ekeberg's brow, the houses' planks and roofs and the church spire, the tower going up under the crane; tall parts kept clear of the rune stone over the station |
| The viaduct's piers | passes; behind the line | white concrete, flat, standing on the water as if floating | no | Concrete lit on the left, the formwork's joints, a bracket under the deck, wet at the waterline, and under the surface the fjord's colour over them, deeper and deeper |
| Line 1's deck (the shared `L` tile) and line 2's | walks on it | a red or orange band over concrete | no | A joint each section, two bolts, the band lit on its top and shaded under, the concrete in the band's shadow, the formwork's joint |
| Station marks | uses (doors, cyan corners) | the metro map's white square in a frame | no | Kept shape and colours; the frame enamelled (lit top and left, shaded bottom and right), the face's inner edge in its shadow |
| The door Hjem | uses (cyan corners) | the stage tower's door | no | The cladding's panels and dots lit and shaded, the dark steel door with its edge lit, a push bar, its brass |
| The water under the viaduct | — | one flat fill (a rectangle a screen column) | no | Bands darkening as it goes down, a rectangle a band, with the light of a wave here and there |
| The mirror balls | passes | hung on a wire from nothing | yes: they are the glamour's (order 27) | already the glamour's | Hung from a bracket clamped to the rune stone's corner |
| The news sign (the story's sign) | reads (cyan corners) | a sign board | no | Its post as every sign post |
| The mound, the gate, the longship, the lanterns | passes / uses the mound's door | drawn in order 13 to 17's style | no | Left alone |

## What enemies throw

| Shot | Thrown by | Drawn | Decision (see `after.md`, "Shots") |
|---|---|---|---|
| Chip | Rådhuset's gull | order 24's frames, enemy palette | measured against every level's fields; see after.md |
| Cone | Akerselva's squirrel | the same | |
| Snowball | the kids (Holmenkollen, Korketrekkeren, Vålerenga), the default shot | the same; the default a pink round | |
| Stone | Bygdøy's slingers | order 25's frames | |
| Ring | Vigelandsparken's ringers | order 25's frames | |
| Dive | Østensjøvannet's gulls | order 25's frames | |
| Bolt | Bjørvika's riveters | order 25's frames | |
| Arrow | Gamlebyen's archers | order 25's frames | |
| Sparks | Bjørvika's welder (a hazard, not a shot) | red stripe while it hurts (ADR 0044) | not a shot: left |
