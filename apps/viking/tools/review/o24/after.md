# Order 24: the measures

Measured 16 November 2026 on branch `line-one-redrawn` (from `origin/main` at `bb40c59`, after order 23), on a Pi busy with the
order's own runs, so times are long; counts are not.

## Sections 1 and 2 changed no rule

The sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, with the edge at its 10 steps, before any change and after
sections 1 and 2: every run's record byte-identical on the four levels the order names.

| Level | md5 of the runs, before | md5, after sections 1 and 2 | hearts a run ±2 / ±4 |
|---|---|---|---|
| Slottet | `0a1e506dd82b` | `0a1e506dd82b` | 0.05 / 0.32 |
| Akerselva | `40b9c2ab91b0` | `40b9c2ab91b0` | 0.82 / 2.52 |
| Stortinget | `d327a7905945` | `d327a7905945` | 1.28 / 1.78 |
| Nordmarka | `58bfcf501657` | `58bfcf501657` | 0.65 / 2.00 |

(Nordmarka's is order 23's.) Section 3 moved three things in Langkaia, Akershus and Vålerenga, none of these four.

## Section 3

`sloppy-edge.md`: the edge place by place, the five levels with 6, 8 and 10 steps, and all sixteen levels after the moves
(54 runs better with 10, 26 worse, of 1,920; order 23: 55 and 31). Langkaia's scripted clear is 61 s (62 before: its deck
pigeon is a tile on).

## Tests, build, budget, front page

- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 407 pass (405 after order 23, and 2 new: the sheep's,
  the flag's, a flame's and the water's frames), 0 fail anywhere (the one failure on the way, a flame's middle tone within 10 of
  the yellow paint, was fixed and the suite run again whole). The viking suite took 171 s.
- `bunx tsc --noEmit` clean; `bun run build` clean.
- First script 58.86 kB gzipped (59.44 after order 23): the bench's, the bracteate's, the rune stone's and the sheep's drawings
  moved to `feel`'s file (20.2 kB gzipped now, 16.7 before), hooks in `LOOKS` and plain shapes left behind.
- The front page: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`. Nothing in `packages/` changed.

## Rectangles a frame

The most any place rose against order 23's code: +4; most places draw fewer; none near 15,000 (`perf.md`).
