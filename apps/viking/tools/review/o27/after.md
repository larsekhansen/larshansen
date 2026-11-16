# Order 27: the measures

Measured on the night of 16 November 2026 on branch `the-neon-invaders`.

## Run files

The sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, on `origin/main` (8ec62d9, in a separate worktree) and on the
branch with every part of the order in it: every run's record byte-identical (`cmp`) for Langkaia, Slottet, Nordmarka and
Gamlebyen. Nothing the rules keep was touched: the stomp, the natural selves, the rune's ring, the glow, the scenery and the
stings are drawing and sound only.

| Level | ±2 | ±4 |
|---|---|---|
| Langkaia | clear 59/60, 0.15 hearts a run | clear 55/60, 0.77 |
| Slottet | clear 60/60, 0.05 | clear 60/60, 0.32 |
| Nordmarka | clear 59/60 (1 Game over), 0.65 | clear 56/60 (4 Game overs), 2.00 |
| Gamlebyen | clear 60/60, 0.47 | clear 59/60, 1.07 |

## Tests, types, builds

- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking (see the hand-back for the final count; 419 pass at part
  (c), with the new `alive/natural.test.ts` and `alive/invasion.test.ts`).
- `tsc --noEmit` clean in all four; `bun run build` clean in the viking game and the front page.
- The first script: 59.51 kB gzipped as vite reports it (59.06 after order 26; the budget is 60).

## Perf

See `perf.md` (the rectangles a frame at order 23's 73 places, against order 26's table).
