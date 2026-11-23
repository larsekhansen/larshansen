# Order 38: a third look, each item and the measures

Measured on 23 November 2026 on branch `a-third-look` (from `origin/main` at `190fcad`, after order 37). Lars has not played, so nothing was
retuned: no route, box, speed, timing, heart, enemy placement or story word, in the fjord or in the maze. Pictures and working files, outside the
repository, in `~/.cache/claude-scratch-larshansen/o38/`: `shots/` (the hand-back's pictures, below), `figures-before/` and `figures/` (the figures
tool on `origin/main` and on the branch: 119 sheets and `figures.json` each), `sloppy-main/` and `sloppy/` (the fjord's run files), `same/` (the
fjord's pictures from both builds), `runs/` (the maze's runs and ghosts), `front/` (the front page gate), `work/` (everything else, the measures'
tables and logs among it), `bin/` (the scripts), `main/` (a worktree of `origin/main`, removed at the end).

## 1. Look first, and rank: done

`before.md`: all 119 sheets of the figures tool at four times, every enemy look in place at 390 x 844 in the first level it is met in, by day and
under its level's own sky, glammed and natural, the maze's raven and mound-dweller in place, Langkaia's props the order named at four screen
pixels an art pixel; a table of every figure (silhouette, light and dark, movement, belonging, colours, its commonest colour's share, a mark from 1
to 3, why), the planner's list against what was found (two struck as tool artefacts or props that hold, three added at 2), the 3s ranked, and the
flyers' beats and every level's nearest silhouettes measured. For the natural pictures in place, `?debug&natural` (commit `e4bb21e`): feel's
`LIFT_ALL`, set by `?debug`'s file only, draws every invader as the rune's ring of daylight leaves it. Not looked at in place: the bosses, the
carriers, what is thrown, the pickups and most props (their sheets only; nothing of theirs changed).

## 2. Redraw the worst, properly: done for the six 3s and two 2s

Each keeps its box, its frame count, its timing, its speed and its behaviour: the rules never see a drawing (the run files below are identical). By
the methods of orders 23 to 28: per-pixel maps in the enemy palette's ramps, lit from the top left, the red outline the page gives, the level's lean
and sheen when glammed (ADR 0050), its natural self in its own ramp when the glamour has broken.

