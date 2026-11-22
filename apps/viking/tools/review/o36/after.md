# Order 36: the maze catches up, each item and the measures

Measured on 22 November 2026 on branch `the-maze-catches-up` (from `origin/main` at `6bed2e2`, after order 35). None of the maze's rules
changed: no level's map, speed, timer, record rule, ghost format or stored key. Pictures and working files, outside the repository, in
`~/.cache/claude-scratch-larshansen/o36/`: `shots/before/` and `shots/after/` (every level in both hosts at 390 x 844, 360 x 640, 844 x 390
and 1280 x 720; the start with `&touch` and without in both languages; reduced motion; the moments), `shots/four/` (fifteen places at
1280 x 850, four screen pixels an art pixel, before and after), `shots/item1/` and `shots/item3/` (each figure at four times: before,
after, and the viking game's thing of the same kind), `shots/finger/` (a finger through every level in both hosts, upright and on its
side), `shots/joins/` (the ways in and out of the mound), `shots/contact-390x844.png` (all seven levels before and after), `figures/` (the
figures tool's sheets and `figures.json`), `same/` (the viking pictures before and after), `runs/` (the maze's runs and ghosts, the
sloppy player's run files), `front/` (the front page gate).

## 1. Look first: done

`o36/before.md`: every figure and tile at four times beside the viking game's, what is flat, what clashes, what does not read on a phone,
what the help says there, ranked; rectangles a frame on every level in both hosts. The maze inside the viking page had no stepped harness:
`packages/maze/src/debug.ts` is now both pages' (the viking page fetches it only under `?debug`). The order's sequence was kept (item 2 before
item 3) though my list ranks him first; him was the first thing drawn in item 3.

## 2. Touch and help: done, but what only a phone can tell

- **The help line says what the device does.** On a touch screen (the kit's `isTouch`, or `?debug&touch`) it says what a finger does and
  names no key, in both pages, from one function (`helpFor` in `packages/maze/src/i18n.ts`): "Drag a finger anywhere to steer. Let go and he
  stands." / "Dra en finger hvor som helst for å styre. Slipp, så står han."; with keys it is as it was. It goes at his first move in the
  viking page too (it stayed up through the whole mound); it wraps at a narrow screen on the maze's own page (it ran off both edges at 390
  in Norwegian) and keeps clear of the home bar. The raven's lines name no key and were not changed (HANDOVER, weak spot 10); the raven's
  words now wrap into bubbles stacked one over another at a narrow screen (they ran off its edge at 390) and keep off a notch (the safe
  areas read from a hidden probe), with the kit's `wrapLines`, which the viking page's feather line at the mound uses too (it ran off the
  edge as well: found in item 4).
- **Shared, not copied**: the touch test is the kit's `isTouch`; the help line's choice is the maze's (`helpFor`), used by both pages; the
  maze marks the page while it is open on a touch screen (`mz-touch`, set and taken off by the scene) and its own styles (in `panel.ts`,
  which both pages get) make its cards' buttons and the level list's rows 56 tall, keep the stage from selecting or calling out and let a
  card scroll; the viking page no longer drops its own touch styles in the mound (its bar's 56 x 56 targets, its cards' buttons): only the
  pad goes, and the way out ("Vikingfjorden") gets a thumb's target and the site's name gives its row to the mound's own (two rows upright
  where it was three and ran off the edge at 360). The maze's own page: Vikingfjorden's solid bar (item 3's frame), its links and buttons 56 x 56.
- **Played start to end on touch**: `?debug&touch&bot=finger` makes the scripted player's moves at pointer speed with a finger (synthetic
  pointer events of type `touch` on the stage, through the scene's own `onDown`, `onMove` and `steer()`). Every level, in both pages, upright (390 x
  844) and on its side (844 x 390): 28 of 28 cleared with no curse, each in the scripted player's own time at pointer speed (1: 0:11.0,
  2: 0:17.8, 3: 0:14.7, 4: 0:06.1, 5: 0:18.1, 6: 0:08.2, 7: 0:20.8), the card up (`shots/finger/`). A person's finger is not a script: this
  shows the touch path steers him as a pointer does, not that it is pleasant.
