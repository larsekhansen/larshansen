# Order 35: housekeeping, and every figure on one page

Written 22 November 2026, after order 34. Lars answered on 22 November ("carry on as planned";
his answers are in `docs/games/handbook/conversations.md`). He has not played yet, so this
order retunes nothing: no route, box, speed, timing, hearts or enemy placement changes, and no
story words. It pays what orders 33 and 34 left, and gives the repository one page of every
figure, which the published figures page has lacked since order 27.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014,
  0035, 0036, 0039 to 0055, and `apps/viking/tools/review/o33/` and `o34/` (`after.md`,
  `thematic.md`).
- `git fetch origin`; `git checkout --no-track -b housekeeping origin/main`. First commit: this
  order, as `docs/games/orders/35-housekeeping-and-the-figures.md`. Commit as you go. Do not
  push, do not delete any branch.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change.
- Sloppy run files for Langkaia, Nordmarka, Bjørvika, Gamlebyen, Slottet, Gamle Oslo
  (`nabolaget`), Holmenkollen and the encore on seeds 201 to 260 byte-identical with
  `origin/main`.
- Front page 28 of 28 byte-identical. First script under 60 kB (58.08 now).

## 1. The test suite's time

The viking suite took 370 s in order 34 (335 s before it; 212 s at order 30). The deploy runs
it too. Bring it to 300 s or less on this Pi, measured alone three times, without losing a
single thing it holds:

- Order 34 named the first trims: count the scenery walk's kept pieces once instead of pixel
  by pixel (about 18 s); share one walk between order 33's and order 34's warning tests. The
  reduced-motion test (about 70 s) is the largest: find what it draws twice.
- For every test you change, show that it still fails when it should: plant the fault it
  guards against (a blink, a red field, a dimmed light), see it fail, remove the fault. List
  each planted fault and its result in `o35/after.md`.
- Do not skip, `.skip`, sample down or delete a test to win time, and do not move tests out of
  the suite the deploy runs. If 300 s cannot be reached honestly, say what you reached and why.
- Write the per-file times before and after into `o35/after.md`, and the three slowest files
  into `docs/games/handbook/lessons.md`.

## 2. Every figure on one page

A tool, `apps/viking/tools/figures.ts`, that writes every figure the game draws as a PNG sheet
at four times size into a directory given on the command line: him (every state and frame),
every enemy kind in every look it has (plain and glammed, each lean it is met in), every boss
with its stages and tells (Loki's four stages after order 34), every carrier, every pickup,
every prop kind of ADR 0051, and what enemies throw. One file per figure, named by its kind,
on the game's neutral sheet background, frames in a row, states in rows, with no text baked
into the image; and a `figures.json` beside them listing for each file: its name as a player
would say it (English and Norwegian), the levels it is met in, and its states in row order.
The glance tools in `apps/viking/tools/glance/` (`frames.ts`, `framesheet.py`, `bosses.ts`,
`loki.ts`, `inventory.ts`) already do parts of this: build on them, do not duplicate them.

- The tool reads the game's own tables, so a new enemy or prop appears without editing it; a
  test fails if a kind used by any level is missing from `figures.json`.
- Run it into `~/.cache/claude-scratch-larshansen/o35/figures/` and hand that directory back.
  Nothing generated is committed (the PNGs are not for the repository); the tool, the test and
  a line in `resources.md` are.

## 3. Small things left by orders 33 and 34

- Under the harness (`?debug&steps=…`) the encore's shouts cannot show because the music never
  saw him wake. Make the harness able to photograph the encore mid-fight with a shout in his
  bubble (without `&say`), and take that picture at 390 x 844 and 360 x 640 in both languages
  to show the bubble never covers a tell.
- Some harness pictures at 390 x 844 come out blank in both builds (orders 32 and 34 met
  them). Find out why (HANDOVER, "The harness", knows one cause: a hit in the first steps) and
  either fix it or make `tools/shots.ts` say which pictures are blank instead of handing them
  back silently.
- Perf was measured at 56 of 275 places in order 34 because each place took about 40 s. Make
  the perf tool measure all places in one browser session, or otherwise cut its time by at
  least half, and measure all 275 on `origin/main` and on your branch.
- Bjørvika's crane lights sit 10.3 from the warning red, and they are lights on a thing that
  does not hurt: real crane lights are red, so leave the hue, and write the exception into the
  warning test by name instead of leaving it as luck.
- `thematic.md` proposed that Holmenkollen's hedgehog should be asleep in winter. An animal
  that is true of a winter hill (a mountain hare in its white coat is true of Nordmarka's
  edge) drawn in the hedgehog's place with the same box, speed, behaviour and frame count is a
  drawing change only: do that, by the methods of orders 23 to 27 (per-pixel maps, the level's
  lean when glammed, the red outline), keep the hedgehog wherever else it is met, show both at
  four times size and in place, and prove Holmenkollen's run files unchanged. Record it in
  `thematic.md` and `conversations.md` as done on the planner's reading of Lars's "Also keep
  enemies thematic", easy to undo.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources for the figures tool and anything new in the harness); DESIGN where a rule
changed; an ADR only if a decision was made or reversed;
`apps/viking/tools/review/o35/after.md`, one section per item. LEVELS.html's pictures retaken
with `apps/viking/tools/pictures.ts` where they changed; say which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside the app and from the repo root;
  `bun run build` clean; first script under 60 kB.
- Front page 28 of 28; run files as said above; every level's pictures by day and night at
  390 x 844 byte-identical with `origin/main` except Holmenkollen where the hare stands.
- Perf: no place more than +100 rectangles a frame, none over 15,000.

## If you cannot do all of it

Order: item 1; item 2; item 3 in the order written. Finish each properly before the next.
Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why. The suite's time, three runs, and per-file times.
2. The figures directory and its `figures.json`; pictures for item 3 in
   `~/.cache/claude-scratch-larshansen/o35/shots/` (not `/tmp`).
3. Tests, tsc, first-script size, front page, run files, perf at all places.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
