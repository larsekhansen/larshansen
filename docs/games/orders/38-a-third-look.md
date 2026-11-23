# Order 38: a third look, with every figure on one table

Written 23 November 2026, after order 37. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or story word. His
standing wish is to "keep looking for more assets that should have increased details. and
consider them with the rest of the game. interaction, fit, thematics". Since order 35 every
figure can be laid on one table (`apps/viking/tools/figures.ts`, 119 sheets). The planner laid
them out and looked. Most hold. These do not, at four times size on the neutral sheet:

- **The scooter** (`enemy-scooter`): an L-shaped tube. No wheels, no deck, no handlebar grips,
  no lamp; it does not say "electric scooter left on an Oslo pavement", which is the joke.
- **The gull and the crow in the air** (`enemy-gull`, `enemy-crow`, and `enemy-pigeonfly`
  beside them): a lens with a beak. No wing shape, no wingbeat that reads, no tail; the gull
  thrower and the magpie beside them have all three.
- **The track rat** (`enemy-trackrat`): its first row is three dots; say what that row is and
  whether a player ever sees it so.
- **The salmon** (`enemy-salmon`): an oval and two rings before it leaps; is the ring a ripple?
  It should read as water breaking.
- **The maze's raven** (`maze-raven`) is a few dark pixels, and the **mound-dweller**
  (`maze-dweller`) a grey block: both speak to him, and neither has a face you can find.
- **The rail tube** (`prop-rail tube`) and the plain **post** and **stove pipe**: flat bars.
- **The pole** as a pickup (`pickup-pole`): a line with a dot.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036, 0039 to 0056 (0044 the warning red, 0045 the grain, 0050 the
  glamour, 0051 props), orders 23 to 28 and 31, and `apps/viking/tools/review/o31/` and `o37/`.
- `git fetch origin`; `git checkout --no-track -b a-third-look origin/main`. First commit: this
  order, as `docs/games/orders/38-a-third-look.md`. Commit as you go. Do not push, do not
  delete any branch.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
  Pictures go under `~/.cache/claude-scratch-larshansen/o38/` (not `/tmp`, which is RAM).
- Nothing you run reaches outside this machine.
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change.
- Drawing only. Every redrawn figure keeps its box, its frame count and timing, its speed and
  behaviour. Sloppy run files on seeds 201 to 260 for all 16 levels and the encore
  byte-identical with `origin/main`; the maze's runs and ghost replay identical. Front page 28
  of 28. First script under 60 kB (58.52 now).

## 1. Look first, and rank

Run the figures tool on `origin/main` into `o38/figures-before/`. Look at every sheet at four
times size and in place at phone size (390 x 844) in a level where it is met, plain and
glammed. Write `apps/viking/tools/review/o38/before.md`: a table of every figure with, for
each, does its silhouette say what it is without colour; does it have a light side and a dark
side; does its movement read (wings, legs, wheels); does it belong to its place (ADR 0055's
rule that enemies belong where they are met); and a mark from 1 to 3. Use measures where they
help (shades used, share of the figure that is one flat colour) but judge with your eyes. My
list above is where to start, not the answer: add what I missed, strike what holds in place,
and say why. Rank the 3s.

## 2. Redraw the worst, properly

Take the ranked list from the top and redraw as many as you can do well (at least the
scooter and the three birds in the air; expect six to ten in all), by the methods of orders
23 to 28: per-pixel maps, GRAIN.md's ramps, light from the top left, the red outline where it
hurts, the level's lean when glammed (ADR 0050), natural where the glamour has broken.

- Each must be told from every other figure in its level by silhouette alone: show the
  silhouettes of each level's figures side by side, before and after.
- A thing that moves, moves: wings beat through distinct shapes (up, level, down), wheels
  turn, a tail trails. Keep the frame count; if a figure truly needs one or two more frames
  to read, add them without changing its timing as the rules see it, and say so.
- The scooter is a hired e-scooter as they stand about in Oslo: two small wheels, a deck, a
  stem, a handlebar, a lamp; its colour its own, at least 10 from the warning red and from
  every role colour (`render/warning.test.ts` holds it). No company's name, logo or exact
  livery.
- The maze's raven and mound-dweller: a beak and an eye that can be found, the dweller's
  face in the dark of its hood (two pale points are enough); keep them the mound's own.
- Show each before and after at four times size, and in place at phone size by day and under
  its level's sky, plain and glammed.
- Cost: no place more than +50 rectangles a frame at 390 x 844; keep what holds still cached.

## 3. Consider them with the rest

For each figure you redrew, say in `after.md` what it does in the game and whether the new
drawing says it: does a thing that throws look as if it could; does a thing safe to stand on
look solid; does a thing that hurts from above look sharp on top; does the tell before its
move still read first (ADR 0041's order of reading). Where the drawing and the behaviour
disagree and only a rule change would mend it, write it down for Lars and change nothing.

## 4. Keep the table honest

- A test that holds the look-first measures that can be held: every enemy's flying frames
  differ from each other by more than a few pixels (no "beat" that is one pixel), and no
  figure's silhouette in a level is the same as another's.
- The figures tool run again into `o38/figures/`; hand the directory back with a contact
  sheet of every figure's first row, before and after, in one picture.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources); DESIGN where a rule changed; an ADR only if a decision was made or
reversed; `apps/viking/tools/review/o38/` (`before.md`, `after.md`). LEVELS.html's pictures
retaken with `apps/viking/tools/pictures.ts` where they changed; say which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; first script under 60 kB; the viking suite's time said (about 268 s
  alone; add no more than 10 s).
- Front page 28 of 28; run files as said above; pictures of every level by day and night at
  390 x 844 byte-identical with `origin/main` except where a redrawn figure stands, each
  such difference named.

## If you cannot do all of it

Order: item 1; item 2 from the top of your ranking; item 3 for what you redrew; item 4.
Finish each figure properly before the next. Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why. Your ranking, and which you redrew.
2. Pictures in `~/.cache/claude-scratch-larshansen/o38/shots/`: each figure before and after
   at four times and in place; the silhouettes per level; the one contact sheet.
3. Tests, tsc, sizes, front page, run files, the maze's runs, cost a frame.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
