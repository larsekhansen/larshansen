# Order 43: the far view: looked at first

Looked at on branch `far-view`, from `origin/main` at `4a8e6a0` (after order 42), its build (`vite build` in `apps/viking`, vite under Node). Pictures
and working files outside the repository, in `~/.cache/claude-scratch-larshansen/o43/` (`bin/` the scripts, `work/` the lists and measures,
`shots/before/` the pictures, `sheets/` contact sheets).

## How it was looked at

- **Places**: every level's walk every 56 columns (`tools/glance/walk.ts --every=56`: four or five places a level where the scripted route first
  stands past each), the encore at three places (x 100, 380, 680) and the line map at four places with line 1 only (three stations cleared) and four
  with line 2 open (line 1 cleared). Each picture 170 steps in, so the place's name on its plate has gone and the sky over the far view is clear.
- **Sizes and skies**: 390 x 844 and 844 x 390 (on its side an art pixel is two screen pixels and the view is 423 x 196 art pixels, where far
  more of the far view shows), by day and under the level's own sky (Langkaia and the map, which follow the clock, at night). 161 addresses with the play
  and the same 145 of them with the far view alone, 612 pictures at the two sizes, and 145 of the sky alone on its side; none blank.
- **Natural**: one place a level with `?debug&natural` at both sizes. The far layers draw no figure and read no glamour (`glam.mode` and the rune's
  lift are read only where an invader is drawn), and the pictures differ only in the figures: the glamour does not touch the far view anywhere, as
  ADR 0050 has it for scenery (the invaders' own scenery, `alive/invasion.ts`, stands in the street's backdrop, not in the far view).
- **The far view alone**: a scratch build of the same code with two switches in `main.ts` that are not in the repository (`?debug&faronly`: the sky
  and the far, mid and near passes, nothing of the street; `?debug&skyonly`: the sky alone), served beside the real build, every address taken a
  third and fourth way. The far view of a picture is the pixels where the two differ (`bin/farmeasure.py`).
- **Colours**: every colour each level's far, mid and near layers paint, washed by its layer's haze toward the level's air and tinted under each
  sky as the kit's `pass` does (haze, then tint), against the warning red, the paint's yellow and every role's colours (`bin/farcolours.ts`, a walk of
  every view of 320 x 200 as the palette test walks them; `work/farcolours-main.txt`).
- **Code**: each level's `far`, `mid` and `near` read for what they draw, at what speed, and how often a thing comes round.

## What every far view has in common

