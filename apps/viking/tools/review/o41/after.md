# Order 41: the screens between, and the last weak tells: each item and the measures

Measured on 24 November 2026 on branch `screens-between` (from `origin/main` at `2ba749d`, after order 40). Lars has not played, so nothing was
retuned: no route, box, speed, timing, heart, enemy placement or word, in the fjord or in the maze. Pictures and working files, outside the
repository, in `~/.cache/claude-scratch-larshansen/o41/`: `shots/before/` and `shots/after/` (every screen state under every condition, from
origin/main's build and the branch's), `shots/tells-before/`, `tells-after/` and `tells-diff/` (the tells and the rune's stone in place, and each
pair cropped round what changed, before on the left), `shots/try1/` (the first look at the mends), `same/` (every level's places from both
builds), `figures/` (the figures tool on the branch), `sloppy/` (the run files), `runs/` (the maze's), `front/`, `timing/`, `work/` (states,
measures, logs), `bin/` (the scripts). Done in the order the order gives: item 2, item 3, item 1, item 4. What was looked at first: `before.md`.

## 2. Look first: done

`before.md`: the 39 states, 296 pictures, how each element was measured, the table of 34 elements with their marks, and the 3s ranked. No pause
screen exists and no language switch (said there).

## 3. Mend the worst: done (the seven 3s and three of the 2s)

| Rank | Element | Was | Is | Where | First script |
|---|---|---|---|---|---|
| 1 | A pad control pressed | white at 0.45: over snow, white marble or a cloud its word 0.0 off its fill (by colour, over every ground the levels paint), gone in the pictures | darker (0.62) with a white ring three pixels wide inside its edge; the half of the move pad held has its own ring. Its word 39.2 or more off its fill over every ground; told from one at rest by the ring wherever the two fills are alike (on the dark) | `styles.css` | 0 (the stylesheet) |
| 2 | A heart lost | the whole heart at 0.22: 8.9 (crust) off the bar's cream, by faintness alone | the waffle's edge alone, hollow, in the crust's shade (43.8 off the cream), as an empty heart; a full heart has that edge too | `main.ts` (`WAFFLE_HEART`, an edge letter), `styles.css` (`.hearts svg.gone`), `render/feel.ts` (the breaking heart's halves the same) | 7 bytes |
| 3 | A pad control dimmed | 0.4 of itself, by faintness alone: its word 7.0 off its fill over white | 0.55 of itself and its edge in dashes, as an empty rune slot's; its word 9.9 off its fill over white | `styles.css` | 0 |
| 4 | The boards under the line map's stations | ran into each other three tiles apart (Stortinget, Ekeberg, Gamle Oslo upright with or without times; Akershus and Rådhuset with times; at every size with times) | each hangs in the first of three rows where it meets nothing; a line's added-up time under every board it would meet; where nothing met, every board as before (a laptop with no times: all in their old place, held by the test) | `levels/kartArt.ts` (`stationBoards`, the map's lazy look), asked by `layoutBoards` in `main.ts`; the bare map lays them as before | about 52 bytes (the hook; the rule itself in the map's file, 7.25 to 7.58 kB with the padlock) |
| 5 | The "!" over what turns on him | its foot on the figure's head: at Rådhuset the gull's crest and red outline met it and the two read as one shape | four pixels higher: the sky between it and the head | `render/feel.ts` | 0 (`feel`'s file) |
| 6 | A station shut | a greyer face and a darker frame only (19.3 and 14.0 off an open one) | and a padlock on its face: shackle lit on the left, a dark body lit along its top, a keyhole (49.5 off the face) | `levels/kartArt.ts` (`stationMark`) | 0 (the map's file) |
| 7 | The arrow at the screen's edge | on its side with a notch on the left, a gull coming from behind got its arrow at x 3 to 10, under the 47-pixel notch | kept off the notch on its side (the kit's `safeSides`, in art pixels): at x 51 to 58 in the same picture; without a notch where it was | `render/feel.ts` | 0 |
| 2s | The skilling and gold counts in the bar | CSS discs beside the pixel hearts and helmet | the game's own skilling face (5 x 5) and bracteate (12 x 12) as pixel pictures | `styles.css` | 0 |
| 2s | A level's card | counted in words only | the skilling's face and the bracteate before their lines | `styles.css` | 0 |
| 2s | A pad control's word at rest over white | 19.5 off its fill by colour | the same fill (it is see-through on purpose, ADR 0043), every word with a dark halo two pixels round its letters | `styles.css` | 0 |

**Judged in place** (`shots/after/`, and the first look `shots/try1/sheet1.png`; before and after side by side in `shots/item3-*.png`): a
pressed jump or the held half of the move pad now shows on Langkaia's white marble, Holmenkollen's snow, Nordmarka's dark and Gamle Oslo's night,
upright and on its side; a lost heart reads as an empty heart beside full ones; the dimmed "Go in" is a dashed outline, faint by design, seen
on marble where it was gone; the map's boards are each readable, the lowered ones a row under the deck; the "!" stands over the gull's crest with
the sky between; the padlock reads as a lock at phone size (8 CSS pixels: small, a shape you can name); the arrow sits clear of the notch. None
reads worse than what it replaced, but a level's card's first look: in Norwegian at 390 wide the bracteate beside its line wrapped the
line's last word alone; the pictures now hang to the left of their lines and take no room (the final pictures, `shots/final/`).

**Judged right as it is** (one line each): the plate with the place's name (its words 44 to 90 off it); the help line (49.6); the rune slots,
the lives, the clock, the sound switch, the links (all 1 in the table); a bubble on white snow or a cloud (its words 84.6 off it, which is what
is read; the bubble is the kit's, shared with the front page); Game over, the loading board, the failed load (plain and plainly read); the
maze's header, its level list and its card (its rows not reached say so in words and with a greyed stone); the last heart (with the lost ones
hollow beside it, it is told by shape; its pulse, or its still red ring with reduced motion, as before).

**Left, with why**: the cards are plain (the site's chrome: the kit's `.card`, the same on the front page and in the maze; drawing them in the
game's grain is a change of the site's look, not a mend); on a phone on its side with a notch the story's opening card (shown once, at the first
visit) and the maze's level list reach 11 pixels into the home bar's strip (mending it moves a touch target, which this order does not allow:
for the planner); the plate under the opening card at the first visit (both come up together; the card is over it, the plate fades in two and a
half seconds).

