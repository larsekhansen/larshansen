# 0015. The viking game's header is solid

Decided by the batch D implementer on 2026-11-14 while fixing a reported fault; accepted by the
planner. Lars has not seen it.

## Context
The shared header bar is 86 % opaque. Over a night sky or the dark overlay it looked grey
(measured about 220, 218, 215), which read as a bug in Nordmarka and Nabolaget.

## Decision
In the viking page the header is solid cream, the same in every level and sky. The front page
keeps its frosted bar (changing it would break the byte-identical gate, 0005).

## Consequences
The two pages' headers differ slightly by day: the viking one is a little whiter and warmer.

## Not chosen
- Leaving it frosted and accepting grey in dark levels.
- Making both solid: a deliberate change to the front page, which needs Lars's say and new
  reference screenshots.
