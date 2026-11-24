# Order 45: the upright phone: looked at first

Looked at on branch `upright-phone`, from `origin/main` at `8db73cf` (after order 44), its build (`vite build` in `apps/viking`, vite under
Node; the first script `index-CfSsQxsw.js`, as order 44's). Pictures and working files outside the repository, in
`~/.cache/claude-scratch-larshansen/o45/`: `shots/before/390x844/` and `shots/before/360x640/` (the pictures and `measure.jsonl`),
`shots/sweep/` (the sweeps), `work/` (the lists and measures), `bin/` (the scripts).

## How it was looked at

- **A phone, not a window.** Earlier rounds photographed "390 x 844" with `tools/shots.ts`, at a device pixel ratio of 1: that view is 391 x 845
  art pixels, a third taller and wider than a phone's. A phone at a ratio of 3 is 293 x 634 art pixels at 390 x 844 and 271 x 481 at 360 x 640
  (the kit's `viewFor`: the 240-pixel minimum width, ADR 0019, makes the scale 4 device pixels an art pixel). Every picture here is a phone's:
  `bin/upright.ts`, order 45's copy of `tools/glance/hand.ts` (Firefox told it has a coarse pointer and a pixel ratio of 3, the pad up with
  `&touch`, the stepped page laid out again with `__game.layout()` so the camera is framed with the pad up, as in play: `handbook/lessons.md`,
  order 42). The picture is the screen's CSS pixels.
- **The canvases read row by row.** The same tool reads the page's canvases (the sky's, the three far layers', the street's: all at art pixels)
  and writes for every row of the view how much of it the street covers, how much of the far layers shows, how much is the sky alone, and how
  much of the composite has detail (a pixel more than 24, summed over red, green and blue, off its right or lower neighbour). From that
  (`bin/bands.py`): the sky over the far view (from under the bar to the first row a tenth covered), the far view (rows a tenth or more far),
  the play (from the highest his head goes to the lowest his feet go along the scripted route within half a view of him: `bin/places.ts`), the
  band below his feet, the pad's bottom row, and the longest run of plain rows (detail on under 1 % of the row) above him and below him.
- **Five places a level** (`bin/places.ts`, from the scripted route): the start (step 170, the place's name gone), the highest he stands, the
  lowest, a boss's fight (150 steps after it wakes) or the end, and one ordinary stretch (nearest the middle); the encore at its start, three
  moments of the fight and its end; each line map at five stations. By day and under the level's own sky (Langkaia and the map, which follow
  the clock, at night), at 390 x 844 and 360 x 640: 320 pictures, none failed.
- **The whole level** (`bin/sweep.ts`): one page a level, him put at every place of the route every 40 world pixels in turn (1,525 places),
  the frame drawn still each time and the canvases read the same way, at both sizes, by day and under the level's own sky; and from a scratch
  build that notes every far piece it draws (a hook in `alive/far.ts`, not in the repository) how much of each landmark of orders 43 and 44
  shows (not under a nearer layer, the street or the bar).

## What every upright frame has in common

- **He stands at 0.60 of the screen's height** (his feet 505 of 844 CSS pixels; 368 of 640) wherever the camera is not held by the level's top:
  ADR 0021's two thirds, counted from the canvas's top to the pad's bottom row (ADR 0043). The bar covers the top 85 CSS pixels (64 art
  pixels); the pad's bottom row (the move pad, the jump) the last 100. Above his feet 420 CSS pixels show (315 art pixels, about 20 tiles; at
  360 x 640, 283 and 13 tiles), below them 340 (255 art pixels, 16 tiles; of them about 4.7 tiles under the pad's row; at 360 x 640, 273 and
  12.8). In 1,525 places of the sweep he stands so everywhere but on Akershus's upper walls (18 of 75 places: 0.17 down, the camera held by the
  map's top) and one place of Rådhuset's tower.
- **So in every level that walks a street** the screen is shared alike: from under the bar about 40 % sky, a strip of 5 to 30 % where the far view
  and the street's own buildings stand, and 45 % ground under his feet. The play (from the highest he goes near there to his feet) is 39 to 256
  CSS pixels, a twentieth to a third of the screen.
- **What is above him he sees in time**: a jump is 46 art pixels, the feather's 91; within the view the route climbs at most 256 CSS pixels over
  his feet, and the view shows 420 above them. **What is below him**: 16 tiles at 390 x 844, 12.8 at 360 x 640, of which the pad's row covers
  the last 4.7 (the frame test holds that he, two tiles under him and six ahead are never under a button). Nothing on the routes was found out of
  view: the camera is not where the screen is wasted.
