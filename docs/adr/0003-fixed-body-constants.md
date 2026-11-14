# 0003. Run and jump never change

Decided 2026-11-13 by the planner; stated in orders 7, 8 and 10 as the first rule.

## Context
The front page's person runs at 1.6 px a step and jumps 46 px high and 54 px far (3.4 tiles) at
60 steps a second. Ten levels with ice, wind, cannons and trains could each be tempted to retune him.

## Decision
`MOVE` and `JUMP` in `packages/pixelkit/src/config.ts` are never retuned. New behaviour comes
from the world (a surface's grip or belt, a zone's push, a carrier, a launcher) or from an
ability added on top: the raven's feather (a second jump in the air: 91 px high, 101 px far), the
ski pole (a dash: 3 tiles in 10 steps, level, once per time in the air).

## Consequences
- Every gap in every level can be measured against two numbers. Required gaps are at most 3
  tiles wide and 2 up.
- He feels the same on the front page and in level 10.
- Two small kit rules were added for the ski jump and are part of the world, not the body: on
  ground with zero grip he is drawn toward its belt speed, and leaving the ground faster than a
  run keeps that speed in the air.

## Not chosen
- A faster, floatier body for the platformer. Would have split the feel of the two games.
- Per-level constants. Would have made the reach proofs and the muscle memory worthless.
