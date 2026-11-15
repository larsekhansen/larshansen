# 0031. The serpent made good: the whole quay its fight, true hints, presence, a real ending

Decided 2026-11-15 by the order 17 implementer, on the planner's order (order 17, section 1), after the
adversarial review of line 2 (`docs/games/reviews/2026-11-15-line-2.md`, D1 to D6, B1, G1). Adjusts
[0027](0027-the-sea-serpent.md) and [0030](0030-the-end-of-line-2.md).

## Context
The review found the serpent's fight began at column 246 while the quay's planks ran from 236, so a ball
vanished in mid-air over the planks and the tail stopped short: from the bench, or wherever a knock-back put
him, nothing could reach him and the fight stalled for ever, saying "hold the shield up" to a player who
held it up. The prow was a second safe spot. The serpent itself was a 34-px dark neck up for under a third
of its fight, its dazed head read as a crate, and the dawn that ended line 2 was a disc beside the moon that
the card covered 1.4 s later.

## Decision
- **The whole quay is the fight**, from the planks' first board (236) to the prow; the ball flies at the
  height he last stood at (the quay or the prow), so a shield held facing it sends it back from every
  column he can stand on (tested, column by column). If he goes back off its quay it sinks and waits, its
  hits kept.
- **Hints only when true.** "Raise the shield while it rears" when its ball hit him facing it or went past
  him; "face it with the shield" when it hit his back; "jump on its head" two seconds into a daze with no
  stomp, while it still lies there; "its tail comes along the quay, jump it" as the tail hits him. The ten
  seconds' repeat says the round's hint again only if he has not since done what it said.
- **A round**: a ring of foam (1.5 s), rise, the tell (1.5 s, a quarter less after each hit, never under a
  second), the spit. Sent back, the ball dazes it; then it lashes its tail along the quay from behind its
  neck towards him (a second's warning: its fin breaks the water), with its neck up, watching. A ball that
  hits him: it stays up watching him 2.5 s, then rests 3 s (was 7 s under the water).
- **After the first hit it rises twice a round**: the first ball sent back it ducks, and comes up elsewhere
  with a ring of a second and its own full tell; the second dazes it. From the first hit its tail comes
  along the quay after each ball (20 steps behind it), from the second closely (10 steps).
- **It rises at least four tiles from him, within seven where it can** (so on a 1280-wide screen it is in
  the middle of the view); if he walks up to its ring it moves once, with a fresh ring.
- **Its look** (`levels/gamlebyen.ts`): a neck sixty pixels high (four times his height), broad at the
  water, scaled, its pale belly towards him, a crest of spines down its back, a moonlit rim and a torch's
  warm side; a head with a fan of spines, a brow, a yellow eye with a slit, a long snout and a jaw that
  drops to spit; dazed, the same head on its jaw on the planks, eye shut, tongue out, its neck arching out
  of the water; coils in the water between rises; a tail that is a hump of its body with a fin; water
  streaming off it as it rises. The hit boxes are as they were (the neck's wall is the drawn neck).
- **The ending.** Beaten, it sinks; over five seconds the harbour stills, the whole sky turns to a dawn (the
  stars, the moon and the aurora go under it) with the sun coming up behind the hills and its path on the
  water, the quay's torches go out one by one, a little warmth comes over the street; then the rune rises
  out of the water to the last longship's prow, which has a carved dragon on its stem; only then can it be
  taken, and the card follows. With reduced motion the same states come without the movement (the sun
  where it ends, the rune appearing at the prow).
- **The map's longship** (0030) lies at anchor at the end of the line, past the last station's boards, in
  view where he stands after the last level, instead of sailing the fjord under the help line.

## Consequences
- Measured with the corrected sloppy player ([0034](0034-the-sloppy-player-made-honest.md)):
  `tools/review/line2-after/`. A player who knows the answer at ±4 loses well under a heart in a fight of
  about 45 s; a learner who does what each hint says beats it in about a minute with two hearts; no naive
  strategy reaches Game over before 75 s, and each hears a true hint within 10 s.
- In the scripted fight (42 s from waking it) its neck is up for 54 % of the time (29 % before) and seen
  going down or reeling another 8 %; its head lies on the planks 8 %; its coils show in the ring of foam
  15 % (`tools/review/phases.ts`).
- The order asked for two to three hearts a fight at ±4 for a player who knows the answer. With the
  sloppy player made honest, that takes a gap of a tenth of a second between the ball and the tail, a
  reflex test; the gaps were left at a third and a sixth of a second.

## Not chosen
- Water between the bench and the fight's quay (the review's other fix): the bench would have stood on a
  jetty of its own, and the quay's left end would still have been out of the fight.
- A body that hurts to touch: as 0027.
