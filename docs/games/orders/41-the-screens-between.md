# Order 41: the screens between, and the last weak tells

Written 23 November 2026, after order 40. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or word. Orders 38
to 40 put every figure on one table and mended the worst. Nobody has yet laid the screens
that are not levels on a table the same way: the line map, the cards, what is drawn over a
level (hearts, coins, the touch buttons, the edge arrow, hints), pause, Game over, a level's
end, the records. A player sees them as often as any enemy. This order looks at them, and
finishes the tells order 40 left. All of it is drawing.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0016, 0019, 0035, 0036, 0039 to 0056, orders 21, 31, 37 and 40, and
  `apps/viking/tools/review/o40/` (`before.md`, `after.md`, `tells.tsv`).
- `git fetch origin`; `git checkout --no-track -b screens-between origin/main`. First commit:
  this order, as `docs/games/orders/41-the-screens-between.md`. Commit as you go. Do not
  push, do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path: nothing you run
  reaches outside this machine. Stop preview servers by port (`fuser -k <port>/tcp`) and kill
  your own headless browsers by PID when done; remove the `/tmp/tmp-*.xpi` files your browsers
  leave. Never `pkill -f` with a pattern that matches your own command line. Pictures go
  under `~/.cache/claude-scratch-larshansen/o41/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change; no word anywhere changes in this
  order (if a word is wrong or does not fit, write it down for the planner).
- Drawing only. Sloppy run files on seeds 201 to 260 for all 16 levels and the encore
  byte-identical with `origin/main`; the maze's runs and ghost replay identical. Front page
  28 of 28. First script under 60 kB (58.56 now: little room; the map, the cards and what is
  drawn over a level may live in the first script, so say what each change costs in bytes,
  and if the room runs out, say what you left).
- If a change does not read better than what it replaces, in place at phone size, keep the
  old and say so.

## 1. The last weak tells

Order 40 ranked every tell and mended the four weakest. Left: the welder's sparks at
Bjørvika (18 pixels), Bjørvika's own gust, the sinking stone at Gamlebyen and the heron,
which share the giving-way tell order 40 mended for the pad and the bundle. Mend each the
way order 40 mended its like (the gust as Ekeberg's, the stone and the heron as the pad),
and give the sparks a size a player can see. No timing changes as the rules see it. Each
held in `render/tells.test.ts` with motion and without. Before and after, motion and
reduced.

- The rune's stone at night and twilight is a dark edge on dark ground (6.7 to 19.3). Give
  it a pale rim on its lit side after dusk only (the light is from the top left; the moon
  will do), not a line all round. The planner's call, a look, easy to undo: record it where
  order 40 recorded the dark line (ADR 0044's amendment) and in `conversations.md`. Day
  pictures identical.

## 2. Look first: every screen that is not a level, on one table

Photograph, at 390 x 844 upright and 844 x 390 on its side, in both languages, with touch
(`&touch`) and without, and with a pretended notch (`&safe=`):

- the line map (line 1, line 2, with stations locked, open, done, and the door);
- every kind of card (the opening, a level's opening words, a boss's, the encore's, the end);
- what is drawn over a level: hearts (full, lost, the last one), coins and what else is
  counted, the touch buttons at rest and pressed, the edge arrow, a hint, the "!" of a
  thrower, the language and sound switches if drawn;
- pause, Game over, a level's end with its count, the records, the maze's own header;
- over three grounds each where it matters: a bright day level, snow, and the dark.

Write `apps/viking/tools/review/o41/before.md`: a table of every element with, for each:
can it be read at arm's length (contrast against the worst ground it stands on, measured as
order 39 did); is it drawn in the game's grain or is it a plain rectangle or bare text; does
it sit clear of the notch and of every other element in both languages; does its state
show (a locked station from an open one, a pressed button from one at rest, the last heart
from the others) by shape as well as colour; and a mark from 1 to 3. Rank the 3s.

## 3. Mend the worst, properly

From the top of your ranking, redraw as many as you can do well (expect five to eight), by
the methods of orders 23 to 28: GRAIN.md's ramps, light from the top left, the roles' colours
kept (ADR 0044: nothing harmless toward the warning red; the kit's reds are the kit's).
Nothing moves from where a thumb expects it: every touch target keeps its place and size
(the tests that hold them still pass). No element grows over the play area by more than two
pixels a side. With reduced motion nothing new moves. Each shown before and after in place,
upright and on its side, on its worst ground, in both languages where it carries words.

- State by shape: where a state shows by colour alone, give it a shape (a lock on a locked
  station, a tick on a done one, a cracked or hollow heart for one lost), if it is not
  there already.
- What you judge right as it is, leave, and say why in a line.

## 4. Keep the table honest

- `o41/after.md`: the table again with new marks; every 2 or 3 that remains named with why.
- Where a measure can be held, hold it in a test (every element drawn over a level at
  least a stated contrast from each level's ground under each sky; no two elements
  overlapping at 360 wide in either language), sharing a walk or recorder already made
  (roadmap, "Known debts": the suite's time).
- The figures tool rerun into `o41/figures/` if any sheet changed; say whether
  `figures.json` changed.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources); DESIGN where a rule changed; the ADR amendment and `conversations.md`
for the rune's stone; an ADR only if a decision was made or reversed;
`apps/viking/tools/review/o41/` (`before.md`, `after.md`). LEVELS.html's pictures retaken
with `apps/viking/tools/pictures.ts` where they changed; say which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; first script under 60 kB; the viking suite's time said against
  `origin/main` the same hour (add no more than 10 s).
- Front page 28 of 28; run files as said above; every level's pictures by day and night at
  390 x 844 byte-identical with `origin/main` except where a changed element or tell stands,
  each kind of difference named.
- No place more than +50 rectangles a frame at 390 x 844.

## If you cannot do all of it

Order: item 2; item 3 from the top of your ranking; item 1; item 4. Finish each properly
before the next. Docs for what was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why. Your ranking, and which you redrew.
2. Pictures in `~/.cache/claude-scratch-larshansen/o41/shots/`: per item, before and after.
3. Tests, tsc, sizes (bytes per change), front page, run files, the maze's runs, cost a frame.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed, words that are wrong or do not fit. Branch and
   commits. Confirm nothing of yours is left running.
