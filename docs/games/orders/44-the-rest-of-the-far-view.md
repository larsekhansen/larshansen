# Order 44: the rest of the far view

Written 24 November 2026, after order 43. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or word. Order 43
laid every far view on one table and redrew five. Seven stayed at mark 2, most of them
because the implementer could not look a place up and would not guess. This order gives the
places (below, from the planner's own knowledge of Oslo, not looked up: Lars judges them in
the end) and finishes the table. All of it is drawing.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036, 0039 to 0056 (0044 the warning red and the haze, 0047, 0050,
  0051, 0052 the encore, 0054 lights after dark, 0055 an ode to Oslo with no "home"), order
  43 and `apps/viking/tools/review/o43/` (`before.md`, `after.md`), and `alive/far.ts`, the
  brush order 43 made: use it, do not make a second.
- `git fetch origin`; `git checkout --no-track -b far-view-rest origin/main`. First commit:
  this order, as `docs/games/orders/44-the-rest-of-the-far-view.md`. Commit as you go. Do
  not push, do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine. Stop preview servers by port (`fuser -k <port>/tcp`) and kill
  your own headless browsers by PID when done; remove the `/tmp/tmp-*.xpi` files your
  browsers leave. Never `pkill -f` with a pattern that matches your own command line.
  Pictures go under `~/.cache/claude-scratch-larshansen/o44/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`, `apps/landing`, `infra/` or `.github/`. ADR 0014 and
  ADR 0003 stand: public landmarks and neighbourhoods only, no street address, no private
  house singled out, nothing personal to the owner, no "home" (ADR 0055). No company's name,
  logo or exact livery on any building. `game/story.ts` and the limits in ADRs 0050 and 0052
  are not yours to change; no word changes. Write only plain text into docs (no control
  characters).
- Drawing only, behind the play: nothing you add may be mistaken for ground, a ledge, a
  thing to take or a thing that hurts (ADR 0044; order 43's far-colour test holds and
  covers what you add). Sloppy run files on seeds 201 to 260 for all 16 levels and the
  encore byte-identical with `origin/main`; the maze's runs and ghost replay identical.
  Front page 28 of 28. First script under 60 kB (55,857 bytes now) and no larger than now
  by more than 100 bytes: a level's far view lives in that level's own lazy file.
- If a change does not read better than what it replaces, in place at phone size, keep the
  old and say so.

## The places, as the planner knows them

Directions are as a person standing there sees them. Where the level's own walk runs the
other way from the compass, put the landmark on the side the map's line puts it, as order
43 did, and say so.

- **Holmenkollen's jump and the TV tower (Tryvannstårnet)**, seen from the town
  (Vigelandsparken, Bygdøy): the tower stands on the ridge above and behind the jump, a
  little to the right of it and clearly higher: a thin mast with a thick collar near its
  top. The jump's hill opens toward the town (south-east), so from the town one looks up
  into it. Check order 43's Vigelandsparken and Bygdøy against this and mend the tower's
  side and height if they differ.
- **Hovedøya from Rådhusplassen**: yes, it is seen, low and wooded, out in the middle of
  the bay's mouth, with Akershus on the left hand and Aker Brygge on the right. Order 43's
  doubt is settled: leave it.
- **Bygdøy**: from Bygdøynes the city lies to the north-east with Rådhuset left of
  Akershus. Order 43 is right: leave it.
- **Akerselva**: no tower of note stands on Grefsenkollen. Take the tower out. Grefsenkollen
  is a rounded wooded hill to the north, seen up the river. What a person looks for along
  the river: tall brick factory chimneys, a cluster of round concrete grain silos, old brick
  mill buildings with rows of small windows, and two church spires over the roofs: Sagene
  kirke (a tall slim pointed spire of red brick, upriver) and Paulus kirke (a pointed
  spire, at Grünerløkka, further down). Each once, in the order the river passes them.
- **Gamle Oslo**: Kampen kirke's spire once, on its low hill to the north-east. Ekeberg's
  wooded hillside rising close to the south-east. To the west, toward the fjord, the
  Barcode's row of slim tall blocks with gaps between, and one tall plain slab tower by the
  central station (no name on it).