- Three far canvases at 0.12, 0.2 and 0.4 of the camera (the kit's, shared by every level), each washed toward the level's air by its haze (0.5,
  0.4, 0.3; Ekeberg 0.12, 0.2, 0.15; Stortinget none) and tinted after dusk; a far layer is placed for a view about 220 pixels tall round him and moved
  down on an upright phone. With the receding planes of order 23 (water and snow in strips) and the split rows (every other tree or roof a little
  farther), most levels have five speeds or more between the sky and the lane.
- **Langkaia, Akershus, Rådhuset, Bygdøy and the map share their far and mid layers**: `drawOsloHills` (two sine waves of pale blue-grey hill with a
  band of forest at their foot) and `drawFjord` (the far shore's green bank with nine small houses in red, white and ochre, the fjord as a plane, a
  sailing boat). They are in the first script (`render/backdrop.ts`), so what differs between those levels is their near layer. Akershus and
  Rådhuset look out over the same hills and shore as Langkaia's quay does.
- **A thing in a far layer placed by its world x** is centred on the screen when the camera's middle is at that x, by day and with reduced motion
  alike (`layerOrigin` is taken from the view's middle); a thing that comes round every N world pixels comes round every N x 0.12 pixels of the
  screen in the far layer, which is two or more to a screen for N under about 1,700.
- **After dusk** the far views' windows come on where they were registered (`lit`, ADR 0054): the census (`render/lights.test.ts`) has "lit
  backdrop" in Langkaia, Akershus, Rådhuset, Slottet, Holmenkollen, Akerselva, Ekeberg, Gamle Oslo, Bygdøy, Gamlebyen and the map, and Bjørvika's
  far and mid layers register their own; Vigelandsparken, Korketrekkeren, Nordmarka, Østensjøvannet (but its sun), Stortinget and the encore have no
  far light. The kit's sky has the moon, stars and the northern lights at night in every level; the low sun is Østensjøvannet's sunrise, Gamlebyen's
  dawn after the serpent, Ekeberg's Scream bands.

## Every far view

Each row: the layers (far 0.12 / mid 0.2 / near 0.4) and how many speeds move against each other as he walks; what a person who knows Oslo looks
for from there, whether it is there and can be told at phone size; repeats; the sky; whether it competes with the play (the measures are in the
next section); a mark, 1 (good) to 3 (thin).

| Level (its sky) | The far view now | What one looks for from there | Repeats | With the sky, the glamour | Competes? | Mark |
|---|---|---|---|---|---|---|
| Langkaia (the clock; night) | far: the shared hills; mid: the shared fjord (plane, boat); near: MUNCH and the Barcode across the water where the front page has them, two of Sørenga's blocks, the fortress on its hill at the level's end, gulls. Six speeds | The Opera (in the lane), MUNCH and the Barcode (there, at the start, told at phone size), Sørenga (there), Akershus on its hill, the next stop (there, at the end); the fjord's islands (not there: the shared far shore only) | Sørenga's blocks twice, 1,000 world pixels apart (440 on the screen in the near layer): one screen apart on its side | Lit windows on the blocks and MUNCH's band; moon; untouched by the glamour | No | 2: the islands are missing, and its far layers are in the first script (anything drawn there costs the first script) |
| Akershus festning (day) | far, mid: the shared hills and fjord, both raised as the view climbs the walls (`climbed`); near: MUNCH and the Barcode twice, gulls; the near layer not raised, so on the walls MUNCH and the Barcode sink out of the view. Six speeds | From the walls: the Opera and Bjørvika to the east (MUNCH and the Barcode, small; no Opera), Rådhuset to the west, the next stop (not there), Hovedøya just off the fortress (not there) | MUNCH and the Barcode at world x 1,500 and 3,300: the second on the side of the line where Rådhuset is | Lit windows; never after dusk unless asked (pinned to day) | No | 3 |
| Rådhuset (day) | far, mid: the shared hills and fjord; near: one cluster of four plain blocks (brick, two pale, glass) at the harbour front, gulls. Nothing raised: up the towers the hills and the fjord sink out of the view, and from the parapet there is sky and the tower's own wall | From the harbour front: Akershus on its rock to the east (not there, though the code's comment names it), Aker Brygge to the west (four generic blocks, at the start, on the east side), the fjord's islands (not there). From the towers: the harbour below (gone) | None (one cluster) | Lit windows on the blocks; pinned to day | No | 3: the thinnest; the far view is the shared one with four blocks, on the wrong side, and gone as he climbs |
| Slottet (17 May) | far: the shared hills raised with the street, a thin white line on the ridge for the jump (once), far birds; mid: the city's roofs in pale colours with a flag on every other one (two speeds); near: Karl Johan's trees (two speeds). Six speeds | The palace up the street (in the lane); far off over the roofs, Holmenkollen's jump (a line two pixels long, not told at phone size) | Roof blocks every 110 world pixels in five colours: a pattern, as a street is | Lit windows; 17 May's flags on the roofs | No | 2: the street's own buildings fill most of the view; the far view is roofs and flags |
| Holmenkollen (winter day, snowing) | far: the city far below (hills with snow, the fjord as a band, the town in two rows of blocks, Rådhuset's two brick towers), sinking as he climbs; mid: forested ridges with snow, the snowfield as a plane; near: snowy spruces. Five speeds | The whole city below and the fjord (there), Rådhuset by the harbour (there) | Rådhuset's towers every 160 pixels of the layer: two or three to a screen on its side | Lit windows in the town; pinned to a winter day | No | 2: the repeat |
| Akerselva (day) | far: Grefsenkollen's hills in summer green with "a tower on the top", gulls; mid: the old mills and blocks along the river, sawtooth roofs, chimneys with smoke, trees (two speeds); near: birch and alder along the banks (two speeds). Six speeds | The mills and the falls (in the lane); the town along the river (there); at Vaterland, the city's tall buildings by the station (not there) | The "tower" (a line two pixels wide, ten tall) every 900 world pixels: 108 on the screen, three or four to a screen | Lit mill windows; pinned to day | No | 2: the repeat; and I am not sure a tower stands on Grefsenkollen where it is drawn |
| Nordmarka (summer night) | far: ridges with spruce tips, the dawn's bands after the troll; mid: rows of spruce (two speeds); near: big trunks (two speeds). Under the level's own dark only his headlamp's circle and the far view's top show | The forest at night (there) | Spruce rows, as a forest is | The dawn after the troll; no far light | No (dark) | 1: the forest is the level's idea and the dark covers the rest |
| Stortinget (underground) | far: the rock of the vault in courses, small far lamps; mid: other platforms across the rock with trains in them; near: concrete columns with the T roundel in the cavern. No sky | None: under the ground | Platforms every 150 world pixels, as a station's are | Its own lamps; no sky | No | 1 (no far view to look for) |
| Ekeberg (evening) | far: the Scream's bands over the hill, and the city below from the viewpoint: the far ridge with the jump on it, roofs in four rows to the water, the fjord with Hovedøya, the boat to Nesodden, a sailing boat, a buoy, a mark for each place on the line and a lamp at every station he has cleared; mid: oaks; near: birches and lamp posts (two speeds). Four speeds | The whole town below (there: every station of line 1 marked in its place) | None | The city's windows, the lamps of the cleared stations, the evening | The Scream's bands are its loudest: still within the backdrop band | 1 |
| Gamle Oslo (winter night) | far: snowy hills with a lit window here and there; mid: Kampen's and Vålerenga's houses under snow, a window or two lit each, smoke from chimneys, Kampen kirke's spire (two speeds); near: bare trees with snow on their branches (two speeds). Five speeds | Kampen and Vålerenga's roofs (there), Kampen kirke (there), the city's lights (a few) | Kampen kirke's spire every 17th house: every 782 world pixels, 156 on the screen, two to a screen | Lit windows, smoke, the northern lights over it | No | 2: the spire repeats |
| Bygdøy (day) | far: the shared hills, and the city across the fjord as a low pale line with a window every 23 pixels and Rådhuset's two towers; mid: the shared fjord; near: Bygdøy's oak and lime woods behind the street, the folk museum's stave church once, gulls. Six speeds | From Bygdøynes: across the water Rådhuset (there, as two lines), Akershus on its rock (not there, though the comment names it), Holmenkollen's jump on the ridge (not there); the city is behind the woods from most places | Rådhuset's towers every 700 world pixels: 84 on the screen, three to five to a screen | Lit windows (the shared shore); pinned to day | No | 3 |
| Vigelandsparken (day) | far: the shared hills, Frogner's blocks in a pale low line, a church's spire; mid and near: the park's limes and maples in rows (two speeds each), which cover the far layer at every place but the gate. Five speeds | Holmenkollen's jump on the ridge over the park, which the Monolith's plateau looks out to (not there) | The spire every 640 world pixels: 77 on the screen, three to five to a screen | No far light at all | No | 3 |
| Korketrekkeren (winter afternoon) | far: pale snowy hills with small houses at their foot, the fjord far down as a plane; mid and near: snowy spruces on the slope, darker in the trees at dusk. The spruces cover the far view nearly everywhere | From Frognerseteren at the start, the whole city and the fjord (there, behind the restaurant and the first spruces, hard to see) | Spruces, as a forest is | No far light | No | 2: the view the place is known for shows little, but the run is in the forest by design |
| Østensjøvannet (twilight) | far: the far shore's low hills, the sun coming up over them as he reaches the rune, the lake as a plane; mid and near: trees along the bank (two speeds each), the mist | The lake, its reeds and hides (in the lane), the sunrise (there) | Bank trees, as a bank is | The sunrise and its light along the water | No | 2: nothing of the suburb round the lake; I am not sure which building a person looks for there |
| Bjørvika (evening) | far: the far shore with lights, the fjord as a plane, an island, the ferry going out lit, a sailing boat; mid: the new town by the water, the Opera far off at the start, the Barcode, the museum's leaning top, cranes with red lights; near: the roofs round the site from above. Five speeds | The Opera, the Barcode, MUNCH, cranes (all there, told at phone size) | Cranes every 740 world pixels, as a site has | Windows, the cranes' warning lights, the ferry | No | 1 |
| Gamlebyen (night) | far: the hills, Ekeberg's slope over the old town (woods, a road, houses with lit windows, kept strips), the dawn after the serpent; mid: the town's roofs, the medieval town, the hall, masts. Two canvases | Ekeberg over the old town (there), the harbour (in the lane) | Ekeberg's slope in four strips of 128 pixels, each different: no visible repeat | Lit windows going out at dawn, the dawn | No | 1 |
| The encore (evening) | far: the shared hills; mid: nine slim towers to the west, a window here and there; near: the park's limes and the ruin's low wall | Bjørvika's towers to the west (there, generic), Ekeberg rising over the park to the south-east (not there, though the code's heading names it) | None (the camera hardly moves) | No far light; the stage is the light | No | 2 |
| The map, line 1 (the clock; night) | far: the shared hills; mid: the shared fjord, darkening in bands down under the viaduct; the stations' own skylines in the street layer | Each station's own picture in its skyline (there) | The shared hills and shore | Lit windows (the shore's and the skylines') | No | 1: the skylines are the landmarks |
| The map, line 2 open | The same, with line 2's skylines | The same | The same | The same | No | 1 |

## Does it compete with the play? Measured

**In the pictures** (`bin/farmeasure.py`, every place on its side, where most of the far view shows, the page's bar cropped off): of the far view
alone (the pixels where the far-only picture differs from the sky-only one), the share of the view's height from its top to the screen's foot; its
own contrast, CIEDE2000 between neighbouring pixels of it, at the 99th percentile and at the most; and how near any of its colours (six pixels or
more) comes to the warning red, the calm pale outline, the outlines' dark line and the paint. For the play's own outlines to stand against: the
warning red is 43.7 off its dark line, the calm pale 71.8 off it, and a figure's dark line stands 30 to 85 off the ground (ADR 0049). The
browser moves each far canvas by the fraction of a pixel its layer has drifted, so a far picture's edges are smoothed and it shows colours in
between its own: the distances here are a little smaller than the colours drawn (the walk below has those).

| Level | Sky | Places | Band (share of the view's height) | Edge, 99th percentile / most | Least off the red | the calm pale | the dark line | the paint | L* 5 to 95 % |
|---|---|---|---|---|---|---|---|---|---|
| akerselva | day | 5 | 0.99 | 35.6 / 67.1 | 28.4 | 9.2 | 12.5 | 24.4 | 26 to 87 |
| akershus | day | 5 | 1.00 | 21.5 / 68.0 | 21.3 | 10.7 | 14.1 | 18.5 | 26 to 79 |
| bjorvika | day | 5 | 0.79 | 40.5 / 68.3 | 32.2 | 6.8 | 13.8 | 30.2 | 22 to 74 |
| bjorvika | own | 5 | 0.79 | 35.4 / 73.1 | 10.3 | 16.8 | 9.3 | 7.7 | 18 to 62 |
| bygdoy | day | 5 | 0.81 | 23.9 / 67.6 | 21.3 | 10.7 | 12.5 | 18.5 | 21 to 79 |
| ekeberg | day | 5 | 1.00 | 29.6 / 77.2 | 15.4 | 13.1 | 9.4 | 20.4 | 15 to 64 |
| ekeberg | own | 5 | 1.00 | 28.0 / 78.3 | 16.8 | 16.4 | 6.6 | 7.7 | 15 to 53 |
| encore | day | 3 | 1.00 | 11.8 / 29.8 | 28.2 | 10.7 | 33.7 | 32.8 | 60 to 79 |
| encore | evening | 3 | 1.00 | 7.3 / 27.8 | 20.9 | 28.4 | 28.1 | 34.9 | 47 to 59 |
| gamlebyen | day | 5 | 0.91 | 31.2 / 70.3 | 30.6 | 16.2 | 11.7 | 29.8 | 20 to 61 |
| gamlebyen | own | 5 | 0.91 | 24.9 / 88.3 | 30.7 | 15.9 | 8.8 | 7.7 | 8 to 14 |
| holmenkollen | day | 5 | 0.72 | 41.2 / 72.3 | 27.8 | 10.4 | 10.1 | 27.9 | 29 to 95 |
| holmenkollen | own | 5 | 0.72 | 41.2 / 72.3 | 27.8 | 10.4 | 10.1 | 27.9 | 29 to 95 |
| kart | day | 4 | 0.69 | 35.9 / 63.5 | 21.3 | 10.7 | 19.3 | 18.5 | 26 to 79 |
| kart | night | 4 | 0.69 | 9.1 / 83.5 | 32.8 | 15.3 | 11.2 | 7.7 | 10 to 21 |
| kart-line2 | day | 4 | 0.69 | 39.4 / 63.5 | 21.3 | 10.7 | 19.3 | 18.5 | 26 to 79 |
| kart-line2 | night | 4 | 0.69 | 10.3 / 83.5 | 32.8 | 15.3 | 11.2 | 7.7 | 10 to 21 |
| korketrekkeren | day | 5 | 1.00 | 27.5 / 63.1 | 28.3 | 10.3 | 16.0 | 24.8 | 31 to 87 |
| korketrekkeren | own | 5 | 1.00 | 23.9 / 69.6 | 22.7 | 16.7 | 9.5 | 29.9 | 24 to 66 |
| langkaia | day | 4 | 0.88 | 20.1 / 73.8 | 21.3 | 10.7 | 12.2 | 18.5 | 26 to 91 |
| langkaia | night | 4 | 0.88 | 62.3 / 88.4 | 32.0 | 15.7 | 7.3 | 7.7 | 11 to 34 |
| nabolaget | day | 4 | 0.79 | 47.0 / 70.0 | 23.9 | 12.0 | 11.1 | 25.2 | 30 to 95 |
| nabolaget | own | 4 | 0.79 | 53.3 / 84.9 | 30.8 | 15.7 | 8.5 | 7.7 | 13 to 34 |
| nordmarka | day | 4 | 1.00 | 31.1 / 64.4 | 33.0 | 10.7 | 18.1 | 30.0 | 30 to 79 |
| nordmarka | own | 4 | 1.00 | 21.3 / 76.1 | 32.8 | 14.9 | 12.8 | 30.2 | 19 to 45 |
| ostensjovannet | day | 5 | 0.79 | 20.7 / 34.2 | 40.4 | 9.6 | 48.7 | 19.9 | 58 to 86 |
| ostensjovannet | own | 5 | 0.79 | 16.4 / 56.5 | 25.1 | 12.5 | 23.6 | 13.1 | 30 to 54 |
| radhuset | day | 4 | 0.79 | 20.0 / 39.6 | 20.2 | 10.7 | 36.2 | 18.5 | 58 to 92 |
| slottet | day | 5 | 0.73 | 40.2 / 69.5 | 19.4 | 10.7 | 10.9 | 24.9 | 30 to 85 |
| slottet | own | 5 | 0.73 | 40.2 / 69.5 | 19.4 | 10.7 | 10.9 | 24.9 | 30 to 85 |
| stortinget | day | 5 | 1.00 | 28.2 / 90.0 | 28.9 | 16.5 | 4.8 | 26.0 | 6 to 45 |
| vigelandsparken | day | 5 | 0.87 | 16.6 / 27.2 | 27.7 | 10.7 | 36.1 | 29.5 | 52 to 79 |


Read: the far views' own edges are softer than the outlines (the 99th percentile 12 to 41 by day, against the outline's 43.7), but Gamle Oslo's
snow on dark roofs (47 by day, which the winter night's level shows only by the T key) and where lit windows stand on a dark night (Langkaia's
Sørenga blocks, Gamle Oslo's houses: 53 to 62), which are lights (ADR 0054). The most of each is a single
pair of pixels (a lit window, the sun's rim, a gull). No far view comes near the warning red but Bjørvika's crane lights after dusk (10.3, named
since order 35); the paint's 7.7 after dusk is the kit's window light, named by ADR 0044 (small panes, never a top edge). The calm pale comes within 10
in Akerselva's, Bjørvika's and Østensjøvannet's by day, as smoothed edges of pale hills and the fjord's light (the walk below finds none in Akerselva's
or Østensjøvannet's drawn colours; Bjørvika's is its fjord by day, which the evening's level shows only when a player asks for it). The dark line:
Stortinget's vault (4.8) and the night's far views (7 to 9) are as dark as it; there the red outline round the dark line is what tells a figure.

**In the colours drawn** (`bin/farcolours.ts`, every view of 320 x 200 of every level walked as the palette test walks them, each far, mid and near
colour washed by its haze and tinted under each sky; `work/farcolours-main.txt`): the least distances over colours of four pixels or more in a view
are the warning red 12.4 (Langkaia's far red houses under the evening), the paint 18.7, what he takes 5.4 (Østensjøvannet's sun-coloured dots on its
far shore) and 8.8 (Stortinget's far lamps, Korketrekkeren's lantern light on its hills), the calm pale 7.3 (Bjørvika's fjord by day), his tunic 2.7
(Stortinget's T-bane blue on its far columns), a boss's "now" 13.8, the mark of things to use 13.2. Held by no test before this order: the palette test
holds only a level's fields (a 250th of what it paints) and order 34's test only the warning red.

**The ranking.** The 3s, thinnest first: **Rådhuset** (the shared hills and four plain blocks on the wrong side, and nothing at all up the towers),
**Vigelandsparken** (no landmark, a repeated spire, and the park's trees hide it), **Bygdøy** (Rådhuset's towers three to five to a screen, Akershus
and the jump missing, the city behind the woods), **Akershus** (MUNCH and the Barcode twice, the second on the wrong side; no Rådhuset, no Opera, no
island). Then the 2s: **Holmenkollen** (Rådhuset's towers repeat), Akerselva (a tower repeats, and I am not sure of it), Gamle Oslo (the spire
repeats), the encore (no Ekeberg), Østensjøvannet, Korketrekkeren, Slottet, Langkaia (the islands; its far layers are the first script's).
