# Order 46: the rest of the upright phone, and a second look at the dark below

Written 25 November 2026, after order 45. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or word. Order 45
looked at every level as an upright phone shows it and filled ten. It left eight (Rådhuset,
Bygdøy, Østensjøvannet, Bjørvika, Nordmarka, Stortinget, the encore, the maps), three named
flat places, and one doubt the planner shares after looking at its pictures: the band under
the ground runs to near-black, and under snow (Holmenkollen, Korketrekkeren) white going
to black reads more as a shadow over the screen than as ground going down. This order
finishes the table and looks at that dark again. All of it is drawing.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0019, 0035, 0036, 0039 to 0056 (0043 as order 45 amended it, 0044, 0047,
  0050, 0052, 0054), order 45 and `apps/viking/tools/review/o45/` (`before.md`, `after.md`),
  `alive/upright.ts`, `render/upright.test.ts` and its helpers. Take upright pictures the
  way order 45 did (a pixel ratio of 3, the pad up): its lessons say how.
- `git fetch origin`; `git checkout --no-track -b upright-rest origin/main`. First commit:
  this order, as `docs/games/orders/46-the-rest-upright.md`. Commit as you go. Do not push,
  do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine. Stop preview servers by port (`fuser -k <port>/tcp`) and kill
  your own headless browsers by PID when done; remove the `/tmp/tmp-*.xpi` files your
  browsers leave; leave the `/tmp/shots-*` folders alone. Never `pkill` or `pkill -f` by a
  pattern at all: kill by PID only. Pictures go under
  `~/.cache/claude-scratch-larshansen/o46/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`, `apps/landing`, `infra/` or `.github/`. ADR 0014,
  0003 and 0055 stand. `game/story.ts` and the limits in ADRs 0050 and 0052 are not yours to
  change; no word changes. Write only plain text into docs (no control characters).
- No rule changes. Sloppy run files on seeds 201 to 260 for all 16 levels and the encore
  byte-identical with `origin/main`; the maze's runs and ghost replay identical. Front page
  28 of 28. First script under 60 kB (55,874 bytes now) and no larger than now by more than
  200 bytes. Use order 45's brush; do not make a second.
- On its side (844 x 390) and on a desktop every picture byte-identical with `origin/main`.
  Every touch target keeps its place and size.
- If a change does not read better than what it replaces, in place at phone size, keep the
  old and say so.

## 1. The dark below, a second look

For each of the nine levels order 45 gave a band under the ground, at 390 x 844 and
360 x 640, by day and under its sky, with the pad: show what stands now beside two lighter
tries, and take the best for each material:

- the band ending at a tone of its own material's darkest ramp step (GRAIN.md), not at a
  near-black: snow going down to packed blue-grey snow and then rock, earth to dark wet
  earth, stone to its shaded courses, marble to its shadowed grey;
- the darkening starting lower and in fewer, broader layers, so that the first screen's
  height under his feet is still plainly the ground he stands on.

Whatever is taken, the pad's measures of order 41 and 45 must hold (the word on a button
and its ring against what is behind them: say the numbers before and after), the band must
never read as somewhere to go, and `render/upright.test.ts` still holds. This is a look the
planner decides on Lars's behalf (record it in `conversations.md` with how to undo; ADR
0043's amendment gets a line). If what stands is the best of the three for a material,
keep it and say so.

## 2. The eight left

Rådhuset, Bygdøy, Østensjøvannet, Bjørvika, Nordmarka, Stortinget, the encore and the two
maps, from order 45's table. For each, either fill it by order 45's method and measures
(the sky band what that level's sky would hold; the band below by item 1's outcome; cost
no more than +60 rectangles and +10 copies a frame; nothing new moves with reduced motion)
or say in a line why it is right as it is (Stortinget underground has no sky; the maps
were marked 1). The encore only where ADR 0052 is untouched: its stage, its figures and
its lights stay; the sky above it and the ground below may be filled. Expect to fill four
to six.

## 3. The three flat places

Ekeberg's fjord far below the viewpoint, Gamlebyen's harbour at the prow, the encore's
water mirror: the test names them as exceptions. Give each what would truly be there
(the fjord from above: islands, a ferry's wake held still, the far shore; the harbour:
the water's depth strips, a mooring; the mirror: what it mirrors, faintly) so that the
exception can come out of the test, or say why it must stay.

- Also: the kit's sky gradient runs to the screen's foot upright, so its horizon colour
  lies under the ground. Without touching the kit, see whether the page can hand the kit
  the horizon's true height upright (a parameter the kit already takes, or one added with
  the kit's default unchanged and the front page 28 of 28). If it costs more than 150
  bytes of the first script or touches the front page's pictures, leave it and say so.

## 4. Keep the table honest

- `apps/viking/tools/review/o46/after.md`: order 45's table again with new marks, every
  level's row; every 2 or 3 that remains named with why.
- `render/upright.test.ts`: exceptions removed where item 3 allows; the suite's time no
  worse than now by more than 5 s.
- LEVELS.html unchanged unless a desktop picture changed (none should).

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources; `conversations.md` for item 1); DESIGN where a rule changed; ADR 0043's
amendment; `apps/viking/tools/review/o46/` (`after.md`).

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; the first script's bytes; the viking suite's time said against
  `origin/main` the same hour.
- Front page 28 of 28; run files as said above; on its side and on a desktop every picture
  byte-identical with `origin/main`; upright, every level you did not change byte-identical.
- With reduced motion nothing new moves.

## If you cannot do all of it

Order: item 1; item 2 in the order given, each level finished properly before the next;
item 3; item 4. Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why. Which levels you changed.
2. Pictures in `~/.cache/claude-scratch-larshansen/o46/shots/`: for item 1 the three tries
   side by side per material; per level changed, before and after at both upright sizes,
   day and its sky, with the pad.
3. Tests, tsc, sizes (each file that grew), front page, run files, the maze's runs, cost a
   frame, the pad's numbers.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
