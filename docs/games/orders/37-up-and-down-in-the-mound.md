# Order 37: up and down in the mound, and the phone's notch

Written 22 November 2026, after order 36. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or story word, in the
fjord or in the maze. This order takes up what order 36 left and the roadmap's idea 4.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0019, 0035, 0036, 0039 to 0056, orders 21, 23 and 36, and
  `apps/viking/tools/review/o36/` (`before.md`, `after.md`).
- `git fetch origin`; `git checkout --no-track -b up-and-down origin/main`. First commit: this
  order, as `docs/games/orders/37-up-and-down-in-the-mound.md`. Commit as you go. Do not push,
  do not delete any branch.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
  Pictures go under `~/.cache/claude-scratch-larshansen/o37/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change.
- The maze's rules do not change: `packages/maze/tools/runs.ts`'s fingerprints for every run
  identical with `origin/main`, and ghosts written by `origin/main` replay to the same end.
- The fjord: sloppy run files on seeds 201 to 260 byte-identical with `origin/main`; every
  level's pictures by day and night at 390 x 844 byte-identical. Front page 28 of 28. First
  script under 60 kB (58.31 now).

## 1. He walks up and down the corridors facing the way he goes

In the maze he is the fjord's side-on sheet, so going up or down a corridor he runs sideways
(order 36's first doubt, and half of all the walking in a maze). Draw him going away (his
back: helmet, cloak or tunic back, the torch held out to one side) and coming toward (his
face, beard, the torch), each standing and running, by the methods of orders 23 to 28 (per-pixel
maps, GRAIN.md's ramps, the outline rule, light from the top left), plainly the same man at
the same size and with the same number of run frames as his side run, so the eye does not
catch a change of pace when he turns a corner.

- The drawing lives where his sheet lives now (the kit), kept out of the fjord's first script
  if the fjord does not use it: say what each file weighs before and after.
- Which way he faces follows his movement with a little stickiness, so a diagonal drag does
  not flicker between two views (hold it in a test: a steady diagonal never changes view more
  than once). Standing, he keeps the view he stopped in.
- His ghost is the same drawings, pale, and its run goes by distance as his does (order 36
  left it on a step count, so its feet may slide). The ghost's stored format does not change.
- Show all four views at four times size beside the side view, and in place at phone size in
  a corridor going up, going down and turning a corner (a strip of consecutive frames).
- Add the new rows to `apps/viking/tools/figures.ts` and `figures.json`.

## 2. What order 36's reduced-motion test did not draw

The maze's shake, the curse's red frame round the view and the fade are drawn by the scene and
were read in the code, not drawn by the test. Make the test draw the scene itself with reduced
motion through a curse, a level's end and a card, and hold that nothing shakes or flashes;
plant each fault, see it fail, remove it, and list them in `o37/after.md`.

## 3. The maze's debug code out of its own page's first script

`apps/iron-maze/src/main.ts` imports `@larshansen/maze/debug` statically, so every visitor of
maze.larshansen.dev downloads the harness (its first script went from 29.3 to 34.4 kB gzipped
in order 36). Load it only under `?debug`, as the viking page does, without changing what the
harness can do. Say what the first script weighs after; the aim is 31 kB or less.

## 4. The camera's jump on notched phones (the roadmap's idea 4)

Order 21 left one "partly": on a notched phone on its side, the camera can jump when he turns
near the Dash button. Read order 21's hand-back and HANDOVER for what is known. No browser
here has a notch, so first make the harness able to pretend one (a debug-only way to set the
four safe-area insets, in the viking page and in the maze), reproduce the jump in stepped
pictures or a test, then fix it, and show the same steps after. If it cannot be reproduced
with pretended insets, say exactly what you tried and leave the code alone.

- With the pretended insets, take every screen kind (a level, the map, a card, the encore,
  the maze in both pages) at 844 x 390 with a notch left and a notch right, and upright with
  a home bar, and fix anything that sits under them. Pictures before and after.

## 5. Small

- `figures.json`'s state names are English only; give each state both languages (ADR 0016),
  held by the figures test.
- Order 36 found that going through a door while the page still loads leaves the maze's way
  out (Back) with nowhere to go. No player is at a door then, but make the way out fall back
  to the line map when there is no history entry to go back to, and hold it in a test.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next", idea
4 struck or narrowed; lessons; resources for anything new in the harness); DESIGN or the
maze's README where a rule changed; ADR 0056 amended for his views in the maze (a new ADR only
if a decision was made or reversed); `apps/viking/tools/review/o37/after.md`, one section per
item. LEVELS.html's maze picture retaken if it changed; say so.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; first script under 60 kB; the viking suite's time said (about 256 s
  alone; add no more than 10 s).
- Front page 28 of 28; fjord run files and pictures as said above; the maze's runs and ghost
  replay identical.
- The maze's rectangles a frame on every level: no more than +50 against `origin/main`.

## If you cannot do all of it

Order: item 1; item 3; item 2; item 4; item 5. Finish each properly before the next. Docs for
what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o37/shots/`: per item, before and after;
   for item 1 one sheet of all his views at four times, and the corridor strips.
3. Every changed word, both languages.
4. Tests, tsc, sizes, front page, run files, the maze's runs, ghost replay, cost a frame.
5. What only a person can judge, as a list for Lars.
6. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
