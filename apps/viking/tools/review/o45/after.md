# Order 45: the upright phone: what was done

Built on branch `upright-phone` from `origin/main` at `8db73cf` (after order 44). Lars has not played; nothing was retuned: no route, box, speed,
timing, heart, enemy placement or word. Drawing and framing only, and one test file. Pictures and working files outside the repository, in
`~/.cache/claude-scratch-larshansen/o45/`: `shots/before/` (origin/main's build, upright at both sizes), `shots/final/` (`after/`, the final build's
upright pictures of the same 160 addresses at both sizes; `side-main/`, `side-wip/`, `desk-main/`, `desk-wip/`, `levels-main/`, `levels-wip/`: on its side,
on a desktop and LEVELS.html's addresses from both builds; `perf-*.tsv`), `shots/handback/` (before over after, a sheet a level and size),
`shots/sweep/` and `shots/sweep-after/` (every level swept, before and after), `work/` (the lists and measures), `bin/` (the scripts: `before.md` says
how each looks).

## Item by item

| Item | Done? |
|---|---|
| 1. Look first: every level upright, on one table | Done: `before.md` (16 levels, the encore, both maps; 320 pictures at a phone's pixel ratio with the pad; the canvases read row by row; every route swept, 1,525 places; each landmark's share showing; a mark each and a ranking) |
| 2. Frame it | Done, the planner's call (ADR 0043 and 0042 amended, `handbook/conversations.md`): where he stands kept, with why; the far layers rise with him upright as on a wide screen (`climbed`) |
| 3. Fill it | Done for ten, from the top of the ranking: Holmenkollen, Korketrekkeren, Vigelandsparken, Slottet, Gamlebyen, Gamle Oslo, Langkaia, Ekeberg, Akerselva (the 3s), and Akershus's sky (a 2, whose sky the test found over its bound). Not filled: Rådhuset, Bygdøy, Østensjøvannet, Bjørvika, the encore, Nordmarka, Stortinget, the maps (below, with why) |
| 4. Keep the table honest | Done: the table again (below); a test (`render/upright.test.ts`: flat bands upright, the hooks' colours, reduced motion); LEVELS.html's pictures are at 1280 x 800 and none changed |
| Docs | HANDOVER, the handbook (start-here, roadmap, lessons, resources, conversations), DESIGN ("In the hand" item 10, the depth rule, the parts table, "Checking"), ADR 0043 and 0042 amended, `before.md`, this file |

## 2. Frame it: the rule

- **Where he stands: kept.** He stands at 0.60 of the screen upright (two thirds of the way down from the canvas's top to the pad's bottom row) in
  1,506 of the sweep's 1,525 places; the screen is shared alike in every level that walks a street: about 40 % sky, a strip of far view and street, 45 %
  ground. Standing him lower shows more of the plain sky (the sky band is already the plainer), higher more of the plain ground; neither fills it.
  What he must see is in view as he stands: within a view the route climbs at most 256 CSS pixels over his feet (the five places' play band), the
  view shows 420 above them (283 at 360 x 640); below, 16 tiles (12.8), 4.7 of them under the pad's row, which `game/frame.test.ts` keeps off him and
  the ground ahead. Not chosen: letting the camera rise over a level's top upright (Akershus's upper walls hold him at 0.17 of the screen, the walls he
  climbs below him; risen, more plain sky over him).
- **The far layers rise with him upright, as on a wide screen.** `climbed` (`render/backdrop.ts`) now reckons, upright, the view the far layers are drawn
  for (`FAR_VIEW_H`, 220 high round him) where it returned nothing; a single line, no number a level. It changes the four levels that raise their far
  layers, only upright. Measured along every route (the sweep, at 390 x 844 by day; places in view / places where at least half of it shows):

  | Landmark | Before | After |
  |---|---|---|
  | Akershus: Rådhuset's towers from the walls | 19 / 0 (never more than nothing) | 19 / 11 (75 % at the most) |
  | Akershus: Bjørvika, Hovedøya | 20 / 7, 31 / 10 | the same |
  | Rådhuset: Aker Brygge and Tjuvholmen from the towers | 18 / 3 | 23 / 11 |
  | Rådhuset: Akershus, Hovedøya | 19 / 15, 48 / 41 | the same |
  | Vigelandsparken: the ridge with the jump and the TV tower | 46 / 19 | 46 / 30 |
  | Slottet: the ridge with the jump and the TV tower | 47 / 0 (36 % at the most) | the same: it stands over the city's roofs, which cover its foot, by order 44's design |

  At 360 x 640 the same (Akershus's Rådhuset 2 / 0 to 18 / 11). The share of the screen the far view takes at Akershus went from 0.06 to 0.30 (0.07
  to 0.38 at 360 x 640), Rådhuset's from 0.08 to 0.14: from the walls and the towers the hills, the fjord and its landmarks stand at his eye, the fjord
  spreading down under them, where the low sun had stood beside the walls under a plain sky.
- **What it cost, and how it was brought within the order's**: lifted upright, the fjord's receding plane (order 23's, `drawFjord`'s) runs from the
  horizon at his eye hundreds of pixels down to the quay, and its even strips two to four pixels tall were two hundred copies a frame (first measured:
  Akershus +479, Rådhuset +648 copies over origin/main). A band lifted so on an upright screen (`Plane.tall`, `alive/depth.ts`) is a dozen strips, each
  half again as tall as the one above (as a plane's strips grow toward the eye), cut from one texture 1,024 pixels deep that serves every height (the
  even strips made a texture for each height, a new one each step he climbed): Akershus +4 to +10 copies, Rådhuset +0 to +9. Wide screens draw the plane
  as before (it is `tall` only where the view is taller than wide and the band deeper than its unlifted 26 pixels).
- **The rules do not see it**: the camera's code is unchanged (`frame.ts`, `main.ts`'s `camera`), so the pad covers what it covered and nothing he
  must see left the screen; the run files are byte-identical (Measures).

## 3. What was drawn, level by level

A brush, `alive/upright.ts` (in `feel`'s file): `skyBand(v, weather, top)` and `underBand(map, under)`, which a level asks for in its own file through
`art.sky` and `art.under`; the page calls them only where the view is taller than wide (`main.ts`'s `render`: the sky's after the kit's sky, on the sky's
canvas, in each sky's own colours; the band's after the tiles, in the street's pass, so the night's tint goes over it). Langkaia's (its level is the
first script's) go through `TEXTURED.upright`, filled in `feel`'s file (`alive/langkaiafar.ts`).

- **The sky**: the air thickening toward the horizon (a gradient over the lower part of the band toward the sky's own horizon colour: the far view
  stands in its haze and the stars thin out into it); thin high streaks (cirrus) in the upper third; a row of small far clouds low over the horizon,
  smaller and paler; a winter's grey cover (the upper sky drawn toward its grey, long flat stratus under it); stars thinning toward the horizon (a sheet
  kept, most near the top); the northern lights' curtains rising over the kit's band (a sheet kept, faint rays brighter at their foot); far birds (a
  few, flapping with motion, still without); a plane's trail. Pieces painted once a sky and copied; what drifts goes by the level's clock and holds
  still with reduced motion; what is far moves with the camera at a sliver of its speed, as the kit's clouds do. Placed under the bar (the page
  passes the rows it covers).