- **Østensjøvannet**: a long shallow lake with reed beds in a broad low valley. On the
  ridges on either side stand rows of 1950s and 1960s housing blocks, low slabs and a few
  taller ones, among trees; beyond the eastern ridge the dark forest of Østmarka, a long
  even line. No famous building: its far view is the reeds, the two ridges with their
  blocks lit after dusk, and the forest. Do not invent a landmark.
- **Korketrekkeren**: the run goes down through spruce forest from Frognerseteren. At its
  top the TV tower stands close above. Where the forest opens (give it one or two openings
  at most, where the level's own ground already opens), the town and the fjord lie far
  below to the south-east: the fjord with its islands, the town as small lights after dusk.
  The forest hiding the rest is right.
- **Slottet**: from the palace hill one looks straight down the main street to Stortinget
  at its far end, with the old university's columned front on the left and the national
  theatre among trees on the right. If the level's own buildings already are these, leave
  it and say so.
- **The encore** (Middelalderparken): Ekeberg's hillside stands directly over the park to
  the south-east, with the Barcode to the north-west across the water. If Ekeberg can stand
  behind and between the slim towers without moving them (a lower, farther layer), add it;
  if it needs them moved, leave it and say so. Nothing else on the encore changes
  (ADR 0052).
- **Langkaia**: out on the fjord, nearest to farthest: Hovedøya (low, wooded), then smaller
  islands of which one has rows of small cabins in mixed colours (Lindøya), and behind all
  of them the long even wooded ridge of Nesodden. Ekeberg's hillside to the left (east).
  Its shared far layers are in the first script and stay; what Langkaia alone shows may be
  added in Langkaia's own file.

Where what the repository already draws disagrees with this, mend the drawing. Where you
doubt what is written here, say so in the hand-back rather than draw around it.

## 1. Mend order 43 where the places say so

The TV tower's side and height at Vigelandsparken and Bygdøy. Before and after.

## 2. The seven left

Akerselva, Gamle Oslo, Østensjøvannet, Korketrekkeren, Langkaia, then Slottet and the
encore, each by order 43's method and measures:

- at least one thing of its place that can be told at phone size by silhouette (show the
  silhouette alone), each landmark once, no visible repeat within two screens;
- after dusk its own lights by ADR 0054 (the census still holds);
- the glamour's lean and the natural self as ADR 0050 has them for scenery;
- cost: no place more than +50 rectangles a frame at 390 x 844 and no more copies than +10;
  each level file's bytes before and after;
- each shown before and after at phone size upright and on its side, by day and under its
  sky, with the play in front, so it can be seen that the play still reads first.

## 3. The map and the levels agree

For every level changed here: the line map's picture of that station and the level's far
view show the same landmark on the same side. Where they disagree, mend the drawing that is
wrong. Does one level's far view show the next or the last where it truly would (the
Barcode from Gamle Oslo, the TV tower from Korketrekkeren).

## 4. Keep the table honest

- `apps/viking/tools/review/o44/after.md`: order 43's table again with new marks; every 2
  that remains named with why.
- Order 43's far-colour test tints day colours rather than walking each sky, and does not
  cover the map. If either can be held cheaply by sharing a walk already made, hold it; if
  not, say what it would cost.
- LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` where they changed,
  and its words for a level updated where they describe the far view; say which.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources; `conversations.md`: the places above were given by the planner, not
looked up, and wait for Lars); DESIGN where a rule changed; an ADR only if a decision was
made or reversed; `apps/viking/tools/review/o44/` (`before.md` only if you measure anything
new, `after.md`).

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; the first script's bytes; the viking suite's time said against
  `origin/main` the same hour (add no more than 10 s).
- Front page 28 of 28; run files as said above; every picture of a level you did not
  change byte-identical with `origin/main`; in a level you changed, the differences only
  behind the play (show one difference picture a level).
- With reduced motion nothing new moves.

## If you cannot do all of it

Order: item 1; item 2 in the order given, each level finished properly before the next;
item 3 for what you changed; item 4. Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why. Which levels you changed.
2. Pictures in `~/.cache/claude-scratch-larshansen/o44/shots/`: per level changed, before
   and after, upright and on its side, day and its sky; the silhouettes.
3. Tests, tsc, sizes (each file that grew), front page, run files, the maze's runs, cost a
   frame.
4. What only a person can judge, as a list for Lars: for each landmark, "is this it, and is
   it where it should be".
5. Departures, doubts (above all about the places as given), found and not fixed. Branch
   and commits. Confirm nothing of yours is left running.
