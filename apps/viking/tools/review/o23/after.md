# Order 23: the measures

Measured 16 November 2026 on branch `alive` (from `origin/main` at `19d1b84`, after order 22), on a Pi busy with the
order's own runs, so times are long; counts are not.

## Sections 1 to 3 changed no rule

The sloppy player (`fresh.ts`, ADR 0034) on seeds 201 to 260, ±2 and ±4, with the edge's forgiveness held at its old 6
steps (`JUMP.coyoteSteps = 6` set before `fresh.ts` is loaded), against the same runs on `origin/main`: every run's record
byte-identical on the four levels the order names.

| Level | md5 of the runs, order 22 | md5, order 23 with 6 steps | hearts a run ±2 / ±4 |
|---|---|---|---|
| Langkaia | `48cecf7409db` | `48cecf7409db` | 0.15 / 0.77 |
| Holmenkollen | `18922a6cdd8b` | `18922a6cdd8b` | 0.10 / 0.27 |
| Nordmarka | `58bfcf501657` | `58bfcf501657` | 0.65 / 2.00 |
| Gamlebyen | `54db73ff6304` | `54db73ff6304` | 0.47 / 1.07 |

(Nordmarka and Gamlebyen are the same as order 19's and order 22's.)

## Section 4: the edge, 6 steps to 10

- The sloppy player, all sixteen levels, 1,920 runs: 55 better, 31 worse, 1,834 the same (`sloppy-edge.md`, seed by seed).
- The reach search with a late jump off an edge: no bracteate reachable without the feather in any level, every rune
  reached both ways; new spots only in Akershus (5), Holmenkollen (20), Slottet (8) and Vålerenga (16), none past a gate or
  in a boss's fight (`reach-edge.txt`; ADR 0048).

## Tests, build, budget, front page

- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 405 pass (392 after order 22, and 13 new: the frames'
  test, the things in front, the shadow's palette test), 0 fail anywhere. The viking suite took 216 s with the Pi busy.
- `bunx tsc --noEmit` clean; `bun run build` clean.
- First script 59.44 kB gzipped (59.85 after order 22): the shared enemies' and the small things' old drawings and `parts`
  moved to `feel`'s file (16.7 kB gzipped now, fetched with the first scene; 8.5 kB before).
- The front page: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`, with the edge's forgiveness at 10 and the
  enemy palette's two shades in the kit.

## Rectangles a frame

Every place of every level draws fewer than order 22's code at the same place (141 to 4,884 fewer); none near 15,000
(the most, Holmenkollen, 11,618). See `perf.md`.
