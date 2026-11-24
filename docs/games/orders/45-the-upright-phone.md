# Order 45: the upright phone

Written 24 November 2026, after order 44. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or word. Orders 43
and 44 gave every level a far view of its place, and both said the same thing at the end:
on a phone held upright, which is how most people will hold it, the far view is a thin
strip. Above it stands a tall plain sky and below the ground a tall plain band of earth,
snow or water. The play fills perhaps a third of the screen. This order looks at the
upright frame of every level and fills it. All of it is drawing and framing.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0019 (the 240-pixel view), 0035, 0036, 0039 to 0056 (0043 the camera and
  the safe area, 0044, 0047, 0050, 0054), orders 21, 37, 42, 43 and 44 and
  `apps/viking/tools/review/o43/` and `o44/`, `game/frame.ts` and `alive/far.ts`.
- `git fetch origin`; `git checkout --no-track -b upright-phone origin/main`. First commit:
  this order, as `docs/games/orders/45-the-upright-phone.md`. Commit as you go. Do not push,
  do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine. Stop preview servers by port (`fuser -k <port>/tcp`) and kill
  your own headless browsers by PID when done; remove the `/tmp/tmp-*.xpi` files your
  browsers leave; leave the `/tmp/shots-*` folders alone (the front page's gate reads one).
  Never `pkill -f` with a pattern that matches your own command line. Pictures go under
  `~/.cache/claude-scratch-larshansen/o45/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`, `apps/landing`, `infra/` or `.github/`. ADR 0014,
  0003 and 0055 stand. `game/story.ts` and the limits in ADRs 0050 and 0052 are not yours to
  change; no word changes. Write only plain text into docs (no control characters).
- No rule changes. Sloppy run files on seeds 201 to 260 for all 16 levels and the encore
  byte-identical with `origin/main`; the maze's runs and ghost replay identical. Front page
  28 of 28. First script under 60 kB (55,867 bytes now) and no larger than now by more than
  300 bytes; a level's own drawing lives in its own lazy file.
- On its side (844 x 390) and on a desktop nothing may change at all unless this order says
  so: every picture there byte-identical with `origin/main`. Every touch target keeps its
  place and size.
- If a change does not read better than what it replaces, in place at phone size, keep the
  old and say so.

## 1. Look first: every level upright, on one table

For each of the 16 levels, the encore and both maps at 390 x 844 and 360 x 640, with touch
(`&touch`), by day and under the level's own sky, at five places along the level (the
start, the highest climb, the lowest place, a boss or the end, one ordinary stretch):
photograph, and write `apps/viking/tools/review/o45/before.md`, a row a level:

- how the screen's height is shared, in pixels: sky above the far view, the far view, the
  play (from the highest thing he can reach to the ground under him), ground below, and
  what the pad covers;
- what stands in the sky band (clouds, sun, moon, stars, the aurora, birds, anything) and
  whether it is plain for more than a third of the screen's height;
- what stands in the band below the ground (earth's layers, stones, roots, water's depth,
  snow) and whether it is plain;
- whether the far view's landmarks of orders 43 and 44 can be seen at all, and for how
  much of the level;
- where he stands on the screen (the camera's height), and how much of what is above him
  and below him that leaves: can he see a ledge he must jump to, a thing falling on him, a
  pit he lands in;
- a mark from 1 to 3 and a ranking.

## 2. Frame it

Where the table shows the camera wasting the screen upright (he stands so that most of it
is plain ground, or plain sky), consider the camera's height for an upright screen alone.
This is the planner's call on Lars's behalf (a look, easy to undo): a single stated rule
(where he stands on an upright screen, how the far layers sit against the horizon so that
the landmarks stand in view), not a number a level. The rules do not see the camera; show
that the run files stay identical, that nothing he must see leaves the screen (every ledge,
thrower and pit on the route in view when he must act on it: measure along the sloppy
runs), and that the pad covers no more of the play than now. If no rule is better than
what stands, keep what stands and say why. Record it where the camera's rules are
(ADR 0043 amended) and in `conversations.md`: decided by the planner, how to undo.

## 3. Fill it

From the top of your ranking, for as many levels as you can do well (expect six to eight),
by the methods of orders 24 to 28, 43 and 44:

- **The sky band**: give it what that level's sky would truly hold, in depth and sparingly:
  cloud layers that differ by weather and hour, the sun or moon at a height that fits the
  hour, stars thinning toward the horizon, the aurora where the level already has it,
  far birds, a plane's trail, snow or rain already falling drawn through the whole height.
  Nothing new moves with reduced motion. Nothing in the sky near the warning red, the
  yellow paint or a role colour (order 43's test covers what you add).
- **The band below**: what is under that ground (the quay's stones and piles going down
  into green water, earth with roots and stones and an old pipe, snow over rock, the
  marble's courses, the metro's concrete), darkening downward so that it never reads as
  somewhere to go, and so the pad's buttons stand clear on it (order 41's measures for the
  buttons hold).
- **The far view**: where a landmark of orders 43 and 44 is hidden upright, give it room
  by item 2's rule or by its layer's height, not by redrawing it.
- Cost: no place more than +60 rectangles a frame at 390 x 844 and no more copies than
  +10; kept and copied where it holds still (ADR 0036). Say each level file's bytes before
  and after.
- Each shown before and after at 390 x 844 and 360 x 640, by day and under its sky, with
  the pad up.

## 4. Keep the table honest

- `o45/after.md`: the table again with new marks; every 3 that remains named with why.
- A test where one can be held cheaply (upright, no band of one flat colour taller than a
  stated share of the screen in any level under any sky), sharing a walk already made.
- LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` where they changed;
  say which.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources; `conversations.md` for item 2); DESIGN where a rule changed; ADR 0043
amended if item 2 changed anything; `apps/viking/tools/review/o45/` (`before.md`,
`after.md`).

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; the first script's bytes; the viking suite's time said against
  `origin/main` the same hour (add no more than 10 s).
- Front page 28 of 28; run files as said above; on its side and on a desktop every picture
  byte-identical with `origin/main` (or, where a sky you enriched also shows there, each
  difference named and shown to be the sky alone).
- With reduced motion nothing new moves.

## If you cannot do all of it

Order: item 1 for every level; item 2; item 3 from the top of your ranking, each level
finished properly before the next; item 4. Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why. Your ranking, and which levels you changed.
2. Pictures in `~/.cache/claude-scratch-larshansen/o45/shots/`: per level changed, before
   and after, at both upright sizes, day and its sky, with the pad.
3. Tests, tsc, sizes (each file that grew), front page, run files, the maze's runs, cost a
   frame.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
