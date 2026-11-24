# Order 43: the far view, an ode to Oslo: what was done

Built on branch `far-view` from `origin/main` at `4a8e6a0`. Lars has not played; nothing was retuned: no route, box, speed, timing, heart, enemy
placement or word. Drawing only. Pictures and working files outside the repository, in `~/.cache/claude-scratch-larshansen/o43/`: `shots/before/`
(the look-first batch), `shots/final/` (origin/main's and the final build's pictures of the changed levels, and the final build's of every other
place), `shots/handback/` (before and after side by side), `shots/silhouettes/` (each far piece alone), `shots/diff/` (a difference picture a
place), `sheets/` (contact sheets), `work/` (the
measures), `bin/` (the scripts).

## Item by item

| Item | Done? |
|---|---|
| 1. Look first: every far view on one table | Done: `before.md` (16 levels, the encore, the map with line 1 and with line 2; 322 pictures with the play, 290 of the far view alone and 145 of the sky alone; the colours of every far layer under every sky; a mark each and a ranking) |
| 2. Enrich the thinnest | Done for five, from the top of the ranking: Rådhuset, Vigelandsparken, Bygdøy, Akershus (the four 3s) and Holmenkollen (the first 2). Not done: the other 2s (Akerselva, Gamle Oslo, the encore, Østensjøvannet, Korketrekkeren, Slottet, Langkaia), below with why |
| 3. Consider it with the rest | Done for the five (below) |
| 4. Keep the table honest | Done: the table again with new marks (below), a test (`render/warning.test.ts`), LEVELS.html's pictures retaken where they changed |
| Docs | HANDOVER, the handbook (start-here, roadmap, lessons, resources), DESIGN ("Frames, shadows and depth", item 9; the parts table; the scenery row), ADR 0047 and 0044 amended, `before.md`, this file |

## 2. What was drawn

