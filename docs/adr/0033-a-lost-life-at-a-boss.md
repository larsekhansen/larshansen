# 0033. A lost life in a boss's fight never puts him further back than its bench

Decided 2026-11-15 by the order 17 implementer, on the planner's order (order 17, B1: "losing one life must
never send him further back than losing all three"). Adjusts [0017](0017-game-over-at-a-boss.md).

## Context
0017 lets a Game over in a boss's fight go on from the bench before it. A single lost life puts him back at
the last flag or bench he reached. At the serpent there was no flag on its quay, and a player who walked past
its bench without sitting was put back across the harbour's two longships, while a Game over put him at the
bench. At the troll and the plough the flag stands two tiles before the bench, so the same was true by two
tiles.

## Decision
- When a life is lost while a boss is awake, and his saved place is behind the boss's bench (or there is
  none), the bench becomes his saved place and he is put back there (`loseLife`, `game/play.ts`).
- Gamlebyen's quay gets a flag of its own at column 244, beside the serpent's bench, as the troll and the
  plough each have one.

## Consequences
- Tested on all three boss levels: with the flags up to the bench raised and the bench not sat on, a life
  lost in the fight puts him at the bench or at a flag past it.
- One line in the first script.

## Not chosen
- A flag at every boss's bench and nothing else: it would hold for the three bosses there are, and not for
  the next one built with its flag a little early.
