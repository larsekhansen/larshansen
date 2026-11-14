# Order 13: the look, the words and the last unfair places

Written 14 November 2026, after order 12 (PR #57) was merged and deployed. Order 12 fixed the rules
and the fairness the adversarial review (`docs/games/reviews/2026-11-14-adversarial.md`) asked for.
This order takes the review's section H (is it one game?), what order 12 handed back as missed, and
what the reviewer of order 12 saw in its screenshots. It is the last planned order: when it is done
the game should read as finished.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0011, 0014,
  0016 to 0020, the review's section H, and `apps/viking/tools/review/README.md`.
- `git fetch origin`, work on a new branch `look-and-words` from `origin/main`. Commit as you go.
  Do not push; the planner reviews, pushes and merges.
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) when you are done.
- Privacy (ADR 0014) stands: no street address, nothing about a wedding, in the repo or the game.
- The body's `MOVE` and `JUMP` do not change (ADR 0003).
- The front page must not change: its 28 pictures must be byte-identical to
  `/tmp/shots-before-jernhaugen/` (taken after order 12; addresses are the `:5180` lines of
  `/tmp/shots-urls.txt`). If that folder is gone, take them from `origin/main` first.

## Known trap in the screenshot tool

`tools/shots.ts` lets Firefox take the picture at the page's load event. Against a **built** page,
`?debug&auto` now needs three fetches after load and the picture comes out blank (sky and water
only). It is a race, not a game bug: through a page that holds the load event back five seconds
the same address shows the level played. Step 0 fixes the tool.

## Step 0: the screenshot tool waits

Give `tools/shots.ts` a `--wait=<ms>` option (default 0) that serves a small wrapper page from a
local port: the address in an `<iframe>` filling the window, and an image from a `/slow` route
that answers after the wait, so the load event comes late. With `--wait` the picture is of the
wrapper. Document it in the tool's header comment and in DESIGN's line about screenshots. Check
that `?debug&auto&steps=2200&level=slottet` against the built preview shows the level.

## Step 1: the look (review H1 to H4, H6)

Look at every level first: six spots per level by day, and the night levels at night
(`bun apps/viking/tools/review/urls.ts 6` gives addresses). Then fix what is there, at least:

1. **Flat areas (H1).** Akershus's outer wall (cols 30 to 45), Rådhuset's tower faces, Stortinget's
   rock above the platforms (rows 0 to 9), Ekeberg's quarry wall, the open water at the bottom of
   Ekeberg and Langkaia. Break each with what belongs there, drawn from the kit where the kit has
   it: arrow slits, moss and darker courses, a drainpipe, iron ties, clock and reliefs on the town
   hall, strata and drill marks in rock, cable trays and a station name in the metro, a buoy, a
   moored boat, seaweed and a deeper band in the water. No new flat pattern laid over an old one:
   a few placed things, not a texture.
2. **Trams sink into the street (H2).** Ekeberg's tram mid-move, and the trams beside Nabolaget's
   last slot. Wheels sit on the rail; nothing of the tram is drawn below the street surface.
3. **The district banner (H3).** Readable from its first frame over every sky, Ekeberg's bands and
   Holmenkollen's snow included: a dark outline or a plate behind it, the same in all levels and
   on the map.
4. **The yellow house at night (H4).** In Nabolaget it reads brown. It should read as a yellow
   house at night (lit windows, a warmer wall under the tint, or a lamp on it).
5. **Enemies at night (H6).** Langkaia follows Oslo's clock, so most evening visitors meet the
   first enemies in the dark. Every enemy and every hazard gets a one-pixel light rim or eye-shine
   under the night tint, in all levels that can be dark. Skilling must not be dim at night.
6. **Slottet's digs.** The strip of the far kerb drawn across each dig looks like a slab one could
   walk on. Make the digs read as holes: darker, lower, broken, or drop the strip inside the
   barriers.
7. **Upright phones.** At `--size=390x844` the help line runs off both edges, he stands at the very
   bottom with empty height above, and in Nordmarka a tree trunk runs up as a brown bar to the top
   of the screen. Wrap or shorten the help line; put him about two thirds down with ground under
   him; background things must end properly however tall the view is. Check all ten levels and
   the map at that size, and one at `--size=844x390` (a phone on its side).
