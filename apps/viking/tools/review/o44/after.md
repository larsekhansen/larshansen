# Order 44: the rest of the far view: what was done

Built on branch `far-view-rest` from `origin/main` at `703685f` (after order 43). Lars has not played; nothing was retuned: no route, box, speed,
timing, heart, enemy placement or word. Drawing only, and one test. The places are the planner's, from his own knowledge of Oslo, not looked up
(`docs/games/handbook/conversations.md`); they wait for Lars. Pictures and working files outside the repository, in
`~/.cache/claude-scratch-larshansen/o44/`: `shots/final/` (origin/main's build and the final one, the same addresses: `main/`, `final/`), `shots/handback/`
(before and after side by side), `shots/silhouettes/` (each far piece alone), `shots/diff/` (a difference picture a place), `shots/pair/` and `sheets/`
(the working pictures), `work/` (the lists and measures), `bin/` (the scripts). No new look-first table was made: order 43's (`o43/before.md`) stood
for these levels, whose code it described, and each was looked at again before it was drawn (`shots/pair/`).

## Item by item

| Item | Done? |
|---|---|
| 1. Mend order 43 where the places say so | Done: the TV tower at Vigelandsparken was right of the jump and higher already; it is now a thin mast with a thick collar near its top, and the jump is drawn as one looks up into it from the town (the inrun steep, the landing hill's clearing fanning out under it). Bygdøy had no TV tower: it has one now, on the higher crest behind the jump, a little to its right |
| 2. The seven left | Done for all seven, in the order given: Akerselva, Gamle Oslo, Østensjøvannet, Korketrekkeren, Langkaia, Slottet (left as its own street, the floating line over its roofs made the ridge with the jump and the tower), the encore |
| 3. The map and the levels agree | Done for every level changed (below); one mend: Gamle Oslo's Ekeberg moved to the side the line map puts it |
| 4. Keep the table honest | Done: the table again (below), no 2 left; the far-colour test walks the line map and holds its own premise; LEVELS.html's pictures retaken where they changed |
| Docs | HANDOVER, the handbook (start-here, roadmap, lessons, resources, conversations), DESIGN ("Frames, shadows and depth", item 9; the parts table), ADR 0047 and 0044 amended, this file |

## 1 and 2. What was drawn, level by level

Each landmark is a far piece of order 43's brush (`alive/far.ts`), drawn in its level's own file (Langkaia's in `feel`'s file), placed by the world x it
is seen from. The silhouettes alone: `shots/silhouettes/`.

| Level | Before (mark) | Now |
|---|---|---|
| **Vigelandsparken** (1) | The ridge from the Monolith's plateau: the jump in profile, its inrun slanting down at 36 degrees; the TV tower a 3-pixel shaft with a 5-pixel deck | The jump as one looks up into it from the town: its tower, the inrun coming down steeply toward him on its legs, the landing hill's clearing fanning out under the knoll; the TV tower on the higher crest above and behind it, a little to its right (28 pixels; about 8 degrees as the places lie), a thin shaft, a thick collar near its top, the mast (64 x 42, was 76 x 40) |
| **Bygdøy** (1) | Holmenkollen's ridge with the jump in profile; no TV tower | Tryvannshøgda's crest behind Holmenkollen's shoulder, a shade paler (farther); the jump seen from the town as at Vigelandsparken; the TV tower on the crest, 19 pixels to the right of the jump's tower and 10 higher (48 x 36). Seen only through the gap between Fram's hall and the Kon-Tiki museum, as order 43 left it |
| **Akerselva** (2) | Generic hills with a white 2-pixel "tower on Grefsenkollen" every 900 world pixels (three or four to a screen) | The tower taken out. **Grefsenkollen** up the river at the start (Nydalen), once: a broad rounded hill wooded to its top, nearer and darker than the ridges, lit on its left (140 x 62, far layer). **Sagene kirke** on its rise above the river by Hjula: red brick, a tall slim tower and its slim pointed spire (drawn in a darker brick, as the order describes it), the nave's slate roof, trees round it (40 x 98, middle layer). **Paulus kirke** at Grünerløkka by Aamodt bru: a broader brick tower with corner pinnacles and a clock, a pointed slate spire, the nave's gable (30 x 66). Each once, in the river's order. Both stand where the lower terraces show the town over the bank: from the upper terraces the bank hides the whole middle layer, so Sagene kirke is glimpsed between Hjula's stilts and Paulus kirke seen over the roofs from Vøien on. The mills, chimneys and Bjølsen's silos were there already (the silos in the lane), and are not repeated |
| **Gamle Oslo** (2) | Snowy hills; Kampen's houses with Kampen kirke's spire over every 17th house (two to a screen); no city, no Ekeberg of its own | **The city toward the fjord**: the Barcode's eight slim blocks with gaps between, light and dark, and the tall plain slab by the station to their right (no name), single windows lit at night (80 x 54). **Ekeberg's hillside** close: wooded under snow, a long rise to its brow, a window or two at its foot (230 x 70). **Kampen kirke** once on its low hill: red brick, the nave's steep roof with snow, its tall windows lit, the tall tower and its pointed spire with a cross (46 x 76), in the far layer: the houses' layer lies under the view on the roofs, where the spire showed its tip at most. As the line map has them (below): the city and Ekeberg to the left, Kampen to the right |
| **Østensjøvannet** (2) | Low far hills with a sun-coloured fleck every 17 pixels; the bank's trees covered the far shore everywhere | **Reed beds** at the far water over the crossing (one piece of three beds). **The eastern ridge** with rows of 1950s and 1960s blocks among trees: long low slabs in pale render, now and then a taller one, three kinds in turn where the ridge is seen (over the crossing and the far shore), single windows lit in the twilight (a lit row read as the paint). **Østmarka** beyond the ridge: dark spruce in a long even line, one wide piece laid end to end along the layer. The sun's glow, which lay in the dips of the old jagged hills, lies along Østmarka's line. The bank's trees stand back over the long crossing (world x 2,330 to 3,050), where the far shore shows across the open water. No landmark invented |
| **Korketrekkeren** (2) | Tall jagged white hills; a stone-grey fleck every few pixels; the spruces hid the rest | **The TV tower** close above Frognerseteren at the top of the run: a thin shaft, a thick collar near its top, the mast, dark against the low sun, its foot behind the hill (9 x 92, middle layer: it rises out of the view as he goes down). The spruces stand back **once**, over the crossing of the line and the gap where the old bridge is gone (world x 2,380 to 2,960), and there the town lies far below: the far hills lowered (38 plus or minus 13 where they were 50 plus or minus 24) and low on the horizon, the fjord under them (its farthest water a flat band in the plane's own far tone) with three low wooded islands, the town along its near shore, snowy roofs close together, small lights after dusk (two wide pieces in turn) |
| **Langkaia** (2) | The shared far hills and far shore; no islands | Out on the fjord, nearest first: **Hovedøya** (low, wooded, a rim of rock; 84 x 10), between Sørenga's blocks to the west; **Lindøya** with its two rows of small cabins in mixed paint under dark roofs (52 x 7) and two smaller islets, past the saunas; behind them the shared far shore stands for **Nesodden**. **Ekeberg's hillside** up the shore to the east, past the Barcode (140 x 40). In `feel`'s file (`alive/langkaiafar.ts`), asked for through the props kit's hook from Langkaia's middle layer: without that file the fjord is as it was (ADR 0053) |
| **Slottet** (2) | The street's own buildings; a white line two pixels long floating in the sky over the roofs at the palace end, meant for the jump | Left as it was, as the order allows: the view down Karl Johan is the level's own street (Stortinget at its foot, the Grand, Nationaltheatret and the University, the palace at the top). The floating line is now **the ridge to the north-west over the roofs**, small and far: Holmenkollen's jump, the next stop, seen from the town, and the TV tower above and behind it, a little to its right (40 x 34) |
| **The encore** (2) | The shared far hills behind nine slim towers | **Ekeberg's hillside** standing over the park, in the farthest layer, behind the towers and between them, which stand where they were: wooded to its brow, grey rock showing in three places on its steep face (360 x 70). Nothing else changed (ADR 0052) |

## 3. The map and the levels agree

- **The line map's picture of each station and the level's far view**: the map draws each station's own landmark (its lane's), not its far view, and
  none of them disagrees with what was drawn: Akerselva's mill and fall (the mills are in the level's lane and middle layer), Gamle Oslo's houses and
  Vålerenga kirke's spire (in its lane; the far view's spire is Kampen kirke's, another church, on the other side), Østensjøvannet's reeds, bird hide
  and swan, Korketrekkeren's snowy run and spruces, Langkaia's Barcode and the Opera's roof, Slottet's palace, Vigelandsparken's Monolith, Bygdøy's
  Fram's hall and the longship's prow, the encore's stage on the water.
- **Sides, where the walk runs the other way from the compass**: Gamle Oslo's walk runs west, from Vålerenga to Kværnerdalen, the other way from the
  line map, which has the centre (Stortinget, and Langkaia and Bjørvika beyond it) and Ekeberg, the stop before, to Gamle Oslo's left. So the city and
  Ekeberg's hillside stand to the left, and Kampen kirke (to the north-east, not on the map) the other way. First drawn with Ekeberg at the right end (by
  the compass, south-east), then moved: the one mend of this item. Akerselva walks down the river, south: Grefsenkollen is seen up the river, behind
  him, at the start. Langkaia walks west to the fortress: Ekeberg is at the start (east), Hovedøya toward the fortress (south-west), Lindøya between.
