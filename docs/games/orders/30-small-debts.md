# Order 30: small debts

Written 21 November 2026, after order 29 and the weekly reset. Orders 27 to 29 each handed back
a short list of things found and not fixed. This order pays them, and adds nothing new. It is
the candidate recorded in `docs/games/handbook/roadmap.md` ("Next").

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0035, 0036, 0039 to 0052,
  and `apps/viking/tools/review/o27/`, `o28/`, `o29/` (each `after.md`).
- `git fetch origin`; branch `small-debts` from `origin/main`. First commit: this order, as
  `docs/games/orders/30-small-debts.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port and kill your own headless browsers by PID when done.
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. The words in
  `game/story.ts` and the limits in ADRs 0050 and 0052 are not yours to change.
- No route, box, speed or timing changes: sloppy run files for Langkaia, Nordmarka, Bjørvika,
  Gamlebyen and the encore on seeds 201 to 260 byte-identical with `origin/main`, except where
  item 3 below changes the encore on purpose (then say exactly what changed and why).
- Front page 28 of 28 byte-identical. First script under 60 kB (59.34 now).

## The debts, in order

1. **Langkaia without the lazy file (order 28).** If feel's file fails to load, Langkaia's
   cabins, walls, tower, boat and posts are not drawn. Give them a plain fallback (flat
   rectangles are fine) that costs as few first-script bytes as possible, or show clearly why
   none is needed (for example, the level cannot start without the file). Add a test that every
   level draws every solid thing with the lazy file absent.
2. **The encore's stop on the map does not glow at night (order 29).** Make its neon glow after
   dark the way the invaders' does, until the encore has been seen.
3. **Loki's club is small (order 29).** Make the raised club read at phone size as the troll's
   does, drawing only: the tell's length and the hit box do not change.
4. **No prefetch for the encore (order 29).** When the map is shown with every rune held,
   fetch the encore's chunk in idle time so the first visit has no loading board. Nothing is
   fetched with a rune missing.
5. **Reduced motion, in pictures (orders 27 and 29).** Nothing was photographed with
   `&reduced`. Take every boss (troll, plough, serpent, Loki) at its tell and its hit, a stomp
   on an ordinary invader, the rune's ring, a thrown shot, and the map's mirror balls, with and
   without `&reduced`. Fix anything that still moves, flashes or flies when it should not. Add a
   test where one is missing that no drawing path under reduced motion reads the frame clock
   for flashing.
6. **Line 2's ending card was never photographed (order 27).** The screenshot tool's wait could
   not reach it. Add a debug way to show a level's end card directly (as `&told` and `&seen`
   were added), photograph line 1's and line 2's ending cards and the encore's at 390 and 1280
   in both languages, and fix any line that overflows.
7. **A kind met in several levels was looked at only in its first (order 27).** For each enemy
   kind that appears in more than one level, take it in place in every level it appears in, by
   day and under that level's sky, and check its lean's two neons against that level's
   backgrounds by eye and by the palette test. Fix what reads badly; list what you changed.
8. **`tsc` from the repo root (order 28).** `bunx tsc --noEmit -p apps/viking` from the root
   reports `main.ts:540` while tsc inside `apps/viking` is clean. Find out why and make both
   clean, or write down why they differ in `lessons.md`.

## Docs, in the same change

HANDOVER; the handbook (start-here's table, roadmap status and "In flight" and "Next", lessons,
resources if a tool or debug flag was added); DESIGN where a rule changed; an ADR only if a
decision was made or reversed (a fallback policy for the lazy file would be one);
`apps/viking/tools/review/o30/after.md` with one section per debt: paid, partly, not, and why.
LEVELS.html pictures retaken if any changed.

## Measures that must hold

- `bun test` green in all four packages; tsc and `bun run build` clean; first script under 60 kB.
- Front page 28 of 28; run files as said above; the map with any rune missing pixel-identical
  to `origin/main`.
- Perf at 390 x 844 against `o29`'s numbers: no place more than +100 rectangles a frame.

## If you cannot do all of it

Pay them in the order given; finish each properly before the next. Docs for what was done are
never skipped.

## Hand back

1. Per debt: paid, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o30/shots/` (not `/tmp`): one folder per debt,
   before and after where something changed.
3. Tests, tsc, first-script size, front page, run files, perf.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