A brush for the far view, `src/alive/far.ts` (in `feel`'s file, as the props kit is): `farPiece(key, w, h, paint)` paints a landmark once on a grid in
three or four tones of each material (`block`: its left column and top row lit, its right column shaded, the light from the top left as in GRAIN.md's
ramps), notes its windows (`pane`), and keeps it as a piece (`custom`, the props kit's); `drawFar(piece, x, foot)` copies it into a far layer at the
layer's x with its foot on a world y, one copy, and registers about half its windows as lights (the same ones every night) through the kit's
backdrop `lit`, so the census names them "lit backdrop" as every far window. The layer's haze washes it with the rest of the layer and the night's
tint goes over it. Each level paints its own landmarks in its own file. Each is placed by the world x it is seen from: a far layer draws a thing at
world x in the middle of the screen when the camera's middle is there (by day and with reduced motion alike).

| Level | Before (mark 3, or 2) | Now |
|---|---|---|
| **Rådhuset** (3) | The shared hills and far shore, one cluster of four plain blocks at the harbour front on the east side; nothing up the towers, where the far layers sank out of the view | From the harbour front, **Akershus on its rock to the east** (the way he came along the line, and on the map's side): grey bastions in courses leaning back from the water, trees on its shoulders, the white castle under its hipped slate roof with two rows of windows, its two towers under pointed spires of old copper (74 x 48, near layer). From the square's end and the towers, **Aker Brygge to the west**: the old yard's brick hall under its gable, glass in floors, a white block, brick, and Tjuvholmen's long roofs of glass over timber curving down to the fjord (112 x 34). **Hovedøya** low and wooded out on the fjord (90 x 10, mid layer). The far layers rise as the view climbs the towers (`climbed`, as Akershus's do), so from the parapet the hills stay on the horizon and Aker Brygge and the fjord lie under them |
| **Akershus** (3) | The shared hills and fjord; MUNCH and the Barcode twice (world x 1,500 and 3,300), the second on the west side; the near layer not raised, so on the walls they sank out of the view | From the walls at the start, **Bjørvika to the east**: the Opera's white marble roof rising out of the water to its flat top, the foyer's glass and the stage tower's dotted cladding, the Barcode's eight slim towers behind it in light and dark with their stripes, MUNCH tall at its end in aluminium with its top bent toward the fjord as the kit draws it (112 x 50). **Hovedøya** just off the fortress (96 x 10). From the walls at the end, **Rådhuset's two brick towers to the west**, the east one taller with its clock toward the harbour, the hall between (60 x 44). The near layer rises with the far ones (`climbed`) |
| **Bygdøy** (3) | The shared hills and fjord; the city across the water as a pale line with Rådhuset's two towers as two lines every 700 world pixels (three to five to a screen); Akershus and the jump missing; the woods behind the street hid it from nearly everywhere | The woods behind the street **open by the open water between the halls** (world x 1,880 to 2,780), and across the fjord, each once, where the city lies from Bygdøynes: **Holmenkollen's ridge** forested and nearer than the far hills, the jump standing up out of the trees (its tower, the inrun slanting down to the right on its legs, the landing hill's clearing; 46 x 26); **Rådhuset's two towers** by the water (22 x 20); **Akershus on its rock** to their right, the white castle and its two copper spires (34 x 20). None is seen from Rådhusbrygga at the start, where Rådhuset is behind him; the jump's top shows over the beach's trees |
| **Vigelandsparken** (3) | The shared hills, Frogner's blocks in a pale line, a church spire every 640 world pixels (three to five to a screen); the park's trees covered the far layer at every place but the gate; no far light | The park's trees **stand back round the Monolith's plateau** (world x 2,700 to 3,720: open granite, as the plateau is), and from the plateau and the steps the **ridge to the north-west** is on the horizon: forested, Holmenkollen's jump standing up out of it with its inrun slanting down to the right, and the TV tower on the higher crest beyond, a slim concrete shaft, its deck, the mast (76 x 40); from the plateau and the Monolith's figures the far layer rises with the view (`climbed`), so the ridge stays over the crowns. The spire once (world x 1,400). After dusk a window lit here and there along Frogner's blocks (the census gains "lit backdrop") |
| **Holmenkollen** (2) | The city far below with Rådhuset's two towers every 160 pixels of the layer (two or three to a screen) | **Rådhuset once**, by the harbour, two brick towers, the east one taller with its clock (15 x 17); **two islands** low and wooded on the fjord (26 x 4, 34 x 5) |

The silhouettes alone (each piece in its colours, washed by its layer's haze, and as one dark shape, at four times): `shots/silhouettes/`.

**Not done, with why** (the 2s left). The order expected four to six; five were done, each finished (in place at both sizes, by day, at night and
under its sky, measured) before the next, and the round stopped there. Of those left, for whoever takes them up: **Akerselva** (its "tower on
Grefsenkollen" comes round three or four times a screen; I am not sure a tower stands there to be seen from the river, so I would take it out
or keep one, not redraw it); **Gamle Oslo** (Kampen kirke's spire twice a screen, at night); **the encore** (Ekeberg rising over the park would stand
behind its nine slim towers, which fill the far view's width: making room for it moves the towers); **Østensjøvannet** (I am not sure which
building of the suburb round the lake a person looks for); **Korketrekkeren** (its far view is hidden by its forest on purpose, the run is in the
trees); **Slottet** (the street's own buildings fill its view); **Langkaia** (the fjord's islands: its far and mid layers are the first script's,
shared with four levels and the map).

## 3. Considered with the rest

- **Does the far view say where he is on the line?** The map's picture of each station and the level agree, landmark and side. Rådhuset: the map's
  two towers with the clock on the east (right) tower; the level's towers are in its lane at its right end, and the far view puts Akershus to their
  left (east) and Aker Brygge to their right (west), as the map's line runs (Akershus left of Rådhuset). Akershus: the map's curtain wall and the keep
  with its copper spire right of the rune stone; the far view puts Bjørvika left (where Langkaia's station is on the map) and Rådhuset right (where its
  station is). Bygdøy: the map's Fram's hall with the longship's prow to its right, as the level has Fram's hall first and the longship's hall later;
  across the water Rådhuset stands left of Akershus there, the other way from the map's line, because from Bygdøynes the city is seen to the
  north-east (true to the place; the map's line reads as if from the fjord). Vigelandsparken: the map's Monolith between two limes, which the level
  has in its lane, the ridge behind it from its plateau. Holmenkollen: the map's jump with the inrun down to the right; the jumps drawn far off at
  Bygdøy and Vigelandsparken slant the same way, as do the far ones of Slottet and Ekeberg and the map's.
- **Do the opening words still fit?** Rådhuset "The bells between the towers / The two towers on Rådhusplassen": the harbour round the square. Akershus
  "The fortress above the harbour": the harbour's two sides from the walls. Bygdøy "The museum ships / The museums on Bygdøy": the city across the
  water from the museums. Vigelandsparken "The sculptures / Frogner Park": the ridge seen over Frogner from the plateau. Holmenkollen "The ski jump
  over the city": the city below. No word was changed.
- **Does one level's far view show the next or the last where it truly would?** Akershus shows Langkaia's Bjørvika (the last stop) to the east and
  Rådhuset (the next) to the west; Rådhuset shows Akershus (the last) to the east; Bygdøy shows Rådhuset, where its ferry left, and Akershus and
  Holmenkollen's jump; Vigelandsparken shows Holmenkollen's jump, and the ridge Korketrekkeren (the next stop) runs down; Holmenkollen shows Rådhuset by
  the harbour. Langkaia already showed Akershus on its hill at its end, and Ekeberg every station of line 1.
- **Where the map and a level disagreed**: Rådhuset's four blocks stood at its harbour front, east of the square, where Akershus is; they are gone
  and Aker Brygge stands to the west.

## 4. The table again

| Level | Mark before | Mark now | Why |
|---|---|---|---|
| Langkaia | 2 | 2 | The fjord's islands; its far layers are the first script's (not changed) |
| Akershus | 3 | 1 | Bjørvika, Rådhuset, Hovedøya, each once, where they are seen from the walls |
| Rådhuset | 3 | 1 | Akershus, Aker Brygge and Tjuvholmen, Hovedøya, each once; the far view stays up the towers |
| Slottet | 2 | 2 | Not changed: the street's own buildings fill its view |
| Holmenkollen | 2 | 1 | Rådhuset once, the islands |
| Akerselva | 2 | 2 | Not changed: the repeated tower, which I am not sure of |
| Nordmarka | 1 | 1 | Not changed |
| Stortinget | 1 | 1 | Not changed (under the ground) |
| Ekeberg | 1 | 1 | Not changed |
| Gamle Oslo | 2 | 2 | Not changed: the spire repeats |
| Bygdøy | 3 | 1 | The city across the water from the open water between the halls: the jump, Rådhuset, Akershus, each once |
| Vigelandsparken | 3 | 1 | The ridge with the jump and the TV tower from the plateau; the spire once; lights after dusk |
| Korketrekkeren | 2 | 2 | Not changed: hidden by its forest on purpose |
| Østensjøvannet | 2 | 2 | Not changed |
| Bjørvika | 1 | 1 | Not changed |
| Gamlebyen | 1 | 1 | Not changed |
| The encore | 2 | 2 | Not changed: Ekeberg would need its towers moved |
| The map, both | 1 | 1 | Not changed |

No 3 remains.

**LEVELS.html**: its pictures retaken with the addresses in `tools/pictures.tsv` from origin/main's build and the final one: four changed
(`02-akershus.png`, `03-radhuset.png`, `05-holmenkollen.png`, `11-bygdoy.png`: each the far view only) and were replaced; Vigelandsparken's
(at the gate) is byte-identical and was left; origin/main's picture of Akershus was byte-identical to the one on the page, so the method reproduces
what is there. Its words for these levels say nothing of their far view that is no longer true (Rådhuset's "the fjord and its far shore behind",
Holmenkollen's "the city lies below in the backdrop"), so none was changed.

## Measures

- **`bun test`**: the viking suite **538 pass, 0 fail** (origin/main 537: the one new test), alone on a quiet Pi, the branch and origin/main (a worktree) in turn
  the same hour: the branch **277.9 s and 272.7 s**, origin/main **270.5 s and 268.2 s** (`timing/times.txt`): on the means +6.0 s (the order allows
  10).
  `packages/pixelkit` 157 pass, `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
- **The new test** (`render/warning.test.ts`, "the far view keeps off what means something"): every colour of the far, mid and near layers over six
  pixels of a view, washed and tinted under every sky, 10 or more off the warning red, the paint and every role's colours, but by name (14 names,
  all of colours that were there before this order). Its least distances on the final code: the warning red 12.4 (Langkaia's far red houses under
  the evening), the paint 18.7, his tunic 2.7 (named: Stortinget's T-bane blue), what he takes 8.8 (named: Stortinget's far lamps), a boss's "now" 13.8,
  the mark of things to use 15.2, the calm outline 7.3 (named: Bjørvika's fjord by day). Shown to fail on a planted fault: the paint's yellow as the
  wall of Rådhuset's far Akershus (6.0 off the paint, 5.5 off what he takes). Two of this order's own colours failed it as first drawn and were
  changed: Tjuvholmen's timber (9.4 off a coin's copper under the evening) and Bygdøy's far brick (9.8).
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (the native
  7.0.2 in Bun's cache, run directly, so nothing was fetched).
- **`bun run build`** at the root: clean (`work/build-root.log`).
- **The first script**: **55,819 bytes by zlib** (vite's number, 55.82 kB; 55,857 by GNU `gzip -c`) against origin/main's 55,801: **+18 bytes**. What
  grew: the land swatches' `island` colour, which the first script now carries as a binding because three lazy files draw with it, and the lazy
  files' new names in its import map (checked: with the chunks' hashes taken out the two scripts differ only by that colour). The last build
  (`index-CQEMN3-O.js`) is the same size.
- **Each file that grew** (bytes gzipped by zlib, origin/main to the final): `feel`'s file 46,122 to 46,298 (the brush), Akershus's 5,671 to 6,448,
  Rådhuset's 5,757 to 6,551, Bygdøy's 10,012 to 10,563, Vigelandsparken's 7,800 to 8,200, Holmenkollen's 6,209 to 6,454. The map's look 7,629 to
  7,630 (names). Nothing else.
- **Rectangles and copies a frame** (`tools/glance/perf.ts`, at 390 x 844, every 20 columns of the five levels' walks, 62 places, by day and at night,
  origin/main's build and the final the same hour; `work/perf-*.tsv`):

  | Level | Places | Rectangles by day | Copies by day | Rectangles at night | Copies at night |
  |---|---|---|---|---|---|
  | Akershus | 14 | -150 at every place | +0 to +2 | -200 to -165 | +0 to +2 |
  | Rådhuset | 11 | -111 at every place | +1 to +2 | -214 to -185 | +1 to +2 |
  | Bygdøy | 13 | -370 to -8 | +0 to +3 | -362 to +0 | +0 to +3 |
  | Vigelandsparken | 12 | -973 to -2 | +0 to +1 | -957 to +11 | +0 to +1 |
  | Holmenkollen | 12 | -24 to -8 | +1 to +3 | -22 to -8 | +1 to +3 |

  The order allows +50 rectangles and +10 copies. Fewer rectangles: MUNCH and the Barcode at Akershus, the four blocks at Rådhuset, were drawn as
  rectangles at every place whether on the screen or not, and the trees that stand back at Bygdøy and Vigelandsparken are not drawn. The first
  measure of Vigelandsparken at night was +88 (its far windows came on every few columns): they were thinned to one in about 24, and measured again.
- **The front page**: **28 of 28** byte-identical to `/tmp/shots-before-jernhaugen/` from the root build of the final code.
- **The fjord's run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the encore,
  on the branch: **17 of 17 byte-identical** with origin/main's (order 42's `sloppy/md5.txt`, made on the code origin/main has).
- **The maze's rules**: `packages/maze/tools/runs.ts` on the branch: the scripted player's runs identical with origin/main's (order 42's
  `runs-branch.txt`, but the line naming where the ghosts were written), the ghosts it writes byte-identical, and origin/main's ghosts replayed to
  the same points and finish on all seven (`runs/`).
- **Pictures**: **The changed levels' pictures** (`shots/final/`: origin/main's build and the final one, the same 33 addresses, by day, at night and under
  Holmenkollen's own sky, at 390 x 844 and 844 x 390, with the play and with the far view alone): of 66 pictures with the play by day and under its
  sky, 46 differ, in 317,145 pixels, and **every one of them lies where the far view alone differs between the two builds** (`bin/behind.py`): the
  changes are behind the play, seen round it or through what is see-through over it (a sign's bubble, the help line). A difference picture a place
  (the final picture greyed, what changed in magenta): `shots/diff/`. Before and after side by side, a row a place, upright and on its side, by day,
  at night and under its sky: `shots/handback/`. One of origin/main's pictures of the far view alone is named BLANK by `tools/shots.ts`: Rådhuset's
  parapet, where on origin/main the far view had sunk out of sight and there was only sky (this order's reason for raising it).

  **Every other level's pictures**: the look-first batch's addresses of the eleven levels not changed, the encore and the line map (by day, under
  their own sky, natural, the encore's and the map's places; 127 addresses at both sizes) taken again from the final build: **254 of 254
  byte-identical** with origin/main's.
- **Reduced motion**: nothing new moves. The far pieces are copies of still pieces, placed by the layer as everything in it is (with reduced motion
  every far layer goes at the camera's speed, as before); `render/reduced.test.ts`, which records every level's scenery at several steps of the
  clock, passes (11 of 11).
- **The lights' census** (`render/lights.test.ts`): passes, Vigelandsparken's row gaining "lit backdrop" (Frogner's windows); the other four levels'
  far windows register as their far windows did.


## What only a person can judge, as a list for Lars

- **Is this it, and is it where it should be?**
  - Rådhuset: Akershus on its rock seen from the harbour front by Rådhusplassen, to the east (left); Aker Brygge's yard hall, glass and blocks and
    Tjuvholmen's sloping roofs to the west (right), seen from the square's end and from the towers; Hovedøya out on the fjord.
  - Akershus: the Opera, the Barcode and MUNCH to the east from the walls at the start; Rådhuset's towers to the west from the walls at the end;
    Hovedøya just off the fortress.
  - Bygdøy: from the open water between the halls, Holmenkollen's ridge and jump far to the left, Rådhuset's towers, Akershus to their right.
  - Vigelandsparken: from the Monolith's plateau, the ridge to the north-west with the jump and, to its right and higher, the TV tower on
    Tryvannshøgda; whether the park's trees standing back round the plateau reads as the open granite it is.
  - Holmenkollen: Rådhuset by the harbour far below, once; the islands.
- Whether each reads at phone size, upright, where the far view is a strip at the horizon (it is wider on its side), and whether the play still
  reads first in front of it.
- Whether the far layers rising up Rådhuset's towers and from Vigelandsparken's plateau feel like height, at speed.
- Whether the windows lit after dusk on the landmarks are too many or too few (the T key's skies; these levels are pinned to day).

## Departures, doubts, found and not fixed

- **Left out because I was not sure of the place**: a tower on Grefsenkollen (Akerselva's far view draws one, three or four to a screen: left as
  found); which of the suburb's buildings a person looks for at Østensjøvannet; the exact side the Holmenkollen jump's inrun faces from each place
  (drawn slanting down to the right, as the map, Slottet's and Ekeberg's far views already have it); whether Hovedøya is seen from Rådhusplassen to
  the left of the fjord's middle as drawn.
- **Bygdøy's woods open, Vigelandsparken's trees stand back**: the nearer layers of two levels changed to let the far view through (the woods by the
  open water between the halls; the trees round the Monolith's plateau). The order asked for the far view; these are its nearer layers, in the same
  files, behind the play.
- **The first script grew by 18 bytes** (zlib): the land swatches' `island` colour, which the first script carries as a binding now that three
  lazy files draw with it, and the lazy files' new names.
- **Found and not fixed**: four levels (Langkaia, Akershus, Rådhuset, Bygdøy) and the map share their far and mid layers, `drawOsloHills` and
  `drawFjord` in the first script, the same pale hills "along the far side of the Oslofjord" whichever way the place looks (Bygdøy and
  Vigelandsparken look north to the city's ridges, where these hills stand for them); giving each its own costs the first script, or a hook. On an
  upright phone the far view is a strip at the horizon (the far layers are placed for a view about 220 pixels tall round him), so every landmark is
  small there by design; on its side it is twice the size and shows far more. A picture's far view is smoothed by the fraction of a pixel each far
  canvas is moved, so colour distances measured in pictures run a little smaller than the colours drawn (`before.md`).
- **My own slip**: the first look-first batch was started with a relative output folder and Firefox wrote nothing (order 41's lesson, again); it was
  stopped at once and started again with absolute paths, and the empty folders it had made in the checkout removed.
