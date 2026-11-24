# Order 42: room, and the edges of the screen: each item and the measures

Measured on 24 November 2026 on branch `room-and-edges` (from `origin/main` at `5e46578`, after order 41). Lars has not played, so nothing was
retuned: no route, box, speed, timing, heart, enemy placement or word, in the fjord or in the maze. Pictures and working files, outside the
repository, in `~/.cache/claude-scratch-larshansen/o42/`: `same/` (every level's places by day and night at 390 x 844 from origin/main's build,
item 1's and the final), `shots/item1/` (what moved, at its first frame, from both builds), `shots/survey/` (every screen state at the four phone
sizes, both languages, with a pretended notch and without), `shots/mazepage/` (the maze's own page), `shots/item3/` (the bubbles and the "!" in
place), `work/` (builds' module lists, measures, logs), `bin/` (the scripts), `sloppy/`, `runs/`, `front/`. What was looked at first:
`before.md`.

## 1. Room in the first script: done

**58.65 to 55.70 kB gzipped** (58,647 to 55,695 bytes by zlib, vite's number; 58,625 to 55,732 by GNU `gzip -c`), with nothing a player sees or
when he sees it changed, by the rules of ADR 0035 (amended): what only `feel`'s file, a later level or `?debug` uses went with it, into files that
already existed. Step by step, each built and measured (`bin/b.sh`):

| Step | What moved, and where | First script (zlib) | Saved |
|---|---|---|---|
| 0 | origin/main | 58,647 | |
| 1 | The kit's swatches the first script never draws with: the river's to Akerselva's file, the ice's to Holmenkollen's (`OWN` in `vite.config.ts`), the feather's, the tram's and the creatures' to `feel`'s (they were in the first script only because the bundler's rule sends a module it is not told about there) | 58,212 | 435 |
| 2 | `runeCells`, the runes as pixels, split from `game/runes.ts` into `game/runecells.ts`, in `feel`'s file (the rune on its stone, its flight, the map's stones; the header draws its runes as strokes) | 57,995 | 217 |
| 3 | How the kit's cannon and drum look, split from their rules into the kit's `launcherart.ts` (in `feel`'s file), drawn by the levels that use them: Akershus's cannons (`art.cannon`), Slottet's drums (`art.drum`); Holmenkollen and Gamle Oslo already drew their own | 57,249 | 746 |
| 4 | The page's plain carrier and plain ledge on a beat, which no level drew with (every level with carriers or ledges, Langkaia too, has its own): taken out, and `levels/lazy.test.ts` holds that every level draws its own carriers, ledges, cannons and drums | 56,997 | 252 |
| 5 | The kit's harness to `?debug`'s file: the harness carries its own runner (`Harness.run`), so the kit's `launch` no longer imports it; the page reads it from its debug code as it starts | 56,711 | 286 |
| 6 | The card after a rune filled in by `feel`'s file (`render/finish.ts`: the time, the best, the bracteate, the skilling, a clean run, the last line, and their words, moved from `game/i18n.ts` unchanged); the page puts the card up with its title and its button; the three cards (a level's end, Game over, a failed load) share `cardUp` (it was said three times) | 55,695 | 1,016 |

What grew (bytes gzipped): `feel`'s file 43,888 to 46,091 (the card, the swatches, `runeCells`, the cannon and the drum), the page's `?debug`
file 6,580 to 6,880 (the harness), Akerselva's 9,744 to 9,825 (its river swatch), Holmenkollen's 6,184 to 6,211 (the ice's), Akershus's 5,655 to
5,673 and Slottet's 9,007 to 9,023 (drawing their cannons and drums); the map's look and the pad's a byte each (the chunks' names). What is
fetched before a first frame (the first script, the map's look, `feel`'s file; the stylesheet unchanged) is 110,115 to 109,367 bytes: 748 less.

