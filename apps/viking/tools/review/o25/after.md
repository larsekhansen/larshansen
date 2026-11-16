# Order 25: the measures

Measured 16 November 2026 on branch `line-two-redrawn` (from `origin/main` at `9d275f7`, after order 24), on a Pi busy with
the order's own pictures, so times are long; counts are not.

## No rule changed

The sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, with the edge at its 10 steps, on `origin/main` before any
change and on the branch after every drawing change: every run's record byte-identical on the four levels the order names.

| Level | md5 of the runs, before | md5, after | hearts a run ±2 / ±4 |
|---|---|---|---|
| Bygdøy | `452e8abd9652` | `452e8abd9652` | 0.40 / 0.80 |
| Vigelandsparken | `ac65016a97f9` | `ac65016a97f9` | 1.90 / 2.32 |
| Østensjøvannet | `7bb99e49f57b` | `7bb99e49f57b` | 0.20 / 0.72 |
| Gamlebyen | `54db73ff6304` | `54db73ff6304` | 0.47 / 1.07 |

(Gamlebyen's is order 23's and order 22's.) No route, box, speed or timing was touched; `JUMP.coyoteSteps` is 10.

## Tests, build, budget, front page

- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 408 pass (407 after order 24, and 1 new: every look
  of every level drawn pixel by pixel, its body in runs one pixel high), 0 fail anywhere. The viking suite took 223 s on the
  busy Pi. The census now names Gamlebyen's guard apart from Akershus's (`guard (the bishop's)`), so the frame tests and the
  sheets hold it too.
- `tsc --noEmit` clean; `bun run build` clean.
- First script 58.86 kB gzipped, as after order 24: line 2's drawings are in their levels' files (the sledge and him lying
  back in Korketrekkeren's), the crowd's people in `feel`'s (Slottet and Holmenkollen share them, about 20.6 kB gzipped now);
  the mallard moved from Akerselva's file to the shared looks' (`looks`, about 2.9 kB gzipped).
- The front page: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`, taken twice (after section 1 and at the end).
  Nothing in `packages/` or `apps/landing` changed.

## Rectangles a frame

Against order 23's table the most any place rose: +10 (Nordmarka's dark, as order 24's +4 there); none draws over 11,466; the
crowds draw 150 to 270 fewer. The troll's fight after dusk +78, the serpent's +11 to +19 (`perf.md`).
