# 0017. Game over at a boss goes on from its bench

Decided 2026-11-14 by the order 12 implementer, on the planner's order (order 12, item 9), after
the adversarial review of the same day (C1). Adjusts [0008](0008-hearts-lives-enemies-pits.md).

## Context
0008 makes Game over restart the level. At the two bosses that meant walking the whole of
Nordmarka (about a minute of perfect play) or Nabolaget (about 80 s) again to try the fight once
more. The review found that no naive strategy hit the troll even once and six of ten reached Game
over within 22 to 48 s; even a player who knows the rule, timing it a little off, lost the level
there in 8 of 30 runs.

## Decision
- A Game over while a boss is awake (in its fight: woken, not yet stone or beaten) lets him go on
  from the bench right before it: three lives, full hearts, and the boss asleep (or parked) again
  with none of its hits. The clock, the flags, the skilling and what else he found stay; the run
  is not a fresh one, so the best time is honest.
- The Game over card says so, in the visitor's language ("You start at the bench before the
  fight, with three lives." / "Du starter ved benken før kampen, med tre liv."). "Try again", R
  and the header's restart on that card go on from the bench; "To the map", Back and a header
  link leave as before.
- Everywhere else, Game over still restarts the level, as 0008 says.
- In rules: `Play.overAtBoss`, set when the last life goes while the boss is awake, and
  `againAtBoss(p)` in `game/play.ts`; the boss slot gains `awake()`.

## Consequences
- Losing at a boss costs the fight, not the level. The bosses can be harder to read without
  being cruel; the troll and the plough were made kinder as well (order 12, items 11 and 12).
- A Game over caused elsewhere in the arena while the boss is awake (a fall) counts as at the
  boss. The only water in either arena is past the plough, after it is beaten.

## Not chosen
- Restarting at the last flag for every Game over. Lars asked for lives that mean something
  (0008); the level restart stays for the rest of the level.
- Keeping the boss's hits after a Game over. Three hits in one go is the fight.