No touch target moved or grew: `render/pad.test.ts` and `game/frame.test.ts` pass unchanged. With reduced motion nothing new moves (the ring, the
dashes, the hollow heart, the padlock, the rows, the icons stand still; the "!" is lifted, not moved).

## 1. The last weak tells: done

Each mended the way order 40 mended its like, drawing only; when each starts and ends is as the rules had it (the run files are identical).
Measured as `render/tells.test.ts` measures (`bin/tells41.ts`: pixels that change in a box round it between the step before it and seven steps
inside it):

| Tell | Was (motion; reduced) | Is (motion; reduced) | Held at | How |
|---|---|---|---|---|
| The welder's sparks about to fall (Bjørvika) | 19; 19 | 78 to 84; 82 | 60 | the torch flares, a cross of sparks round its tip in the glamour's lime and magenta, and the curtain begins: eight sparks three pixels long off the beam's edge, falling a third of the way and further as the second goes, held where they are with reduced motion (`levels/bjorvika.ts`) |
| A gust coming over the shafts (Bjørvika) | 60; 60 | 98 to 114; 98 to 114 | 80 | as Ekeberg's: sixteen streaks of dust from its first step where it was ten, more as the second goes, and a scrap of paper in every fourth, lit on its windward edge |
| The stone that sinks, about to go (Gamlebyen) | 206 on the tremble's steps and 0 between; 0 | 225 and 19; 19 | 16 | as a lily pad: the water stirring round its pillar's foot, a glint each side and a broken line on the surface, for the whole of its last half second, still (`levels/gamlebyen.ts`, `sinking`) |
| The heron about to fly (Østensjøvannet) | 23 to 28; 0 | 43 to 48; 20 | 16 | as a lily pad: the water stirring round its legs, a glint at each and a broken line on the surface (`levels/ostensjovannet.ts`) |

