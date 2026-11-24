# Order 42: room, and the edges of the screen

Written 24 November 2026, after order 41. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or word. Two things
have built up over orders 36 to 41 and are now in the way of every later round: the first
script stands at 58.65 kB of its 60 kB (ADR 0035), and a handful of things still sit under a
phone's notch or home bar, or under each other, because orders 37 and 41 were not allowed to
move a touch target. This order makes room and clears the edges.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014,
  0016, 0019, 0035 (the budget and what may be lazy), 0036, 0039 to 0056, orders 21, 35, 37
  and 41, and `apps/viking/tools/review/o37/` and `o41/` (`before.md`, `after.md`).
- `git fetch origin`; `git checkout --no-track -b room-and-edges origin/main`. First commit:
  this order, as `docs/games/orders/42-room-and-edges.md`. Commit as you go. Do not push, do
  not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine. Stop preview servers by port (`fuser -k <port>/tcp`) and kill
  your own headless browsers by PID when done; remove the `/tmp/tmp-*.xpi` files your browsers
  leave. Never `pkill -f` with a pattern that matches your own command line. Pictures go
  under `~/.cache/claude-scratch-larshansen/o42/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change; no word changes.
- No rule changes. Sloppy run files on seeds 201 to 260 for all 16 levels and the encore
  byte-identical with `origin/main`; the maze's runs and ghost replay identical. Front page
  28 of 28 (the front page's own files are not touched; where the kit is shared, the front
  page's pictures are the proof).

## 1. Room in the first script

58.65 kB of 60. Win back room without changing anything a player sees or when they see it.

- First measure: what is in the first script, by module, in gzipped bytes (a table in
  `apps/viking/tools/review/o42/before.md`), and for each: is it needed before the first
  frame of the map or of a level, or only later (a card kind met once, a boss, a level's own
  look, the records, the encore, anything behind a door).
- Then move what is only needed later into lazy files that already exist where it fits, by
  the rules of ADR 0035, and take out what is dead or said twice. Nothing may pop in late:
  where a thing moves, show that it is there by the frame it is first drawn (the existing
  tests for lazy loading, and one new picture per moved thing at its first frame, identical
  with `origin/main`).
- The aim is 56 kB or less. If you reach it only by something doubtful, stop short and say
  where you stopped. Every level's pictures by day and night at 390 x 844 byte-identical
  with `origin/main` after this item alone (commit it before item 2).
- Say what the first frame costs in requests before and after (no more requests before the
  map's first frame than now).

## 2. The edges

With a pretended notch and home bar (`&safe=`), in both languages, at 390 x 844 and
844 x 390 and at 360 x 640 and 667 x 375 (a short phone):

- The story's opening card and the maze's level list reach 11 px into the home bar's strip
  on a phone on its side. Here a touch target may move, as little as it must: keep a card's
  height off the safe bottom so its button stands clear (and the card scrolls if its words
  do not fit), and the same for the maze's list in both pages. Show before and after, and
  that on a phone with no notch nothing moves at all (pictures byte-identical there).
- At the first visit the place-name plate comes up under the opening card: hold it back
  until the card has gone.
- On the map on its side, a board lowered by order 41's rows can come close to or under the
  move pad (Ekeberg's, line 1 nearly done). Keep boards clear of every pad control and of
  the notch; hold it in `levels/kart.test.ts` beside the boards' own rule.
- Then look once more for anything else under the notch, the home bar, the pad or another
  element on every screen kind at those four sizes, list what you find, and mend what can
  be mended without moving anything a thumb expects on a phone without a notch.

## 3. Two small marks left

- A speech bubble on white snow or a cloud has no edge (the kit's bubble, shared with the
  front page). Give the viking page's bubbles an edge on pale ground without changing the
  kit's default (the front page must stay 28 of 28): a thin line of the game's dark, by a
  parameter the viking page sets.
- The "!" over a thrower is two art pixels wide. Make it three with a dark edge if that
  reads better in place on snow, marble and the dark; keep the old if not. It stays the
  warning's colour (ADR 0044).

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next",
"Known debts"; lessons; resources); DESIGN where a rule changed; ADR 0035 amended with what
moved and the new measure, ADR 0043 or whichever holds the safe area amended for the cards;
`apps/viking/tools/review/o42/` (`before.md`, `after.md`). LEVELS.html's pictures retaken
with `apps/viking/tools/pictures.ts` where they changed; say which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; the first script's bytes before and after, per step; the viking
  suite's time said against `origin/main` the same hour (add no more than 10 s).
- Front page 28 of 28; run files as said above; every level's pictures by day and night at
  390 x 844 byte-identical with `origin/main` except where item 3 shows, each named.
- The maze page's first script no larger than now (32.12 kB).
- No place more than +50 rectangles a frame at 390 x 844.

## If you cannot do all of it

Order: item 1; item 2; item 3. Finish each properly before the next. Docs for what was done
are never skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o42/shots/`: per item, before and after.
3. Tests, tsc, sizes (bytes per step, every file that grew), requests before the first
   frame, front page, run files, the maze's runs, cost a frame.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
