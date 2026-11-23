# Order 39: the rest of the table, each item and the measures

Measured on 23 November 2026 on branch `rest-of-the-table` (from `origin/main` at `a52f15b`, after order 38). Lars has not played, so
nothing was retuned: no route, box, speed, timing, heart, enemy placement or story word, in the fjord or in the maze. Pictures and working
files, outside the repository, in `~/.cache/claude-scratch-larshansen/o39/`: `shots/` (the hand-back's pictures: `item1/`, `item2/`, `item3/`,
`item4/`, `four-times/`; and every picture taken, `item1-before/`, `item1-after/`, `jumpers-before/`, `jumpers-after/`, `item3-before/`,
`item3-after/`), `figures-before/` and `figures/` (the figures tool on `origin/main` and on the branch), `same/` (every level's places from
both builds), `sloppy-main/` and `sloppy/` (the run files), `runs/` (the maze's), `front/`, `work/` (measures, logs), `bin/` (the scripts),
`main/` (a worktree of `origin/main`, removed at the end).

Done in the order the order gives: item 2, item 1, item 3, item 4.

## 2. A still warning for the jumpers with reduced motion: done

With reduced motion the salmon's water and the track rat's ballast were not drawn at all (`!view.reduced`, since order 23): the tell was
a movement, and the drawing held it still at nothing. Now (`levels/akerselva.ts`, `levels/stortinget.ts`):

- **The salmon**: the water over it held broken at its fullest (the larger of order 38's two swells: the hump of paler water ringed in
  foam with its crest thrown up), there from the first step of its tell (`RIPPLE`, 60 steps) to the last, never blinking; gone as it
  leaps. Its splash, as before, is drawn only with motion (it comes after the leap, not before it).
- **The track rat**: its three stones held kicked up, as at one step of their stir (the middle one a pixel higher), for the whole of the
  tell. Held, not enlarged: with motion the tell is the same three dark stones on the third rail's red cover, on and off. It is small
  either way (found, not changed: making it larger would change the picture with motion, which this item does not).
- **The Angry Boy** (Vigelandsparken), the third jumper, already had one: his stamping pose, held on its first frame.
- Without reduced motion nothing changed: the run files and the pictures (taken without reduced motion) are identical where no redrawn
  figure stands (below, "Measures").
- **Held** by `render/reduced.test.ts`, "every jumper's tell is seen with reduced motion": each of the eight jumpers' whole beats drawn
  step by step where it waits, recorded as in a browser; the step before its tell is one drawing, every step of the tell one other, which
  is drawn at no other step of the beat; and without reduced motion its tell is drawn more than one way (the test can see a blink).
  Shown to fail: on `origin/main`'s drawing (every salmon and rat: "nothing to see in its tell"), with the held swell made to alternate
  again and with the held stones made to blink ("drawn 2 ways"). Its cost: about 0.4 s.
- **And by** `render/feel.test.ts`: the throwers' wind-up, the statues', guards' and swans' turn and the sledgers' lean change their outline
  by 18 pixels or more with reduced motion as without (they did; shown to fail with a wind-up pose dropped under reduced motion: "radhuset's
  gull with reduced motion, 0").
- **Pictures** (`shots/item2/`): the salmon at Akerselva and the track rat at Stortinget at steps 139 (before the tell), 141, 170, 199 (in
  it) and 205 (the leap), by day and at night, with and without reduced motion, from `origin/main`'s build and the branch's.

### Every tell in the game, with motion and without

How each was checked: read in the drawing, and drawn with reduced motion (the jumpers by the test above; the throwers, turns and the
sledger by `feel.test.ts`; the bosses and Loki by `bin/bosstells.ts`, which plays each boss's route and draws it, its state held, at the step
before each phase and inside it, with reduced motion and without, counting the pixels it differs by: `work/bosstells.txt`).

| Tell | Before what | With motion | With reduced motion |
|---|---|---|---|
| The salmon's water (Akerselva) | its leap | the water swells and breaks on its own beat, two shapes | **nothing (until order 39)**; now the swell held at its fullest |
| The track rat's ballast (Stortinget) | its leap | three stones stirring between the rails, on and off | **nothing (until order 39)**; now the stones held kicked up |
| The Angry Boy's stamping (Vigelandsparken) | his leap, and the loose slab's drop | he stamps, two frames | his stamping pose, still |
| Every thrower's wind-up (gull, squirrel, kid, slinger, ring-throwers, nesting gulls, riveters, archers) | the throw | a pose, 18 pixels or more of outline (the slinger's whirl, the nesting gull's wings, four and two frames) | the same pose, its first frame (held by the test) |
| A statue walking, a guard waking, a swan turning (Vigelandsparken, Gamlebyen, Østensjøvannet) | its walk, its charge | its outline from the calm pale to the red, the "!" springing up; the swan's neck down, its head shaking | the outline and the "!" still and whole; the swan's neck down, still |
| A sledger about to set off (Korketrekkeren) | its slide | it leans in over its sledge's nose | the same lean |
| A thrower or flyer about to come into view | it, from off the screen | an arrow at the screen's edge | the same arrow (it does not move) |
| A ledge on a beat about to go (bells, banners, oars, the plinth's step, ice slabs, Bjørvika's boards) | its going | a warning ring blinking, the ledge shaking, the paint's dashes marching | the ring lit and steady, the paint's dashes joined, a still crack (the step, the slab, the ice) |
| The loose slab over the broken span (Vigelandsparken) | its drop | it shakes, grit falls, cracks open | the cracks, still; the boy in the air |
| A pad, a bundle, the sinking stone, the heron about to go | its going under him | a tremble, a pixel to and fro | the paint's dashes joined |
| A lift or a train about to leave | its going | its stripe flashing, a ding-dong | the stripe lit and steady |
| What hurts on a beat and is not an enemy (the crossing's barrier, the welder's sparks) | it | lights blinking, sparks dripping | the lights lit and steady; three sparks dripping held where they are |
| A gust (Ekeberg, Bjørvika) | its push | leaves or dust streaming through for a second | the leaves or dust, held in place |
| A wall closing behind him (Gamlebyen) | its rising | the ground trembles, cracks, dust | a still crack and the stones' tops |
| The troll's club (Nordmarka) | the slam and its wave | the club raised a second in the violet (779 pixels unlike its walk), a pale glint blinking | the same (779 pixels), the glint steady |
| The plough revving (Gamle Oslo) | the charge | beacons flashing, the blade lifting (522 to 1,912 pixels) | both beacons lit with their glow, the blade up (499 pixels) |
| The serpent's ring (Gamlebyen) | its rising | a ring of foam in the violet, swelling (355 to 373) | the ring at its full size, still (379) |
| The serpent rearing | the ball of brine | its throat swelling in the violet (2,654) | the throat's violet held (2,521) |
| The serpent's tail | the lash along the quay | its fin breaking the water, growing, spray (105) | the fin growing, spray held (89) |
| Loki's club, charge and bite (the encore) | the slam, the slide, the jaws | the club raised (294), the beacons flashing on his pads (573), a ring of neon foam running after him then holding (251) | the same club (294), the beacons lit (573), the ring (251) |
| The maze: a sliding wall, the curse's line, the crumbling floor | the wall, the curse, the fall | an outline shimmering, the line pulsing, the slab shaking with its cracks widening | the outline steady, the line bright and steady, the cracks widening in their three stages |

Nothing else showed nothing: the jumpers were the only tells that were a movement alone.

## 1. The three left at 2, and the dweller: done

Each keeps its box, its frame count, its timing, its speed and its behaviour (the rules never see a drawing; the run files below are
identical). By the methods of orders 23 to 28 and 38: per-pixel maps in the enemy palette's ramps, lit from the top left, the red outline
the page gives, the level's lean and sheen when glammed (ADR 0050), its natural self in its own ramp. Drafted outside the game at eight
times (`bin/preview.ts`, `draft/`) and looked at in place before being kept.

| Figure | What it was | What it is | Frames, box | Where |
|---|---|---|---|---|
| The bishop's guard (Gamlebyen) | 13 x 9: a round mail hood over a tabard and a halberd, a blob with a spike at phone size | 15 x 10: a kettle hat, its dome lit and its brim wider than his head (steel: the white glammed, a pale grey natural); his face in its shadow with an eye; the tabard with the bishop's pale cross; mail on his legs; his halberd levelled in both fists, its axe-blade across the shaft and its spike before it. As stone, grey with moss, the halberd upright beside him with its blade at the top | stone 1, still 2, walking 4 by distance, as before; drawn for the box Gamlebyen keeps (10 x 8, `fit`), the hat's top two pixels over it (as the palette test allows) | `levels/gamlebyen.ts` |
| The coot (Østensjøvannet) | a dark round bird, its white a few pixels lost to the glamour's sheen | plump and black (the plum's darkest, its back lit), its head up on a short neck, the white shield up its brow and its short white bill in the pale (`E.pale`, which neither the sheen nor a lean touches, so it stays a light mark on its head glammed and natural), long grey-green legs on big lobed toes; its neon cap as before | still 2, walking 4 (its body no longer drops a row as it walks, its head nods), as before; 13 x 10 for its boxes (`fit`) | `levels/ostensjovannet.ts`, `alive/natural.ts` (its pale and its toes' light, natural) |
| The squirrel (Nordmarka, Ekeberg) | 13 x 17, its curled tail most of it | 15 x 17: a red squirrel sitting up, its tail a plume rising from its rump behind its back with sky between them, flicked back at its tip; its ears tufted; a pale belly; in its forepaws a cone as big as the cone it throws (the thrown cone's own first frame, without its stem), raised in both paws over its head to throw, where the cone leaves from | idle 2, move 1, wind-up 1, as before | `render/looks.ts` |
| The mound-dweller (the maze) | 9 x 12: three greys, the folds and hands too faint to see | 9 x 12: a peaked hood, the cloak lit on its left and falling in folds (a dark groove beside each lit ridge, splaying at the hem), one pale hand on his knee; order 38's eyes kept | three frames (his eyes left, ahead, right), as before | `packages/maze/src/figures.ts` |

- **Told apart by silhouette in its level** (`bin/sil39.ts`, `work/sil-before.txt`, `sil-after.txt`; pixels apart at the best overlay, as
  `alive/frames.test.ts` measures): the bishop's guard's nearest figure at Gamlebyen 41 to 55 (the owl), and against Akershus's guard 72 to 74;
  the coot's nearest at Østensjøvannet 26 to 37 (the mallard); the squirrel's 97 to 105 (the hedgehog) at Nordmarka and Ekeberg. Each further
  from its nearest than before; the test's 12 holds.
- **In place at 390 x 844** (`shots/item1/`, each `origin/main`'s build over the branch's, enlarged four times): `guard-in-place.png` (woken by
  day, at night, natural, and as he wakes), `coot-in-place.png` (by day, at twilight, natural, the far shore's coot), `squirrel-in-place.png`
  (Nordmarka by day, at twilight and natural, Ekeberg in its evening and natural), `dweller-in-place.png` and `dweller-face.png` (in his seat at
  the last finish). **At four times**: `shots/four-times/` (the figures tool's sheet before beside after).
- **Does each read better in place**: the squirrel plainly (a squirrel with a cone, not a curl); the guard, a man in a hat with a polearm where
  there was a blob with a spike, though at 10 pixels high his face is a row; the coot a little (its white face now a mark that survives the
  glamour; the bird is still small and dark, as a coot is); the dweller a little (a cloaked figure with folds where there was a block; his hand
  is a pale dot). None read worse, so none was put back.

## 3. The sheets order 38 did not see in place: done

`before.md` has how, the table and the ten worst. Every boss state, every carrier, what is thrown and every pickup photographed in place
where it is met, by day and under its level's own sky (206 subjects, 412 pictures, `shots/item3-before/`); the props found in every level's
pictures; each measured as the contrast between its rim and the pixel just outside it (`rim.tsv`, `props.tsv`).

**Mended: what is thrown, after dusk.** Its own neon glow lay right against its red outline: in Bjørvika's evening the riveters' bolts stood
16.5 off it (CIEDE2000), the archers' arrows at night 21.2, the gulls' chips 22.9, the nesting gulls 23.7 (by day all 44 to 53). By the game's
own means, the one order 32 used over a level's own dark: a pixel of the dark between the outline and the glow, the glow a pixel further out
(`glows` in `alive/glamour.ts`, for what the page marks as thrown: `THROWN` in `render/sprite.ts`, passed by the page for every throw and by
Gamlebyen for the serpent's ball). Under each level's own sky every thrown thing now stands 40 or more off what is round it: the bolts 40.7,
the arrows 46.4, the chips 46.2, the nesting gull 43.8, the sling stones 46.1 (33.0 before), the serpent's ball 45.9 (56.9); the stone rings
46.4 where they were 57.0 (their acid-green glow stood further off the red than the dark pixel does: still over 40) (`work/outline-after-thrown.tsv`;
`shots/item3/thrown-before-after.png`: each, by day and under its sky, before and after). By day nothing changed. Nothing harmless went toward the
warning red: the dark pixel is the night's own colour (`DARK_GAP`). Held by `alive/thrown.test.ts` (shown to fail with the branch taken away).
Its cost: one more copy a thrown thing after dusk.

**Left, with reasons** (`before.md`): the carriers, benches and the flag that measure low are told by their role's mark (the paint on what
carries him, the cyan corners of what he uses), which the edge measure does not count; the props that measure low are scenery kept quiet by
design. **For the planner**: what he takes against an evening sky (the bracteate and the cheese at Ekeberg and Langkaia, 14.5 and 15.0; the
skilling) is warm on warm; the maze's own rule for a thing to take (a one-pixel dark line round it) after dusk would mend it, and would change
every coin in every evening picture: a decision about the look, not built.

## 4. Keep the table honest: done

- **The figures tool** run again into `o39/figures/` (119 sheets and `figures.json`): four sheets differ from `origin/main`'s, the four redrawn
  (`enemy-guard (the bishop's)`, `enemy-coot`, `enemy-squirrel`, `maze-dweller`); `figures.json` is byte-identical (no name or state changed).
  What is thrown is drawn on its sheet without its glow, so its sheet is as it was.
- **One contact sheet** of every changed figure's first row, before (left) and after (right): `shots/item4/contact-first-rows.png`.
- **Order 38's marks, kept honest**: `before.md`, "Item 4": no 3s (the five order 38 redrew are 1s, looked at again on the branch's sheets);
  the 2s that remain (the track rat's tell, the ski pole, the balusters, the fire basket, the pontoons, the post, the tube railing, the stove
  pipe), each named with why it was left.

## Docs

HANDOVER (the round's row, its section, order 38's note, the first script, the margins); the handbook (start-here's state and table, the
roadmap's status, "In flight" and "Next", lessons, resources, conversations: the planner's call for item 2); DESIGN ("What just happened"
point 8: every tell has a still form; "The glamour": what is thrown keeps its outline clear after dusk; the maze's figures; "Checking"); ADR
0040 amended (item 2; the order named ADR 0041 "the order of reading", which is the drawing of what is off the screen: the tells and reduced
motion's still answers are ADR 0040's, so the amendment is there, as order 38 read the same name); `before.md`, this file, `rim.tsv`,
`props.tsv`. LEVELS.html's pictures: retaken with `tools/pictures.ts`; from `origin/main`'s build all 23 came out byte-identical to the
committed ones (its worktree had no change after), from the branch's one changed, `16-gamlebyen` (a bishop's guard on the wall walk, woken: his
hat, his halberd; `shots/levels-pictures/`): its words say so now.

## Measures

- **`bun test`**: the viking suite 501 pass, 0 fail (499 on `origin/main`: the two new tests), alone on a quiet Pi, the branch
  271.5 s against `origin/main`'s worktree 270.0 s the same hour (`timing/times.txt`): about 1.5 s more, inside the 10 s the order allows. Two
  earlier branch runs had 3 failures, all in `render/night.test.ts`, found and mended (below, "Found and fixed"). `packages/pixelkit` 155 pass,
  `packages/maze` 254 pass, `apps/landing` 18 pass, none fail.
- **tsc**: clean inside every package (5.9.3: the viking app, the maze, the kit, the front page, the maze's own page) and from the root (7.0.2,
  the native compiler already in Bun's cache on this machine, run directly so nothing was fetched).
- **`bun run build`** at the root: clean (`work/build-root.log`, `build-root2.log` after the last change).
- **The viking page's first script**: 58.55 kB gzipped by vite (58,530 bytes by GNU `gzip -c`), from 58.53 (58,512): 18 bytes, the page
  marking what it throws (`THROWN`) and the chunks' names it carries. `feel`'s file 42.73 to 42.77 kB (the glow for what is thrown); the
  shared looks' file 3.14 to 3.16 (the squirrel), Gamlebyen's 16.08 to 16.12 (the guard), Stortinget's 10.17 to 10.18; the maze's scene file
  inside the page 19.66 to 19.68 (the dweller). Under 60.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` on the final build (`front/front-after`); the kit was not
  touched.
- **The fjord's run files**: the sloppy player (`tools/review/fresh.ts`) on seeds 201 to 260 at ±2 and ±4, every level of both lines and the
  encore, from the worktree of `origin/main` and from the branch: 17 of 17 byte-identical (`sloppy-main/md5.txt`, `sloppy/md5.txt`), and the
  same as order 38's.
- **The maze's rules**: `packages/maze/tools/runs.ts` on `origin/main`'s worktree and on the branch: the scripted player's 18 runs (every level,
  both speeds, both ways where there are teleport stones) identical, step for step (`runs/runs-main.txt`, `runs-branch.txt`); the ghosts each
  writes byte-identical, and `origin/main`'s replayed by the branch's code to the same points and the same finish on all seven, as by its own.
- **The fjord's pictures**: order 35's 176 places (every level's walk every 60 columns by day and at night, the encore, the map in its states)
  at 390 x 844 from `origin/main`'s build and the branch's: 168 of 176 byte-identical, none blank; the 8 that differ are 4 places by day and at
  night, each only where a redrawn figure stands (`shots/same-diffs/`, each region before beside after): the bishop's guard as stone at
  Gamlebyen (column 60), the squirrel in Nordmarka's dark (columns 120 and 180), the coot at Østensjøvannet (column 120). None of those places
  has a thrown thing in flight after dusk, and none is taken with reduced motion. **With reduced motion off, nothing of item 2 shows**: the
  jumpers' 40 pictures (`jumpers-before/`, `jumpers-after/`) differ from `origin/main`'s only where reduced motion is on and the tell is up (the
  12 of them at steps 141, 170 and 199 with `&reduced`); every picture without `&reduced`, and with it before the tell, is byte-identical.
- **Rectangles a frame**: order 38's 295 places (order 35's walk and the redrawn figures') and order 39's own 42 (item 1's figures in place, the
  jumpers with reduced motion through their tell), measured in both builds the same hour with `tools/glance/perf.ts` (`work/perf-before.tsv`,
  `perf-after.tsv`, `bin/perfcmp.py`): no place more than 28 rectangles a frame over `origin/main`'s (the order allows 50), copies a frame
  unchanged everywhere. 290 places draw exactly what they drew; with reduced motion the salmon's held swell is 7 to 14 rectangles more a
  salmon whose tell is up (28 after dusk, when the page draws its enemies again over the dark) and the track rat's held stones 3 to 12; Nordmarka
  draws 2 fewer, Ekeberg and the redrawn figures' places 1 fewer. In the maze (every level at step 30 and the dweller's chamber,
  `work/mazeperf-*.tsv`): the same rectangles and copies everywhere (the dweller is a kept piece). What is thrown after dusk is one copy more
  (its dark pixel) and the same glow copy.

## What only a person can judge

- With reduced motion on: whether the salmon's held swell and the track rat's held stones are seen in time before they leap (the stones are
  small with motion or without).
- Whether the bishop's guard reads as a man in a kettle hat with a halberd at phone size (he is ten pixels high), and his stone self as a statue.
- Whether the coot's white face reads as a coot's, glammed (purple, its neon cap) and natural.
- Whether the squirrel's raised cone reads as the thing that then flies at him.
- Whether the mound-dweller's folds read as cloth and his hand as a hand.
- After dusk, whether what is thrown reads better with the dark pixel round its outline, or looks heavier than an enemy's (an enemy keeps its
  glow against its outline).
- What he takes against an evening sky (the bracteate, the cheese, the coins at Langkaia, Ekeberg and Bjørvika): whether it is hard to see on
  a phone, and so whether the maze's dark line round a thing to take is wanted.

## Found and fixed

- **The bishop's guard lost his eye on two steps**: on the walking frames his body dropped a row, his levelled halberd crossed his face and hid
  his eye (and its shine after dark). The halberd goes down with him now (found by asking the census for every frame's eye pixel; every frame
  of the four figures has its eye).
- **Two new tests leaked into another**: the jumpers' tell test and the thrown test outlined shapes under a stand-in document and left them
  noted; in the whole suite `render/night.test.ts`, which draws over Vålerenga's dark, then made their glow with no document (3 failures; each
  file alone passed). Both forget what they noted, the thrown test restores the paint target and the view; shown by putting the leak back
  (3 fail) and taking it away (all pass).

## Departures, doubts, found and not fixed

- **ADR 0041**: the order calls item 2 "a fairness mend (ADR 0041)"; 0041 is the drawing of what is off the screen. The amendment is in ADR
  0040, whose decision holds the tells and reduced motion's still answers (order 38 read the order's "order of reading" the same way).
- **The track rat's tell** is held as it is (three dark stones on the red cover, one step of their stir): held, not enlarged. It reads weakly
  with motion too; making it larger changes the picture with motion, which item 2 does not do. For a later round.
- **Item 3's mend reaches beyond the ten worst**: what is thrown was eleventh as met (Bjørvika's bolts, 16.5) but the only one on the list that
  hurts; the order puts it first. The ten above it are told by their role's mark (paint, cyan corners), are scenery kept quiet, or are what he
  takes against an evening sky, which is a decision about the look and is left for the planner (above).
- **The stone rings** at Vigelandsparken measure 46.4 after the mend where they were 57.0 (their acid-green glow stood further off the red than
  the dark pixel does); still over 40, and Vigelandsparken is a day level, where nothing changed.
- **The measure** is approximate (`before.md`, "Limits"): carriers in the water and things in Nordmarka's dark were not found by their colours
  and were looked at by eye; a level pinned to day is measured at night but not ranked so.
- **The coot's walk**: its body no longer drops a row on two of its four walking frames (its head nods instead): the same frames, count and
  clock; the drop hid its legs at its new height.
- **The bishop's guard is a row taller** (10, from 9) and narrower with his halberd (15, from 17): drawn for the same box with `fit`, his hat's
  top two pixels over the box's top, which the palette test allows (it was one).
- **The squirrel's held cone** is the thrown cone's own first frame without its stem: the same cone the player sees fly.
