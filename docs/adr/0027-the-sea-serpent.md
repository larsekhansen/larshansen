# 0027. The sea serpent: the shield sends its ball back, a stomp on its dazed head

Decided 2026-11-15 by the order 16 implementer, on the planner's order (order 16, "The serpent"; the plan
for line 2, `docs/games/PLAN-LINE-2.md`: "three bosses, three answers: light for the troll, timing for the
plough, the shield for the serpent"). Builds on [0017](0017-game-over-at-a-boss.md),
[0022](0022-the-plough-hurts-only-while-it-moves.md) and [0024](0024-the-shield-is-a-held-stance.md).

## Context
Gamlebyen ends line 2 with a third boss on a quay of about 24 columns. The order fixed its shape: three
places it rises, each marked by a ring of foam for 1.5 s; a tell before it spits a ball of brine along the
quay; the shield sends the ball back and dazes it; a stomp on its dazed head is the hit; a tail swept once
between spits, to be jumped; quicker after each hit but never under a second of tell; hints as the other
bosses have; Game over goes on from its bench; and ten naive strategies that either win or see a hint
within 10 s, none at Game over before 75 s.

## Decision
- **Its rules** are `game/serpent.ts`, a small pure module that comes with Gamlebyen through the boss slot
  (`LevelDef.boss`), as the plough's does. Tested in `rules.test.ts` ("the sea serpent") on a made-up quay.
- **A round**: a ring of foam (90 steps; drawn still with reduced motion), it rises (30), rears for its tell
  (90, 75, 60 steps by hits taken), and spits a ball of brine straight along the quay at his middle's height,
  2 px a step, towards him. With the shield up and facing it the ball is held (`Boss.hurts` returns it, the
  shield's `holds` takes it, `shoved` turns it round) and flies back; reaching the head it dazes it: the head
  lies on the quay's edge for four seconds, harmless, and a stomp on it is a hit (it reels, then dives).
  Unblocked, or with his back to it, the ball costs a heart.
- **The tail**: after a round in which its ball missed him or it was dazed, as it dives its tail comes up at
  the quay's end nearer its neck, a second before it sweeps (its tip breaking the water), and sweeps the quay
  low at 1.6 px a step. It hurts from below: the shield does not stop it, a jump clears it.
- **It never rises within four tiles of him**, and where it can it rises within eleven, so he can see the
  ring; the order is middle, right, left, never the same place twice.
- **Its neck is a wall, not a hurt.** While it is up its neck stands in his way (`Boss.blocks`, as the
  plough at rest). The order says its body does not hurt while dazed or diving; as built it never hurts, and
  what hurts is its ball and its tail. A ball that hits him ends the round without the tail and with a longer
  rest under the water (seven seconds against two and a half), as the plough backs off after running into him.
- **Hints**, by event, shown beside it as the plough's are: `wake` as it first rises; `miss` after a round
  with no dazing ("Hold the shield up as it spits. The ball goes back where it came from."); `missHead` after
  a dazing with no stomp ("It lies stunned on the quay. Jump on its head."); after ten seconds with nothing
  said, the round's hint again.
- **Game over** in its fight goes on from its bench (the level's last) with three lives and the serpent asleep
  with no hits ([0017](0017-game-over-at-a-boss.md)); a lost life sends it under, its hits kept.
- **Beaten**, it sinks; the water stills, and the dawn comes over the fjord (drawn after the night's tint,
  with the sun's rim over the far shore); the rune G on the last longship's prow can be taken.

## Consequences
- Ten naive strategies (`tools/review/bosses.ts`, extended to it): the first hint at 5 to 7 s for every
  one; Game over for three of them, at 85, 94 and 182 s; the others survive 300 s
  (`tools/review/line2/bosses-gamlebyen.txt`). None wins: the answer needs the shield.
- The route's fight (three rounds) takes about 45 s; the level clears in 96 s.
- Night rules apply ([0023](0023-what-hurts-keeps-its-light-after-dusk.md)): its neck and head carry a pale
  rim and eye-shine, its ball and its ring of foam are drawn after the tint.

## Not chosen
- A body that hurts to touch while it rears (the order's reading): naive strategies that ran at it reached
  Game over in 55 to 67 s, well inside 75.
- Rising anywhere, even on him: a ring of foam under his feet gives no fair second.
- A parry (the ball goes back only if blocked at the last moment): the shield is a held stance (0024).
