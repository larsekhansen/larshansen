# Order 26: the ground under him

Written 16 November 2026, after order 25. Lars chose way 3 for the pixels (ADR 0045): same
grid, better drawn. Orders 23 to 25 did everything that moves or is picked up. What he stands
on and walks past is still flat rectangles: the research record
(`docs/games/research/2026-11-16-reference-games.md`, section 1, "Tiles") found that the games
with our grain texture every tile: a lit top edge, a shadowed bottom edge, moss, cracks. This
order does that for the lane: ground, walls, platforms' bodies, crates, stairs, and the props
he passes at arm's length. The far backdrops stay quiet (ADR 0044's value band): figures must
still stand off the ground.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, `docs/games/GRAIN.md`,
  the research record, ADRs 0003, 0014, 0035, 0036, 0039 to 0048, orders 22 to 25.
- `git fetch origin`; branch `the-ground` from `origin/main`. First commit: this order, as
  `docs/games/orders/26-the-ground.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port and any headless browser you started when done.
- ADR 0003 and ADR 0014 stand. No route, box, speed or timing changes: sloppy run files for
  Langkaia, Akershus, Stortinget and Bygdøy on seeds 201 to 260 byte-identical.
- The front page shares the kit's ground drawings: everything here is opt-in for the viking
  game; front page 28 pictures byte-identical.
- First script under 60 kB.

## 1. Look first

For every level, list each kind of surface in the lane (planks, cobbles, brick, granite,
concrete, snow, earth and grass, rock, roof tiles, metal decks, ice) with where it is drawn and
how (rectangles a tile, kept strip, stamp). Take a 3x crop of each at 390 x 844 by day and
under its own sky. Put the table in `apps/viking/tools/review/o26/before.md`.

## 2. Each surface, drawn once as a textured piece and copied

For each kind: a small set of tiles (three or four variants so repeats do not show, plus a top
edge, a left and right end, an inner corner where the level has one), drawn pixel by pixel:

- a lit top edge one pixel lighter where the sky reaches it, a shadowed foot where it meets
  what is below, a darker joint between stones or planks;
- the material's own grain: plank grain and nail heads, a chipped cobble, moss in a wall's
  shadowed joints, a crack, a drain cover, salt stains at a quay's waterline, snow with a blue
  shadow side and a few sparkles, grass tufts over the edge of earth, rivets on steel;
- three to five tones of one hue, all inside a narrow band: the lane's ground may not come
  closer to any role colour than it is today (palette test), and its contrast stays below the
  figures' (measure as order 22 did for backdrops, and add the ground to that test with its
  own band);
- the yellow paint of ADR 0044 sits on top exactly as now.

Variants are picked by a hash of the tile's column and row, so a level looks the same every
visit and the pictures are stable. Everything is drawn once into kept pieces and copied
(ADR 0036, 0041): no place may gain more than 200 rectangles a frame, and none exceed 15,000.

After dusk and in the dark levels the tint applies as now; check the lit edge does not glow.

## 3. Props at arm's length

Benches are done. The same treatment for what stands in the lane and is not an enemy: crates,
barrels, bollards, lamp posts, signs' posts, railings, ladders, doors, the T-bane doors and
platform furniture, the sauna, market stalls, ski racks: whatever section 1 finds. Things he
uses keep the "use" cyan corners exactly as they are.

## 4. Docs

DESIGN (a rule for level authors: surfaces come from the textured set, how to add one),
HANDOVER, an ADR for the textured ground and its band, GRAIN.md's status, LEVELS.html pictures
retaken, `o26/after.md`.

## Measures that must hold

- `bun test` green in all four packages; `tsc --noEmit` and `bun run build` clean; first script
  under 60 kB.
- Front page 28 of 28 byte-identical.
- Run files as said above.
- Perf table for every level at 390 x 844 against `o23/perf.md`.
- A test that every solid tile kind used by any level has a textured piece, and that the
  ground's tones hold the band.

## Hand back

1. Per surface and per level: done, partly, not done and why.
2. Pictures in `/tmp/shots-ground/`: each surface at four times size, and every level before
   and after at 1280 x 800 and 390 x 844, day and its own sky.
3. The contrast numbers: figures against ground before and after.
4. Perf, tests, first-script size, front page comparison, run files.
5. What only a person can judge, as a list for Lars.
6. Departures, doubts, found and not fixed. Branch and commits. Confirm no preview server or
   headless browser of yours is left running.