- **The sky band** is the kit's sky (`pixelkit/sky.ts`) made for a view about 200 high: a gradient from its top colour to the horizon's over the
  whole canvas (so upright the horizon's pale colour lies at the screen's foot, not at the horizon), a sun or a moon 96 pixels over a world
  horizon, seven small clouds, by night the stars evenly over the upper three fifths and the northern lights' band, falling snow where it snows.
  Upright that is about 330 CSS pixels of plain blue with seven clouds; plain runs of rows (no cloud across them) of up to 200 CSS pixels
  (Holmenkollen), 26 % of the screen under the bar in the sweep's worst place.
- **The band below** is the level's ground going on down (its own tiles inside the map, then its bottom row repeated past the map's foot, ADR
  0021): earth, snow, setts or stone of one material's texture, at phone size a band of one colour. The sweep's longest plain runs below his feet
  (no detail across them): Nordmarka 44 to 48 % of the screen, Ekeberg 31 to 43 %, Gamlebyen 23 to 48 %, Vigelandsparken 29 to 30 %, Gamle Oslo
  14 to 19 %, Korketrekkeren 16 to 18 %. Elsewhere the texture breaks every row, but the band is still one material from his feet to the foot.
- **The far view** is drawn as for a view 220 high round him and moved down to where he stands (ADR 0021), but what is placed in the world (all
  of orders 43 and 44's landmarks) stays at its world height: upright it is a strip at the horizon, 30 to 230 CSS pixels, mostly behind the
  street's own buildings. **And where he climbs it does not rise**: `climbed` (order 20, ADR 0042) raises the far layers as the view climbs on a
  wide screen and returns nothing upright, so from Akershus's walls Rådhuset's towers (a landmark of order 43) never show upright (19 places in
  view, none with half of it showing), and Slottet's ridge with the jump and the TV tower never shows half (47 places, 0).

## Every level, upright

Each row: the shares of the screen's height in CSS pixels at 390 x 844 (at 360 x 640 in brackets), the mean of the five places by day: sky over the far
view / far view / play / below his feet; the longest plain run above and below him there; what stands in the sky band and below the ground; the
landmarks of orders 43 and 44 (from the sweep at 390 x 844 by day: places it is in view / places at least half of it shows); where he stands; a
mark, 1 (the screen used) to 3 (most of it plain sky or plain ground).

| Level (its sky) | Sky / far / play / below | Plain runs above / below | In the sky band | Below the ground | Landmarks upright | He stands | Mark |
|---|---|---|---|---|---|---|---|
| Langkaia (the clock; night) | 358 / 74 / 154 / 340 (221 / 71 / 152 / 273) | 88 / 7 | Seven clouds and the sun; by night stars, the northern lights' band, the moon | The fjord in the lane (its strips, then deep water of one colour past the map's foot); at the start the Opera's marble and the quay's stone | Hovedøya 47/32, Lindøya 44/32, the islets 40/31 and 39/27, Ekeberg 25/6 | 0.60 | 3 |
| Akershus (day) | 180 / 44 / 256 / 481 (157 / 29 / 255 / 342) | 88 / 0 | Clouds, the sun (from the hoist, low beside the walls: it is placed by a world horizon far below him) | The fortress's stone: his walls, which he climbs | Bjørvika 20/7, Hovedøya 31/10, Rådhuset 19/0 (never: the far layers do not rise upright) | 0.43 (0.17 on the upper walls, held by the map's top) | 2 |
| Rådhuset (day) | 230 / 45 / 249 / 405 (140 / 44 / 231 / 303) | 115 / 1 | Clouds, the sun | The quay's granite; the towers' brick as he climbs | Akershus 19/15, Hovedøya 48/41, Aker Brygge 18/3 | 0.52 | 2 |
| Slottet (17 May) | 332 / 30 / 116 / 340 (197 / 30 / 110 / 272) | 132 / 0 | Clouds, the sun, far birds | Karl Johan's paving going down, grey | The ridge with the jump and the TV tower 47/0 (never half: the far layers do not rise upright) | 0.60 | 3 |
| Holmenkollen (winter day, snowing) | 308 / 170 / 104 / 362 (186 / 142 / 93 / 280) | 200 / 0 | Blue with seven clouds and the sun though it snows; the snow falling, sparse over the tall view | Snow, white to pale blue, in four steps darker down: at phone size one white band | Rådhuset by the harbour 54/28, the islands 52/7 and 36/30 | 0.57 | 3 |
| Akerselva (day) | 279 / 139 / 122 / 341 (147 / 133 / 120 / 273) | 156 / 1 | Clouds, the sun, far birds | Brown earth; the river's water | Grefsenkollen 50/9 (behind the T-bane's hall and the bank at the start), Sagene kirke 36/8, Paulus kirke 37/18 | 0.60 | 3 |
| Nordmarka (summer night) | 0 / 18 / 63 / 341 (0 / 20 / 59 / 273) | 69 / 333 | The forest's dark; only his headlamp's circle | Dark earth under the dark | (none drawn) | 0.60 | 2 (the dark is the level's idea) |
| Stortinget (underground) | 0 / 196 / 103 / 341 (0 / 115 / 101 / 273) | 3 / 1 | No sky: the vault's rock, its lamps | The platform's concrete, the track bed | (none drawn) | 0.60 | 1 |
| Ekeberg (evening) | 280 / 229 / 91 / 341 (130 / 226 / 88 / 287) | 113 / 239 | The Scream's bands over the town, clouds; no star | Plum-brown earth, one colour: plain for 31 to 43 % of the screen | (the town below; none of orders 43 and 44) | 0.60 | 3 |
| Gamle Oslo (winter night) | 325 / 190 / 189 / 346 (176 / 150 / 189 / 291) | 137 / 7 | Stars evenly over the upper sky, the northern lights' band, the moon, falling snow | Snow and setts, then earth; the houses' walls | The city 45/8, Ekeberg 84/9, Kampen kirke 48/9 (between the roofs he walks on) | 0.59 | 3 |
| Bygdøy (day) | 308 / 47 / 214 / 341 (173 / 46 / 143 / 274) | 95 / 12 | Clouds, the sun | Sand and earth; the halls' floors | The jump 67/1, Rådhuset 62/2, Akershus 61/2 (behind the woods but in the gap by the water, as orders 43 and 44 have it) | 0.60 | 2 |
| Vigelandsparken (day) | 347 / 75 / 114 / 341 (211 / 76 / 114 / 273) | 108 / 1 (the sweep: 30 % below) | Clouds, the sun | Brown earth, plain | The ridge with the jump and the TV tower 46/19 | 0.60 | 3 |
| Korketrekkeren (evening) | 309 / 102 / 39 / 341 (174 / 101 / 38 / 273) | 181 / 81 | Peach clouds; no star, no bird | The run's snow, lilac, plain | The town 154/41 and 128/31, the islands 61/31, the TV tower 9/4 (behind the first sign's bubble at the start) | 0.60 | 3 |
| Østensjøvannet (twilight) | 203 / 60 / 71 / 341 (122 / 60 / 71 / 273) | 137 / 13 | Clouds, the moon or the sun coming up | The island's bank in layers (order 20), the lake | Østmarka 139/34, the blocks 114/18, 93/24 and 57/26, the reeds 66/39 | 0.60 | 2 |
| Bjørvika (evening) | 218 / 134 / 95 / 397 (94 / 53 / 93 / 317) | 113 / 3 | Clouds; the cranes | The new blocks' façades with their windows, the site's concrete | (the Opera, the Barcode, MUNCH in its own layers) | 0.53 | 2 |
| Gamlebyen (night) | 315 / 146 / 155 / 341 (179 / 166 / 152 / 273) | 107 / 175 | Stars evenly, the northern lights' band, the moon | Brown earth, plain (23 to 48 % of the screen in the sweep); the harbour | (Ekeberg's slope, order 20's) | 0.60 | 3 |
| The encore (evening) | 268 / 94 / 68 / 341 (132 / 93 / 68 / 273) | 97 / 16 | Peach clouds, the low sun | The park's earth, the water mirror | Ekeberg 7/0 (behind the towers) | 0.60 | 2 |
| The map, line 1 (the clock) | 237 / 359 / 80 / 340 (101 / 292 / 80 / 272) | 88 / 0 | The bar is tall here (the site's links): the sky is a fifth | The fjord under the viaduct, darkening in bands, the piers | (each station's skyline) | 0.60 | 1 |
| The map, line 2 open | 249 / 358 / 80 / 340 (112 / 290 / 80 / 272) | 88 / 0 | The same | The same | The same | 0.60 | 1 |

## The ranking

The 3s, most plain first: **Holmenkollen** (the tallest plain sky, 200 CSS pixels in a run, and a white band of snow under him), **Korketrekkeren**
(181 of plain evening sky, plain snow), **Vigelandsparken** (the tallest sky of all, 347, and plain earth), **Slottet** (332 of sky, grey paving),
**Gamlebyen** (a tall night sky of even stars; plain earth for up to half the screen), **Gamle Oslo** (the same sky; under it the street),
**Langkaia** (358 of sky; the fjord's deep water past the map's foot one colour), **Ekeberg** (its bands fill the evening sky, but plain earth for a
third of the screen and more), **Akerselva** (sky 279, brown earth). Then the 2s: Rådhuset, Akershus (the far layers that do not rise: item 2),
Bygdøy, Østensjøvannet, the encore, Bjørvika, Nordmarka. The 1s: Stortinget, the two maps.
