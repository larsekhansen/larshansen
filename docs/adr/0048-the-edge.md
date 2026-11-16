# 0048. The edge forgives a little longer: ten steps, not six

Decided 2026-11-16 by the planner (order 23, section 4), from the research record's comparison with Celeste Classic
(`docs/games/research/2026-11-16-reference-games.md`: 0.20 s there, 0.10 s here). Carried out by the order 23
implementer. The only change to `JUMP` since [0003](0003-fixed-body-constants.md), which stands otherwise.

## Decision
- `JUMP.coyoteSteps` (`packages/pixelkit/src/config.ts`): a jump still works for 10 steps (0.17 s) after walking off an
  edge, where it was 6 (0.10 s). The buffer before landing stays 6 steps; the run, the jump's height and reach, gravity and
  the dash do not change, so no gap in any level is wider or narrower than it was. The front page shares the kit and gets
  the same body (ADR 0003: he feels the same everywhere); its 28 pictures are byte-identical.
- ADR 0003's promise, as this record reads it: **no route gets harder by design**. A longer forgiveness only lets a jump
  happen that used to come too late; it never takes one away.

## What was measured
- **The reach search**, given a move it did not have (walking or running off an edge and jumping 1 to `coyoteSteps - 1`
  steps after, `tools/review/edge.ts`), with 6 and with 10: no bracteate becomes reachable without the feather, in any
  level; every rune is reached both ways. New spots he can stand on with 10: Akershus 5 (by the battlements at column 230,
  row 7), Holmenkollen 20 (along the slopes of the hill and the inrun, columns 180 to 258), Slottet 8 (on Karl Johan's
  slope), Vålerenga 16 (on the roofs at the start, columns 22 to 57); none in the other twelve, none in a boss's fight, none
  past Gamlebyen's walls. Nothing new skips a gate, a key or a boss (there are no keys; the bosses' fights and Gamlebyen's
  walls are untouched). `tools/review/o23/reach-edge.txt`.
- **The sloppy player** (`fresh.ts`, seeds 201 to 260, ±2 and ±4, all sixteen levels, 1,920 runs), seed by seed against
  the same runs with 6 (`tools/review/edgecmp.py`, `tools/review/o23/sloppy-edge.md`): 55 runs do better, 31 do worse, 1,834
  are the same. Ekeberg gains most (2.58 to 1.72 hearts a run at ±4; 18 better, 8 worse, six of those ending off the route
  "across on the sheep" with fewer hearts); Stortinget 17 better, 2 worse (both off the route). Worse: Langkaia 6 (all at
  ±4, a heart more, most at the pigeon on the longship's deck, column 205: 0.77 to 0.85 a run), Akershus 6 (a heart more,
  at the keep's guards, columns 221 to 232; at ±4 the level is better, 1.00 to 0.93), Vålerenga 9 (the terrace's dash to
  the plough's cab and the first roofs: 1.15 to 1.27 and 1.47 to 1.60). Unchanged: the other nine.

## Consequences
- The order's premise, that it can only help, is not what the sloppy player shows: in four places a jump the sloppy player
  pressed late, which used to come too late (so he dropped, onto the deck pigeon's back, off the terrace), now happens.
  A person who presses jump at an edge means to jump; the sloppy player presses it on its route's schedule. Whether those
  places are harder for a person is for a person to say; the numbers are kept so the planner can decide (keep 10 and move
  those places a tile, or go back to 6). This record keeps 10, as ordered.
- The tests' reach search does not try a late jump off an edge (it would slow the suite); `edge.ts` does, on demand.

## Not chosen
- The hang at the top of a jump (Celeste's halved gravity): it changes how far a jump reaches (ADR 0003).
- A longer buffer before landing: not asked for, and it would make a jump pressed too early in a fall happen.
- A forgiveness of its own for each level: ADR 0003's "not chosen".
