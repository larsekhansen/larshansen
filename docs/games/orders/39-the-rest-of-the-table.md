# Order 39: the rest of the table

Written 23 November 2026, after order 38. Lars has not played yet ("carry on as planned"), so
nothing is retuned: no route, box, speed, timing, hearts, enemy placement or story word.
Order 38 ranked every figure and redrew the worst; it left three enemies at a middling mark,
looked at the bosses, carriers, thrown things, pickups and most props on their sheets only,
and found one thing unfair with reduced motion. This order finishes the table.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap, conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036, 0039 to 0056 (0041 the order of reading, 0044 the warning red,
  0046, 0050, 0051), orders 23 to 28 and 38, and `apps/viking/tools/review/o38/` (`before.md`,
  `after.md`).
- `git fetch origin`; `git checkout --no-track -b rest-of-the-table origin/main`. First
  commit: this order, as `docs/games/orders/39-the-rest-of-the-table.md`. Commit as you go. Do
  not push, do not delete any branch.
- Bun only; run scratch scripts with `bun --no-install` and import by path (lessons.md, order
  38): nothing you run reaches outside this machine. Stop preview servers by port
  (`fuser -k <port>/tcp`) and kill your own headless browsers by PID when done. Never
  `pkill -f` with a pattern that matches your own command line. Pictures go under
  `~/.cache/claude-scratch-larshansen/o39/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change.
- Drawing only, except item 2 as it says. Every redrawn figure keeps its box, frame count,
  timing, speed and behaviour. Sloppy run files on seeds 201 to 260 for all 16 levels and the
  encore byte-identical with `origin/main`; the maze's runs and ghost replay identical. Front
  page 28 of 28. First script under 60 kB (58.53 now).
- If a redraw does not read better than what it replaces, in place at phone size, keep the old
  one and say so.

## 1. The three left at 2, and the dweller

- **The bishop's guard** (Gamlebyen): "a blob with a spike at phone size". A kettle helmet, a
  tabard with a cross, a halberd whose blade reads; told from the plain guard by silhouette.
- **The coot** (Østensjøvannet): black, a white bill and shield on its brow, big lobed feet;
  that white on black is the whole bird and must survive the glamour's lean (ADR 0050) as a
  light mark on the head.
- **The squirrel** (Nordmarka, Ekeberg): a tail that is plainly a tail, ears with tufts; what
  it throws should look as if it came from its paws.
- **The mound-dweller**: three greys and no folds or hands; give the cloak folds and one
  hand, keep the eyes order 38 gave him.

By the methods of orders 23 to 28 and 38; each shown before and after at four times size and
in place at 390 x 844 by day, under its level's sky, glammed and natural (`?debug&natural`).

## 2. A still warning for the jumpers with reduced motion

Order 38 found that with reduced motion the salmon and the track rat show no tell at all
before they leap (so since order 23): the tell is a movement, and reduced motion holds it
still at nothing. That is unfair to exactly the players who asked for less motion. Give each
jumper a tell that does not move: a still mark that stands for the whole of the tell's time
(the broken water held at its fullest for the salmon; for the track rat whatever its tell
is, held), appearing and going once, no blink. Timing as the rules see it does not change;
run files identical. Hold it in the reduced-motion test (the mark is there for every step of
the tell, and nothing blinks), plant the fault, see it fail.

- Then check every other tell in the game the same way, bosses and Loki included: with
  reduced motion, is there something to see before each thing that hurts? A table in
  `o39/after.md`: each tell, what is seen with motion, what is seen without. Mend any that
  shows nothing, the same way. This is the planner's call on Lars's behalf as a fairness
  mend (ADR 0041), easy to undo; record it in an ADR amendment and in `conversations.md`.

## 3. The sheets order 38 did not see in place

Bosses and Loki, every carrier, what is thrown, pickups and props: photograph each in place
at 390 x 844 where it is met, by day and under the level's own sky. For each, in
`o39/before.md`: can it be told from the ground behind it. Measure it: the contrast between
the figure's rim and the pixels just outside it, by day and at night, and list the ten worst.
What is thrown matters most (it hurts and it is small). Mend the worst by the game's own
means (the outline rule, a rim light, a shade moved), not by changing a level's backdrop
unless that is the only way; nothing harmless goes toward the warning red (ADR 0044).

## 4. Keep the table honest

- Run the figures tool into `o39/figures/`; hand it back with one contact sheet of every
  changed figure's first row, before and after.
- Update `before.md`'s marks of order 38 in a copy for this order: no 3s, and each 2 that
  remains named with why it was left.

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources); DESIGN where a rule changed; an ADR amended for item 2;
`conversations.md` for item 2; `apps/viking/tools/review/o39/` (`before.md`, `after.md`).
LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` where they changed; say
which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; first script under 60 kB; the viking suite's time said (about 266 s
  alone; add no more than 10 s).
- Front page 28 of 28; run files as said above; pictures of every level by day and night at
  390 x 844 byte-identical with `origin/main` except where a changed figure stands, each
  difference named. With reduced motion off, nothing of item 2 shows.
- No place more than +50 rectangles a frame at 390 x 844.

## If you cannot do all of it

Order: item 2; item 1; item 3; item 4. Finish each properly before the next. Docs for what
was done are never skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o39/shots/`: per item, before and after.
3. Tests, tsc, sizes, front page, run files, the maze's runs, cost a frame.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