**The modules that left the first script** (the table in `before.md`, again with where each went): the kit's `harness.ts` (to `?debug`'s file), the
kit's swatches `river.ts` (Akerselva's file), `ice.ts` (Holmenkollen's), `feather.ts`, `tram.ts`, `creature.ts` (`feel`'s); and from modules that
stay, `runeCells` (`runes.ts` 2,060 to 998 bytes), the cannon's and drum's drawing (the kit's `launcher.ts` 3,944 to 661), the plain carrier (`carrier.ts`
5,296 to 4,865) and ledge (`timed.ts` 1,577 to 867), the card and its words (`main.ts` 59,789 to 57,438, `game/i18n.ts` 5,671 to 4,035).
Left, with why (`before.md`): the maze's glue in `main.ts`, the bosses' bubbles' placing, a click's walk, the swatches part of which the first
script draws with.

**Nothing pops in late.** Every level's places by day and night at 390 x 844 (order 35's 176: every level's walk every 60 columns, the encore, the
map), origin/main's build and item 1's (commit `213bc2b`): **176 of 176 byte-identical**. One picture per moved thing at its first frame, from
both builds, in English and in Norwegian (`work/moved.tsv`: the card after a rune at Langkaia, at line 1's and line 2's ends, at the encore and
a first clear at Akershus; Game over; a failed load; Akershus's cannons and Holmenkollen's; Slottet's drums and Gamle Oslo's; a rune stone in a
level and the map's rune stones by day and night; Ekeberg's tram by day and night; the feather falling, plain and gold; Akerselva, Holmenkollen,
Nordmarka; the encore with a shout; a stepped route): **52 of 52 byte-identical** (`shots/item1/moved-*`). The harness itself: every stepped
picture above is taken through it. `levels/lazy.test.ts` passes, with its new test (shown to fail with Akershus's cannons undrawn).

**Requests before the first frame** (`bin/requests.sh`: a logging server, a fresh Firefox with a mouse, the page opened on the map and in
Langkaia): five before and five after, the same five: the page, its script, its stylesheet, the map's look (`kart`), `feel`'s file; on a touch
screen the pad's file too, as before.

**Without `feel`'s file** (ADR 0053, amended): the card after a rune is its title and its button, and goes by itself after six seconds; Game over
and a failed load are whole, as before.

## 2. The edges: done (one part partly)

Looked at with a pretended notch and home bar (`&safe=upright` upright: the notch 47, the home bar 34; `&safe=sides` on its side: 47 each side,
the home bar 21), in both languages, at 390 x 844, 844 x 390, 360 x 640 and 667 x 375, every screen state of order 41's table and two more (the
map at the line's start and at its far end, every station timed): 41 states. The scratch copy of `hand.ts` that writes every element's place
(`bin/screens.ts`, order 41's) now lays the stepped page out again before it measures, as a browser's resize observation does at the start
(`__game.layout()`): a stepped page on a touch screen frames its camera before the pad is up, so order 41's pictures of the map on its side showed
the camera without the pad's room (`handbook/lessons.md`). The branch's survey: `shots/survey/item2/` (every state, with a notch); origin/main's
and the final build's: `shots/survey/main/`, `shots/survey/final/` (the cards, the map and the maze, with a notch and without). Measured by
order 41's `measure.py`: each element's box, whether it is under the notch or the home bar, and what it meets.

**The opening card and the maze's level list off the home bar's strip** (ADR 0043 amended): a card's foot was the screen's less 10 px
(`body.touch .card`, and `#finish` and `.card.story` with a mouse); it is now `max(10px, the safe area's bottom)` from the foot, so it scrolls
above the strip. On its side with a notch (844 x 390): the opening card 86 to 380 became 86 to 369, the maze's list 86 to 380 became 86 to 369,
the safe edge, in both languages; the card's button is reached by scrolling the card, as its words do not fit. At 667 x 375 and 360 x 640, every
card's foot is at or above the safe edge (the opening card 107 to 354 and 261 to 606; the list 141 to 606 at 360 x 640). **With no notch nothing
moves**: without a notch, origin/main's pictures and the final's of a level's card, the endings', the encore's and Game over are
byte-identical at all four sizes in both languages (`shots/survey/main/*-plain`, `final/*-plain`); the loading board's and the failed load's pictures
differ between any two runs, both ways (racy under `?debug`, below). With a notch the cards that reached into the strip moved up to the safe edge:
on its side at 844 x 390 the opening card and the maze's list (380 to 369), at 667 x 375 also the end of line 2's and the encore's cards (their foot
365 to 354), at 360 x 640 the opening card (611 to 606) and the maze's list (630 to 606). **The maze's own page**: its list (from 18 % down, `max-height: calc(100% - 24px - safe)`) ran past the screen's foot on a
phone on its side, with a notch or without (its fifth row cut by the screen's edge, the sixth and seventh never reachable: `shots/mazepage/main/`);
its foot is kept on the screen the same way (`packages/maze/src/panel.ts`), so there the picture without a notch changes too, by design (`shots/mazepage/`, origin/main's against the branch's, both languages,
four sizes, with a notch and without: the header and the card after a level identical everywhere, upright everything identical; on its side only the
list's foot, at 844 x 390 and 667 x 375, with a notch and without).

**The plate waits for the opening card**: at the first visit, the map's plate ("T-banen") is held back while the card is up (its time starts when
the card goes). Upright the card covered it whole (with the plate alone held back, item 2's first build's pictures there were byte-identical with
origin/main's); on its side it showed over the card's top edge and now does not (`shots/survey/main|final2/844x390-notch/m-story_844x390.png`;
before and after on one sheet with the pad hidden, `shots/item2/opening-card-before-after.png`).

**The map's boards clear of the pad**: on a touch screen the map's camera keeps the band from him down to the lowest board clear of the pad's bottom
row (the move pad and the jump; the dash is not on the map) across the whole view, the same lift all along the deck (`below` in `game/frame.ts`).
`levels/kart.test.ts` walks him the whole line and back as the page frames the map, at the four sizes, without a notch and with one (upright at the
top; on its side on both sides, on the left, on the right), with no times and with every station's: no board under the move pad or the jump, and at
the line's start (where the camera stops) none under a notch (Hjem's board, at 667 x 375 with a notch on the left 2 to 3 px inside it, is moved in:
`stationBoards`). With origin/main's camera (the lift taken out) the test fails on its side: 29 boards, by progress and notch, under the pad's bottom
row at 844 x 390 and 667 x 375 (Rådhuset's and Ekeberg's under the jump most often, both lines' added-up times under the jump and the move pad);
upright none. What it costs: nothing upright; on its side 0 with no times, 7 to 13 px
with line 1's times, 24 px (no notch) to 45 px (a notch) with every station's and both lines' added-up times (844 x 390). The lift stops where the
stations' doors would go under the bar: at 667 x 375 the map's bar is two rows of links (97 px), and with line 2 open a third of runes (159 of 375
px), and there the stations come first: the lift is 8 px at most and the lowest boards (Rådhuset's, both lines' added-up times) may reach the jump or
the move pad (printed by the test, not held). Not held either: the raised slot over the jump on its side (the way in) stands over the deck itself by
ADR 0043's design, and the boards pass under it at the screen's edge as the stations do.

**Looked at once more** (`work/m-item2-*.tsv`; each flag looked at in its picture). Found and mended:
- **The opening card under the pad** on a short phone (360 x 640, 667 x 375, with a notch or without): its button lay under the move pad and the jump,
  its last lines under the way in. The style sheet hides the pad while the card is up (`body:has(.card.story) .pad`); it is not turned off
  (as under a level's card), so the camera keeps the pad's room and the map does not move when the card goes (turned off first, it did: the map
  eased back about 20 px as the card went).
- **The map's stations under the bar** at 667 x 375 once the boards' lift took them up: the lift stops at the doors (above).

Found and not mended (each would move a thumb's target on a phone without a notch):
- **The map's bar on a short phone on its side** (667 x 375): the site's links wrap to two rows and, with line 2 open, its runes take a third (97 or
  159 of 375 px); the stations stand just under it and their rune stones under it. Laying the bar out again for that width moves the links.
- **The maze's level list inside the page over the maze's help line** on a short phone (360 x 640, 844 x 390): the list is a dialog over the mound, the
  help line under it goes at his first move.

Nothing else sits under the notch, the home bar, the pad or another element in any state at the four sizes in either language: the bar's targets keep
inside the safe area, the help line and the bubbles keep off the notch, the edge arrow keeps off it (order 41), the loading board and Game over fit. What
`measure.py` flags and is not real: the plate's box under a card's header in the harness's `&card` pictures (the card is put up over a level's first
frame, order 41's lesson), a stale plate box in the maze, and a card's rows below its foot (inside its scroll).

## 3. Two small marks: done

**A bubble's edge**: the kit's bubble (`packages/pixelkit/src/text.ts`, shared with the front page) draws a line round itself only when a page asks
(`bubbleEdge.color`); `feel`'s file asks, at module load, for the game's dark, the ink (`#1f1a17`, the bubble's own words' colour), a line one CSS
pixel wide: so every speech bubble of the viking page (a sign's, a boss's, his own, the key at a door, and the maze's raven's when the maze is inside the
page) has it; the front page and the maze's own page never ask, and their bubbles are as they were (the front page 28 of 28, below). In place
(`shots/item3/sheet-bubbles.png`, item 2's build on the left, the final on the right): on Holmenkollen's snow and cloud, Langkaia's sky by the Opera,
Vigelandsparken's sky, a bubble now has its edge; over Gamle Oslo's and Nordmarka's dark the line is dark on dark and barely there, as it should be. Held:
the kit's `text.test.ts` (no line unless asked; asked, one in that colour a pixel wide), `render/feel.test.ts` (the page asks for the ink), and
`render/palette.test.ts` (a bubble seen against every ground the levels paint, under every sky, by its white or by its line: at the least 34.2 over 1,320 grounds, held at 30;
by its white alone it was 0.0, on snow). First script: about 50 bytes (the kit's bubble is in it).

**The "!" three pixels wide**: two variants tried against the old in place, from three builds at the same steps (`shots/item3/item2|bangA|bangB`): A, three
wide with the old proportions (a bar of four, a gap of two, a dot a pixel tall); B, three wide with a bar of four, a gap of one and a dot two pixels tall,
the dark edge all round (the old had no edge under its dot). Staged at Rådhuset (the gull, by day, swelling and standing) and at Korketrekkeren (the
snowball kid, its evening, over the hut's dark planks), and the same "!" cut out by its colours and laid on Holmenkollen's snow, Langkaia's pale stone
and Nordmarka's dark (`sheet-bang-in-place.png`, `sheet-bang-grounds.png`): the old reads as a thin bar with a dash under it, A's dot as an underline,
B as an exclamation mark on all three. B is built (`bang` in `render/feel.ts`); five wide as it swells. Its colours are the warning red and its near-black
(ADR 0044), held as before by the palette test. Staging the "!" over Holmenkollen's, Nordmarka's, Gamlebyen's and Vigelandsparken's throwers with
`?debug&on=windup` did not come (he was not where they aim, or the stepped camera had not seen them); the cut-out lays the same pixels on those grounds.

## Docs

HANDOVER (the round's row and section, the first script, the margins, the harness and the pretended notch in "Checking"); the handbook (start-here's
state, table and the budget's rule; the roadmap's status, "In flight", "Next" and the suite's time; lessons; resources); DESIGN ("The parts": the card
filled in, the runes as pixels, the kit's `launcherart.ts`; "Colour says what a thing is": the bubbles' edge; "What just happened": the "!"; "In the
hand": the banner waiting for the opening card, the boards and the pad, a card's foot; "Checking"); ADR 0035 amended (what moved and the new measure,
what may be lazy), ADR 0043 amended (the edges), ADR 0053 amended (the card without `feel`'s file; what only later levels draw); `before.md`, this
file. LEVELS.html's pictures: retaken with `tools/pictures.ts` from the final build: 7 of 23 changed, each by
a bubble's edge only (every changed pixel darker, at a bubble): `11-bygdoy` (a sign), `17-encore` (Loki's shout), `18-jernhaugen` (the raven's
words, dark on dark), and the map's `kart`, `kart-line2`, `kart-end`, `kart-encore` (a sign by him); the other 16 byte-identical. The page's words did
not need to change.

## Measures

- **`bun test`**: the viking suite 537 pass, 0 fail (origin/main 530: the seven new tests), alone on a quiet Pi, the branch and origin/main (a
  worktree) run in turn the same hour: the branch **275.6 s and 276.1 s**, origin/main **280.5 s and 269.6 s** (`timing/times.txt`, the JUnit
  reports): on the means +0.8 s (the reduced-motion file +4 s, the frame test +1.6, the map's test +0.7; noise between runs is ±5).
  `packages/pixelkit` 157 pass (two new), `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (7.0.2, the
  native compiler already in Bun's cache, run directly so nothing was fetched).
- **`bun run build`** at the root: clean, on the last commit (`work/build-root2.log`; the viking page's first script `index-ChaJdew3.js`, 55,801 bytes).
- **The viking page's first script**, step by step (zlib, vite's number; GNU `gzip -c` in brackets): origin/main 58,647 (58,625); item 1 55,695
  (55,732: the six steps above); item 2 55,750 (the plate waiting for the opening card, the page handing the map's look its door boards and the
  camera the boards' foot); with item 2's later mend (the pad hidden under the opening card, by the style sheet) and item 3 (the kit's bubble's edge) **55,801 (55,730)**,
  **55.80 kB**. Every file that grew (bytes gzipped,
  origin/main to final): `feel`'s 43,888 to 46,123 (item 1's card, swatches, runes as pixels, cannon and drum; the bubble's setting, the "!"),
  the pad's 3,231 to 3,325 (the boards' lift and its stop at the doors), the map's look 7,580 to 7,630 (a board moved in from a notch), the page's
  `?debug` file 6,580 to 6,880 (the harness), Akerselva's 9,744 to 9,825, Holmenkollen's 6,184 to 6,210, Akershus's 5,655 to 5,672, Slottet's 9,007
  to 9,023, the stylesheet 4,620 to 4,626 (a card's foot). Smaller: the maze's scene file 19,681 to 19,424 (its cards' style sheet without its comments).
- **The maze page's first script**: 32.12 to **31.86 kB** (32,145 to 31,876 bytes by GNU gzip): its cards' style sheet's comments out of the string it
  is sent, and the list's foot.
- **Requests before the first frame** (`bin/requests.sh`: a logging server, a fresh headless Firefox with a mouse, the page opened on the map and in
  Langkaia): origin/main five, item 1 five, the final five, the same five (the page, its script, its stylesheet, the map's look, `feel`'s file); on a
  touch screen the pad's file too, as before. In bytes, what those fetch: 110,115 to 109,367 after item 1 (748 fewer), 109,553 in the final.
- **The front page**: **28 of 28** byte-identical to `/tmp/shots-before-jernhaugen/` from the root build of the final code (`front/`).
- **The fjord's run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the encore,
  on the branch's final code: **17 of 17 byte-identical** with origin/main's (order 41's `sloppy/md5.txt`, made on the code origin/main has; no rule
  has changed since).
- **The maze's rules**: `packages/maze/tools/runs.ts` on the branch: the scripted player's 18 runs identical step for step with origin/main's (order
  41's `runs-branch.txt`, made on the code origin/main has; the maze's rules untouched), the ghosts it writes byte-identical, and origin/main's ghosts
  replayed to the same points and finish on all seven (`runs/`).
- **The fjord's pictures**: order 35's 176 places (every level's walk every 60 columns by day and at night, the encore, the map) at 390 x 844, none
  blank: after item 1, **176 of 176 byte-identical** with origin/main's; the final, **146 identical**, and the 30 others differ only by the line round
  a bubble (item 3; every changed pixel darker and beside a bubble's white): a sign's words at Langkaia, Rådhuset (two places), Stortinget, Gamle Oslo,
  Bygdøy, Korketrekkeren, Østensjøvannet and Gamlebyen, and the map's sign at the line's end (six progresses), each by day and at night. What moved, at its
  first frame: 24 of 26 identical in the final, the two others a bubble's edge (Holmenkollen's sign, the encore's shout). With a mouse the map's camera is
  as before (the boards' lift is the pad's).
- **The survey's pictures** (the cards, the map and the maze, both languages, the four sizes, with a notch and without, origin/main's build and the
  final, `shots/survey/main/`, `final/`): what differs is what this order changed, each named: the cards' foot with a notch (above); the map on a
  touch screen where the boards' lift is (with times on its boards, on its side, with a notch or without; at 667 x 375 with a notch also with no times,
  and Hjem's board moved in from the notch); the opening card (the plate held back; the pad hidden: `final2/`, the last build); a bubble's edge (the
  map's sign by line 2's gate, the raven in the maze); and the loading board and failed load, which differ between runs. Upright without a notch, the
  map is as before.
- **Rectangles a frame**: order 39's 337 places measured with `tools/glance/perf.ts` in both builds the same hour (`work/perf-main.tsv`,
  `perf-final.tsv`): 335 measured both ways, **none changed** in rectangles or copies (the "!" is the same three rectangles wider; a bubble's line is one
  stroke on the text canvas, which `?debug&perf` does not count: one a bubble; the map's lift is the pad's, and these are taken with a mouse). The order
  allows 50.

## What only a person can judge

- On a phone on its side with a home bar, whether the opening card's button, which the card now scrolls to rather than letting it reach into the home
  bar's strip, is found (the card says "To the line" at its foot; the card scrolls under a thumb).
- Whether the map on its side, lifted up to 45 px so the boards under the stations keep off the move pad and the jump, still reads well: the stations a
  little nearer the top, the plate over them for its two and a half seconds at arrival.
- Whether the opening card with the pad hidden under it reads as "tap to go on" (the pad comes back when it goes).
- On the maze's own page on a phone on its side, whether the level list's last rows, now in reach, are scrolled to.
- Whether a speech bubble with a thin line of the game's dark round it reads as a bubble on white snow and a cloud, is not heavy on the sky, and is
  wanted over the dark, where it barely shows.
- Whether the "!" three pixels wide with its square dot reads as "this one is about to throw" at speed on a phone, and is not too heavy over a small figure.

## Departures, doubts, found and not fixed

- **The maze's own page without a notch changed**: its level list ran past the screen's foot on a phone on its side with or without a notch (its last
  rows out of reach), so keeping its foot on the screen changes that page's picture without a notch too (the order asked that nothing move without a
  notch; on Vikingfjorden's page nothing does).
- **The map's camera moved on a phone without a notch too**: the boards came close to the pad on its side with or without a notch, so the lift applies
  to both (nothing upright; on its side 0 to 24 px without a notch, up to 45 with one). With a mouse nothing changed.
- **The pad hidden under the opening card** changes the first visit's picture on a phone without a notch too, at every size (the pad is gone from
  over the card; only on the short phones did it lie over the card's button).
- **Not held**: the raised slot over the jump on its side (the way in) over boards at the screen's edge, by ADR 0043's design; and on a short phone on its
  side with line 2 open the lowest boards reaching the pad where the map's bar leaves no room (the stations first).
- **Kit changes** (the front page is the proof, 28 of 28): the kit's `launcher.ts` split (its drawing in `launcherart.ts`, which the front page does not
  use); the harness carries its runner (`Harness.run`), so `launch` calls it; the kit's bubble has an optional edge (`bubbleEdge`), which only the viking
  page sets. Inside the viking page the maze's raven speaks in an edged bubble too (its own page, none).
- **The test's bars are measured**: `levels/kart.test.ts` takes the map's bar on a phone from the pictures (204 px upright, 39 on its side at 844, 97
  or 159 at 667, and the notch's top), not from the page's layout.
- **Found and not fixed**: the map's tall bar on short phones (667 x 375: 97 or 159 of 375 px; 360 x 640 upright: 204, 251 with a notch), whose links are
  thumb targets; the maze's level list inside the page over the maze's help line on a short phone; at arrival on the map the plate can lie over a sign's
  bubble for its two and a half seconds (seen at 360 x 640, by line 2's gate); under `?debug` the loading board's pictures (`&fetch=hang`) are racy: the
  page fetches the level its address names alongside its debug code, so the level may be in before the page asks for it, and then no board shows (seen
  in the survey both ways; a player never has `?debug`).
- **Left in the first script, with why** (`before.md`): the maze's glue in `main.ts` (about 1.2 kB), the bosses' bubbles' placing, a click's walk, the
  swatches part of which the first script draws with.
- **The "!" grew a pixel at its foot** (its dark edge under the dot), so it stands a pixel nearer the head than order 41 left it; nothing met in the
  pictures.
