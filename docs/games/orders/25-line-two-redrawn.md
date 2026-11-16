# Order 25: line 2 redrawn

Written 16 November 2026, after order 24 (PR #70). Lars chose way 3 for the pixels (ADR 0045).
Orders 23 and 24 drew him, all of line 1 and the shared things that way. This order finishes
the game: line 2's own kinds, the sea serpent, and whatever else `o24/old-style.md` lists, so
that after it nothing that moves or is picked up is drawn in the old style.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, `docs/games/GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036, 0039 to 0048, orders 23 and 24, `apps/viking/src/alive/`,
  `apps/viking/tools/review/o24/old-style.md` (your work list).
- `git fetch origin`; branch `line-two-redrawn` from `origin/main`. First commit: this order, as
  `docs/games/orders/25-line-two-redrawn.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port and any headless browser you started when done.
- ADR 0003 and ADR 0014 stand. No route, box, speed or timing changes at all: sloppy run files
  for Bygdøy, Vigelandsparken, Østensjøvannet and Gamlebyen on seeds 201 to 260 byte-identical
  before and after. `JUMP.coyoteSteps` stays 10: that choice is with Lars.
- Front page 28 pictures byte-identical. First script under 60 kB (58.86 now): each level's
  kinds in that level's chunk.

## 1. Way 3 for line 2

Everything `o24/old-style.md` lists as left, as per-pixel frames (idle, cycle, wind-up,
three-frame death), three to five tones a material, a lit side, an eye where it has one, inside
ADR 0044's outlines and palette test:

- **Enemies**: crab, penguin, slinger (Bygdøy); statue, bronze, boy, ringer (Vigelandsparken:
  the statues are stone and bronze, so the tones are the material's: verdigris in the bronze's
  shadows, lichen on the stone; the moment a watched statue turns must stay exactly as readable
  as it is); sledger (Korketrekkeren); swan, coot, the lake's duck, nester (Østensjøvannet);
  riveter (Bjørvika); archer, the bishop's guard, goose, dog (Gamlebyen).
- **The sea serpent**, every state (ring, rising, reared, spitting, dazed, tail): scales with a
  lit ridge, a pale belly, an eye; its "now" violet and every tell where they are.
- **Harmless movers and thrown things** still listed (the heron, line 2's shots, and any other).
- **Anything else that moves or is picked up** that you find still in rectangles while walking
  all sixteen levels and the map (carriers' passengers, the boat's crew, the figure on the map,
  birds that are scenery near the lane): list what you found, redraw what fits.

Each must read at 390 x 844 at its real size: look at every one there, by day and under its
level's own sky, before calling it done.

## 2. What order 24 said a person should judge, made better where pictures can tell

1. The wasp and the flying pigeon are small and thin, the track rat's rising frame is a blob,
   the kid's hat reads like hair at real size: one more pass on each silhouette.
2. The troll's shading is barely visible in the dark: after dusk its lit side takes the level's
   rim light a little more (drawing only, inside the palette test).
3. Pictures of what order 24 did not picture: the serpent's frames, the falling feather, the
   bracteate and the shield in place.

## 3. Docs

`o25/old-style.md`: what is left, which should be nothing (or say exactly what and why).
DESIGN, HANDOVER, GRAIN.md's status, LEVELS.html pictures retaken.

## Measures that must hold

- `bun test` green in all four packages; `tsc --noEmit` and `bun run build` clean; first script
  under 60 kB.
- Front page 28 of 28 byte-identical.
- Run files as said above.
- Perf: no place more than 200 rectangles a frame over `o23/perf.md`, none over 15,000.

## Hand back

1. Per item: done, partly, not done and why.
2. Pictures in `/tmp/shots-line2/`: a frame sheet per figure at four times size, and each in
   place at 390 x 844 by day and under its own sky, before and after.
3. Perf, tests, first-script size, front page comparison, run files.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm no preview server or
   headless browser of yours is left running.