- **Notch and home bar**: the help line keeps `env(safe-area-inset-bottom)` clear on both pages; the raven's words the left and right
  insets; the viking page's bar keeps its insets as on its levels; the maze's own page's bar is the kit's, which keeps the top and sides.
  Reasoned, not seen: no headless browser here has a notch.
- **A long press, a pull down, a pinch do nothing**: the stage takes no touch action (`touch-action: none`, set by the scene since order 9),
  the page no overscroll (the kit's `overscroll-behavior: none`), and on a touch screen no selection or callout on the stage (`mz-touch`).
  Reasoned from the styles, not touched: a pinch on the header itself is the browser's on the maze's own page, as on the viking page.
- **Reduced motion**: nothing blinks or shakes: the sliding walls' warning is steady (it blinked four times a second), an adder's tongue
  stays out (it flicked three times a second), the raven does not blink. `packages/maze/src/reduced.test.ts` draws every level as the page
  draws it, its world held where the scripted player is every four seconds, at 48 steps of the clock, and holds every recording the same;
  every sliding wall through its warning; an adder's tongue; his torch's flame (his breath and blink are idles: never back within 24
  steps); his ghost. Shown to fail on five planted faults (below).
- **Both languages**: the maze's `i18n.test.ts` holds every string in both with the same keys and kinds (the new one with them); the
  figures' names in both (`alive/figures.test.ts`). Seen at 360 wide in both languages: the start with and without touch, and the moments
  (`shots/after/start/*360x640*`, `shots/after/moments360/`).

## 3. The figures and the ground, in the game's grain: done

- **Him** (`shots/item3/him.png`, `him-sheet.png`): the viking game's own sheet, his frames and their machinery moved into the kit
  (`packages/pixelkit/src/frames.ts`, `him.ts`; the viking game's `alive/frames.ts`, `him.ts` re-export them and its build keeps them in
  `feel`'s file, so its first script did not change for it). The mound is seen from above with its walls' faces showing, so he stands on
  the floor as the walls stand: feet at the foot of his six-pixel body, head over it; facing the way he last went sideways; standing he
  breathes and blinks; walking, his run's four frames by the distance he covers (three pixels a frame, as in the fjord); a torch in his
  front hand, its flame flickering (still with reduced motion); cursed, rust red all over, as before. The ghost is the same man, pale.
- **Walls and ground** (`walls-floor.png`): `packages/maze/src/look.ts`. The floor's packed earth in five tones of its own brown (the three
  it was drawn in, a shadow and a highlight), mottled, with pebbles lit on their top left and shadowed below right, a worn flagstone in one
  tile in seven, and depth where it meets a wall: the wall above throws two rows of shadow, the wall to the left one column. The lining in
  the kit's stone, now in courses of blocks lit on their top left with a joint between, iron cramps over joints; every wall's front face
  shaded, lit on its lip, its foot in shadow, an iron band riveted across it (the iron the mound is named for). The hill round the tunnels
  near-black earth with a buried stone lit on its top and a thread of root. Not a tenth viking level: no paint, no sky, no glamour.
- **The rest**: the standing stones as maps (a rounded head, lit left side, shaded right and foot, weathered pits; the rune a dark groove,
  blue once lit, white as it lights); the raven as a map (a blue-black sheen on its lit side, its head turning on its own); the mound-dweller
  lit on his left edge; the rune key's bow in the take-gold with its glint and the rune's blue in it, its shaft iron; a teleport stone round
  and flat, lit on its top left, shaded to its foot; the door on with its corners in the use cyan (as every door in the fjord); the doorways'
  frames dressed stone, the way deeper three steps down into the dark; the start pad's slabs lit on their top left, its carved ring lit on
  its far lip; the sliding walls the lining's stone with its iron-banded face; the adders natural (Norway's adder: grey-brown, lit along its
  back, the dark zigzag, a broad head with its crown's mark, a forked tongue) and outlined as what hurts is (the near-black line, the warning
  red). The gate and the crumbling floor were already drawn with ramps and are as they were. **The feather kept**: the feather over the last
  finish is now the fjord's own drawing (`pixelkit/feather.ts`, moved there from `alive/things.ts`); `maze/feather.ts` stays where order 33
  put it, with the maze.
