# Order 40: what he takes, and what warns: each item and the measures

Measured on 23 November 2026 on branch `takes-and-warns` (from `origin/main` at `5335a4b`, after order 39). Lars has not played, so nothing was
retuned: no route, box, speed, timing, heart, enemy placement or story word, in the fjord or in the maze. Pictures and working files, outside
the repository, in `~/.cache/claude-scratch-larshansen/o40/`: `shots/` (the hand-back's pictures: `item1/`, `item2/`, `item3/`, `item4/`; and every
picture taken: `takes-day/`, `takes-main/`, `takes-all/`, `takes-shadow/`, `tells-main-all/`, `tells-wip/`, `eight-main/`, `eight-final/`),
`figures/` (the figures tool on the branch; order 39's `o39/figures/` is `origin/main`'s), `same/` (every level's places from both builds),
`sloppy-main/` and `sloppy/` (the run files), `runs/` (the maze's), `front/`, `work/` (places, measures, logs), `bin/` (the scripts).
Done in the order the order gives: item 1, item 2, item 3, item 4. What was looked at first: `before.md`.

## 1. What he takes, after dusk: done

**Built** (the planner's call, ADR 0044 amended): under any sky but the day's, each skilling, the cheese and the bracteate on the screen that he
can still take has a line a pixel wide round its shape (every pixel beside it, left, right, above or below, that it does not paint), the rule
the maze's rune key has (ADR 0056), in **the level's dark**: the near-black of an enemy's inner line (`ENEMY.line`) as the sky's tint leaves it,
`#331d2c` in the evening (a dark plum), `#1e1c3a` at twilight (an indigo), `#101025` at night (a navy). Drawn by `takeLines` (`alive/things.ts`)
in `afterDark` (`render/dusk.ts`, `feel`'s file) before the skilling and the cheese are drawn again over their tinted selves; a piece a shape
and colour, copied. Not round a bracteate found on an earlier visit (its pale ring hangs there: the page tells `afterDark`, `PAGE.owned`, its one
change to the first script), not round the rune's stone (its own edge is a dark line all round), not round what is off the screen. By day nothing
changes.

**Judged at phone size** (`shots/item1/three-evening-day-before-all-shadow-x5.png`, `three-evening-before-all-shadow-x2.png`; the bracteate at
Langkaia, the cheese at Ekeberg, a skilling at Bjørvika, each by day, in the evening before, with the line all round, and with the line on the
shadow side only): with the line all round each reads as a coin, a cheese, a medallion with a dark rim, plainly apart from the evening's warm
ground; none looks like an enemy (no red: the line is 30 or more off the warning red, and the enemies' read is the red outline round a near-black
one). The plain line is not heavy at phone size: it is the coin's rim. The lighter means, **the shadow side only** (right, under and the corner),
reads as relief and is lighter, but the cheese's lit top and the bracteate's lit side stay warm on warm (the cheese 27.9 at Ekeberg and at
Langkaia), and a skilling seen edge on becomes a dark stick beside a copper one. **Chosen: the line all round.** The shadow side is kept as a
switch (`TAKE_LINE.shadow`) only to say what was tried.

**Measured** as order 39 measured (`takes.tsv`; its edge against the pixel beyond, CIEDE2000, the median), every skilling, cheese and bracteate
under every sky after dusk it is met under:

| | Langkaia evening | twilight | night | Ekeberg evening | Bjørvika evening | Korketrekkeren evening | Østensjøvannet twilight | Gamlebyen night | Gamle Oslo winter |
|---|---|---|---|---|---|---|---|---|---|
| skilling | 17.2 → **31.6** | 37.2 → 36.9 | 37.6 → 35.9 | 17.7 → **31.6** | 18.0 → **31.6** | 29.1 → **31.6** | 32.6 → 36.9 | 37.4 → 35.9 | 37.5 → 35.9 |
| cheese | 18.3 → **44.9** | 37.3 → 49.8 | 38.4 → 49.6 | 15.0 → **44.9** | 21.0 → **44.9** | (not found: the level's opening words lie over it at step 1) | 38.8 → 49.8 | 33.3 → 40.7 | 34.7 → 49.6 |
| bracteate | 14.5 → **49.6** | 41.6 → 49.9 | 46.7 → 45.9 | 14.5 → **49.6** | 23.4 → **49.6** | 25.3 → **49.6** | 41.6 → 49.9 | 46.7 → 45.9 | 46.7 → 45.9 |

**None under 30 afterwards** among what he takes, met after dusk, where it is found. Named, as the order asks:
- **Nordmarka** (twilight under its own dark): the skilling 4.8 before and after; the cheese and the bracteate not found. Outside his headlamp's
  circle the forest's dark covers everything after the line is drawn, by design (ADR 0054); inside it they are as at twilight.
- **The rune's stone** is not given the line (its own edge is dark): at Langkaia's twilight 19.3 and night 6.7, Østensjøvannet's twilight 13.5, a
  dark edge on the night's dark ground; its rune is lit and glows when he is near. A dark line cannot lift dark on dark; a pale rim would be a
  decision about the look, and is not built.
- **Benches and flags** are not things to take (a bench is marked by its cyan corners, which keep their light after dark; a flag is raised): under
  30 after dusk in most levels (`takes.tsv`), unchanged.
- At night the line against the ground beyond it is small (3 to 26): the night's dark is nearly the line's own; what reads is the coin's edge
  against the line (35.9 or more).

The levels pinned to day are measured at night too (`takes.tsv`, "met under it: no"): every skilling, cheese and bracteate found there 35.9 or more (Rådhuset's bracteate and rune stone not found by their colours, as in order 39).

**Held** by `alive/takes.test.ts` (beside `alive/thrown.test.ts`): no line by day; after dusk, in every level, at steps that show the skilling's
four turns, the cheese's bob and the bracteate narrow and full, with motion and without, the line is exactly the pixels beside each shape and in
the level's dark; the dark is `ENEMY.line` under the sky's tint, 30 or more off the warning red (20 off it tinted) and 10 or more off every role's
colour, and not black in the evening; it stands 30 or more (the median) off the edge it goes round as the page shows that after dusk; none round
what is taken, a bracteate found before, or what is off the screen. Shown to fail on three planted faults (the shadow side only; the line black;
the found bracteate lined).

**Its cost**: the first script 24 bytes (the page's `owned` for `afterDark`), `feel`'s file 42.77 to 43.45 kB gzipped; a copy a thing to take on
the screen after dusk (below, "Measures").

## 2. The weakest tells: done

**The track rat** (`levels/stortinget.ts`): its tell was three dark stones kicked up on the third rail's red cover, 6 pixels, on and off with
motion (held still with reduced motion since order 39). Now, for the whole of the tell, **its snout pokes up over the cover**: the top of its
rising frame (its nose, its eye, its whiskers), drawn through `drawFoe` and outlined as the rat is (the near-black line and the warning red), so it
says at once that what is in the pit hurts; with motion it sniffs (its nose down a pixel and up again on the stones' beat), with reduced motion it
is held up and still. The stones are as they were. It cannot be touched until it leaps, as before (its box is the rules', unchanged). In place
(`shots/item2/trackrat-before-after-x5.png`: the step before, a third into it on both of the sniff's frames, two thirds, with reduced motion, and
at night with and without): the branch's picture adds 26 pixels at 45.3 off what was there with motion, 25 with reduced motion, where origin/main's
tell was 6 dark pixels on red (or none, half the time). At night its neon glow comes with it.

**Every tell ranked** (`before.md`, `tells.tsv`): the five weakest rows with motion: a wall closing behind him at Gamlebyen, the track rat, what
gives way under him (a lily pad, a bundle), a gust coming at Ekeberg, the welder's sparks at Bjørvika. **Mended, the same way, drawing only**
(when each starts and ends is as the rules had it; the run files are identical):

| Tell | Was | Is | Added in place (same step, origin/main's picture against the branch's): motion, reduced |
|---|---|---|---|
| A wall closing behind him (`levels/gamlebyen.ts`) | a crack a pixel high, two stones' tops a pixel high and 4 and 3 wide, four grains of dust (13 pixels, 14.1) | the tops of its two stones two rows high and six wide each, pale as a risen stone, a joint between them, the crack across the tile, six grains of dust thrown higher | 30 pixels at 20.9; 16 at 19.6 |
| A lily pad about to sink (`levels/ostensjovannet.ts`) | a pixel's tremble (13 pixels) | and the water stirring at its rim: a glint at each end and a broken line of glints along its foot, still, for the whole half second | 24 at 17.1; 24 at 17.1 |
| A bundle about to sink (`levels/bygdoy.ts`) | a pixel's tremble (24) | and water slopping up at each end, still | 12 at 33.8; 12 at 33.8 |
| A gust coming (`levels/ekeberg.ts`) | four to twelve leaves of the evening's own colour (53 pixels, 5.9) | eight to sixteen leaves, each lit on its windward end, and the wind's streaks already, shorter and fainter than when it blows | 74 at 20.3; 64 at 20.3 |

Pictures: `shots/item2/mended-before-after-x4.png` (each a third into it, with motion and with reduced motion; origin/main's left, the branch's
right). **Left**: the welder's sparks (fifth), and what shares the mended tells but was not touched: Bjørvika's gust (its dust already pale
streaks), the sinking stone at Gamlebyen and the heron (the same "gives way" tell as the pad: a tremble, and the paint's dashes joined with
reduced motion). The bosses and Loki are not among the weakest (their own drawings change 105 to 2,654 pixels at their tells, order 39).

**Held** by `render/tells.test.ts`: each tell staged as the harness stages it, its drawing recorded pixel by pixel in a box round it at the step
before it (the level's ground and where he was as they were) and at seven steps inside it; at every one, with motion and with reduced motion, at
least: the track rat 10 pixels (its body alone: the page adds the outline), the salmon 12, the Angry Boy 12, the closing wall 40, the lily pad 20,
the bundle 10, the gust 50. On origin/main's drawings it fails for the rat, the wall, the pad, the bundle and the gust (shown); the salmon and the
boy were already over theirs. `render/reduced.test.ts` (every jumper's tell one still mark with reduced motion, nothing blinking) and
`render/feel.test.ts` still hold.

## 3. The eight left at 2: done (six redrawn, two left with reasons)

| Figure | Was | Is | Where |
|---|---|---|---|
| The track rat | its tell three dark stones | its snout over the cover (item 2) | `levels/stortinget.ts` |
| The stove pipe (the sauna rafts, the club's hut) | a flat cap on a bar | a rain cap on two legs with the flue's soot under it, the round pipe lit and shaded, a joint's collar on the tall one, the flashing through the roof | `alive/props.ts` |
| The pontoons (the sauna rafts) | a dark band, its top row under the deck's edge | a row of tarred floats under the deck, each lit on its upper left and rounded, darkening into the fjord at the waterline | `alive/props.ts` |
| The post | a bar lit on its left | iron: a cap with a dark line under it, a collar, a plinth; wood: a bolt near its top, a knot, its foot dark and wet | `alive/props.ts` |
| The balusters (Slottet) | bars two wide, nicked at the waist | turned balusters three wide at the same pitch: a cap, a neck, the swelling of the body, a neck, a foot | `levels/slottet.ts` |
| The fire basket (Akershus) | a rim over a bowl, three rows | a rim, a cage of bars with the coals' dark between, a bowl, a stem and a foot (the flame drawn apart, as before) | `levels/akershus.ts` |
| The ski pole | left: a pixel wide at his side with its grip, strap, basket and tip all there; any wider and it stands out from him as a stick | | |
| The tube railing | left: ADR 0051 keeps a rail a line with a glint; clamps and base plates on its posts were tried and were not seen in place at phone size, so the old drawing stands | | |

Each keeps its place and its size but the pontoons (two rows deeper, under water, where the deck covered the old band's top) and the baluster
(three wide where it was two, at the same pitch: the same number in each balustrade). Pictures: at four times, the figures tool's sheets before
and after (`shots/item3/four-times.png`); in place at 390 x 844, by day and under each level's sky (`shots/item3/in-place-*.png`; props are not
glammed, so glammed and natural are the same picture; the track rat glammed and natural in `shots/item2/`). **Read better in place**: the stove
pipes plainly (a chimney, not a T), the balusters plainly (a balustrade of turned stone), the fire basket (a basket on a stem under its fire),
the pontoons a little (floats under the deck), the posts a little (Holmenkollen's station posts read as columns, the deck's posts as timber).
None reads worse.

## 4. Keep the table honest: done

- **The figures tool** run again into `o40/figures/` (119 sheets and `figures.json`): seven sheets differ from origin/main's, the changed figures
  and the rafts that carry the pontoons (`carrier-langkaia`, `enemy-trackrat`, `prop-baluster`, `prop-fire basket`, `prop-pontoons`, `prop-post`,
  `prop-stove pipe`); **`figures.json` is byte-identical** (no name, state or piece key changed).
- **One contact sheet** of every changed figure's first row, before (top) and after (below): `shots/item4/contact-first-rows.png`.
- **The marks again** in `before.md`, "The marks again": no 3s; two 2s remain (the ski pole, the tube railing), each named with why.

## Docs

HANDOVER (the round's row and section, the first script, the margins); the handbook (start-here's state and table; the roadmap's status, "In
flight" and "Next"; lessons; resources; conversations: the planner's call for item 1); DESIGN ("Colour says what a thing is": what he takes;
"What just happened" point 8: every tell big enough to be seen; "Props at arm's length"; "Checking"); ADR 0044 amended (the rule for item 1: the
outlines by role are its; the maze's key is ADR 0056's); `before.md`, this file, `takes.tsv`, `tells.tsv`. LEVELS.html's pictures: retaken with `tools/pictures.ts`; from origin/main's build
all 23 came out byte-identical to the committed ones; from the branch's, eight changed, each only where a thing to take stands after dusk (its
line; a few of its pixels under what is drawn after it, Nordmarka's dark, the paint): `07-nordmarka`, `09-ekeberg`, `10-nabolaget`,
`13-korketrekkeren`, `14-ostensjovannet`, `15-bjorvika`, `16-gamlebyen`, `16-gamlebyen-dawn`. No picture shows a redrawn prop or a tell; the
page's words did not need to change.

## Measures

- **`bun test`**: the viking suite 512 pass, 0 fail (501 on origin/main: the eleven new tests), alone on a quiet Pi. The branch **272.6 s, 272.6 s and
  277.0 s**; origin/main (a worktree, the same hour) **262.2 s and 270.9 s** (`timing/times.txt`, the JUnit reports `timing/*.xml`). Paired as run:
  +10.4 s and +6.1 s; on the means +7.5 s. The new tests are 1.6 s of it (`alive/takes.test.ts` 1.2, `render/tells.test.ts` 0.4); the JUnit report
  put 7.6 s more on the reduced-motion test, but alone it is no slower (61.3 s on the branch, 63.0 s on origin/main), so the rest is the run-to-run
  spread while the reach searches load all four cores. Inside the 10 s the order allows on the mean; one pairing is 0.4 s over it. `packages/pixelkit` 155 pass, `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (7.0.2,
  the native compiler already in Bun's cache on this machine, run directly so nothing was fetched).
- **`bun run build`** at the root: clean (`work/build-root.log`; the viking page's first script the same file, `index-Bh1oO4wx.js`, 58.56 kB).
- **The viking page's first script**: **58.56 kB** gzipped by vite (58,551 bytes by GNU `gzip -c`), from 58.55 (58,530): 21 bytes. Item by item
  (each commit built alone): item 1 +24 bytes (the page's `owned` for `afterDark`), item 2 and item 3 nothing of their own (their drawing is in
  lazy files; the first script's size moved by the chunks' names it carries, -15 and +12). Lazy files: `feel`'s 42.77 to 43.45 kB gzipped (item 1)
  and to 43.72 (item 3's props); Stortinget's 10.18 to 10.26, Gamlebyen's 16.12 to 16.15, Østensjøvannet's 7.31 to 7.35, Bygdøy's 9.97 to 10.01,
  Ekeberg's 7.75 to 7.77 (item 2); Akershus's 5.63 to 5.65, Slottet's 8.99 to 9.00 (item 3). Under 60.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` on the final build (`front/front-after`); the kit was not touched.
- **The fjord's run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the
  encore, on origin/main's code (before any change) and on the branch: **17 of 17 byte-identical** (`sloppy-main/md5.txt`, `sloppy/md5.txt`), and the
  same as order 39's.
- **The maze's rules**: `packages/maze/tools/runs.ts` on origin/main's code (before any change) and on the branch: the scripted player's 18 runs (every
  level, both speeds, both ways where there are teleport stones) identical step for step (`runs/runs-main.txt`, `runs-branch.txt`); the ghosts each
  writes byte-identical, and origin/main's replayed by the branch's code to the same points and the same finish on all seven. The maze's own perf
  (every level at step 30): the same rectangles, colours and copies (`work/mazeperf-*.tsv`). Nothing of the maze changed.
- **The fjord's pictures**: order 35's 176 places (every level's walk every 60 columns by day and at night, the encore, the map) at 390 x 844 from
  origin/main's build and the branch's, none blank: **by day 83 of 88 byte-identical**; the 5 that differ, each only where a redrawn prop stands
  (`shots/same-diffs/`): Akershus column 240 (a fire basket), Holmenkollen column 0 (the station's roof posts), Langkaia columns 60 and 120 (the
  deck's posts, the sauna rafts' pontoons and stove pipe, the club hut's stove pipe), Gamle Oslo column 180 (a washing-line post). **At night every
  place with a thing to take in view differs** (74 of 88), and only there and at those props: of their differing pixels nearly all are the line's
  own colour (`#101025`); the rest (3 to 79 a picture) are line pixels under what `afterDark` and the page draw after it (a coin drawn again, the
  paint, an invader's glow, the help line's words, Nordmarka's dark), each looked at (`work/samediffs/`). No place shows a mended tell (none was
  in its tell at those steps); the tells' own pictures are under item 2.
- **Rectangles a frame**: order 39's 337 places (order 35's walk by day and at night and order 38's figures in place, `work/perf-places.tsv`)
  measured in both builds the same hour with `tools/glance/perf.ts` (`work/perf-before.tsv`, `perf-after.tsv`, `work/perfcmp.txt`): 335 measured both
  ways; **no place more than 2 rectangles a frame over origin/main's** (the track rat with reduced motion at night, its snout; the order allows 50),
  none fewer. Copies a frame: after dusk a copy for each thing to take on the screen (its line), up to 15 more at a place (Rådhuset at
  night, column 180), 19 where the track rat is in its tell with reduced motion at night (its snout's outline and its glow with the lines); by day none, but
  one at the track rat's place a step before its tell with reduced motion (its picture there is byte-identical to origin/main's, its snout behind
  a train; the perf frame counts it, a step on). The redrawn props are each one copy, as before.
- **What he takes, on the final build**: the 60 places met after dusk photographed again from the final build and measured again
  (`work/takes-rim-final.tsv`): every skilling, cheese and bracteate as in the table above; the only thing under 30 is the skilling in Nordmarka's
  dark (4.8). The rune's stone as on origin/main: a first build had drawn the line round it too, and it measured 8 to 10 there (the dark line
  against its own dark edge), which is why it has none.


## What only a person can judge

- After dusk, whether a coin, the cheese and a bracteate with a dark rim still read as treasure at a glance, or look heavier than he likes (by
  day nothing changed); and whether the line is wanted at all (it is one call to take out).
- Whether the track rat's snout over the cover is seen in time before it leaps, at speed, with motion and with reduced motion; and whether a red
  outline on something that cannot yet be touched reads as "it is coming", not "stomp it".
- Whether a wall about to close behind him at Gamlebyen is noticed (he is standing on it when it starts), and whether the water stirring round
  a lily pad or a bundle reads as "about to go" in the half second it has.
- Whether a gust's streaks and leaves at Ekeberg read as wind coming, in the evening.
- Whether the stove pipes, the floats under the rafts, the posts, the balusters and the fire baskets read as what they are at phone size.

## Departures, doubts, found and not fixed

- **The ADR**: the order named 0056 or 0044, whichever holds the rule. The rule a dark line round a thing to take is drawn in the maze since order
  36 but not written in 0056; what each outline means (red, pale, now dark) is 0044's, so 0044 is amended and points at 0056's key.
- **The rune's stone gets no line**: its own edge is a dark line already; at night and twilight it measures low (6.7 to 19.3, dark on dark), named
  above; a pale rim would be a look to decide, not built.
- **The tell measure is noisy**, and the hand-back says where (`before.md`, "Limits"): him and the camera's world in routed stagings, a train
  behind the track rat, the bosses' windows not on the bosses. The ranking was read with the pictures; for what each mend added, the two builds'
  pictures at the same step are compared, which is exact.
- **Mended four rows, not three**: the wall, the track rat, what gives way (the pad and the bundle) and the gust. The fifth weakest, the welder's
  sparks (18 pixels, 20.1), is not mended; nor Bjørvika's gust, the sinking stone or the heron, which share mended kinds of tell.
- **`render/tells.test.ts` holds drawings without their outline**: where there is no page `outlined` just draws, so the track rat's number is its
  body alone (the page adds the outline, about as many pixels again).
- **The pontoons are deeper** (nine rows, five under the deck as before), and **the baluster three wide** where it was two, at the same pitch and
  count: drawings only; no box, top or place changed.
- **The tube railing**: clamps and base plates on its posts were drawn, photographed and taken out again (not seen in place); its sheet is as it was.
