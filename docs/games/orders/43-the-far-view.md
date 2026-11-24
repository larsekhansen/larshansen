# Order 43: the far view, an ode to Oslo

Written 24 November 2026, after order 42. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or word. He said of
the game on 22 November: "It's more of an ode to Oslo." Orders 24 to 28 redrew the ground,
the things he stands on and the props; orders 38 to 41 every figure and every screen between.
What has not been laid on one table is what stands behind it all: each level's sky, its far
skyline and its landmarks. That is where a person who knows Oslo says "there it is", and
where one who does not sees a city rather than a backdrop. This order looks at the far view
of every level and enriches the thinnest. All of it is drawing.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036 (what holds still is kept and copied), 0039 to 0056 (0044 the
  warning red and the haze, 0049, 0050 the glamour, 0051 props of their place, 0054 lights
  after dark, 0055 an ode to Oslo with no "home"), orders 24 to 28, 32 and 34, and
  `docs/games/LEVELS.html`.
- `git fetch origin`; `git checkout --no-track -b far-view origin/main`. First commit: this
  order, as `docs/games/orders/43-the-far-view.md`. Commit as you go. Do not push, do not
  delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine (no looking things up: draw from what the repository's docs
  say of each place and from what is commonly known of Oslo; where you are not sure a
  building stands where you would put it, leave it out and say so). Stop preview servers by
  port (`fuser -k <port>/tcp`) and kill your own headless browsers by PID when done; remove
  the `/tmp/tmp-*.xpi` files your browsers leave. Never `pkill -f` with a pattern that
  matches your own command line. Pictures go under `~/.cache/claude-scratch-larshansen/o43/`
  (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand: public landmarks and
  neighbourhoods only, no street address, no private house singled out, nothing personal to
  the owner, no "home" (ADR 0055). No company's name, logo or exact livery on any building.
  `game/story.ts` and the limits in ADRs 0050 and 0052 are not yours to change; no word
  changes.
- Drawing only, behind the play: nothing you add may be mistaken for ground, a ledge, a
  thing to take or a thing that hurts (ADR 0044: the far view stays hazed and off the
  warning red and off the yellow paint; `render/warning.test.ts` and the palette test hold).
  Sloppy run files on seeds 201 to 260 for all 16 levels and the encore byte-identical with
  `origin/main`; the maze's runs and ghost replay identical. Front page 28 of 28. First
  script under 60 kB (55.80 now) and no larger than now by more than 100 bytes: a level's
  far view lives in that level's own lazy file.
- If a change does not read better than what it replaces, in place at phone size, keep the
  old and say so.

## 1. Look first: every far view on one table

For each of the 16 levels, the encore and the two line maps, by day and under the level's
own sky, glammed and natural (`?debug&natural`), at 390 x 844 and at 844 x 390 (where far
more of it shows), at four or five places along the level: photograph it, and write
`apps/viking/tools/review/o43/before.md`, a row a level:

- what stands in the far view now, layer by layer (sky, far, middle), and how many layers
  move against each other as he walks;
- which real thing of that place a person who knows Oslo would look for from there, and
  whether it is there and can be told at phone size (name them plainly: from Langkaia the
  Opera and the fjord's islands; from Ekeberg the whole town below; and so on, for each);
- whether the far view repeats visibly along the level (the same hill or block every screen);
- whether it changes with the sky as it should (lit windows after dusk by ADR 0054, a moon,
  a low sun), and whether the glamour touches it as ADR 0050 says and no more;
- whether anything in it competes with the play (too dark, too sharp, too near the colours
  of ground or danger): measure the far view's contrast against the play's own outlines;
- a mark from 1 to 3, and a ranking of the 3s and 2s.

## 2. Enrich the thinnest

From the top of your ranking, redraw or add to the far view of as many levels as you can do
well (expect four to six), by the methods of orders 24 to 28: GRAIN.md's ramps, light from
the top left, the haze that sets far things back, kept and copied where it holds still
(ADR 0036).

- Each gets at least one landmark of its place that can be told at phone size by silhouette
  (show the silhouette alone), set where it would truly be seen from, roughly; and no
  visible repeat within two screens.
- After dusk it carries its own lights by ADR 0054's rule (its census still holds).
- The glamour's lean and the natural self as ADR 0050 has them for scenery.
- Cost: no place more than +50 rectangles a frame at 390 x 844 and no more copies than
  +10; say each level file's bytes before and after.
- Each shown before and after at phone size upright and on its side, by day and under its
  sky, with the play in front, so it can be seen that the play still reads first.

## 3. Consider it with the rest

For each level you changed, say in `after.md`: does the far view say where he is on the
line (the map's own picture of that station and the level's far view should agree: the same
landmark, the same side); does the level's opening words still fit what is seen; does the
far view of one level show the place of the next or the last where it truly would (Akershus
from Langkaia, Holmenkollen's jump from the town). Where the map and a level disagree, mend
the drawing that is wrong, not the words.

## 4. Keep the table honest

- `o43/after.md`: the table again with new marks; every 3 that remains named with why.
- A test where one can be held cheaply (no far-view colour within the stated distance of
  the warning red, the yellow paint or a role colour in any level under any sky, if the
  palette test does not hold it already), sharing a walk already made.
- LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` where they changed,
  and its words for a level updated where they describe the far view; say which.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources); DESIGN where a rule changed; an ADR only if a decision was made or
reversed; `apps/viking/tools/review/o43/` (`before.md`, `after.md`).

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; the first script's bytes; the viking suite's time said against
  `origin/main` the same hour (add no more than 10 s).
- Front page 28 of 28; run files as said above; every picture of a level you did not
  change byte-identical with `origin/main`; in a level you changed, the differences only
  behind the play (show one difference picture a level).
- With reduced motion nothing new moves.

## If you cannot do all of it

Order: item 1 for every level; item 2 from the top of your ranking, each level finished
properly before the next; item 3 for what you changed; item 4. Docs for what was done are
never skipped.

## Hand back

1. Per item: done, partly, not, and why. Your ranking, and which levels you changed.
2. Pictures in `~/.cache/claude-scratch-larshansen/o43/shots/`: per level changed, before
   and after, upright and on its side, day and its sky; the silhouettes.
3. Tests, tsc, sizes (each file that grew), front page, run files, the maze's runs, cost a
   frame.
4. What only a person can judge, as a list for Lars: above all, for each landmark you drew,
   "is this it, and is it where it should be".
5. Departures, doubts, found and not fixed, anything you left out because you were not sure
   of the place. Branch and commits. Confirm nothing of yours is left running.
