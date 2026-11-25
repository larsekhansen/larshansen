# Order 46: the rest of the upright phone, and a second look at the dark below: what was done

Built on branch `upright-rest` from `origin/main` at `323a768` (after order 45, PR #93). Lars has not played; nothing was retuned: no route, box,
speed, timing, heart, enemy placement or word. Drawing only, one argument the kit's sky takes, and the upright test's named places taken out.
Pictures and working files outside the repository, in `~/.cache/claude-scratch-larshansen/o46/`: `shots/item1/` (the three tries side by side
per material, both upright sizes), `shots/handback/` (before over after, a sheet a level and size), `shots/before/` (origin/main's upright
pictures: order 45's final ones, which are byte-identical to origin/main's build, checked on six; the prow's taken from origin/main),
`shots/final/` (`after/`, the final build's upright pictures of every address at both sizes; `before-prow/`, origin/main's at the prow;
`side-wip/`, `desk-wip/`, `levels-wip/`, the final build's on its side, on a desktop and at LEVELS.html's addresses; `perf-main.tsv`, `perf-wip.tsv`), `shots/tries/` (`try0/` what stood, `tryA/` the first lighter try as built, `try2/` the second, `try1-first/` the
first try before its layers' lines were mended), `work/` (lists and measures), `bin/` (the scripts), `sloppy/`, `runs/`, `timing/`, `mainwt/` (an
archive of origin/main for its build, its runs and its suite).

## How it was looked at

As order 45 did (`o45/before.md`): every picture a phone's, at a pixel ratio of 3 with the pad up (`bin/upright.ts`, order 45's copy of
`tools/glance/hand.ts`, the page laid out again before the picture), at 390 x 844 and 360 x 640, by day and under each one's own sky, at order
45's five places of each level (and Gamlebyen's prow at dawn, `16-gamlebyen-prow`, the place order 45's test named). The flat bands were
measured as the test measures them, on this thread (`bin/flats.ts`, `bin/rows.ts`: each row under his feet, its detail and its colour), and the
pad's numbers over the band from the same frames (`bin/padnums.ts`).

## Item by item

| Item | Done? |
|---|---|
| 1. The dark below, a second look | Done. Three tries for every material at both sizes, by day and under its sky, with the pad (`shots/item1/`); the first lighter try taken for every material (the planner's call, `handbook/conversations.md`; ADR 0043 amended). The pad's measures hold (below) |
| 2. The eight left | Done: five filled (Rådhuset, Bygdøy, Østensjøvannet, Bjørvika, the encore); three right as they are (Nordmarka, Stortinget, the maps), each with why |
| 3. The three flat places | Done: Ekeberg's fjord far below the viewpoint, Gamlebyen's harbour at the prow, the encore's water mirror given what is there; none is named in the test now. The kit's horizon: done (the kit takes the row; the page hands it upright), 4 bytes of the first script by GNU gzip, the front page 28 of 28 |
| 4. Keep the table honest | Done: the table below; `render/upright.test.ts` without exceptions; LEVELS.html unchanged (no desktop picture changed) |
| Docs | HANDOVER, the handbook (start-here, roadmap, lessons, resources, conversations), DESIGN ("In the hand" item 10, the parts table, "Checking"), ADR 0043 amended (and its line in the ADR index), this file |

## 1. The dark below

For each of the nine levels order 45 gave a band under the ground (Holmenkollen, Korketrekkeren, Vigelandsparken, Slottet, Gamlebyen, Gamle Oslo,
Langkaia, Ekeberg, Akerselva), at 390 x 844 and 360 x 640, by day and under its sky, with the pad, three builds of the same code side by side
(`shots/item1/<material>_<size>.png`, rows: what stood, A, B):

- **What stood**: from two or three tiles under the surface the ground darkens to the level's near-black at 0.75 to 0.8, with thin lines at
  14, 33, 57, 84, 116, 152 and 194 pixels.
- **A, the band ending at a tone of its own material's darkest ramp step** (`Under.deep`, by the letter at a column's foot or by the column): snow
  to packed blue-grey snow (Holmenkollen's deepest snow's darkest step, Korketrekkeren's crust's) and then the rock its boulders and stones are
  of; earth to dark wet earth (`earthOf`'s darkest, the park's deepest soil, the hillside's, the old town's); stone to its shaded courses (Slottet's
  deepest setts, Gamle Oslo's street, Rådhuset's quay granite, the shared quay's); the Opera's marble to its shadowed grey (its seam and edge);
  water to its deep. 0.85 at its darkest.
- **B, the darkening starting three tiles lower in three broad layers** (a soft first, then two each beginning at a deeper line and holding
  nearly even), to the same near-black.

**Taken: A, for every material.** Under snow it reads as snow over rock where the near-black read as a shadow over the screen; earth reads as
earth going down; the stone as courses in shade; the marble as the Opera's foot in its own grey (order 45 asked whether the black there read as
a strange column); the water as water deepening. B keeps the black under the pad, and its broad steps' edges read as shelves across the screen.
Two things were mended in A as it was first built (`shots/tries/try1-first/`): its lines, by alpha alone over ground of nearly their own colour,
hardly showed and the plain runs under him grew (Langkaia 13.4 to 18.5 % of the screen, Slottet 7.8 to 16.4, Ekeberg 23.3, Gamle Oslo 16.9), so in
its own tones a layer's line is the tone lit and the tone in the joint's shade, seen from the first layer on; and water's deep tones, toward
the ink, came 6.5 off his tunic's navy (`render/upright.test.ts` found it: 324 colours), so water goes to a dark teal (`DEEP_WATER`: the tiles'
deep water to #143c3a, 11.3 or more off it), its lines its depth strips (the light from above, no joint). A pit's foot keeps the near-black, so a
pit reads as one.

**The pad's measures** (order 41's, the stylesheet's colours over every pixel of the pad's two rows, the last 170 CSS pixels, at the four places
of every level with a band, both sizes, by day and under its sky; `work/pad-try0.tsv` and `pad-final.tsv`):

