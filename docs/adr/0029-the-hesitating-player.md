# 0029. The hesitating player, and the lake eased for him

Decided 2026-11-15 by the order 16 implementer, on the planner's order (order 16, "First: small things left
from order 15", item 3).

## Context
Østensjøvannet measured 1.2 hearts a run at ±4 against about 2.5 wanted, because the sloppy player (the
route's plan with a person's timing) never lingers, so its swans never came. The order asked for a player that
hesitates, and to lengthen or ease the lake by its numbers.

## Decision
- **The hesitating player** (`tools/review/sloppy.ts`, `hesitate=0.2`): the sloppy player, but before one move
  in five (seeded by the run, the move and the clock, so the look-ahead decides as the run will) it stands
  still 0.5 to 1.5 s. Only where a person would stop to look: on the ground, not while a raft or a hook
  carries him, and not right after a move that only stood and waited for something (that wait was the timing).
- Measured first as built after order 15, it lost 7.3 hearts a run at ±4 on the lake with 18 Game overs in 30:
  standing on a lily pad sank it under him (it held him two thirds of a second). The order says to ease it if
  over 3.5.
- **The lake eased**: a lily pad holds him a second and two thirds (`SinkPad.firm`, 100 steps; Bygdøy's balsa
  keeps two thirds of a second), and a swan that has caught him lets him be while he blinks and starts counting
  again. The pads are as wide as before.

## Consequences
- Østensjøvannet at ±4: the hesitating player 2.6 hearts a run (1 Game over in 30), the swans now its main
  cost; at ±2 3.7 with none. The sloppy player is unchanged at 1.2. Numbers in `tools/review/line2/summary.md`.
- Older levels for comparison, hesitating at ±4: Langkaia 1.4 (sloppy 1.5), Bygdøy 2.0 (sloppy 1.2).
- The tools also gained a way back the route never takes (`RECOVER`: Bjørvika's net, St. Clement's floor), so
  a fall that costs nothing is not counted as giving up.

## Not chosen
- Narrower pads (forbidden by the order) or a longer crossing: the lake was already over the mark for him.
- A hesitating player that never stops on a pad: that is the mistake the lake is about.
