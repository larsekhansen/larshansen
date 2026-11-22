# Order 35: housekeeping, and every figure on one page, each item and the measures

Measured on 22 November 2026 on branch `housekeeping` (from `origin/main` at `d53e4fb`, after order 34). Nothing in it retunes the game:
no route, box, speed, timing, hearts or enemy placement changed, and no story words. Pictures and working files (outside the repository)
are in `~/.cache/claude-scratch-larshansen/o35/`: `figures/` (item 2), `shots/` a folder an item, `timing/` (the suite's runs and their
JUnit files), `faults/` (each planted fault's run), `perf/` (item 3c), `runs-before/` and `runs-after/` (the sloppy player's run files).

## 1. The test suite's time: done

**The suite's time**, `bun test` in `apps/viking` alone on a quiet Pi (load about 1.5 as each began), timed from the outside: **264.1 s,
263.7 s and 256.9 s** (488 tests across 23 files, none failing). Before any change the same morning: 362.7 s (484 tests across 22 files);
order 34 measured 370.5 s. The order's limit is 300 s. (Three runs before the last small change, the warning test working out each light's
colour once, took 267.9, 271.0 and 261.3 s.)

**Where the time went, and what was done.** Every file was timed from bun's JUnit report (`--reporter=junit`), and the slowest were profiled
(`bun --cpu-prof-md` on a script that does what the test does). Nothing was skipped, sampled down, deleted or moved out of the suite; every
test holds what it held, and its output (every table it prints) is the same line for line where it prints one.

- **The recorders the tests draw into** (most of the gain). Every stand-in context (`areaRecorder` in `render/fields.ts`, the warning
  test's raster, the reduced-motion test's recorder, the light census's) was a `Proxy` round an object, so every `fillRect` and every
  `fillStyle =` went through a trap; `areaRecorder` also parsed a colour and printed its hex on every fill, and the warning test built a
  string key on every fill under a haze. Now each keeps what it needs as its own and leaves anything else to a prototype that is a proxy
  (`ANY_METHOD`; `NO_METHOD` for a canvas that keeps nothing), and works a colour out once (`areaKey`, the warning test's inks a map a haze,
  the census's alpha). Drawing every level for the fields (`levelPaint`) went from 25.1 s to 7.6 s, which `palette.test.ts` and
  `props.test.ts` both do. The areas, tables and verdicts are the same: each file's printed output was compared with the run before.
- **The reduced-motion test**: its recorder mixes each call's numbers (both halves of each number's bits, nought with one sign) and
  hashes each string once into the fingerprint, where it built a string a call and hashed it character by character; and what it drew
  twice: where a path changes in its six sparse recordings, its 25 dense ones drew those six clocks again; they reuse them now. (The
  warm-up drawing before the recordings stays: it keeps a cache that starts over from splitting a run of recordings, as order 32 found.
  Each of the four route walks also plays the route again; sharing one would need a snapshot of the play, not done.)
- **The warning tests share one walk** (order 34 named it): each level is walked once, the scenery and the ground drawn into one raster,
  what he meets drawn once onto both (counted in one, covering in the other).
- **The reach searches** (`levels.test.ts`): sixteen workers at once on four cores, every test waiting for the slowest. Now a pool of as
  many workers as cores, the costliest first, Gamlebyen's nine searches each a job, a worker taking job after job; the tests go on beside
  them, and a level's reach tests wait only for its own (`game/reachlevel.ts` holds the searches; `reach.worker.ts` is a thin worker). The
  results were compared field by field with the old workers' for all sixteen levels: identical. They are CPU-bound (about 400 core-seconds;
  Akershus's search alone 52 s, nearly all of it the kit's `moveY`), so this saved about twenty seconds, not more.
- **Not done, and why**: counting the warning walk's kept pieces once (order 34's suggestion) would need a stand-in canvas that keeps
  pixels and copies them; with the recorder's cost gone the walk takes about 10 s (Akershus 2.0, Bygdøy 2.3), and the remaining time is
  the drawing. The kit's physics (the reach searches' floor) is the front page's too and was not touched.

**Every test changed, shown to fail when it should.** Each fault was planted in the game's own code, the test run, and the fault removed
(`faults/run.py`, its logs in `faults/`):

