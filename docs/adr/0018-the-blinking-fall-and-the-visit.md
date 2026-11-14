# 0018. A fall while blinking is free; a visit remembers what a level gave

Decided 2026-11-14 by the order 12 implementer, on the planner's order (order 12, items 5 and 8),
after the adversarial review (D5, F2, F3). Adjusts [0008](0008-hearts-lives-enemies-pits.md).

## Context
A hit knocks him back about two and a half tiles he cannot steer. Near water, the knock-back
often ended in it, and the fall took a second heart while he still blinked. The review counted 38
such knock-ins at Nordmarka's first bog alone. Separately, restarting a level put its brown
cheese and every skilling back, so a patient player could farm lives by restarting.

## Decision
- A fall into water or a pit while he is still blinking from a hit puts him back (at the flag,
  bench or last firm ground, as any fall) but takes no heart: the hit was the heart.
- For the rest of a visit, each level remembers that its brown cheese was taken (it is not there
  again after a restart), and which of its skilling and beaten enemies have paid into the purse
  (taken again, they count on the card, but pay nothing towards a life twice).
- A bracteate found on an earlier visit is drawn as a pale outline and is quiet when touched.

## Consequences
- A fall right after a hit costs no more than the hit; a fall on its own still costs a heart.
- Lives from the cheese and the purse mean what they say. A new visit starts afresh, as before.

## Not chosen
- Shortening the knock-back near edges. The rule is simpler and covers every edge.
- Making throwers hold fire after a respawn. Throwers were moved out of reach of flags instead.