- **Under the ground**: from a fixed depth under the surface (two or three tiles) the level's ground darkens toward its own dark (at most 0.75 to 0.8),
  in layers (a lit line and a deeper line at 14, 33, 57, 84, 116, 152 and 194 pixels: stops of one gradient a column group, no rectangle a layer),
  wherever the body of the level's ground letters runs unbroken to the map's foot (a tower's face, a ledge, a pit is never darkened: the run's
  letters are the level's); what lies in it is drawn first and darkened with it (`inTheGround`: a stone in about one tile in sixty-four, a root under the
  surface in a column in twelve; an old pipe along the level, a joint every five tiles); and under a pit's foot the same dark, so a pit reads as one.

| Level | The sky (upright) | Under the ground (upright) | Its file, gzipped bytes |
|---|---|---|---|
| Holmenkollen (winter day, snowing) | A winter's grey cover in three bands, small clouds far off over the city, the air thick toward the horizon, a few crows | Boulders in the packed snow, darkening into the mountain's rock from three tiles down (`#` and the inrun's under-snow) | 6,451 to 6,584 |
| Korketrekkeren (evening) | Three high streaks lit from below, a plane's trail, small clouds far off over the town, the air thick toward the horizon, crows | Stones in the run's snow, darkening from three tiles down | 7,636 to 7,770 |
| Vigelandsparken (day) | A summer day over Frogner: three high streaks, a plane's trail, four small clouds far off, the air thick, a few birds | The trees' roots, stones, the fountain's old pipe three tiles down, darkening | 8,234 to 8,413 |
| Slottet (17 May) | Two high streaks, four small clouds far off over the town, the air thick, a few birds | Stones and the old water main under Karl Johan, darkening | 9,272 to 9,424 |
| Gamlebyen (night) | Stars thinning toward the horizon, the northern lights' curtains rising, a cloud or two; by day a streak, far clouds, the haze | The old town's stones and roots, darkening; and the harbour's water under the quay | 16,265 to 16,400 |
| Gamle Oslo (winter night) | Stars thinning toward the horizon, the northern lights' curtains rising over the snow falling, a cloud or two | Stones and the old water main under the street, darkening | 15,115 to 15,271 |
| Langkaia (the clock) | By day two high streaks, four small clouds far off over the fjord, gulls, the air thick; after dusk the stars thinning and the curtains | The quay, the Opera's marble and the harbour's water going down into the deep's dark | in `feel`'s file (below) |
| Ekeberg (evening) | The evening's first stars high over the Scream's bands, a few crows, two clouds far off | The hillside's stones and the oaks' roots, darkening into the rock (`#` and `K`) | 7,770 to 7,903 |
| Akerselva (day) | Two high streaks, four small clouds far off over the town, the air thick, a few birds | The banks' roots, stones, an old pipe from the mills four tiles down, darkening | 10,737 to 10,916 |
| Akershus (day) | Two high streaks, two small clouds far off, the air thick, a few gulls | (none: the walls he climbs are the level's own) | 6,447 to 6,491 |

`feel`'s file: 47,065 to 50,031: the brush, the lifted fjord's strips (`Plane.tall`) and Langkaia's hooks. Bytes gzipped by zlib as vite measures them, origin/main's build to the final one. Every other file within a few bytes (the chunks' names).

**The far view** (the order's third bullet): where a landmark was hidden upright because the far layers did not rise, item 2's rule gives it room
(above). Where it is hidden by the level's own nearer things it was left, as on its side: Akerselva's Grefsenkollen behind the T-bane's hall at the
start, Gamle Oslo's city and Kampen kirke between the roofs he walks on, Bygdøy's ridge, Rådhuset and Akershus through the gap between the halls only
(orders 43 and 44 placed them so), the encore's Ekeberg behind the towers, Korketrekkeren's TV tower behind the first sign's bubble while it is up,
Slottet's ridge's foot behind the city's roofs. None was redrawn.

**Not filled**, with why: Rådhuset (a 2: the towers fill most of its places, and the far layers now rise there), Bygdøy, Østensjøvannet, Bjørvika and
the encore (2s; the encore's water mirror is named by the test), Nordmarka (its dark is the level's idea: only the headlamp's circle shows), Stortinget
(under the ground: no sky), the maps (the bar is tall there and the fjord under the viaduct darkens in bands with its piers).

## 4. The table again

Marks upright (1 the screen used, 3 most of it plain sky or plain ground), before and now, and what the sweep measured: the mean longest plain run over
his head and under his feet as a share of the screen under the bar, at 390 x 844 under the level's own sky, before and after.

| Level | Before | Now | Plain over / under, before | after | Why |
|---|---|---|---|---|---|
| Langkaia | 3 | 2 | 0.07 / 0.00 | 0.05 / 0.01 | The sky holds the air, streaks, clouds and gulls by day, the stars and the curtains at night; the deep water and the marble go down into the dark. Still 2: the sky is 43 % of the screen at the quay |
| Akershus | 2 | 1 | 0.10 / 0.00 | 0.06 / 0.00 | The far view stands at his eye from the walls (0.06 to 0.30 of the screen), Rådhuset with it; a sky with streaks and clouds |
| Rådhuset | 2 | 1 | 0.08 / 0.00 | 0.08 / 0.00 | The far view stands at his eye up the towers (0.08 to 0.14); Aker Brygge in view half again as often |
| Slottet | 3 | 2 | 0.12 / 0.00 | 0.11 / 0.02 | The sky's streaks, clouds and birds; under the street the dark in layers with the old main. Still 2: the 17 May sky is plain blue between them |
| Holmenkollen | 3 | 1 | 0.20 / 0.00 | 0.10 / 0.01 | A winter day's grey cover and stratus over the falling snow; under the snow boulders and the dark of the rock |
| Akerselva | 3 | 2 | 0.13 / 0.00 | 0.09 / 0.02 | Streaks, clouds, birds; the banks' roots, stones and pipe into the dark. Grefsenkollen still behind the hall at the start |
| Nordmarka | 2 | 2 | 0.11 / 0.19 | 0.11 / 0.19 | Not changed: the dark is the level's idea |
| Stortinget | 1 | 1 | 0.00 / 0.00 | the same | Not changed: under the ground |
| Ekeberg | 3 | 2 | 0.12 / 0.03 | 0.08 / 0.07 | First stars and crows over the bands; the hillside into the dark. Still 2: at the viewpoint the fjord far below is a plain band (named by the test) |
| Gamle Oslo | 3 | 1 | 0.07 / 0.04 | 0.03 / 0.07 | Stars thinning, the curtains over the snow; under the street the dark in layers with the old main |
| Bygdøy | 2 | 2 | 0.09 / 0.00 | the same | Not changed |
| Vigelandsparken | 3 | 1 | 0.13 / 0.01 | 0.10 / 0.05 | A summer day's streaks, trail, clouds and birds; roots, stones and the fountain's pipe in the dark; the ridge in view a half again as often |
| Korketrekkeren | 3 | 1 | 0.18 / 0.09 | 0.10 / 0.08 | The evening's lit streaks, a trail, clouds and crows; stones in the snow and its dark |
| Østensjøvannet | 2 | 2 | 0.13 / 0.01 | the same | Not changed |
| Bjørvika | 2 | 2 | 0.14 / 0.00 | the same | Not changed (its façades fill below him) |
| Gamlebyen | 3 | 1 | 0.06 / 0.11 | 0.03 / 0.14 | Stars thinning and the curtains; under the old town and the harbour the dark in layers. Its plain run under him at the prow is named by the test |
| The encore | 2 | 2 | 0.11 / 0.00 | the same | Not changed; its water mirror named by the test |
| The maps | 1 | 1 | | the same | Not changed |

**Every 3 left**: none. The 2s are named with why above.

**What the plain runs under him say**: the dark deepens the lowest rows to one colour, under the pad's row for the most part, so the mean plain run
under his feet rose by up to 0.04 of the screen where the ground was textured to its foot (Vigelandsparken, Ekeberg, Gamle Oslo; measured again on the final code, `shots/sweep-final/`); that is the dark the
order asks for ("so that it never reads as somewhere to go"), and the test holds it under a fifth of the screen.

**The test** (`render/upright.test.ts`, three tests):
- **Flat bands upright**: every level and the encore drawn as the page draws it upright (four at a time in workers; a canvas of its own in typed arrays that composites the sky
  and what the level adds, the three far layers shifted as `farPass` shifts them, each washed by its haze and tinted after dusk, the street's backdrop,
  the water, the tiles and what lies under them) at four places of its scripted route (the start, the highest, the end, the middle), framed by the
  page's camera rule with the pad's buttons at 390 x 844 and 360 x 640 at a pixel ratio of 3, by day and under its own sky: no run of rows with detail on
  under 1 % of the row (the browser measure's) takes more than **a fifth of the screen under the bar**, over his head or under his feet, but by name:
  Ekeberg's fjord far below the viewpoint (0.43), Gamlebyen's harbour at the prow at dawn (0.34; 0.48 before), the encore's water mirror (0.28, not
  filled). Run against origin/main's drawing it fails on Akershus (0.22), Holmenkollen (0.29), Akerselva (0.22), Korketrekkeren (0.26) and Gamlebyen
  (0.48). The passes are drawn once a place and washed for each sky (no far, mid or near layer draws differently under another sky, which
  `render/warning.test.ts` holds), the buffers kept and cleared.
- **Colours**: everything the two hooks fill (solid colours and their gradients' stops) under every sky, the sky's as drawn and the band's as the
  street's tint leaves it, 10 or more off the warning red, the paint, his tunic (by day), what he takes, a boss's now, things to use and the calm
  outline. Least: the calm outline 11.6 (Vigelandsparken's streaks' lit edge by day), what he takes 13.9 (the haze toward an evening horizon), his tunic
  16.3, things to use 16.5, a boss's now 22.9, the paint 24.2, the warning red 25.1. It found two as first drawn (a twilight star 7.6 off the calm
  outline, the trail's tail 6.7 off it) and they were changed; shown to fail on the paint's yellow planted as a streak (6.0).
- **Reduced motion**: with reduced motion the two hooks draw the same calls at four moments of the clock in every level and sky; shown to fail on a
  bird planted to flap with it.

**LEVELS.html**: its pictures are at 1280 x 800, where nothing changed; taken from both builds (Measures: 23 of 23 byte-identical) and none replaced. Its words describe
no upright frame and were left.

## Measures

- **Rectangles and copies a frame** (`tools/glance/perf.ts` at 390 x 844, its view 391 x 845 at a pixel ratio of 1 as every order measured it; all 160
  addresses of the look-first batch, by day and under each one's own sky, origin/main's build and the final one; `shots/final/perf-*.tsv`):

  | Level | Places | Rectangles | Copies |
  |---|---|---|---|
  | Langkaia | 10 | +11 to +12 | +6 to +9 |
  | Akershus | 5 | +10 | +4 to +10 |
  | Rådhuset | 5 | +0 | +0 to +9 |
  | Slottet | 10 | +27 to +45 | +6 |
  | Holmenkollen | 10 | +20 to +40 | +6 |
  | Akerselva | 5 | +28 to +54 | +6 |
  | Ekeberg | 10 | +10 to +40 | +2 to +3 |
  | Gamle Oslo | 10 | +12 to +39 | +3 to +6 |
  | Vigelandsparken | 5 | +39 to +54 | +8 |
  | Korketrekkeren | 10 | +11 to +38 | +7 |
  | Gamlebyen | 10 | +11 to +47 | +3 to +6 |
  | Nordmarka, Stortinget, Bygdøy, Østensjøvannet, Bjørvika, the encore, both maps | 95 | +0 | +0 |

  The order allows +60 and +10. First measured, the band under the ground drew up to +118 (a stone in one tile in twenty, a root in a column in four, a
  pipe's joint every three tiles: at 391 x 845 that is many tiles) and the lifted fjord up to +648 copies; both mended (fewer stones, roots and joints;
  `Plane.tall`) and everything measured again.

- **`bun test`**: the viking suite **542 pass, 0 fail** (origin/main 539: the three new tests), alone on a quiet Pi, the branch and origin/main (an
  archive of it under `o45/mainwt`) in turn the same hour, on the final code: the branch **286.6 s and 285.6 s**, origin/main **276.1 s and 278.0 s**
  (`timing/times.txt`): on the means **+9.1 s** (the order allows 10). Earlier rounds, before the frames went into workers: the branch 288.0, 291.9,
  303.4 s against origin/main's 279.8, 268.1, 284.8 s (+16.8 on the means, over), which is how the slow drawing after the reduced-motion test was
  found (each file's time in a JUnit report of each: the new file 19.5 s, every other within two seconds of origin/main's). `packages/pixelkit` 157
  pass, `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
  `render/upright.test.ts`: 3 pass; in the suite 6.6 s after the reduced-motion test (each file's time from a JUnit report), its frames in four workers
  (`render/uprightframe.ts`, `upright.worker.ts`): on the test's own thread the same frames took 18.7 s there, where alone they take 7 (`handbook/lessons.md`).
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (the native
  7.0.2 in Bun's cache, its binary run directly, so nothing was fetched).
- **`bun run build`** at the root: clean (`work/build-root.log`).
- **The first script**: **55,935 bytes by zlib** as vite measures it (55.94 kB; origin/main 55,831) and **55,874 by GNU `gzip -c`** (origin/main
  55,867): **+104 and +7 bytes** (the order allows 300): the page's two calls upright and the bar's rows it keeps for them, `FAR_VIEW_H` moved beside
  `climbed`, Langkaia's two hooks, and the lazy files' new names in its import map (two builds of the same first script with other chunk names measured
  55,921 and 55,935).
- **Each file that grew**: in the table of section 3 (zlib, as vite measures it).
- **The front page**: **28 of 28** byte-identical to `/tmp/shots-before-jernhaugen/` from the root build.
- **The run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the encore, on the
  branch: **17 of 17 byte-identical** with order 44's (`o44/sloppy/md5.txt`, made on the rules origin/main has).
- **The maze's rules**: `packages/maze/tools/runs.ts` on the branch: the scripted player's runs identical with order 44's, the ghosts it writes
  byte-identical, and order 44's ghosts replayed to the finish on all seven (`runs/`).
- **Upright, the levels not changed**: of the 320 upright pictures (160 addresses at both sizes) from origin/main's build and the final one, every
  picture of Nordmarka, Stortinget, Bygdøy, Østensjøvannet, Bjørvika, the encore and both maps is byte-identical, and Rådhuset's where he does not
  climb (the start, the lowest, the ordinary stretch, by day); the rest differ, as drawn.
- **Reduced motion**: nothing new moves: `render/upright.test.ts` holds that the two hooks draw the same calls at four moments of the clock with
  reduced motion in every level and sky (shown to fail on a bird planted to flap with it); the lifted fjord's strips drift as the plane's always did, and
  with reduced motion not at all; `render/reduced.test.ts` passes (it draws the wide view, where nothing changed).
- **The pad's buttons on the band below**: at the band's darkest under every sky a white word stands 77 or more (CIEDE2000) off its button's face, the
  button's white ring 49 off it (computed from the stylesheet's colours over each level's dark, as order 41 measured them over the ground).

- **On its side and on a desktop: byte-identical.** On its side (844 x 390, a phone at a pixel ratio of 3 with the pad: every level's and the
  encore's five places by day and each one's start under its own sky, both maps; 107 addresses): **107 of 107** byte-identical between origin/main's
  build and the final one. On a desktop (1280 x 800, `tools/shots.ts`: every level's start and ordinary stretch by day and under its own sky, the
  encore, both maps; 66 addresses): **66 of 66**. None blank.
- **LEVELS.html**: its 23 addresses (`tools/pictures.tsv`, 1280 x 800) from origin/main's build are byte-identical to the page's pictures, and from the
  final build to origin/main's: **23 of 23**; none was retaken.
- **The upright pictures, the final build's**: the levels the last mending touched (fewer stones, the lifted fjord's strips) were taken again from
  the final build; the others' upright pictures are the build before it, which draws them alike (byte-identical to origin/main's).


## What only a person can judge, as a list for Lars

- Whether the tall sky now reads as weather and depth (the haze toward the horizon, the high streaks, the far clouds, the birds, a plane's trail, the
  winter's grey cover at Holmenkollen, the stars thinning and the northern lights' curtains at night), or as clutter; whether the trail reads as a
  plane's trail or as a scratch.
- Whether the ground under him reads as ground going down (its layers, stones, roots, an old pipe) or as a black band; whether the pad's buttons read
  better on it (by the numbers the white word stands 77 or more off the button over the darkest band, its ring 49).
- At Langkaia's start, whether the Opera's marble fading into the dark below its roof reads as the building's foot or as a strange column.
- At Akershus and Rådhuset, whether the far view standing at his eye from the walls and the towers, the fjord spreading down under it, reads as height.
- Whether any of it shows as it should on a real phone (pixel ratios of 2 and 2.625 give views of 261 x 563 and 257 x 555 at 390 x 844), and at speed.

## Departures, doubts, found and not fixed

- **Departures**: ten levels filled where the order expected six to eight (the test's bound found Akershus's and Akerselva's skies over it, and they
  were cheap); the camera's height kept (the order allowed it, with why); under a pit's foot the dark too (the far layers showed through as if a pit had
  a floor); the test samples four places of each route, not five (time), and its sky band is drawn by day and under the level's own sky only.
- **Doubts**: the dark under the ground at 0.75 to 0.8 of a near-black may be heavier than Lars likes (`most` in each level's `under`, one number); the
  evening's streaks are a muted pink, and the far clouds small; the camera's height was not tried at other heights on a phone, only reasoned and
  measured from the table.
- **Found and not fixed**: the kit's sky gradient runs from its top colour to the horizon's over the whole canvas, so upright its horizon colour lies
  at the screen's foot, under the ground (the haze toward the horizon stands in for it; mending it is the kit's, shared with the front page); the falling
  snow is as sparse upright as the kit draws it over a taller view (more flakes cost a rectangle each, over the order's budget); the kit's stars still
  stand evenly over the upper three fifths (the new ones thin toward the horizon over them); the day sun is placed by a world horizon, so where a level
  does not raise its far layers and he is high it can stand low on the screen.