- **The next or the last stop where it truly would be**: Gamle Oslo shows the Barcode (Bjørvika, Langkaia's skyline) toward the fjord and Ekeberg (the
  stop before) close; Korketrekkeren shows the TV tower at the top of the run (Vigelandsparken, the stop before, shows the same ridge from the town);
  Slottet shows Holmenkollen's jump, the next stop, on the ridge; Langkaia shows Hovedøya, which Akershus and Rådhuset show too.

## 4. The table again

| Level | Mark before | Mark now | Why |
|---|---|---|---|
| Langkaia | 2 | 1 | Hovedøya, Lindøya with its cabins and two islets, Ekeberg; Nesodden is the shared far shore. Small, and Sørenga's blocks stand in front of them for some of the way |
| Akershus | 1 | 1 | Not changed |
| Rådhuset | 1 | 1 | Not changed |
| Slottet | 2 | 1 | Its own street is the view the order names (left as it was); the ridge with the jump and the TV tower over the roofs where a line floated |
| Holmenkollen | 1 | 1 | Not changed |
| Akerselva | 2 | 1 | Grefsenkollen once, no tower; Sagene kirke and Paulus kirke once each in the river's order. Sagene kirke is glimpsed more than seen |
| Nordmarka | 1 | 1 | Not changed |
| Stortinget | 1 | 1 | Not changed (under the ground) |
| Ekeberg | 1 | 1 | Not changed |
| Gamle Oslo | 2 | 1 | Kampen kirke once; the Barcode and the slab by the station; Ekeberg's hillside. Seen between the roofs he walks on |
| Bygdøy | 1 | 1 | The TV tower added; still seen only through the gap between the halls |
| Vigelandsparken | 1 | 1 | The jump seen from the town and the TV tower as the places say |
| Korketrekkeren | 2 | 1 | The TV tower at the top; the forest opens once onto the town's lights and the fjord's islands |
| Østensjøvannet | 2 | 1 | Reed beds, the ridge's blocks lit, Østmarka's line; the bank's trees stand back over the long crossing |
| Bjørvika | 1 | 1 | Not changed |
| Gamlebyen | 1 | 1 | Not changed |
| The encore | 2 | 1 | Ekeberg's hillside behind and between the towers, which did not move |
| The map, both | 1 | 1 | Not changed |