- **Nothing harmless in the warning red**: `packages/maze/src/warning.test.ts`: every level's still layer and what is drawn over it, him and
  his ghost, 10 or more (CIEDE2000) off the warning red and the curse's three reds, but by name the two things that hurt and say so (a
  sliding wall's line while it stands; the rune on a shut gate); an adder's body 20 or more off them and the warning red round it. Shown to
  fail on a red floor and a red key.
- **Cost** (rectangles a frame, `?debug&perf`, 390 x 844, each level where the scripted player is at its middle): 

  | Level | The maze's own page, before | after | Inside the viking page, before | after |
  |---|---|---|---|---|
  | 1 Inngangen | 496 | 483 | 671 | 658 |
  | 2 Ormegropa | 873 | 766 | 1,399 | 1,216 |
  | 3 Jernporten | 623 | 537 | 988 | 902 |
  | 4 Råttent gulv | 1,016 | 1,004 | 1,422 | 1,410 |
  | 5 Skyveveggene | 577 | 533 | 1,051 | 931 |
  | 6 Mørket | 886 | 860 | 1,143 | 1,117 |
  | 7 Haugbonden | 1,070 | 779 | 1,279 | 988 |

  Fewer everywhere: the still layer is one copy as before; the stones, the key, the mound-dweller, the teleport stones and the sliding
  walls' stone are pieces kept and copied (copies a frame 3 to 9 where they were 2, and 66 on level 5 inside the viking page, the
  kit's stonework squares); him is a rectangle a run of his frame where he was one a
  pixel; an adder about 50 rectangles where it was about 85. (The milliseconds the line prints were taken with other work on the Pi
  and are not compared.)
- **The maze's own page** (`apps/iron-maze/src/styles.css`): Vikingfjorden's solid cream bar (ADR 0015) where the front page's frosted one
  let the mound through as a grey haze; its help line as Vikingfjorden's; on a touch screen its links, the level button and the sound 56 x 56.
  Its cards are the maze's own, the same in both pages (the mark stones drawn from the standing stone's map).

## 4. The joins, tested: done (by a test and stepped pictures; none by a person)

- **Into the maze from the line map and back** (`shots/joins/`): `/viking/?debug&told&level=1&steps=30&out&after=40#jernhaugen`: out of the
  mound by its own way out (Esc), he stands at the mound's stop on the map, "↑ go in" over him.
