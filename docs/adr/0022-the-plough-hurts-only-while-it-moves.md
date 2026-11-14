# 0022. The plough hurts only while it moves at him, and standing still it is in his way

Decided 2026-11-14 by the order 13 implementer, on the planner's order (order 13, step 3: "the plough:
none in under 75 s; a first hint within 10 s for all"), after order 12's numbers. Adjusts the plough's
rules in `game/plough.ts` as order 12 left them.

## Context
Three naive strategies against the plough reached Game over in 43 to 46 seconds and saw no hint at
all: holding right, or running to the far end of the street. The plough backed off to rest after
running into him but showed nothing, and when its rest ended with him leaning on it, it started
driving and hurt him in the same step, with no telegraph. While it stood still at the end of its
stretch he could walk through it, into the tram's slot behind it.

## Decision
- It hurts only while it moves at him under its own power: driving or charging, and moving that
  step. Revving in place (the one-second telegraph), standing at the end of its stretch, stuck in
  the bank, turning, reeling or backing off, it is a stopped machine, harmless to touch.
- Awake and standing still, its body is a wall: he is put back out of it on the side he came from
  (`Boss.blocks`, run in `game/play.ts`). Parked or beaten it is not.
- Running into him is a round with no hit, as a stuck or a turn with no hit is: the round's hint
  shows beside it. So does ten seconds of nothing (it used to say "The plough waits").
- After running into him, or ten idle seconds, it backs off to the far end of its stretch and rests
  five seconds (it was two); it does not set off while he leans on it there, and every ten seconds
  it shows the round's hint again.
- The round-one hint says where it sticks rather than that it is stuck, since it now shows also
  when it is not.

## Consequences
- Against the naive strategies (`tools/review/bosses.ts`): no Game over before 79 seconds; the
  first hint within 10 seconds for every one of them (`tools/review/after13/bosses.txt`).
- A player who leans on the resting plough is never charged; the fight waits for him, with hints.
  The sloppy player, resynchronised past the fight by its own rules, can wait there for good
  (counted as a time-out), which is an artefact of the sloppy player, not a trap.
- Running at it and jumping no longer beats it by accident.

## Not chosen
- A plough that charges a player leaning on it after a while (tried: ten seconds). The sloppy
  player lost more hearts there than before order 13, for nothing a person would learn.
- Leaving it walk-through when still. Holding right then walked him through it into the slot,
  Game over in 45 seconds.