| Figure | What it was | What it is | Frames, box | Where |
|---|---|---|---|---|
| The e-scooter (Rådhuset, Stortinget) | an L-shaped tube (18 x 15 squashed to the kept 12 rows: its wheels under its deck) | a hire scooter: a T-bar with grips, a stem with a headlamp, a low deck lit along its edge, two small wheels (tyre, rim, pale hub) whose spoke's light goes round as it rolls, its rear end over the back wheel with a reflector. Glammed acid green with a neon strip along the deck, a neon tube down the stem and streamers off the grips; its own colours (its natural self) a deep petrol (`#2f6b78`, lit `#3c7f8c`), graphite (`#2a2c30`, `#4a4e56`), a chrome lamp (`#e6ebe8`) and a dark red reflector (`#8a3a2a`): no company's name, logo or livery | still 2 (its lamp on, off), rolling 4 by distance, as before; 18 x 13 drawn for its kept box 14 x 12 (`fit`), its bar a pixel over the box's top | `render/looks.ts`, `alive/natural.ts` |
| The gull on the wing (Langkaia, Rådhuset, Slottet, Akerselva, Bygdøy) | a lens with a beak: wings three rows over its back, squashed to the kept box | a herring gull: a white body lit along its back, a round head, a dark eye, a heavy orange bill, a short square tail; long wings in the plum ramp (a grey mantle as its natural self) with black tips and a white mirror, beating up over its back, level, down under its belly, half raised and bent at the wrist; its body sinks as the wing lifts. Its crest (its glam) as before | gliding 2, beating 4 on its clock, as before (the four shapes are new and in a new order: up, level, down, half up); drawn from two rows over whatever box its level keeps (`Looks.above`) | `alive/foes.ts` |
| The crow (Akershus, Holmenkollen, Ekeberg, Vålerenga, Vigelandsparken, Korketrekkeren, Bjørvika) | the gull's frames in plum | a hooded crow: a heavy head, a thick straight bill, a fanned tail, broad wings with splayed fingers, the same four shapes; glammed plum with a mantle in the plum's light; natural grey with a black head, wings and tail (`#8a8c92` for the mantle) | as the gull | `alive/foes.ts`, `alive/natural.ts` |
| The pigeon in flight (Stortinget) | a lens with a beak, two frames 5 pixels apart | plump, lit along its back, its breast orange, the neck's green, an eye, a dark bill with its pale cere, a fanned tail with its band, broad rounded wings with dark bars and tips, the same four shapes | as before, but drawn from two rows over its kept box | `levels/stortinget.ts` |
| The salmon's water (Akerselva) | its tell a line of foam blinking on and off (half the second nothing); its splash two squares of foam | before it leaps the water over it swells and breaks in foam on its own beat, every step of the second (two shapes, six steps each); as it breaks out the surface tears open in foam either side and drops are thrown up and out, the highest two pixels each so they stand off the river's own glints. Drawn plain, as before; nothing with reduced motion, as before | the fish untouched | `levels/akerselva.ts` |
| The maze's raven | 7 x 6 dark pixels on dark slate | 10 x 13: a heavy head with a grey hooked bill and a pale eye, throat hackles, wings folded, a wedge of tail, feet on the wall's edge; black lit in a blue-violet sheen (`#33364f`, `#525884`) so it stands off the slate; its head turns toward him and blinks as before; kept as a piece a pose and copied | its head and blink as before; the bubble hangs where it did | `packages/maze/src/figures.ts`, `render.ts` |
| The mound-dweller | a grey block on the sheet, his eyes drawn apart by the maze | one drawing with his face: the hood's rounded opening, two pale points of eyes (`#e2dcc0`, they were amber) in the dark of it, following him (three frames), the cloak in folds, pale hands in his lap, its hem parted | 9 x 12 as before, outlined as before | `packages/maze/src/figures.ts`, `render.ts` |
| The wasp (Akerselva, Ekeberg), touched up | two frames of its beat 5 pixels apart (both a pale blob over its back) | its half-raised wings swept back in a diagonal, so its four frames are four shapes | as before | `render/looks.ts` |

- **Told apart by silhouette in its level**: `shots/silhouettes/<level>.png` (and `all-levels.png`): every figure of each level, its still frame and its
  first moving frame in black on white, before over after. Measured (`bin/sil.ts`, `work/sil-before.txt`, `sil-after.txt`): the nearest two
  figures of any level are 21 pixels apart at their best overlay (the statue and the ring-thrower at Vigelandsparken, its plinth no longer counted
  as the figure); where the redraws touch a level's nearest pair it is about as far apart as before, well over the 12 the test holds: Langkaia's
  and Slottet's pigeon and gull 37 to 33 (the gull's glide is the same length, its level wing now inside its body), Stortinget's nearest pair now
  the pigeon on foot and the pigeon in flight, 33 (it was the pigeon in flight and the umbrella, 31).
- **A thing that moves, moves**: the four flyers' least difference between any two frames of the beat, at the best overlay: gull 12 to 20, crow 11
  to 16, pigeon in flight 5 to 16, wasp 5 to 8 (Ekeberg; 9 at Akerselva); the owl (16) and the bat (12) as they were. No frame was added.