- **From Nordmarka and back into Nordmarka**: `?debug&told&level=nordmarka&x=2372&steps=1&walkin=60&out&after=30#nordmarka`: he walks
  through the mound's door once the page has loaded, the maze opens (without `out` the picture is the maze), and out again he stands at
  the mound's door in Nordmarka as he left it, the banner up, the fjord's help line back. Found: walked in while the page loads, the
  address's change replaces the page's history entry (the HTML standard's rule), so the way out (Back) has nowhere to go and the page
  stays in the mound; no player is at a door then, and the harness walks in after load.
- **A record made in one host seen in the other where the design says**: `packages/maze/src/joins.test.ts`: inside Vikingfjorden the feather
  the maze gives is the one the fjord reads, under the same keys (`viking.feather`, `viking.featherGold`); a record and a ghost made in one
  page are seen again in that page and never in the other (each page's storage is its own address's); alone, the feather is kept but
  cannot cross, and the words say it waits in Vikingfjorden; a ghost reads back to its finish.
- **The feather moment after the maze**: `?debug&told&level=3&bot=keys&steps=1300&out&after=90#jernhaugen`: level 3 cleared in a fresh
  browser, the feather won, out to the map, and ninety steps on the feather is on his shoulder with his line beside him. The line ran off
  the screen at 390 wide: it wraps now (`wrapLines`).
- **Muted, silent in both pages**: `joins.test.ts`: the maze makes no sound of its own (no synth, no audio, no voice: every sound is
  `sfx.play` on the sfx its page gives it), the viking page's sfx forwards to the kit's synth, and `nomusic.test.ts` holds that a muted kit
  synth makes no sound.

## 5. Two debts from order 35: done

- **The reduced-motion test's watch of the kit's carriers** watched nothing (no level draws its carriers with `drawCarrier`): removed from
  `render/reduced.test.ts`, and said so in it. A level's own carriers are drawn by its part 1 where they are with the clock running: a blink
  planted in Langkaia's rafts (`art.carrier`) fails "every thing in every level" (carriers 0 to 7). Making part 5 draw the levels' own
  carriers wherever the clock puts them was tried and found 113 false changes (Slottet's banners rising out of the crowd, Ekeberg's tram out
  of its slot, Nordmarka's moose: their drawing depends on where they are, not on the clock), so the dead watch was removed rather than
  replaced.
- **The figures tool**: the bosses and Loki now have the outline the page gives them in each state (`render/sprite.ts`'s `noPage.outline`
  hands a tool each shape `outlined` draws where there is no page, and its rim: the warning red while it can hurt, the calm pale while it
  cannot; a beaten enemy's natural self leaving now shows its calm outline too, as the page draws it). The maze's figures are on it:
  `maze-him`, `maze-ghost`, `maze-adder`, `maze-raven`, `maze-stone`, `maze-key`, `maze-portal`, `maze-dweller`, named in both languages
  (`alive/figures.ts`, met in `jernhaugen`). `~/.cache/claude-scratch-larshansen/o36/figures/`: 119 sheets and `figures.json`.

## Planted faults, each shown to fail its test, then taken out

| Fault planted | Test | Result |
|---|---|---|
| the sliding walls' warning shimmering with reduced motion | maze `reduced.test.ts`: every sliding wall through its warning | fails |
| the raven blinking with reduced motion | maze `reduced.test.ts`: every level's world held | fails, all seven levels |
| an adder's tongue flicking with reduced motion | maze `reduced.test.ts`: an adder's tongue | fails |
| the wall torches flickering with reduced motion | maze `reduced.test.ts`: every level's world held | fails, all seven levels |
| his torch flickering with reduced motion | maze `reduced.test.ts`: his torch's flame | fails |
| the floor's shadow in the curse's red | maze `warning.test.ts`: the still layer | fails, all seven levels |
| the rune key's bow in the warning red | maze `warning.test.ts`: what is drawn over it | fails, on the two levels with a key |
| a blink in Langkaia's own rafts (`art.carrier`) | viking `render/reduced.test.ts`: every thing in every level | fails (carriers 0 to 7) |

## The measures

- **Tests**: pixelkit 153 pass, maze 245 pass (211 on `origin/main`; new: `reduced.test.ts` 13, `warning.test.ts` 16, `joins.test.ts` 5),
  landing 18 pass, viking 488 pass (as on `origin/main`: the figures test holds the maze's names in its two tests), none failing.
- **The viking suite's time**, alone on a quiet Pi, timed from the outside: the branch 255.9 s and 254.0 s, `origin/main` 257.1 s between them
  (`timing/`): no time added (the reduced-motion test's dead watch is gone; the maze's new tests run in its own suite, 3.8 s in all).
- **tsc**: clean inside every package (5.9.3) and from the root (`bunx tsc --noEmit -p <package>`, 7.0.2). `bun run build` at the root clean.
- **The viking page's first script**: 58.31 kB gzipped by vite (58,287 bytes by GNU `gzip -c`), from 58.14 (58,123): 0.17 kB for the
  maze's way in under `?debug` (its harness fetched then, its stepping in `?debug`'s own file), the maze told the page is a touch screen,
  its help line chosen for the device, and the feather's line at the mound wrapped (the kit's `wrapLines`). His frames and the feather,
  moved into the kit, are in `feel`'s file as before.
- **The maze's own lazy file inside the viking page** (`scene-*.js`): 18.4 kB gzipped (18,409 bytes), from 14.7 (14,726): the look, the
  figures, the kept pieces. Its words' file 1.78 kB (1.69); its rules' file unchanged; it fetches no file more than before.
- **The maze's own page's first script**: 34.4 kB gzipped (34,404 bytes), from 29.3 (29,319): his sheet and the frames' machinery, the
  look, the figures, the checking aids' frame measure. It has no budget.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`; its built script is `origin/main`'s, byte for byte
  (`index-DMQodwL9.js` from both).
- **The viking levels' run files**: the sloppy player (`fresh.ts`) on seeds 201 to 260 at ±2 and ±4 on every level of both lines and the
  encore, from a worktree of `origin/main` and from the branch: 17 of 17 byte-identical (md5 of each, first twelve: Langkaia `dd2406a1c3c0`,
  Akershus `49f3e97eed34`, Rådhuset `cff8003d1f27`, Slottet `0a1e506dd82b`, Holmenkollen `18922a6cdd8b`, Akerselva `40b9c2ab91b0`,
  Nordmarka `58bfcf501657`, Stortinget `d327a7905945`, Ekeberg `0de3bcfdf03a`, Gamle Oslo `ec4e38c6dea5`, Bygdøy `452e8abd9652`,
  Vigelandsparken `ac65016a97f9`, Korketrekkeren `90ecd44e4ead`, Østensjøvannet `7bb99e49f57b`, Bjørvika `1fdbdf511c68`, Gamlebyen
  `54db73ff6304`, the encore `112b3fb514ab`; the eight order 35 recorded have its md5s).
- **The viking levels' pictures**: order 33's 174 places and the two at Holmenkollen order 35 added (every level's walk every 60 columns by
  day and at night, the encore, the map in its states) at 390 x 844 from the frozen `origin/main`-drawing build and the branch's: 176 of 176
  byte-identical (`same/`); after the last change (CSS in the mound only) 16 of them again, byte-identical. LEVELS.html's 22 pictures taken
  again with `tools/pictures.ts` from the branch's build: all byte-identical; one added, `18-jernhaugen` (the maze's level 2 inside the
  viking page).
- **The maze's rules**: `packages/maze/tools/runs.ts` on `origin/main`'s worktree and the branch: the scripted player's run on every level
  at key and pointer speed, the long way round and through the teleport stones on levels 2 and 5 (18 runs), every step's state and events
  fingerprinted: identical, run for run (`runs/runs-main.txt`, `runs-branch.txt`). **Ghosts**: written by `origin/main`'s code for every
  level and replayed by the branch's: every one decodes to the same points and ends in its level's finish; written by the branch's code,
  byte-identical to `origin/main`'s.
- **Cost a frame**: see item 3: fewer rectangles on every level in both hosts.

## Every changed word, both languages

- The help line on a touch screen (`packages/maze/src/i18n.ts`, `helpTouch`): "Drag a finger anywhere to steer. Let go and he stands." /
  "Dra en finger hvor som helst for å styre. Slipp, så står han." With keys it is as it was.
- The figures' names (`apps/viking/src/alive/figures.ts`): the viking in the mound, with his torch / vikingen i haugen, med fakkelen; the
  ghost of your best run / gjenferdet av beste runde; an adder / en hoggorm; the raven / ravnen; a standing stone / en bautastein; the rune
  key / runenøkkelen; a teleport stone / en flyttestein; the mound-dweller / haugbonden.
- LEVELS.html's maze section, a paragraph and a caption (English, as the page is).
- Under `?debug` only, in English: "finger: level N cleared in S steps, C curses" and "out: Back did not answer (…)" on the help line.
- No raven's line, card word or level name changed.

## What only a person can judge

- Whether he reads as the fjord's man in the mound on a phone, facing sideways while he goes up and down a corridor; whether the torch
  in his hand reads as a torch.
- Whether a standing figure in a corridor a tile wide reads right: his head over the wall's face above him is a three-quarter view (the
  feet are where the rules look), but a person might think he touches the wall.