In place (`shots/tells-diff/`, and on one sheet `shots/item1-tells-x4.png`: each pair origin/main's left, the branch's right, inside the tell, with
motion and with reduced motion; the same addresses from both builds, so every pixel that differs is the change): the sparks' flare and curtain
88 to 93 pixels; the heron's water 20; the stone's 28; the gust's streaks and scraps spread over the floor. Before the tell (the "A" pictures) the
two builds differ only in the bar (the hearts' new edge and the skilling's icon).

**The rune's stone** (the planner's call, ADR 0044 amended, `conversations.md`): after dusk its own edge's top and left pixels, its lit side, are a
pale moonlit grey (`runeRim`, `#cdcdd2`), 24 pixels, bobbing with the stone; not a line all round. In place (`shots/tells-diff/rune-*.png`): at
Langkaia's night and twilight and Østensjøvannet's twilight those 24 pixels are the only change round the stone; by day the pictures are the same
(but the bar). Measured as order 40 measured (the stone's edge against the pixel beyond, CIEDE2000, the median), on its lit side, where the rim is: at Langkaia's
night 6.7 to **69.9**, its twilight 19.3 to **37.3**, Østensjøvannet's twilight 11.7 to **37.5** (in the evening it stood 31 before; the rim is drawn there
too, as under every sky but the day's). Held by
`alive/takes.test.ts` (its own top row and left column, 24 pixels, and no others, with motion and without; 30 or more off its own dark edge
under every sky after dusk; 39.8 off the warning red and 16.1 or more off every role's colour, the nearest the calm pale).

## 4. Keep the table honest: done

**The table again**, with the marks after this order (the element numbers are `before.md`'s):

| # | Element | Mark before | Mark now | Why, where it is still 2 |
|---|---|---|---|---|
| 1 | A station's mark, open | 1 | 1 | |
| 2 | A station's mark, shut | 3 | **1** | a padlock |
| 3 | A station's rune stone | 1 | 1 | |
| 4 | The boards under the stations | 3 | **1** | in rows, none meets another (held by `levels/kart.test.ts`) |
| 5 | A line's added-up time | 1 | 1 | under every board it would meet |
| 6 | Line 2 before it opens | 1 | 1 | |
| 7 | The doors | 1 | 1 | |
| 8 | The place's name on its plate | 1 | 1 | |
| 9 | The opening card | 2 | **2** | plain (the site's chrome); on its side with a notch its button reaches into the home bar's strip (a touch target this order may not move) |
| 10 | A level's card | 2 | **1** | the skilling and the bracteate drawn beside their counts |
| 11 | The endings' and the encore's cards | 2 | **2** | plain cards, as #9; their counts drawn as #10 |
| 12 | Game over | 1 | 1 | |
| 13 | The loading board, the failed load | 1 | 1 | |
| 14 | A heart, full | 1 | 1 | its edge in the crust's shade (43.8 off the cream) |
| 15 | A heart lost | 3 | **1** | hollow |
| 16 | The last heart | 2 | **1** | told by shape from the hollow ones beside it |
| 17 | The lives | 1 | 1 | |
| 18 | The skilling count | 2 | **1** | the game's skilling |
| 19 | The gold count | 2 | **1** | the game's bracteate |
| 20 | The clock | 1 | 1 | |
| 21 | The rune slots | 1 | 1 | |
| 22 | The sound switch, the restart | 1 | 1 | |
| 23 | The links | 1 | 1 | |
| 24 | A pad control at rest | 2 | **2** | its word 19.5 off its fill over white snow by colour, more with its halo; it is see-through on purpose (ADR 0043), and darker would hide more of the game |
| 25 | A pad control pressed | 3 | **1** | darker with a white ring; 39.2 |
| 26 | A pad control dimmed | 3 | **2** | its edge in dashes now (shape); faint by design, its word 9.9 off its fill over white |
| 27 | The help line | 1 | 1 | |
| 28 | A bubble | 2 | **2** | on white the bubble has no edge (its words read, 84.6); the kit's, shared with the front page |
| 29 | The "!" | 3 | **1** | clear of the head |
| 30 | The edge arrow | 3 | **1** | off the notch |
| 31 | The key over him at a door | 1 | 1 | |
| 32 | The maze's header | 1 | 1 | |
| 33 | The maze's level list | 2 | **2** | on its side with a notch its last rows reach into the home bar's strip (it scrolls); the maze's own card, a touch target |
| 34 | The maze's card after a level | 1 | 1 | |

**Held by tests** (each shown to fail on origin/main's drawing or stylesheet):
- `render/palette.test.ts`, "what is drawn over a level stands off every level's ground (order 41)", in the palette test's own walk (no new walk):
  over the 1,320 grounds (every colour any level paints as a field by day and under the evening, twilight and night tints, and every sky), the
  pad's colours read from `styles.css`: a word 18 or more off its button's fill at rest (19.5), 35 or more pressed (39.2) with its white ring in
  the rule, 9 or more dimmed (9.9) with its dashed edge in the rule, each button 15 or more off the ground by its fill or its edge (17.3); the
  plate's and the help line's words 45 or more off the plate; a bubble's words 80 or more off the bubble; the "!" and the edge arrow 20 or more
  off every ground by the warning red or its near-black edge (24.8). On origin/main's stylesheet it fails (no ring; a pressed word 0.0 off its
  fill). 1.0 s alone.
- `levels/kart.test.ts`: no two of the map's boards within two pixels of each other at 360 x 640 and 390 x 844 upright, 844 x 390 on its side and
  1280 x 800, with no times and with every station timed at 12:34.5 and both lines' added-up times (the words' widths a generous stand-in, 0.62 of
  the font a character); at a laptop's size with no times every board in its old place. Without the rows six of its nine fail.
- `render/tells.test.ts`: the four tells above held at 60, 80, 16 and 16 pixels at every step of them, with motion and with reduced motion
  (origin/main's 19, 60, 0 and 0).
- `alive/takes.test.ts`: the rune's stone's rim (above).

The overlap of elements at 360 wide in both languages that a test can hold is the map's boards (the words are the same in both languages: the
stations' names are Norwegian in both, the times numbers); the bar's and the cards' layout is the browser's, and was measured in the pictures at
390 x 844 and 844 x 390 in both languages (`work/m-after.tsv`, `summary-after.txt`): no overlap the branch's pictures show that origin/main's did
not, and the way in under the shield is gone (below, "Found and fixed"); the ones that remain are the harness's own (a card put up over a
level's first frame) and the two reaches into the home bar's strip left above.

**The figures tool** run again into `o41/figures/`: all 119 sheets and `figures.json` byte-identical with origin/main's (no figure was redrawn:
the tells are drawn round figures, not in them).

## Docs

HANDOVER (the round's row and section, the first script, the margins); the handbook (start-here's state and table; the roadmap's status, "In
flight", "Next" and the suite's time; lessons; resources; conversations: the planner's call for the rune's stone); DESIGN ("The rules": the
bar's marks, the map's padlock and boards; "Colour says what a thing is": the rune's stone after dusk; "What just happened": the lost heart, the
tells, the "!" and the arrow; "In the hand": pressed and dimmed; "Checking"); ADR 0044 amended (the rune's stone's rim); `tools/glance/hand.ts`
gained `--lang`; `before.md`, this file. LEVELS.html's pictures: retaken with `tools/pictures.ts` from the branch's final build: 20 of 23 changed, every level's (and the encore's) in the
bar only (the hearts' edge, the skilling's picture), but `16-gamlebyen-dawn` (the rune's rim, at the prow after the serpent) and the map's
`kart` (a padlock) and `kart-line2` (the boards in rows, padlocks); `kart-end`, `kart-encore` and `18-jernhaugen` are byte-identical. The page's
words did not need to change.

## Measures

- **`bun test`**: the viking suite 530 pass, 0 fail (origin/main 512: the eighteen new tests), alone on a quiet Pi, the branch and origin/main (a
  worktree) run in turn the same hour: the branch **263.1 s and 273.6 s**, origin/main **273.3 s and 275.1 s** (`timing/times.txt`, the JUnit
  reports `timing/*.xml`): paired as run -10.3 s and -1.4 s, on the means -5.9 s, no slower (the new tests are 0.3 s of it: the palette test's new part
  shares its walk, 20.5 s and 20.6 s for the whole file both ways). `packages/pixelkit` 155 pass, `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (7.0.2,
  the native compiler already in Bun's cache on this machine, run directly so nothing was fetched).
- **`bun run build`** at the root: clean (`work/build-root.log`).
- **The viking page's first script**: **58.65 kB** gzipped by vite (58,625 bytes by GNU `gzip -c`), from 58.56 (58,551): 74 bytes. Item by item:
  item 3's hearts' edge 7 bytes, the page asking the map's look for its stations' boards about 52 (the rule itself in the map's file; in the first
  script it cost 172 bytes, `lessons.md`), the rest the chunks' names it carries; item 1 nothing (the tells in their levels' files, the rune's rim
  in `feel`'s). Lazy files: the map's look 7.25 to 7.58 kB gzipped (the padlock, the boards' rows), `feel`'s 43.72 to 43.89 (the rune's rim, the "!"
  lifted, the arrow off a notch, the breaking heart's edge), Bjørvika's 7.11 to 7.24, Gamlebyen's 16.15 to 16.26, Østensjøvannet's 7.35 to 7.41, the
  pad's 3,238 to 3,247 bytes; the stylesheet (which the first script's budget does not count) 3,983 to 4,620 bytes gzipped (the pad's looks, the
  hearts, the icons as pixel pictures). Under 60.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` on the final build (`front/front-after`); the kit was not touched.
- **The fjord's run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the encore,
  on the branch's final code: **17 of 17 byte-identical** with origin/main's (order 40's `sloppy/md5.txt`, made on the code origin/main now has;
  no rule has changed since).
- **The maze's rules**: `packages/maze/tools/runs.ts` on the branch: the scripted player's 18 runs identical step for step with origin/main's
  (order 40's `runs-main.txt`, the maze untouched since), the ghosts it writes byte-identical, and origin/main's ghosts replayed to the same points
  and finish on all seven. The maze's own perf (every level at step 30): the same rectangles, colours and copies (`work/mazeperf-*.tsv`).
- **The fjord's pictures**: order 35's 176 places (every level's walk every 60 columns by day and at night, the encore, the map) at 390 x 844
  from origin/main's build and the branch's, none blank: **146 differ only in the bar** (the hearts' new edge and the skilling's picture; nothing
  below the bar). The 30 others, each named: the rune's stone's rim at night where it is in view (Akerselva, Bygdøy, Ekeberg, Østensjøvannet at
  column 240: 24 pixels each, nothing else below the bar); Bjørvika at column 180 by day and at night (its gust in its warning at step 1 at those
  places: 8 pixels of the new dust); the line map (the padlocks on shut stations, the boards in rows, a line's added-up time under them: 112 to
  5,923 pixels, `shots/kart-diffs.png`). By day, below the bar, nothing else changed.
- **Rectangles a frame**: order 39's 337 places measured with `tools/glance/perf.ts` in both builds the same hour (`work/perf-before.tsv`,
  `perf-after.tsv`, `work/perfcmp.txt`): 335 measured both ways; **the most added at any place is 20** (Bjørvika, every place: its gust's warning
  in view at the measured step), 2 at 107 places after dusk (the rune's rim, two rectangles, drawn after dusk wherever the rune is free), none
  fewer; copies the same at every place. The order allows 50.

## What only a person can judge

- On a phone, whether a pressed button with its white ring reads as pressed under a thumb, over snow and in the dark, and whether the darker fill
  hides too much of what is under it while held.
- Whether a dimmed button's dashed edge reads as "nothing to do here now", and whether it is too faint over snow to find.
- Whether a hollow heart reads as a heart lost at a glance in the bar, and whether the full hearts' darker edge is wanted.
- Whether the padlock on a shut station reads as a lock at phone size (it is 6 x 6 art pixels).
- Whether the boards in rows under the map's stations read as belonging to their stations (a lowered board is a row under its station).
- Whether the "!" four pixels higher still reads as the thrower's, at speed.
- Whether the welder's flare and the curtain begun read as "sparks are coming", whether Bjørvika's dust and scraps read as wind coming, and whether
  the water stirring round the sinking stone and the heron's legs is seen in its half second.
- Whether the rune's stone with a pale rim on its top and left reads as lit by the moon, or as a stone with a pale edge.
- Whether the skilling and the bracteate beside the counts (bar and card) read as the things he takes.

## Departures, doubts, found and not fixed, words

- **The pad's look changed beyond the ring**: pressed is now darker (0.62 of the dark fill) where it went white, and dimmed is 0.55 of itself where it
  was 0.4, with its edge in dashes; every word on the pad has a dark halo. Still greys and white, see-through, nothing moving (`render/pad.test.ts`
  reads the stylesheet and passes). ADR 0043 says "pressed shows in the event that pressed it", which stands.
- **A full heart has a darker edge too**: the hollow heart is the full heart's edge, so the full one gained it (the crust's shade, `FOOD.waffleShade`,
  already the palette's). The breaking heart's halves in `render/feel.ts` were given the same edge.
- **The "!" stands four pixels higher** over every enemy that turns on him (not the troll's or a boss's). Not a touch target; it moves no box.
- **The boards' order in the page's list** changed (the stations' boards come after the other doors' boards); they never overlap those, so where no
  board is lowered the pictures are as before.
- **The rune's stone's rim is drawn under every sky but the day's**, the evening's too, as order 40's line is; the order named night and twilight,
  where it was dark on dark.
- **The tells**: the stone's and the heron's water are the lily pad's size (19 and 20 pixels in the test, 28 and 20 in place); the order said "as
  the pad", and they are. The welder's sparks are lights (drawn after dusk): Bjørvika is always in its evening; under the sky key's day they show
  nothing, as the curtain itself never did.
- **Found and fixed, not drawing**: the pad's shared slot (the way in, or the shield) was set only when the shield's `aside` class was out of step,
  and the shield starts without it; so on a first frame away from a door with the shield, the way in stayed shown under the shield (its dimmed
  edge, dashed since this order, showed round the shield's: Vigelandsparken, both languages). In play a level starts at its T-banen door, which
  sets the slot right, so a player would rarely have seen it; origin/main's picture shows it too, the way in's faint edge round the shield
  (`shots/item3-slot.png`). `render/pad.ts` now sets both whenever either is out of step (one condition).
- **Found and not fixed**: on a phone on its side with a notch, the story's opening card (once, at the first visit) and the maze's level list
  reach 11 pixels into the home bar's strip; a card's top could start under the bar on a short screen, or its height keep off the safe bottom and
  scroll, but either moves a touch target, which this order does not allow. At the first visit the plate with "T-banen" comes up under the
  opening card (both at once); the card is over it and the plate goes in two and a half seconds. `?debug&card` puts a card up over a level's first
  frame, so the pictures show the plate and the pad with it, which play never does (the pad hides a frame later when a card is up): not counted.
- **The measure of a word in a picture is noisy** (`before.md`, "How"); the pad's, the plate's and the bubble's are worked out from their colours
  over every ground and held by the test; the pad's halo is not counted (it only helps).
- **Words**: none changed. None found wrong. One that fits only just: in Norwegian at 390 wide a level's card's bracteate line ("Brakteaten: ikke
  funnet. Den henger høyt.") fills the card; with the bracteate's picture beside it the last word wrapped alone, so the pictures hang to the left
  of their lines and take no room (`styles.css`).