| | Before | After | Order 41's bound |
|---|---|---|---|
| A word at rest off its button's fill | 19.5 | 19.5 | 18 |
| Pressed, off the pressed fill (with its white ring) | 39.2 | 39.2 | 35 |
| Dimmed | 9.9 | 9.9 | 9 |
| A button seen off the ground (its fill or its edge) | 17.3 | 17.3 | 15 |
| At the band's darkest: the white word off the button's face (order 45's measure) | 79.3 (Holmenkollen) | 66.5 (Holmenkollen's rock) | |
| At the band's darkest: the button's white edge off the ground | 48.7 | 42.9 | |

The least of each over the pad's rows is where the ground is lightest (snow, marble, sky), as before; over the band itself the word stands
further off than over the snow beside it.

**Never somewhere to go**: the band begins two or three tiles under the surface as before, its layers are lines a pixel each, not shelves, no
lit top of the paint's yellow; it is drawn under the street's things and over nothing he can touch. `render/upright.test.ts` holds (below).

## 2. The eight left

| Level | Filled, or why it is right as it is | Its file, gzipped (vite) |
|---|---|---|
| Rådhuset (day) | A summer day over the fjord: two high streaks, four small clouds far off, a few gulls, the air thick toward the horizon; under the square and the quay the granite going down to its shaded courses, an old water main | 6.55 to 6.74 kB |
| Bygdøy (day) | Three high streaks, a plane's trail, four small clouds far off over the fjord, gulls, the air thick; under the beach the sand to dark wet sand, under the halls their slabs to the shaded courses, under the park the earth to dark wet earth, the quay's stone to its shaded courses, and where the fjord is over the ground its water to its deep (`WET`); a stone and a root now and then, not under the fjord | 10.71 to 11.02 |
| Østensjøvannet (twilight) | The twilight before the sunrise over the lake: the last stars thinning toward the horizon, a high streak, three small clouds far off over Østmarka, a skein of geese, the air thick. Under the island the lake's old bed already goes down in its own layers, darker deeper (order 20): left as it is | 8.10 to 8.15 |
| Bjørvika (evening) | Three high streaks lit from below, a plane's trail, three small clouds far off, crows, the air thick. Under him the new blocks' façades fill the screen with their windows (order 45): left as they are | 7.23 to 7.29 |
| The encore (evening) | Three lit streaks, three small clouds far off, gulls, the air thick over the park; under the path the earth to dark wet earth, under the water mirror its deep with its depth strips, and in the mirror the stage (item 3). Its stage, figures and lights as ADR 0052 has them | 11.48 to 11.98 |
| Nordmarka | Right as it is: its dark is the level's idea (only the headlamp's circle shows; order 45's plain runs 0.11 / 0.005) | unchanged |
| Stortinget | Right as it is: under the ground, no sky; the vault's rock over him, the platform's concrete and the track bed under him (0.01 / 0.005) | unchanged |
| The maps | Right as they are (order 45's 1): the bar is tall there and the fjord under the viaduct darkens in bands with its piers. Their sky's gradient changed with item 3's horizon, as every upright sky did | unchanged |

Cost and motion: below (Measures). Nothing new moves: the brush's streaks, clouds and birds hold still with reduced motion as order 45 made them.

## 3. The three flat places, and the horizon

- **Ekeberg's fjord far below the viewpoint** (0.43 of the screen under his feet on origin/main): drawn only where the screen is taller than wide
  (what a wide screen never reaches), in its far layer with the brush of order 43 (`farPiece`, `drawFar`), still: the far shore's long wooded
  point coming in from the west with houses and a jetty, an island further out than Hovedøya, a holm with a row of summer cabins, a ferry
  going out to sea with its wake held still behind it, a bare skerry with a sea mark nearer in, and the light on the nearer water in short
  streaks. Their colours, washed by the far layer's haze toward each sky's air and tinted as `render/warning.test.ts` washes them, stand 12.0 or
  more off every role (`bin/farcheck.ts`: first drawn, the cabins' ochre came 7.7 off a coin's copper in the evening and the wake's far end 10.3
  off his tunic; both changed). Under his feet now 0.08 at the most anywhere in the level; at the viewpoint under its own sky 0.03 at 360 x 640
  and 0.02 at 390 x 844.
- **Gamlebyen's harbour at the prow** (0.29 to 0.34 on origin/main): the water goes down to its deep with its depth strips (item 1), and the last
  longship's mooring chain hangs from under its bow into the dark (one copy). And a flaw found there and mended: at dawn the level's sky is
  drawn in its far layer for a view of the usual height round him, so upright the night stood over it with a hard edge (origin/main has it,
  `shots/before/`); on the sky's canvas, above that, the dawn's highest colour as the dawn lays it (`dawnAbove`, one fill, only once the dawn
  comes and after dusk). Now 0.11 at the most.
- **The encore's water mirror** (0.28): what it mirrors, faintly: the stage upside down from the water line (its deck, the dark curtain in
  folds, the truss towers and the roof), laid into the water's deep tone and fainter the deeper, broken by the ripples (a row in six broken,
  the rows beside it shifted a pixel); what is dark mirrors as the water's own dark. Still: the stage's lights, the neon and Loki are not in it.
  Now 0.06.
