# Order 40: what he takes, and what warns

Written 23 November 2026, after order 39. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or story word.
Order 39 measured everything in place and left three things: what he takes is warm on warm
against an evening sky; the track rat's tell is small with motion or without; and eight
figures still stand at mark 2. This order takes them up. All of it is drawing.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036, 0039 to 0056 (0040 the tells, 0044 the warning red, 0050,
  0051, 0056 the maze's dark line round a thing to take), orders 32, 38 and 39, and
  `apps/viking/tools/review/o39/` (`before.md`, `after.md`, `rim.tsv`, `props.tsv`).
- `git fetch origin`; `git checkout --no-track -b takes-and-warns origin/main`. First commit:
  this order, as `docs/games/orders/40-what-he-takes-and-what-warns.md`. Commit as you go. Do
  not push, do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine. Stop preview servers by port (`fuser -k <port>/tcp`) and kill
  your own headless browsers by PID when done. Never `pkill -f` with a pattern that matches
  your own command line. Pictures go under `~/.cache/claude-scratch-larshansen/o40/` (not
  `/tmp`, which is RAM).
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change.
- Drawing only. Every figure keeps its box, frame count, timing, speed and behaviour. Sloppy
  run files on seeds 201 to 260 for all 16 levels and the encore byte-identical with
  `origin/main`; the maze's runs and ghost replay identical. Front page 28 of 28. First
  script under 60 kB (58.55 now, so little room: say what each item costs in bytes).
- If a change does not read better than what it replaces, in place at phone size, keep the
  old and say so.

## 1. What he takes, after dusk

Order 39 measured the bracteate, the cheese and the skilling at 14.5 to 15 against evening
skies and left it. Build it, as the planner's call on Lars's behalf (a look, easy to undo):
under a level's evening or night sky, a thing to take gets a thin dark line round it, the
same rule the maze has (ADR 0056) and the same means order 32 and order 39 used for what is
thrown. By day nothing changes: every day picture byte-identical.

- First show it on three pickups in three evening levels, before and after at phone size,
  and judge it: does the coin still look like treasure, not like an enemy (no red, ADR
  0044; the line is the level's dark, not black where the level is not black)? If the plain
  line looks heavy, try the lighter means (a line on the lower right only, the shadow side)
  and take the one that reads best. Say which and why.
- Then every pickup kind under every evening and night sky: measure as order 39 did; none
  under 30 afterwards, and name any that is.
- Held by a test beside `alive/thrown.test.ts`. An ADR amended (0056 or 0044, whichever
  holds the rule) and `conversations.md`: decided by the planner, how to undo.

## 2. The weakest tells

The track rat's tell is three dark stones on a red cover, small with motion or without.
Make it read: larger, lighter against what is behind it, or a second sign (its eyes, a
twitch of the tail held still with reduced motion), without changing when the tell starts
or ends as the rules see it. Show before and after, with motion and with reduced motion.

- Then rank every tell in order 39's table by what a player gets: the tell's size in
  pixels, its contrast against what is behind it where it is met, and how long it stands.
  List the five weakest and mend at least the three weakest the same way, drawing only.
  Bosses and Loki included in the ranking; mend them only if they are among the weakest.
- The reduced-motion test and `feel.test.ts` still hold; add the measure that can be held
  (no tell smaller than a stated number of pixels).

## 3. The eight left at 2

`o39/before.md` names eight figures still at mark 2, each with why it was left. For each:
redraw it by the methods of orders 23 to 28, 38 and 39, or say why it truly cannot be
better at its size. Expect to redraw at least five. Each shown before and after at four
times size and in place at 390 x 844 by day, under its level's sky, glammed and natural.

## 4. Keep the table honest

- Run the figures tool into `o40/figures/`; one contact sheet of every changed figure's
  first row, before and after; say whether `figures.json` changed.
- The marks table again in `o40/before.md`: every 2 that remains named with why.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources); DESIGN where a rule changed; the ADR amendment and `conversations.md`
for item 1; `apps/viking/tools/review/o40/` (`before.md`, `after.md`). LEVELS.html's
pictures retaken with `apps/viking/tools/pictures.ts` where they changed; say which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; first script under 60 kB; the viking suite's time said (about 271 s
  alone; add no more than 10 s).
- Front page 28 of 28; run files as said above; pictures of every level by day at 390 x 844
  byte-identical with `origin/main` except where a changed figure or tell stands, each
  difference named; night pictures differ only there and at things to take.
- No place more than +50 rectangles a frame at 390 x 844.

## If you cannot do all of it

Order: item 1; item 2; item 3; item 4. Finish each properly before the next. Docs for what
was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o40/shots/`: per item, before and after.
3. Tests, tsc, sizes, front page, run files, the maze's runs, cost a frame.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
