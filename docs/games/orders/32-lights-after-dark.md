# Order 32: lights after dark

Written 21 November 2026, after order 31. Lars is away; his standing words are in
`docs/games/handbook/conversations.md` ("keep looking for more assets that should have increased
details. and consider them with the rest of the game. interaction, fit, thematics, etc. ...
remember to write docs too btw."). Like order 31, this order touches nothing that waits on him:
no story words, no change to the encore's fight, no forgiveness numbers, no difficulty.

Order 31 found that Korketrekkeren's lamps do not come on after dark while Vigelandsparken's
gate lanterns do. That is one case of a wider question nobody has asked of the whole game: when
a level is seen under dusk or night, is every thing that should give light lit, and does
nothing glow that should not? This order asks it everywhere, then pays order 31's leftovers.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons, roadmap), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0035, 0036, 0039 to 0053,
  and `apps/viking/tools/review/o28/`, `o30/`, `o31/` (each `before.md` and `after.md`).
- `git fetch origin`; branch `lights-after-dark` from `origin/main`. First commit: this order,
  as `docs/games/orders/32-lights-after-dark.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. The words in
  `game/story.ts` and the limits in ADRs 0050 and 0052 are not yours to change.
- No route, box, speed or timing changes: sloppy run files for Langkaia, Nordmarka, Bjørvika,
  Gamlebyen, Slottet and the encore on seeds 201 to 260 byte-identical with `origin/main`.
- Front page 28 of 28 byte-identical. First script under 60 kB (59.60 now: there is almost no
  room, so new drawing goes in the lazy chunk or replaces something; if you can win bytes back
  in the first script without changing a pixel, do, and say how).

## Part one: every light, in every level, after dark

1. **The table.** Walk every level, the encore and the map at 390 x 844 and 1280 x 800 with
   `&sky=night` and under each level's own sky. In `apps/viking/tools/review/o32/before.md`
   list every thing that would give light in the real place (street lamps, lanterns, torches,
   windows, tram and train windows, signs, the stage, braziers, the sauna's stove, a lighthouse,
   boats' lamps) and every thing that glows now:

   | Thing | Where | Lit after dark now? | Should it be? | Lights what is near it? | Decision |

2. **Make it consistent.** One rule, written in DESIGN and held by a test: a thing that gives
   light is drawn at its own colour over the dark (as Vigelandsparken's lanterns and order 31's
   tram windows are), with a small warm pool where that helps the player see the lane, and
   nothing else glows. Start with Korketrekkeren's lamps (order 31 suspects the dusk drawn in
   front of them in `levels/korketrekkeren.ts`). The limits:
   - ADR 0050: neon belongs to the glamour only. A lamp's light is warm and natural, never a
     neon of `ROLES.glamour`, and may not be mistaken for a coin, a rune, a door's cyan or a
     platform's yellow top (ADR 0044). Measure the nearest role colour as the palette test does.
   - A light may never hide or dim a red outline, and Nordmarka's dark stays as dark as order
     31 left it away from lamps.
   - Reduced motion: flicker is held still (order 31's test must cover any new light).
   - Perf: lights are kept pieces, copied (ADR 0036, 0041, 0045).
3. **By day nothing changes**: every level's daytime pictures byte-identical with
   `origin/main`, except where part two redraws a thing.

## Part two: what order 31 left

4. **The flattest things left in the lane**: Akerselva's logs and Holmenkollen's chairlift
   chairs. Redraw both by ADR 0051's rules (of their place, natural, quieter than the figures);
   the logs keep ADR 0044's yellow top if he stands on them, and their boxes do not move.
5. **The red outline against an invader's own orange glow** measured 22.7 in Nordmarka's dark
   (33.8 against the forest). Bring it to at least the daytime figure (29.2) without lightening
   the dark, for example by a thin dark gap between ring and glow; put the case in the palette
   test.
6. **The reduced-motion test's blind spots**: things whose position comes from the clock
   (carriers, timetable trains, ledges, jumpers) are watched only while still, and `main.ts`'s
   and `render/feel.ts`'s own drawing is not drawn by it. Cover what can be covered: a moving
   thing may move, but its drawing at a given position must not depend on the clock otherwise.
   Keep the file's time under 90 s; say what still cannot be covered and why.
7. **Norwegian, the three unphotographed**: the touch notes, the shield's touch words and the
   encore's hints after a miss, at 360 wide in both languages. Fix what overflows (outside
   `story.ts`).

## Docs, in the same change

HANDOVER; the handbook (start-here's table; roadmap's status table, "In flight", "Next";
lessons; resources if a tool or debug flag was added); DESIGN (the rule for lights, for a level
author); an ADR (0054) for the lights rule, since it is a decision;
`apps/viking/tools/review/o32/after.md` with one section per item: done, partly, not, and why.
LEVELS.html's pictures retaken with `apps/viking/tools/pictures.ts` if any changed, and say
which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside the app and from the repo root;
  `bun run build` clean; first script under 60 kB.
- Front page 28 of 28; run files as said above; the map with any rune missing pixel-identical
  to `origin/main` by day.
- Perf at 390 x 844, measured on `origin/main`'s build and yours at the same places, by day and
  by night: no place more than +150 rectangles a frame, none over 15,000.

## If you cannot do all of it

Do the items in the order given; finish each properly before the next. Docs for what was done
are never skipped.

## Hand back

1. Per item: done, partly, not, and why. The table with its decisions.
2. Pictures in `~/.cache/claude-scratch-larshansen/o32/shots/` (not `/tmp`): one folder per
   item; for part one every level at night before and after, side by side, at both sizes.
3. Tests, tsc, first-script size, front page, run files, perf, the contrast numbers.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