8. **The bosses' bubbles and hints.** They work; make them belong: same board as the signs or one
   bubble style used everywhere, never over him or over the boss's weak spot, readable at night.

## Step 2: the words (H5 and what order 12 added)

Read every line the game can show, in both languages, in one sitting: signs, cards, hints, help
lines, the loading board, the failed-load card, button labels, what is said to screen readers.
One dry voice, two lines at most on a sign, no exclamation marks, the terms of ADR 0016.

- Holmenkollen: "Og flyr deg over juvet." becomes "Og sender deg over juvet."
- Stortinget: "Dørene lukkes" is a quote, not a place name: "Doors closing" in English.
- The lines order 12 added (boss hints, Game over at a boss, loading, touch words, help line) are
  first drafts: rework any that do not sound like the rest.
- Norwegian must be idiomatic bokmål. If unsure of a phrase, choose the plainer one.

## Step 3: the last unfair places

Order 12's own numbers (`apps/viking/tools/review/after/`) leave these. Fix the place, not the
number: one problem at a time, and room to recover.

| Place | Now, at ±4 | Wanted |
|---|---|---|
| Rådhuset, the pool bells (127 to 131 worst) | 0.68 hearts a try; Game over in 8 of 30 runs with mistakes | no single jump over 0.4; Game over in at most 2 of 30 with mistakes |
| Nordmarka, the bogs (77 to 81 worst) | 0.62 a try, 4.2 hearts a run | at most 0.4 a try, at most 4 a run |
| Ekeberg, 50 to 75 at the first gust | 0.62 a try | at most 0.4 |
| Langkaia, boat to longship | 0.50 a try, 1.8 hearts a run | at most 0.3 a try, at most 1.5 a run; it is level 1 |
| Akerselva, the logs | about 0.47 each | at most 0.35 each |
| The plough | three naive strategies reach Game over in under a minute | none in under 75 s; a first hint within 10 s for all |
| Stortinget's locals | 6.6 and 6.2 s worst wait | about 5 s |
| Standing still | Rådhuset 38 %, Akerselva 37, Nordmarka 36, Stortinget 37 | each at or under a third, or say why not |

Slottet stays the easy breather (0.5 hearts a run is accepted; the level table in DESIGN should say
it is the rest before the mountain). Stortinget at 1.6 is accepted too.

Add a test for order 12's untested rule: no enemy's patrol within three tiles of the take-off or
landing of a route jump over a pit or water (take the jumps from the routes; list any deliberate
exception by name in the test).

Rerun the sloppy study for every level you touch and put the numbers in
`apps/viking/tools/review/after13/`.

## Step 4: docs and the plan page

- `docs/games/LEVELS.html`: retake all ten level pictures and `kart.png` into `docs/games/shots/`
  (same names, 1280 x 800, a spot that shows the level at its best), and bring every number on the
  page up to date (columns, clear time, enemies, skilling, flags) from the code, not by hand where
  a script can do it. The planner republishes the page.
- `docs/games/HANDOVER.md`: the state after this order; what is still weak, honestly.
- `apps/viking/docs/DESIGN.md`: whatever changed.
- An ADR for any decision made or reversed (the next number is 0021).

## Measures that must hold

- `bun test` green in `packages/pixelkit`, `packages/maze`, `apps/landing`, `apps/viking`; the
  viking suite under two minutes; `tsc --noEmit` clean.
- `bun run build` clean; viking's first script at most 60 kB gzipped (57.84 now).
- Scripted clears, the reach search and the dead-end search still pass; no bracteate reachable
  without the feather.
- The front page's 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`.
- No level worse at ±2 or ±4 than in `tools/review/after/`.

## Hand back

1. Per item above: done, partly (with the number), or not done and why.
2. Before and after pictures of every visual change in `/tmp/shots-look/`, named for what they
   show, with the night and upright-phone ones included.
3. The table of Step 3 with the new numbers.
4. Every changed line of text, old and new, both languages.
5. Departures from this order, doubts, and anything found and not fixed.
6. Branch, commits, test results, first-script size, the front page comparison.