- **Each before and after at four times**: `shots/four-times/<sheet>.png` (the figures tool's sheet on `origin/main` beside the branch's).
  **In place at phone size**: `shots/in-place/` (each picture a crop of a 390 x 844 picture enlarged four to six times, `origin/main`'s build
  over the branch's): `gull-langkaia.png` (four steps of the beat by day, then the evening, then natural by day and in the evening),
  `gull-bygdoy.png` (the beat, a grown box), `crow-akershus.png` (the beat, the night, natural by day and at night), `crow-holmenkollen.png` (a grown
  box, glammed and natural), `pigeonfly-stortinget.png` (the beat, the night, natural), `scooter-radhuset.png` (rolling, the night, natural by day
  and at night), `scooter-stortinget.png`, `salmon-akerselva.png` (the swell's two beats, the splash at two moments, the night, natural),
  `maze-raven-1.png`, `maze-raven-3.png`, `maze-dweller-7.png`; the whole pictures in `shots/redrawn-before/`, `redrawn-after/`, `maze-before/`,
  `maze-after/`.
- **Cost**: no place more than 22 rectangles a frame over `origin/main`'s at 390 x 844 (the order allows 50), copies a frame unchanged
  everywhere: order 35's 279 places and the redrawn figures' own 16, measured in both builds the same hour with `tools/glance/perf.ts`
  (`work/perf-before.tsv`, `perf-after.tsv`, `bin/perfcmp.py`). 260 places draw exactly what they drew; Akerselva's draws 6 more by day and 12
  more at night everywhere (the salmon's swell, drawn plain, is a few rectangles more than the line it replaces, for each salmon whose water is
  swelling, on the screen or not; after dusk the page draws its enemies again over the dark, `afterDark`, and the swell with them) and 11 and 22 more where a salmon swells or splashes in
  view; Rådhuset's and Stortinget's by night 1 fewer. The birds and the scooter are outlined shapes, painted once a frame of theirs and copied, as
  before. In the maze (inside the viking page, every level at step 30 and the dweller's chamber, `work/mazeperf-*.tsv`): 18 to 20 fewer rectangles
  a frame everywhere and one copy more (the raven a kept piece where it was a rectangle a run; the dweller's eyes in his piece).

## 3. Consider them with the rest: done

What each does in the game, and whether the drawing says it. ADR 0041 is the drawing of what is off the screen; the order's "order of reading" was
taken as ADR 0040's and 0046's: the tell is seen before the move it warns of.

- **The e-scooter** is a walker that rolls along its stretch of pavement (Rådhuset at 0.7 a step, Stortinget at a walker's speed), hurts on touch
  and is beaten by a stomp. It looks like a machine that rolls into him: wheels on the ground, turning, and the red outline round all of it. He
  stomps it on its bar, the top of its box, which is now a T-bar he can see (it was a stub). It has no tell (a walker). The joke ("e-scooters left
  everywhere", order 27's story notes) is there: a hire scooter in its own colours once the glamour breaks, rolling off. *Disagreement left as it
  was*: the picture is 18 wide over a box 14 wide, so its wheels' outer two pixels each side do not hurt; the old drawing was as wide.
- **The gull, the crow and the pigeon in flight** patrol the air, hurt on touch and are stomped on the back. Their back is now where it is drawn in
  every frame (within two pixels of the box's top, as the palette test holds); the raised wing stands up to two pixels over the box's top, so a jump
  that grazes a raised wingtip does not land, as one that grazed the old crest did not. A raised wing over its back says "a bird in the air", a down
  wing under its belly says how high it is over him; their shadows on the ground are as before. Nothing they do has a tell. *For Lars*: a
  wing raised over the box looks like part of what he can land on; it is not, by two pixels at most.
- **The salmon** leaps out of the water on its beat and hurts on touch; its tell is the second of water before it (`RIPPLE`, 60 steps). The tell now
  reads first and all of that second: the water swelling and breaking where it will come out (before, half the second was nothing). Its leap and
  its timing are as before. *Found and not changed*: with reduced motion the jumpers show no tell at all (the salmon's water and the track rat's
  ballast are drawn only with motion, `!view.reduced`, since order 23); a still swell under reduced motion would be drawing only but changes what the
  reduced-motion test holds, and is for the planner to decide.
- **The maze's raven** speaks to him (its bubble) and is harmless: it is not outlined, sits on its wall, and now has a beak and an eye that can be
  found. It is black: nothing in the mound that hurts is black and unoutlined, so it is not mistaken for an adder (which has the red).
- **The mound-dweller** sits over the last finish and is harmless; his eyes follow him as before, now in his own frames.
- **The wasp** flies its patrol and hurts on touch; its beat now four shapes. Its amber and black are as Lars asked in order 26.

Nothing found where the drawing and the behaviour disagree that only a rule change would mend, but the reduced-motion tell above.

## 4. Keep the table honest: done

- **The test** (`alive/frames.test.ts`, "a third look"): every flyer's beat is shapes, any two of its frames 8 pixels or more apart at their best
  overlay (shifted up to two pixels); in every level no two figures' still silhouettes within 12 pixels of each other (shifted up to four). Shown
  to fail: on `origin/main`'s drawings (the pigeon in flight 5, the wasp 5 at Akerselva and at Ekeberg), and with Holmenkollen's hedgehog drawn as
  its grill (0 pixels apart at Holmenkollen and Akerselva). The e-scooter's own colours: `render/warning.test.ts`, shown to fail with its frame in a
  red 1.4 from the warning red and with it in his tunic's blue.
- **The figures tool** run again into `o38/figures/` (119 sheets, `figures.json`): the sheets the redraws touch differ, and three more do because
  the sheet now leaves what a look draws plain without an outline, as the page does (the census notes it: `noPage.plain`, a hook in `render/sprite.ts`
  for a tool with no page): the track rat's ballast, the salmon's water, the nesting gull's nest, the ring-throwers' plinths and a few pixels the
  granite and bronze statues draw plain. The raven is drawn whole (its head on its body),
  the dweller's three frames with his eyes; their states in both languages (`alive/figures.ts`).
- **One contact sheet** of every sheet's first row, before over after: `shots/contact-first-rows.png` (each at twice an art pixel, ordered him,
  enemies, bosses, the maze, harmless movers, pickups, what is thrown, carriers, props; a row taller than 65 art pixels cropped to its foot).

## Docs

HANDOVER (the round's row, the harness's `natural`, the first script, the order's section, the margins); the handbook (start-here's state and table,
the roadmap's status, "In flight" and "Next", lessons, resources); DESIGN ("Frames, shadows and depth" point 8, the maze's figures, "Checking"); ADR
0046 amended (a beat is shapes, every figure its own shape, drawn at its own height in kept and grown boxes); `before.md`, this file. LEVELS.html: its
pictures retaken with `tools/pictures.ts`; from `origin/main`'s build all 23 came out byte-identical to the committed ones, from the branch's four
changed, each only where a redrawn bird flies (`shots/levels-pictures/`): `04-slottet` (the gull over the parade, 2,832 pixels), `08-stortinget`
(the pigeon in flight, 2,928), `10-nabolaget` (the crow over the roofs at night, 7,088 with its glow), `11-bygdoy` (the gull over the boathouse,
2,720); their words say what the pictures show now.

## Measures

- **`bun test`**: the viking suite 499 pass, 0 fail (496 on `origin/main`: the three new tests), alone on a quiet Pi from outside, the
  branch 275.6 s, `origin/main`'s worktree 265.8 s, the branch again 265.6 s (`timing/times.txt`; the first run is the cold one): the new tests
  cost about 0.4 s (`alive/frames.test.ts` and `render/warning.test.ts` together 10.9 s against 10.5 s on `origin/main`), inside the 10 s the order
  allows. `packages/pixelkit` 155 pass, `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
- **tsc**: clean inside every package (5.9.3) and from the root (7.0.2, the native compiler already in Bun's cache on this machine, run directly
  so nothing was fetched) for the viking app, the maze, the kit, the front page and the maze's own page.
- **`bun run build`** at the root: clean (`work/build-root.log`).
- **The viking page's first script**: 58.53 kB gzipped by vite (58,512 bytes by GNU `gzip -c`), from 58.52 (58,502): 10 bytes, the hook a
  page-less tool is handed what a look draws plain (`noPage.plain`) and the chunks' names. `feel`'s file 42,514 to 42,747 bytes (the birds, the
  scooter's own colours, `LIFT_ALL`); the maze's scene file inside the page 19,500 to 19,667 (the raven and the dweller); Akerselva's, Stortinget's
  and the shared looks' files took their own figures. Under 60.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` on the final build (`front/front-after`).
- **The fjord's run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the
  encore, from the worktree of `origin/main` and from the branch: 17 of 17 byte-identical (`sloppy-main/md5.txt`, `sloppy/md5.txt`), and the same
  as order 37's. Akerselva's taken again after the salmon's splash was last changed: identical.
- **The maze's rules**: `packages/maze/tools/runs.ts` on `origin/main`'s worktree and on the branch: the scripted player's 18 runs (every level,
  both speeds, both ways where there are teleport stones) identical, step for step (`runs/runs-main.txt`, `runs-branch.txt`); the ghosts written by
  each byte-identical (`ghosts-main.json`, `ghosts-branch.json`), and `origin/main`'s replayed by the branch's code to the same points and the same
  finish on all seven, as by its own (`replay-main-on-main.txt`, `replay-main-on-branch.txt`).
- **The fjord's pictures**: order 33's 174 places and order 35's two (every level's walk every 60 columns by day and at night, the encore, the map in
  its states; `o35/same-places.tsv`) at 390 x 844 from `origin/main`'s build and the branch's: 140 of 176 byte-identical, none blank; the 36 that
  differ are 18 places by day and at night, each only where a redrawn figure stands (`shots/same-diffs/`, each region before beside after;
  `work/same-diffs.tsv`): a crow at Akershus (columns 60 and 240), Bjørvika (0), Ekeberg (240), Holmenkollen (120), Korketrekkeren (0), Vålerenga
  (60) and Vigelandsparken (0 and 180); a gull at Bygdøy (60 and 240), Langkaia (120 and 180), Rådhuset (180) and Slottet (60, 120 and 180); the
  salmon's water at Akerselva (0). The scooter and the pigeon in flight stand in none of them (their pictures in place are in `shots/in-place/`).
- **LEVELS.html's 23 pictures**: see "Docs" above (four changed, each a bird).
- **Rectangles a frame**: see item 2, "Cost".

## What only a person can judge

- Whether the four wing shapes read as a wing beat at speed (six steps a frame, ten frames a second), or as flicker; whether the body's sinking as the
  wing lifts reads as flight or as a hiccup.
- Whether the gull reads as a gull and the crow as a crow at a phone's size, in their levels' leans (the crow plum and pink, the gull white with plum
  wings); and whether a plum-winged gull is too like the plum pigeon on foot at Langkaia and Slottet.
- Whether the e-scooter reads as a hire scooter left on a pavement (and the joke lands), glammed and as its petrol self rolling off.
- Whether the salmon's swell reads as water about to break, before the fish comes; and whether its splash is seen at all among the river's glints.
- Whether the raven's beak and eye can be found on a phone in the mound's light, and whether the dweller's pale eyes read better or worse than his
  amber ones did.
- Whether the wasp's swept-back half-raised wings read as a wing or as a mark on its back.

## Departures, doubts, found and not fixed

- **Two figures, two looks**: the crow had the gull's frames; it is a map of its own now (the order said "the gull and the crow in the air").
- **The flyers' four frames are in a new order** (up, level, down, half up; they were up, half up, level, down): the same count and the same six
  steps a frame on the same clock; the cycle reads as a beat in this order.
- **`Looks.above`** is new: a look drawn from rows over its box's top whatever box it has. The pigeon in flight, drawn in Stortinget's own file,
  does the same by hand (`e.h + 2`).
- **The scooter's history**: its commit (`174fbe7`) uses `Looks.fit`, which the birds' commit after it adds; the branch builds at its end, not at that
  commit alone.
- **The dweller's eyes** were amber (`#b39a4a`) drawn apart by the page; they are a warm pale now, in his frames, as the order's "two pale points".
- **Struck from the planner's list, with reasons** (`before.md`): the track rat's first row (the sheet's artefact, mended in the tool), the tube
  railing, the posts, the stove pipe and the ski pole (they hold in place as what they are).
- **Not redrawn, at 2**: the bishop's guard, the coot, the squirrel; candidates for a later round.
- **Found, not fixed**: with reduced motion the jumpers show no tell before they leap (item 3). The salmon's sheet: the census draws a jumper "still"
  at a moment its water swells, so its still row is water only (the fish is under it); that is what the page shows then.
- **A stray request**: a draft script of mine in the scratch folder imported `@larshansen/pixelkit/palette` by name, and Bun, finding no
  `node_modules` there, asked the npm registry for the package (a 404; nothing but the package's name was sent). Every script after it imported
  by path and ran with `bun --no-install` (`handbook/lessons.md`).
