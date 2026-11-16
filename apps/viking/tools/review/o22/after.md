# Order 22: the measures

Measured 16 November 2026 on `paint-and-grain` rebased on `origin/main` after order 21 (`6c799fb`), on a Pi busy with
another order's work (load 6 to 30), so times are long; counts are not.

## The rules did not change

The sloppy player (`fresh.ts`, ADR 0034) on seeds 201 to 260, ±2 and ±4: every run's record is byte-identical on the
code before order 22 and on this branch, and the same as order 19's: Akershus (md5 `5a1eac08e46e`, 0.52 / 1.00 hearts
a run), Nordmarka (`58bfcf501657`, 0.65 / 2.00), Bygdøy (`9e982a3ca1bf`, 0.40 / 0.80), Gamlebyen (`54db73ff6304`,
0.47 / 1.07). No box, place, speed or timing changed: what changed is drawing (the outlines, the paint, the haze) and
the click-walk's file, which is fetched with the first click.

## Tests, build, budget, front page

- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 392 pass, 0 fail anywhere. The viking suite
  took 252 s with the Pi under load (the palette test alone 62 s, 50 s before order 22 under the same load: one walk
  of each level now serves the fields, the paint's uniqueness and the haze's band).
- `bunx tsc --noEmit` clean; `bun run build` at the root clean.
- First script 59.85 kB gzipped (59.47 after order 21, 59.00 after order 20). To make room the careful walk to a
  clicked spot (`game/careful.ts`) is a chunk of its own (0.57 kB) fetched with the first click, and the haze is the
  far passes' own fill toward the level's air (folding it with the night's tint into one fill was built, measured at
  0.25 kB and taken out). The grain study is `grain-*.js`, 5.9 kB, only under `?debug&grain`.
- The front page: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`, on the rebased kit (`stage.ts`'s haze
  takes an opt-in colour, `props.ts`'s ledge an opt-in worn end, the swatches of the roles changed: the front page
  uses none of them).

## Rectangles a frame

See `perf.md`.
