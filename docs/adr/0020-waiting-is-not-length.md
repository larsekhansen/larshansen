# 0020. Waiting is not length: the clear-time floor is 45 s

Decided 2026-11-14 by the order 12 implementer, while doing order 12's items 19 and 20 (cut every
forced wait to about 5 s, bring the share of the route spent standing under a third by making
waits shorter, not by adding walking). Adjusts the measure in [0009](0009-mario-length-levels.md).

## Context
0009's measure held each scripted clear to at least 60 s (Nabolaget 90 s), "reached by distance,
not waits". In practice several levels reached it partly by waiting: single chairs, slow lifts,
long ferry and bell rounds, a plough that took 11 s to come. Cutting those waits took 5 to 16 s
off Rådhuset, Holmenkollen, Nordmarka and Nabolaget without taking anything to do away.

## Decision
- The floor is now 45 s for a scripted clear (Nabolaget 80 s). The size of a level is held by its
  columns, 220 to 280, as before.
- The tests also now hold every level to: no dead end (the reach search's graph), no thrower that
  can reach a flag, a bench or a sign, and the bosses' rules on made-up levels.

## Consequences
- Holmenkollen clears in 48 s with the script; a person takes longer. Nordmarka about 63 s.
- The routes stand still less: see `apps/viking/tools/review/after/`.

## Not chosen
- Keeping 60 s and adding walking or things to wait for. That is what the order forbids.
- Measuring "time moving" instead of the clear: a ride is part of a level, not idle.