- **The kit's horizon upright**: the kit's `drawSky` ran its gradient from its top colour to the horizon's over the whole canvas, so upright the
  horizon's colour lay at the screen's foot, under the ground. It takes the row now (`low`, the canvas's foot unless given; `beginLayers` passes it
  on), and the page hands it his row upright (`main.ts`, `render`): the sky reaches its horizon's colour where the far view stands. 4 bytes of the
  first script by GNU gzip (8 by zlib); the front page passes nothing and is 28 of 28. It changes every upright sky but Stortinget's (under the
  ground); on its side and on a desktop nothing (the page passes nothing there).

## 4. The table again

Order 45's marks upright (1 the screen used, 3 most of it plain sky or plain ground) and order 46's, and the longest plain run over his head and
under his feet as `render/upright.test.ts` measures it (its four places, both sizes, by day and under its own sky; the most of them, as a share of
the screen under the bar), origin/main and now (`work/flats-main.tsv`, `flats-wip.tsv`).

| Level | Order 45 | Now | Over / under, origin/main | Now | Why |
|---|---|---|---|---|---|
| Langkaia | 2 | 2 | 0.09 / 0.13 | 0.09 / 0.05 | The quay, the marble and the water in their own tones. Still 2: the sky is 43 % of the screen at the quay, though it now pales to its horizon at the far view |
| Akershus | 1 | 1 | 0.10 / 0.03 | 0.10 / 0.03 | The sky's horizon only |
| Rådhuset | 1 | 1 | 0.11 / 0.00 | 0.08 / 0.05 | Its sky and the granite going down (item 2) |
| Slottet | 2 | 2 | 0.11 / 0.08 | 0.11 / 0.08 | The setts going down to their shaded courses. Still 2: the 17 May sky is plain blue between its streaks and clouds |
| Holmenkollen | 1 | 1 | 0.12 / 0.01 | 0.12 / 0.03 | Snow over rock where it went to a slate black |
| Akerselva | 2 | 2 | 0.12 / 0.05 | 0.12 / 0.05 | Earth to dark wet earth. Still 2, as order 45 left it: Grefsenkollen is behind the T-bane's hall at the start |
| Nordmarka | 2 | 2 | 0.11 / 0.01 | 0.11 / 0.01 | Right as it is: the dark is the level's idea |
| Stortinget | 1 | 1 | 0.01 / 0.01 | the same | Under the ground |
| Ekeberg | 2 | 1 | 0.16 / 0.43 | 0.16 / 0.08 | The fjord far below the viewpoint (item 3); the hillside to dark wet earth |
| Gamle Oslo | 1 | 1 | 0.19 / 0.08 | 0.19 / 0.08 | The street's setts in their own tones |
| Bygdøy | 2 | 1 | 0.14 / 0.00 | 0.11 / 0.08 | Its sky; sand, slabs, earth, quay and fjord each to its own deep (item 2) |
| Vigelandsparken | 1 | 1 | 0.09 / 0.08 | 0.09 / 0.08 | The park's soil to its darkest |
| Korketrekkeren | 1 | 1 | 0.14 / 0.11 | 0.14 / 0.11 | The run's snow to its crust's darkest and the stones' rock |
| Østensjøvannet | 2 | 1 | 0.19 / 0.03 | 0.13 / 0.03 | Its twilight sky (item 2); the bed's own layers |
| Bjørvika | 2 | 1 | 0.16 / 0.01 | 0.12 / 0.01 | Its evening sky (item 2); the façades |
| Gamlebyen | 1 | 1 | 0.14 / 0.29 | 0.14 / 0.11 | The harbour at the prow and its dawn (item 3); the old town's earth |
| The encore | 2 | 1 | 0.12 / 0.28 | 0.12 / 0.06 | Its sky, the park's earth, the water mirror (items 2, 3) |
| The maps | 1 | 1 | | | The sky's horizon only |