No 2 remains. What is weakest is said in the "Why" column and under "What only a person can judge".

**The far-colour test** (`render/warning.test.ts`, "the far view keeps off what means something"):
- **It walks the line map now**, with line 1 only and with every rune, on the walk the other tests share (the two map scenes add about a second). The
  map's far layers have no haze (ADR 0044), and its far shore's ochre houses stand 9.5 off a coin's copper under an evening sky there: named, as the
  levels' washed ones are (the test found it at once).
- **It walked by day and tinted rather than walking each sky**: that is exact while no far, mid or near layer draws anything differently under another
  sky, and that is held now: every scene's three far layers (the sixteen levels, the encore and both maps) drawn at five places under each sky record
  the same fills and copies as by day (about a second). Shown to fail on a far drawing planted under the night sky only (Korketrekkeren's). Walking
  every view under each of the four skies instead would cost the far part of the walk three times again (the whole walk is about 10 s of the suite);
  the check makes it needless. A level's own dark and its lights are drawn after the passes and are held by `render/lights.test.ts`, as before.

**LEVELS.html**: retaken with `tools/pictures.ts` from origin/main's build and the final one, the nine of the changed levels: origin/main's
were byte-identical to the page's (so the method reproduces what is there); five changed and were replaced: `06-akerselva.png`, `10-nabolaget.png`,
`13-korketrekkeren.png`, `14-ostensjovannet.png`, `17-encore.png` (the far view only; Korketrekkeren's shows the TV tower by the restaurant).
Langkaia's, Slottet's, Bygdøy's and Vigelandsparken's are byte-identical (their places do not show the new pieces) and were left. Its words for
these levels say nothing of their far view that is no longer true and were left; two pictures' descriptions were brought up to date (Korketrekkeren's
names the TV tower, Gamle Oslo's the city's towers and Ekeberg's hillside).

## Measures

- **`bun test`**: the viking suite **539 pass, 0 fail** (origin/main 538: the one new test), alone on a quiet Pi, the branch and origin/main (an archive of it under `o44/mainwt`) in turn the same hour: the branch **283.6 s and 279.9 s**, origin/main **281.4 s and 282.4 s** (`timing/times.txt`): on the means -0.2 s (the order allows 10). A first round is not counted: the branch's failed the palette test (below) and origin/main's ran while I ran that test again (299.0 s). `packages/pixelkit` 157 pass, `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (the native
  7.0.2 in Bun's cache, its binary run directly, so nothing was fetched).
- **`bun run build`** at the root: clean (`work/build-root.log`); its viking first script is the final build's, byte for byte (`index-CfSsQxsw.js`).
- **The first script**: **55,831 bytes by zlib** (vite's number, 55.83 kB), **55,867 by GNU `gzip -c`**, against origin/main's 55,819 and 55,857:
  **+12 and +10 bytes** (the limit is 100): Langkaia's call to the props kit's hook (`TEXTURED.prop("islands")`), and the lazy files' new names in
  its import map (with other names the same code measured 55,839).
- **Each file that grew** (bytes gzipped by zlib, origin/main to the final build): Akerselva's 9,821 to 10,737, Gamle Oslo's (`nabolaget`) 14,284 to
  15,115, Østensjøvannet's 7,410 to 8,096, Korketrekkeren's 7,136 to 7,636, Slottet's 9,025 to 9,272, the encore's 11,164 to 11,480, Bygdøy's 10,561 to
  10,701, Vigelandsparken's 8,200 to 8,234, `feel`'s file 46,299 to 47,065 (Langkaia's far view, `alive/langkaiafar.ts`, and the props kit's case
  for it). Every other file within a few bytes (the chunks' names).
- **Rectangles and copies a frame** (`tools/glance/perf.ts`, at 390 x 844, every 20 columns of the changed levels' walks and the encore's three
  places, 102 places, by day, at night and under each one's own sky, origin/main's build and the final one; `work/perf-*.tsv`):

  | Level | Places | Rectangles (day / night / own sky) | Copies (any sky) |
  |---|---|---|---|
  | Langkaia | 11 | +0 / +0 to +1 / +0 | +1 to +5 |
  | Slottet | 12 | -3 to +0 at each | +0 to +1 |
  | Akerselva | 13 | -4 to -2 / -3 to +1 / -4 to -2 | +0 to +3 |
  | Gamle Oslo | 11 | -51 to -17 / -45 to +1 / -45 to +1 | +2 to +3 |
  | Bygdøy | 13 | +0 | +0 |
  | Vigelandsparken | 12 | +0 | +0 |
  | Korketrekkeren | 14 | -206 to -59 / -148 to -1 / -148 to -1 | -31 to +7 |
  | Østensjøvannet | 13 | -782 to -23 / -767 to -15 / -767 to -15 | +3 to +8 |
  | The encore | 3 | +0 | +1 |

  The order allows +50 rectangles and +10 copies. Fewer rectangles: the spires over every 17th house at Gamle Oslo, the trees that stand back over
  Østensjøvannet's crossing and Korketrekkeren's opening, the flecks on two far shores. First measured, Korketrekkeren drew up to 20 copies more
  (its farthest water as strips of the plane, now two flat bands) and Østensjøvannet up to 21 (Østmarka, the blocks and the reed beds in many small
  pieces, now fewer and wider): both mended and measured again. Then the palette test (run with the suite, not with the far tests I ran as I went)
  found Korketrekkeren's two flat bands of far water a field, the paler 10.0 off the calm outline: one band in the plane's own far tone now, measured
  and photographed again.
- **The front page**: **28 of 28** byte-identical to `/tmp/shots-before-jernhaugen/` from the root build of the final code.
- **The run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the encore, on the
  branch: **17 of 17 byte-identical** with origin/main's (order 43's `sloppy/md5.txt`, made on the code origin/main has).
- **The maze's rules**: `packages/maze/tools/runs.ts` on the branch: the scripted player's runs identical with origin/main's (order 43's), the ghosts
  it writes byte-identical, and order 43's ghosts replayed to the finish on all seven (`runs/`).
- **Pictures**: **every other level's pictures** (the eight levels not changed and both line maps: order 43's look-first addresses by day, under their
  own sky and natural, 86 at each size) taken from origin/main's build and the final one: **172 of 172 byte-identical**. **The changed levels'**
  (56 places by day, 30 under their own sky, 4 at night, at 390 x 844 and 844 x 390, with the play and with the far view alone): of the 172 with the
  play by day and under their own sky, 147 differ, in 1,268,619 pixels, and **every one of them lies where the far view alone differs** between the two
  builds (`bin/behind.py`): the changes are behind the play. None blank. A difference picture a place: `shots/diff/`; before and after side by side, a
  row a place, upright and on its side, by day, at night and under its sky: `shots/handback/`.
- **Reduced motion**: nothing new moves. Every new piece is a still copy placed by its layer as everything in it is (with reduced motion every far layer
  goes at the camera's speed, as before; the pieces laid end to end, Østmarka and Korketrekkeren's town, by the layer's own origin, so they stay end to
  end). `render/reduced.test.ts` passes.
- **The lights' census** (`render/lights.test.ts`): passes, Østensjøvannet's and Korketrekkeren's rows gaining "lit backdrop" (the ridge's windows; the
  town far below); the other levels' far windows register as far windows did.
- **The far-colour test**: passes, its least distances unchanged by the new pieces (the warning red 12.4, the paint 18.7, his tunic 2.7 and what he
  takes 8.8 named as before); the map's nearest to things to use is 12.6.

## What only a person can judge, as a list for Lars

Is this it, and is it where it should be?

- **Vigelandsparken**: from the Monolith's plateau, the ridge to the north-west: the jump seen from the town, its inrun steep toward you and its landing
  hill opening under it; the TV tower above and behind it, a little to its right, clearly higher.
- **Bygdøy**: through the gap by the open water between the halls, the same ridge, the jump and the TV tower to its right and higher (seen for a moment).
- **Slottet**: over the roofs near the palace, the same ridge small and far: the jump and the TV tower.
- **Akerselva**: Grefsenkollen up the river from Nydalen at the start, a rounded wooded hill; Sagene kirke on its rise by Hjula (is its spire red brick,
  or copper?); Paulus kirke at Grünerløkka by Aamodt bru (its spire is drawn slate grey: is it?).
- **Gamle Oslo**: toward the fjord the Barcode and one tall plain slab by the station; Ekeberg's hillside close; Kampen kirke on its hill. And the sides:
  the city and Ekeberg to the left, Kampen to the right, as the line map has them, though the walk runs west.
- **Østensjøvannet**: across the lake the reed beds, the ridge's blocks among trees with a few windows lit, Østmarka's line beyond with the sunrise along it.
- **Korketrekkeren**: the TV tower close above Frognerseteren at the top; where the forest opens by the crossing, the town far below with its lights, the
  fjord with its islands, the low hills beyond.
- **Langkaia**: Hovedøya off to the west between Sørenga's blocks, Lindøya with its cabins and two islets past the saunas; Ekeberg's hillside to the
  east by the Barcode.
- **The encore**: Ekeberg standing over the park behind the towers.
- Whether each reads at phone size, upright (where the far view is a strip at the horizon) and on its side, and whether the play still reads first.
- Whether Korketrekkeren's lowered far hills and its one opening feel like height at speed on the sledge.

## Departures, doubts, found and not fixed

- **Doubts about the places as given** (each drawn as given, said here rather than drawn around):
  - **Sagene kirke**: the order has "a tall slim pointed spire of red brick"; I remember its tower in red brick with a spire that may be copper,
    green. Drawn in a darker brick, as given. **Paulus kirke**: the order says only "a pointed spire"; drawn slate grey, which is my guess, not
    knowledge (it may be copper too).
  - **The jump's facing**: the order has its hill opening toward the town (south-east), so from Vigelandsparken (south-south-east of it) and from
    Bygdøy (south) it would be seen nearly head-on. Drawn steep, as one looks up into it, with the landing hill fanning out under it, but still
    slanting a little down to the right, as the map's, Slottet's and Ekeberg's far jumps and the level itself have it. Ekeberg's far jump (not in
    this order) is still drawn in profile.
  - **Gamle Oslo's sides**: the order has Ekeberg to the south-east; from Kværnerdalen, where the walk ends, Ekeberg's north slope is nearer south
    or south-west. Drawn by the order's own rule for a walk that runs the other way from the compass: on the side the line map puts it (left, with
    the city), Kampen kirke the other way.
  - **The encore**: Ekeberg (south-east of the park) and the Barcode (north-west across the water) are on opposite sides; the order allowed Ekeberg
    behind and between the towers in the farthest layer, and it is drawn so.
  - **Korketrekkeren**: "the town and the fjord to the south-east" lies to the right of a run going down to the south-east, which is where the
    opening is; the TV tower is to the north-west, behind him at the top, so it stands to the left of the restaurant there.
- **Departures**:
  - **Korketrekkeren's far hills were lowered** (38 plus or minus 13 pixels where they were 50 plus or minus 24) and a flat band of far water put
    under them, 14 pixels, so the town and the fjord read as far below in the opening; this changes the far layer the whole run long (mostly hidden by the
    spruces), and at the top.
  - **Østensjøvannet's far hills** are now the ridge (flatter, greener), the sun's glow lies 10 pixels higher (along Østmarka's line), and the bank's
    trees stand back over the long crossing.
  - **Slottet**: the order said to leave it if its own buildings are the view it names, and they are; but its far layer drew the jump as a white line
    floating over the roofs, which the first bullet of the places mends (the jump and the tower seen from the town), and which shows the next stop.
  - **Kampen kirke** is in the farthest layer, not among Kampen's houses (whose layer lies under the view on the roofs).
  - **Langkaia's islands are in `feel`'s file**, asked for through the props kit's hook, where the order said "Langkaia's own file": that file is the
    first script, and the hook keeps the first script within its 100 bytes (12).
  - **A test was added to** (`render/warning.test.ts`): the map walked, and the sky premise held. Item 4 asked for either if cheap: both are.
- **Found and not fixed**:
  - Upright, the far view is a strip at the horizon: Grefsenkollen does not show at Akerselva's start upright (the T-bane's hall and the bank are in
    front of it), Korketrekkeren's TV tower is behind the first sign's bubble while it is up, and most of the new pieces are small there.
  - Sagene kirke and Kampen kirke are glimpsed between the lane's own things (Hjula's stilts and bridge; the roofs he walks on) more than seen.
  - Bygdøy's far view still shows only through the gap between Fram's hall and the Kon-Tiki museum.
  - With reduced motion the far hills drawn a column at a time (Akerselva's, Gamle Oslo's, Korketrekkeren's) stretch to eight times their width, as
    every such layer always has; the new pieces do not stretch.
- **My own slips**: a picture script piped into `grep` never returned (its preview servers held the pipe) and had to be stopped, which stopped the
  servers; and a far-only address list first came out as `?debug?debugfaronly` (bash 5.2's `&` in a pattern substitution). Both caught before any
  picture was used (`handbook/lessons.md`).
