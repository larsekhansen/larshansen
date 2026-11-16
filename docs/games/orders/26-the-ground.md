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

## 3b. The small flags (added the same evening)

Lars: "the tiny flag on the 17 of may are not detailed enough. also upgrade their detail level. so the falg isnt
ambiguous". Every small Norwegian flag in Slottet (17 May on Karl Johan): the hand flags the parade children and the crowd
wave, the banner bearers', flags on buildings, stalls and bunting, and the same small flags anywhere else in the game
(Holmenkollen's crowd, the map). Find them all first and picture each at 3x at 390 x 844 before changing anything.

What "not ambiguous" needs: red field, a blue cross with a white edge on both sides of it, the cross's upright nearer the
pole (not centred), proportions near 22:16. The smallest map that still carries all of that is about 7 wide by 5 high
(columns from the pole: red, white, blue, white, red, red, red; rows: red, white, blue, white, red, with the cross's arms
running full width and height); prefer 9 x 7 or the full-size game flag's drawing wherever there is room, and make the hand
flags a pixel or two larger if their present box cannot hold 7 x 5 (they are drawing only, no boxes). Keep the red a true
flag red even though it is near the warning red: a flag is unmistakable by its shape and cross, but check the palette test
and name the flags there as kept by shape if it objects. A wave of two or three frames if cheap. The kit's own flag (shared
with the front page) stays untouched: 28 pictures byte-identical. Perf budget as in the order (kept pieces, copied). Hand
back before and after crops of each kind of flag at real size and at 3x, by day and at night.

## 3c. Holmenkollen's spruces (added the same evening)

Lars: "in holmenkollen, the trees are all missing the top part. no spike. They should have one. either green or white".
Holmenkollen's spruces end in a flat tier with no pointed top. First find out why (picture them at 3x at both sizes: is
the tip not drawn, clipped by a kept piece's box or the canvas edge, or hidden under the header?), then give every spruce a
proper spire: a narrowing top of two or three pixels' steps ending in a single pixel, in the tree's green or snow-capped
white, whichever reads better against that sky (snow on the top and on the tiers' upper edges would suit Holmenkollen).
Check every layer of trees in the level (near row, far rows, split rows of order 23), and the same spruce drawing wherever
else it is used (Nordmarka, Korketrekkeren, the map): fix them all, and say where you did. Kept pieces' boxes must grow to
hold the tip. Scenery rule and haze of ADR 0044 hold; perf budget as in the order. Hand back before and after pictures of
each layer at both sizes.

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