- Whether the walls' iron bands and the lining's courses read as iron and stone after the night's tint, or as stripes; whether the floor's
  mottling is busy.
- Whether the adders read as snakes at a phone's size, and the warning red round them as "hurts".
- Dragging a finger to steer: whether "Drag a finger anywhere" is enough to start; whether he follows the finger at the right speed.
- The way out by thumb in both pages; the cards' buttons; a long press, a pull down and a pinch doing nothing; a notch on its side.
- Whether the maze inside the viking page is too small on an upright phone (it shares the page's 240-pixel view, ADR 0019).

## Departures, doubts, found and not fixed

- **Him in a three-quarter view from the side**: the maze is seen from above with its walls' faces showing, so the sheet's side frames stand
  on its floor; he faces the way he last went sideways and runs that way while he goes up or down a corridor (no front or back frames: they
  would be a second drawing). His figure (10 x 14) is larger than his body (6 x 6, unchanged): in a corridor a tile wide his head is over the
  face of the wall above him, as a three-quarter view draws it; the rules look at his body. A person may read that as touching: on the list.
- **The adders are natural, not glammed** (ADR 0056): the mound is not Oslo and its snakes are its own; the warning red round them says they
  hurt. The order did not ask about the glamour; it asked the maze to stay its own place.
- **The gate and the crumbling floor** are as they were: already drawn with ramps, lit and shaded.
- **The maze inside the viking page stays small on an upright phone** (the page's 240-pixel view, ADR 0019): not the maze's to change.
- **Found and fixed on the way**: the viking page's feather line at the mound ran off the screen at 390 wide (wrapped now); with a mouse in a
  window 360 wide the mound's header ran its curse count off the edge (it wraps now); the help line inside the viking page never went (it
  goes at his first move now, with keys too: a change on a computer as well, as on the maze's own page).
- **Found, and left as the page is right**: walked through a door while the page loads, the address's change replaces the history entry, so
  the maze's way out (Back) has nowhere to go; no player is at a door then. The harness walks in after load.
- **The viking page keeps `body.touch` in the mound** where it dropped it: its bar's targets and cards' buttons are the page's own touch
  styles; the pad alone is hidden. The `playing` class is left to the pad as before (he may come in from a level with it set; the mound's
  header hides what it would).
- **`render/sprite.ts` gained a hook for tools** (`noPage.outline`), in the first script (a few bytes): where there is no page `outlined`
  hands a tool the shape and its rim; the page itself never sets it.
- **The reduced-motion watch of the maze** records what its drawing functions draw with the world held; the scene's own overlays (the shake,
  the curse's red frame round the view, the fade) are drawn by the scene and each is off with reduced motion in the code (read, not drawn by
  the test). His ghost's run is drawn by its step count, not its distance, so its feet may slide.
- **Notch and home bar, a long press, a pull down, a pinch**: reasoned from the styles; no headless browser here has a notch or a finger.
- **The finger** is synthetic pointer events of type `touch`: it proves the scene's touch path steers him exactly as the pointer bot does,
  not how a thumb feels.
- **Not committed, as before**: the pictures, the figures' sheets and `figures.json`, the run files (all in `~/.cache/claude-scratch-larshansen/o36/`).