| Fault planted | Test | Result |
|---|---|---|
| a red field: the deep water in an enemy's orange (`render/tiles.ts`) | palette: no enemy body near any level's field | fails |
| a neon prop: the props kit's wood in hot pink | props: no prop is neon | fails (asked alone with `-t` it first passed: it read what the first test's walk gathered; each test now draws what it reads) |
| a harmless thing in the warning red: Rådhuset's ferry band | warning: what carries him | fails |
| scenery in the warning red: the deep water | warning: the scenery and the ground | fails |
| a red crane light: Bjørvika's in the warning red | warning: no light near the warning red (new) | fails |
| a dimmed light: a see-through fill over the view in Gamlebyen's front pass | lights: nothing drawn after a light dims it | fails (a first try, a dusk drawn over lights registered earlier in the same pass, passed: a pass's lights are drawn at its end, so that is no dimming) |
| a blink in Langkaia's backdrop, by the clock with reduced motion | reduced: every level's scenery | fails |
| a blink in every look drawn as frames | reduced: every thing | fails |
| a blink in the Angry Boy's leap | reduced: every moving thing | fails (a first try in the kit's `drawCarrier` passed: no level draws its carriers with the kit now, so that part of the watch watches nothing) |
| a blink in his drawing (feel) | reduced: what feel draws | fails |
| a blink in `afterDark` | reduced: after dusk | fails |
| a blink in the line map's backdrop | reduced: the map | fails |
| a blink in the troll's body | reduced: every boss | fails |
| Gamlebyen's bracteate on the street at the start | levels: the bracteate cannot be reached (through the pooled searches and the joined parts) | fails |
| the hare's name taken out | figures (new): every figure named | fails |
| Bjørvika's throwers left out of the list | figures (new): every kind listed | fails |

**Per file**, the JUnit report's seconds, the run before any change and the last three runs:

| file | before (`origin/main`, 484 tests) | run 1 | run 2 | run 3 |
|---|---|---|---|---|
| `src/levels/levels.test.ts` | 125.9 | 107.2 | 107.3 | 105.4 |
| `src/render/reduced.test.ts` | 99.1 | 70.5 | 71.3 | 71.0 |
| `src/render/palette.test.ts` | 38.4 | 20.4 | 20.4 | 20.0 |
| `src/render/warning.test.ts` | 26.0 | 15.6 | 15.1 | 12.0 |
| `src/alive/props.test.ts` | 23.5 | 7.6 | 7.6 | 7.3 |
| `src/render/lights.test.ts` | 17.1 | 16.5 | 16.1 | 16.4 |
| `src/game/frame.test.ts` | 12.2 | 11.3 | 10.2 | 9.8 |
| `src/alive/ground.test.ts` | 4.9 | 0.5 | 0.5 | 0.5 |
| `src/render/feel.test.ts` | 4.1 | 3.9 | 4.2 | 3.9 |
| `src/render/night.test.ts` | 3.8 | 3.4 | 3.5 | 3.4 |
| `src/levels/lazy.test.ts` | 3.2 | 2.4 | 2.4 | 2.4 |
| `src/alive/invasion.test.ts` | 1.8 | 1.7 | 1.9 | 1.6 |
| `src/alive/fore.test.ts` | 0.9 | 1.0 | 1.0 | 0.9 |
| `src/levels/encore.test.ts` | 0.8 | 0.8 | 0.7 | 0.7 |
| `src/game/rules.test.ts` | 0.4 | 0.6 | 0.6 | 0.5 |
| `src/alive/natural.test.ts` | 0.4 | 0.4 | 0.4 | 0.4 |
| `src/game/tune.test.ts` | 0.2 | 0.2 | 0.2 | 0.2 |
| `src/alive/frames.test.ts` | 0.1 | 0.1 | 0.1 | 0.1 |
| `src/game/words.test.ts` | 0.0 | 0.0 | 0.0 | 0.0 |
| `src/render/pad.test.ts` | 0.0 | 0.0 | 0.0 | 0.0 |
| `src/game/progress.test.ts` | 0.0 | 0.0 | 0.0 | 0.0 |
| `src/game/card.test.ts` | 0.0 | 0.0 | 0.0 | 0.0 |
| `src/alive/figures.test.ts` | 0.0 | 0.1 | 0.1 | 0.1 |
| total (junit) | 362.7 | 264.0 | 263.6 | 256.9 |