**Every 2 that remains**: Langkaia (the sky's height at the quay), Slottet (17 May's plain blue between the clouds), Akerselva (a landmark behind
the hall, not the bands), Nordmarka (its dark). **No 3.**

**The test** (`render/upright.test.ts`): its three named places (`FLAT_NAMED`) are gone; none takes more than a fifth of the screen (the most now
0.19, Gamle Oslo's sky by day at the highest place, as on origin/main). It composes the sky as the page now draws it (the horizon at his row).
Its colour test found the water's tones near his tunic (above) before they were changed: least now his tunic 11.3 (the encore's mirror), the calm
outline 11.6, what he takes 13.9, things to use 16.5, a boss's now 21.6, the paint 24.2, the warning red 25.1.

**LEVELS.html**: its pictures are at 1280 x 800, where nothing changed (below); none retaken.

## Measures

- **The first script**: **55,943 bytes by zlib** as vite measures it (55.94 kB; origin/main 55,935) and **55,878 by GNU `gzip -c`** (origin/main
  55,874): **+8 and +4 bytes** (the order allows 200): the row the page hands the kit's sky upright, the kit's parameter, the chunks' names.
- **Each file that grew** (gzipped, as vite reports them, origin/main's build to the final one): `feel`'s file 50.03 to 50.33 kB (the brush's
  tones and lines, `DEEP_WATER`, Langkaia's deep tones); Ekeberg 7.90 to 8.81 (the fjord far below); the encore 11.48 to 11.98 (its sky, ground and
  mirror); Bygdøy 10.71 to 11.02; Rådhuset 6.55 to 6.74; Gamlebyen 16.40 to 16.67 (the mooring, the dawn carried up); Østensjøvannet 8.10 to 8.15;
  Bjørvika 7.23 to 7.29; Holmenkollen 6.58 to 6.62; Korketrekkeren 7.77 to 7.81; Vigelandsparken 8.41 to 8.44; Slottet 9.42 to 9.44; Gamle Oslo
  15.27 to 15.30; Akerselva 10.92 to 10.93; Stortinget and the routes' files within 0.01 (the chunks' names) (`work/build-main.log`,
  `build-wip.log`).
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (the native
  7.0.2 in Bun's cache, its binary run directly, so nothing was fetched).
- **`bun run build`** at the root: clean (`work/build-root.log`); its viking first script is the final build's (`index-DnclRSMO.js`).
- **The front page**: **28 of 28** byte-identical to `/tmp/shots-before-jernhaugen/` from the root build (`front/`).
- **The maze's rules**: `packages/maze/tools/runs.ts` on the branch and on origin/main's archive: the runs identical (the files differ only in the
  line naming where the ghosts went), the ghosts byte-identical, and origin/main's ghosts replayed on the branch to the finish on all seven (`runs/`).
- **The pad's buttons on the band**: the table in item 1.
- **The run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the encore, on the
  branch and on origin/main's archive: **17 of 17 byte-identical** (`sloppy/branch/md5.txt`, `sloppy/main/md5.txt`), and identical with order 45's.
- **On its side and on a desktop: byte-identical.** On its side (844 x 390, a phone at a pixel ratio of 3 with the pad, order 45's 107 addresses):
  **107 of 107** byte-identical with origin/main's; on a desktop (1280 x 800, `tools/shots.ts`, order 45's 66 addresses): **66 of 66**; LEVELS.html's
  23 addresses at 1280 x 800: **23 of 23** (none blank). Origin/main's are order 45's final pictures, from its build of origin/main's code
  (order 45 found them byte-identical with its own origin/main's before it).
- **Upright**: of the 324 pictures (162 addresses at both sizes), Stortinget's 10 are byte-identical with origin/main's; every other level's differ,
  as drawn, and Akershus's, Nordmarka's and the maps' by the sky's canvas only (item 3: their files are unchanged).
- **Rectangles and copies a frame** (`tools/glance/perf.ts` at 390 x 844, its view 391 x 845 at a pixel ratio of 1 as every order measured it; all
  162 addresses by day and under each one's own sky, origin/main's build and the final one, `shots/final/perf-*.tsv`):

  | Level | Places | Rectangles | Copies |
  |---|---|---|---|
  | Rådhuset | 5 | +3 to +21 | +0 to +6 |
  | Bygdøy | 5 | +19 to +47 | +8 |
  | Østensjøvannet | 10 | +22 | +4 to +5 |
  | Bjørvika | 10 | +10 | +7 |
  | The encore | 10 | +16 to +25 | +7 |
  | Ekeberg | 10 | +0 to +7 | +0 to +6 (the fjord below the viewpoint) |
  | Gamlebyen | 12 | +0 to +1 | +0 to +1 (the mooring) |
  | Langkaia, Holmenkollen, Korketrekkeren | 30 | +0 to +2 | +0 |
  | Akershus, Slottet, Akerselva, Nordmarka, Stortinget, Gamle Oslo, Vigelandsparken, both maps | 65 | +0 | +0 |

  The order allows +60 and +10. The band in its own tones is the same one fill a column group (a column group more where two materials meet); the
  sky's horizon is the same one gradient.
- **Reduced motion**: nothing new moves. `render/upright.test.ts` holds that the two hooks draw the same calls at four moments of the clock with
  reduced motion in every level and sky (it now draws Rådhuset's, Bygdøy's, Østensjøvannet's, Bjørvika's and the encore's too); the fjord below Ekeberg's
  viewpoint, the mooring and the mirror image are still pieces; Gamlebyen's dawn carried up follows the dawn as the level's own dawn does.
  `render/reduced.test.ts` passes.
- **`bun test`**: the viking suite **542 pass, 0 fail** on the branch and on origin/main (no test added: the upright test's named places
  were taken out), alone on a quiet Pi, in turn the same hour (`timing/times.txt`): the branch **286.3 s and 287.1 s**, origin/main **287.3 s and
  285.9 s**: on the means **+0.1 s** (the order allows 5). `render/upright.test.ts` 3 pass. `packages/pixelkit` 157 pass, `packages/maze` 254 pass,
  `apps/landing` 18 pass, none fail. (A first run of the suite while the pictures were being taken: 542 pass in 363 s, a busy Pi.)

## What only a person can judge, as a list for Lars

- Whether the ground under him now reads as ground going down (snow over rock, dark wet earth, stone in shaded courses, the Opera's marble in its
  grey, the harbour's water deepening), and whether it is now too light, where the near-black read as a shadow.
- Whether the pad's buttons read as well on it on a real phone (by the numbers they hold order 41's measures; over the darkest band the word
  stands 66.5 off its button where it stood 79.3).
- Whether the sky reaching its horizon's pale at the far view reads as a sky with air in it, or as a washed-out lower sky.
- At Ekeberg's viewpoint: whether the fjord below reads as the fjord seen from the hill (the islands, the ferry and its wake, the far shore's
  point), and whether the planner's places are right (none is a named island; the far shore is the fjord's west side in general).
- At the encore: whether the stage upside down in the water mirror reads as a reflection, or is too faint to see at all.
- At Gamlebyen's prow: whether the chain reads as a mooring; whether the dawn's sky now reads as one sky over the whole screen.
- The skies of Rådhuset, Bygdøy, Østensjøvannet (a skein of geese at dawn) and Bjørvika: weather and depth, or clutter.
- Whether any of it shows as it should on a real phone and at speed.

## Departures, doubts, found and not fixed

- **Departures**: the sky's horizon (item 3's last bullet) changes every level's upright sky but Stortinget's, so "upright, every level you did
  not change byte-identical" holds for Stortinget alone (10 of 10 pictures); Akershus, Nordmarka and the maps, whose files this order did not
  touch, differ upright by the sky's canvas only (the change is in `drawSky`'s gradient, which the page calls on the sky's canvas before any
  layer). The first try was mended as it was taken (its lines in its own colours, the water's teal), and `most` went from 0.75 to 0.8 to 0.85
  where a level's ground goes down in its own tones. Gamlebyen's dawn edge upright was not asked for; it was found at the prow and mended (one
  fill). Østensjøvannet and Bjørvika got their skies only: their ground under him was already filled (the lake's old bed, the façades). Origin/main's
  upright pictures are order 45's final ones (its source is origin/main's; six taken again were byte-identical), and so are its pictures on its side,
  on a desktop and of LEVELS.html (order 45 found its build's byte-identical to origin/main's before it); origin/main's frame measures were taken
  again (they equal order 45's final ones). The second try's code (`steps`) and the switch the three builds were made with are not in the branch.
- **Doubts**: whether the lighter ground is too light under the pad on a real phone (the numbers hold order 41's bounds); whether the encore's
  mirror image is too faint to be seen as one; whether Ekeberg's islands, a sliver each at phone size, read as islands; whether the Opera's marble
  going down light (Langkaia's start) reads as the building's foot or a pale column, the question order 45 asked of the black.
- **Found and not fixed**: drawing in a far layer made only for an upright screen (Ekeberg's fjord) is held by no test (`render/warning.test.ts`
  walks at 320 x 200); it was checked by hand. Order 45's notes stand: falling snow as sparse upright as the kit draws it; the kit's stars evenly
  over the upper three fifths; the day's sun placed by a world horizon.