(`figures.test.ts` is new: 0.1 s. Each run's JUnit file is in `timing/`, with `perfile.py` that makes this table.) The three slowest files,
the mean of the three runs: `levels/levels.test.ts` 106.6 s (the reach searches, CPU-bound), `render/reduced.test.ts` 70.9 s,
`render/palette.test.ts` 20.3 s.

## 2. Every figure on one page: done

`apps/viking/tools/figures.ts <dir>` writes 112 sheets and `figures.json` into `~/.cache/claude-scratch-larshansen/o35/figures/`
in about a minute and a half. Each sheet is one figure at four times size on the sheets' neutral ground (`glance/framesheet.py`'s light
ground), a state a row, its frames along the row, each row's frames on one grid so they line up, no words in the picture. `figures.json`
lists each file with its name as a player would say it (`{ en, nb }`), the levels it is met in, and its states in row order.

- **Him**: every frame of his table, a state a row (standing, running, in the air, landing, dashing, behind the shield, sitting, thrown
  back, pushing into a door); a frame his table gains comes in a row of its own.
- **Every enemy** (43 looks, by the census's names): for each level it is met in, its states glammed in that level's lean
  (still, moving, winding up for a thrower, its glamour breaking), levels whose rows come out alike sharing them; then its natural self and
  its glam marks alone. What can hurt him has the page's outline (the near-black line and the warning red, as `outlined` grows it), its
  natural self the calm pale. `census(true)` draws each look in every level (the census drew it in its first only).
- **The bosses**: the troll, the plough and the serpent in every state their glance sheets have (`glance/bosses.ts`, `serpent.ts`, now
  functions as well as commands, their output unchanged: compared by md5), a state a row; Loki at each of his four stages (glammed, the
  wig off, the shades off, the jacket off) through every move with its tell (waiting, waking, strutting, the club raised and the slam with
  its wave, revving, the charge, the ring of foam and the jaws, posing under his stars, reeling), and plain (standing, shrugging, walking
  off), drawn by the encore's own art. The bosses and Loki are drawn without the outline: the page outlines them by their phase inside
  their own drawing.
- **Carriers**: each level's, a row a carrier (alike ones once), at four moments of its round, where it is then.
- **What is thrown**: by thrower, in flight in its two frames and spent, outlined; levels that draw it alike share a row.
- **Pickups and things** (`glance/frames.ts`'s sheets): skilling, brown cheese, the bracteate, the rune stone, the ski pole, the feather,
  the shield, the bench, the flag; and the sheep and the heron.
- **Props** (ADR 0051): every kind any level draws, and the panel doors (drawn from a scene's doors), each piece it is drawn as, alike
  pieces once, at most eight to a row (the props kit reports its pieces to the tool through `PROPS.pieces`).
- **Held**: `alive/figures.test.ts`: every enemy look, what every thrower throws, every boss and every level's carriers are listed with
  the levels they are met in, every figure listed has its name in both languages, and no name is left over; `alive/props.test.ts`: every
  prop kind a level draws is named. `game/words.test.ts` reads the names as words kept by language. What is drawn comes from the tables, so a
  new enemy, carrier, thrower or prop is drawn without a word in the tool; only its name must be written (`alive/figures.ts`), and the
  tests say which.

## 3. Small things left by orders 33 and 34

### 3a. The encore's shouts under the harness: done

Stepped (`?debug&steps=…`), the page now asks the level's music every step, without sound (`main.ts`, under the harness only), so it sees
Loki wake and knows his beat: a still picture mid-fight shows a shouted line in its bubble without `&say`. In the scripted fight (`&auto`)
the music has a line up from step 238 to 345 (strutting), 434 to 463, 742 to 791 and 1022 to 1055 (posing); the page shows it where
none of his own lines or hints is up (at step 300 his "Good evening, Oslo!" is still up, and it shows that instead). Photographed at steps 330, 440, 760 and 1030, at 390 x 844 and 360 x 640, in English and Norwegian
(`shots/3a-shout/after/`, 16 pictures), and `origin/main`'s build at 390 x 844 (`before/`: no bubble there). In each the bubble stands beside
him on the side away from the player; posing, his violet stars are under the bubble's foot and clear of it (`look/3a-zoom.png` at three
times: about two pixels between them at 360 x 640); strutting, nothing of a tell is up (a line is never up during one, `shoutAt`).

### 3b. Blank harness pictures: found, fixed and named

**Why.** `tools/shots.ts` was run over every harness picture of orders 32 and 34 kept in `~/.cache` (337): 17 are blank, every one an
encore picture under `?debug&told&level=encore&auto&steps=…` taken with `--wait=5000`. Each shows the header at 0:00.0 with no lives and the
page's own background where the scene should be: the picture was taken before the page had started (the encore's file, its route, the
scripted player and `feel`'s file come after the load event, and on a loaded Pi that took longer than the five seconds). HANDOVER's cause, a
hit in the last steps, holds a picture (the page draws nothing new for four steps), but the harness draws its one frame after stepping, so
it shows; it was not what blanked these. Where it could blank one, it is fixed: a frame over canvases a resize has just emptied is drawn
whatever holds (`main.ts`); and `?debug&perf` measures a whole frame while a hit holds (it measured 0 at ten places of orders 33 and 34).

**Fixed.** A `?debug` page now tells the frame round it when its picture is drawn (`afterStart` in `debug.ts`, after any `on=`, `note=` or
grain), and `shots.ts --wait=<ms>` takes the picture then (a fifth of a second after), `<ms>` the most it waits: the encore's pictures took
about 3 s each here. **Named.** `shots.ts` names any picture whose middle (a fifth to four fifths of its height) is nothing but one colour a
row, as the page's background is, as `BLANK` as it is taken and again at the end, and ends with 3; `tools/pictures.ts` puts none on
LEVELS.html. The front page's pictures are not affected (the check reads the file after it is taken).

### 3c. Perf at every place: done

`tools/glance/perf.ts` measures every place in one browser: headless Firefox opens a small page served by the tool, which opens each place
in turn in a frame the window's size and waits for its line before the next; the game is served through the tool, so the small page shares
its origin and empties the game's storage before each place, as a fresh browser had it. `--each` is the old way. On ten places the counts
were the same both ways and the same as `origin/main`'s tool's; `origin/main`'s tool took 52.7 s (5.3 s a place, on a quiet Pi; order 34's
"about forty seconds" was not reproduced), the new one 22 s (2.2 s a place).

**All places, both builds** (`perf/places.tsv`: order 33's 275 places, every level's walk by its own sky and at night, the encore, the map,
Stortinget's shafts, Vålerenga's lane; and the hare's place at Holmenkollen by day and at night; at 390 x 844), one browser each:
`origin/main`'s build in 574 s, the branch's in 586 s (2.1 s a place). Every place draws the same number of rectangles in both but ten:
the places where he is hit in the first step (Stortinget columns 30 and 48, Gamle Oslo's lane at columns 92 and 102, by day and at night),
which measured 0 on `origin/main` (the hold) and now measure a whole frame, 1,705 to 5,287 rectangles. By level, the most a frame:

| Level | places | most before | most after | most gained | least change |
|---|---|---|---|---|---|
| Langkaia | 10 | 7,251 | 7,251 | +0 | +0 |
| Akershus | 10 | 6,899 | 6,899 | +0 | +0 |
| Rådhuset | 8 | 4,954 | 4,954 | +0 | +0 |
| Slottet | 10 | 9,703 | 9,703 | +0 | +0 |
| Holmenkollen (the hare's place among them) | 12 | 10,832 | 10,832 | +0 | +0 |
| Akerselva | 12 | 11,151 | 11,151 | +0 | +0 |
| Nordmarka | 8 | 4,597 | 4,597 | +0 | +0 |
| Stortinget | 24 | 4,289 | 4,289 | +0 (four places measured 0 before: now 1,705 to 2,705) | +0 |
| Ekeberg | 10 | 8,601 | 8,601 | +0 | +0 |
| Gamle Oslo, its walk and its lane | 80 | 9,552 | 9,552 | +0 (six places measured 0 before: now 3,810 to 5,287) | +0 |
| Bygdøy | 10 | 5,442 | 5,442 | +0 | +0 |
| Vigelandsparken | 10 | 6,825 | 6,825 | +0 | +0 |
| Korketrekkeren | 12 | 3,318 | 3,318 | +0 | +0 |
| Østensjøvannet | 10 | 10,054 | 10,054 | +0 | +0 |
| Bjørvika | 10 | 8,765 | 8,765 | +0 | +0 |
| Gamlebyen | 14 | 4,639 | 4,639 | +0 | +0 |
| The encore | 22 | 3,029 | 3,029 | +0 | +0 |
| The map | 5 | 5,110 | 5,110 | +0 | +0 |

None draws over 15,000 (the most, 11,151, Akerselva at night). The tables are `perf/perf-390-before.tsv` and `perf-390-after.tsv`.

### 3d. Bjørvika's crane lights: done

The far cranes' red light at each jib's tip (`#ff5a44`, registered as a lamp's light) stands 10.3 off the warning red. The warning test now
holds every light every level registers: none within 10 of the warning red, and any within 12 named with why (`NAMED_LIGHTS`: "real crane
lights are red, a pixel each, far off, on a thing that does not hurt"). The hue is kept. ADR 0044 amended.

### 3e. Holmenkollen's hedgehog is a mountain hare: done

In the hedgehog's place at column 222 (`levels/holmenkollen.ts`): `look: "hare"`, the same kind (spiky), box, patrol, speed and behaviour
(the def is otherwise as it was), and the same frames (15 x 10, an idle of two, a hop of four, legs on the last row as the hedgehog's were).
A mountain hare in its white winter coat, its ears laid back with black tips, its long hind feet; glammed, in Holmenkollen's lean (its neons
electric blue and hot pink), three neon spikes stand along its back (it hurts from above, as the spines did) and shades over its eye; its
natural self white with grey shading, in the calm outline, running off (`NATURAL.hare`). Per-pixel maps, the level's lean, the red outline:
the methods of orders 23 to 27. The hedgehog is as it was at Akerselva, Nordmarka and Ekeberg. `palette.test.ts`, `frames.test.ts`,
`natural.test.ts`, `warning.test.ts` pass with it.

At four times: `figures/enemy-hare.png` beside `figures/enemy-hedgehog.png` (`look/hare-hedgehog.png`), and at ten times
(`look/hare10.png`). In place: the walk's picture of its place at 390 x 844 by day and at night from both builds (`shots/3e-hare/5184/` and
`5185/`, `hare-place-day.png` and `-night.png` at three times), and at 1280 x 850 (four screen pixels an art pixel; `hare-1280-day.png`,
`-night.png`). By day it is a white-mint hare in its red outline on the snow under the spruce, its ears and spikes small but there; at night it
glows in the lean's electric blue. **Run files**: the sloppy player on seeds 201 to 260, ±2 and ±4, Holmenkollen's byte-identical
(`18922a6cdd8b`, below).

Recorded in `o34/thematic.md` and `handbook/conversations.md` as done on the planner's reading of "Also keep enemies thematic", easy to
undo; ADR 0055 amended.

## Docs

HANDOVER (the history, the harness, the first script, speed, a section for order 35); the handbook (start-here's table, the roadmap's
status, "In flight", "Next" and the tools' debts, lessons, resources: the figures tool, the shots' wait and blank pictures, perf in one
browser, the warning test's lights, png.ts, conversations: the hare); DESIGN (the hare under the thematic rule, the recorders, the figures'
module, the tests); ADR 0044 and 0055 amended (no decision was reversed); LEVELS.html's Holmenkollen enemies; this file.

**LEVELS.html's pictures**, all 22 taken again with `tools/pictures.ts` from the branch's build: one changed and was kept, `17-encore` (Loki
posing at step 450 now has his shouted line "Higher hair, Oslo! / Mind the wind!" beside him, clear of his stars: item 3a; before and after in
`shots/3a-shout/levels-17-encore-*.png`); the other 21 came out byte-identical. The hare's place is in none of them; LEVELS.html's list of
Holmenkollen's enemies names it.

## The measures

- **Tests**: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 488 pass (484 on `origin/main`; new: `alive/figures.test.ts`'s two, the warning test's lights, the props test's names), none failing.
- **tsc**: clean in all four packages, inside each (TypeScript 5.9.3) and from the root (`bunx tsc --noEmit -p <package>`, 7.0.2). `bun run build` at the root clean. (`tools/` is outside `tsc`, as before.)
- **First script**: 58.14 kB gzipped (vite, `bun run build`), 58,120 bytes by GNU `gzip -c` (`origin/main`: 58.08 kB, 58,051): the
  stepped page's music asked every step and a frame over emptied canvases (`main.ts`); `debug.ts`'s changes are in the debug chunk.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` (nothing in `packages/` or `apps/landing` changed;
  `tools/shots.ts` did: its blank check reads the picture after it is taken).
- **Run files**: the sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, from a worktree of `origin/main` (`d53e4fb`) and from the
  branch: every run's record byte-identical, the seven order 34 recorded with the same md5 as then, and Holmenkollen's:

  | Level | md5 of the runs, before and after |
  |---|---|
  | Langkaia | `dd2406a1c3c0` |
  | Nordmarka | `58bfcf501657` |
  | Bjørvika | `1fdbdf511c68` |
  | Gamlebyen | `54db73ff6304` |
  | Slottet | `0a1e506dd82b` |
  | Gamle Oslo (`nabolaget`) | `ec4e38c6dea5` |
  | Holmenkollen | `18922a6cdd8b` |
  | The encore | `112b3fb514ab` |
- **Every level's pictures** by day and at night at 390 x 844 (order 33's 174 places: every level's walk every 60 columns, the encore, the
  map in its states; and the hare's place), from `origin/main`'s build and the branch's: 174 of 176 byte-identical, the two others the hare's
  place by day and at night (`shots/same/`). None came out blank.
- **Perf**: every place, see 3c: +0 everywhere but the ten places that measured nothing before; none over 15,000.

## What only a person can judge

- The hare: does it read as a hare in the snow at a phone's size, glammed (mint white with blue spikes and pink shades) and plain; are the
  neon spikes enough to say "not from above" now that it is not a hedgehog.
- The figures' sheets: whether a page of them is what Lars wants to comment on (they are ready to be published as the page of every
  figure again).
- The encore's shouted lines in time with the tune: still unheard.

## Departures, doubts, found and not fixed

- **Item 1, by a different route**: the trims order 34 named were the warning walk's kept pieces counted once (not done: see item 1) and
  one walk for both warning tests (done, worth about a second); most of the time came from the recorders' cost a call, which every test
  that draws a level paid. The reach searches were scheduled anew; the suite's floor is now their CPU (about 100 s) and the reduced-motion
  test (about 70 s in company, 50 alone: in company it runs after files that fill the shared caches; not pinned down).
- **Found, not fixed**: no level draws its carriers with the kit's `drawCarrier` any more, so the reduced-motion test's watch of "every
  carrier the kit draws" watches nothing (a planted blink there passed); it would watch a level that came back to the kit.
- **Item 3b**: HANDOVER's cause (a hit in the first steps) was not what blanked the pictures; it was the fixed wait. The fix for a hold over
  emptied canvases is a safeguard: no picture was seen blank by it. `shots.ts --wait` now ends as soon as a `?debug` viking page says it has
  drawn; any other page still waits the whole time.
- **`?debug&perf` changed** at the ten places held after a hit: they measured 0 and now measure the frame, so against `origin/main` they
  show +1,705 to +5,287 rectangles; nothing else did.
- **Perf's time**: order 34 wrote about forty seconds a place; `origin/main`'s tool took 5.3 s a place here on a quiet Pi. The new tool takes
  2.1 s, so it is under half either way.
- **The figures' sheets**: the bosses and Loki are drawn without the page's outline (it is chosen by phase inside their own drawing); an
  enemy's "glamour breaking" row is as tall as its flight away (the third frame is the natural self far off, as it leaves); Rådhuset's
  carriers' sheet is tall (the tower lift draws its shaft); a level's carriers are named as a group, their rows by kind and number; a
  prop's rows name its pieces by their keys (size and material), which are the kit's words, not a player's; the states are in English
  only (the names are in both, as the order asked). The census takes the first enemy of each look in each level; two of one look drawn
  differently in one level would show one.
- **The hare**: glammed it is the enemy palette's cool white with the lean's electric-blue spikes and hot-pink shades, which on the snow
  reads pale (the red outline carries it); the order allowed the hare's own drawing, so its frames are the hedgehog's count and box but not
  its rows.
- **Doubts**: the suite's time on the deploy runner, which runs it with the Pi otherwise busy, is not measured; the three runs here are alone.
  The first script grew 0.06 kB (58.08 to 58.14 kB): the stepped page asks the music every step, and a frame over emptied canvases.
