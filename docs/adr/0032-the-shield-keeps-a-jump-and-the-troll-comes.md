# 0032. A jump pressed while the shield is up is kept; the troll is not frozen by the shield

Decided 2026-11-15 by the order 17 implementer, on the planner's order (order 17, sections 1 and 3, C1).
Adjusts [0024](0024-the-shield-is-a-held-stance.md).

## Context
- 0024 says that while the shield is up he cannot jump. A jump pressed a moment before down was let go was
  simply lost: at the serpent, whose tail now follows its ball, a player who pressed jump and let go of down
  in the same instant, in the wrong order, stood still and was hit. The sloppy player showed it in most of
  the hearts it lost there.
- The review (C1) found that a shield held at Nordmarka's arena mouth froze the troll: it walked into the
  shield, was pushed back a tile, and walked in again, 872 times in 300 s, never winding up and never giving
  the "ten seconds" hint, since it did get nearer each time. 0024 said the fight was unchanged by the shield.

## Decision
- A jump pressed while the shield is up (or coming up) is kept for six steps, a tenth of a second: if down
  is let go within them, with the jump key still held, he jumps then (`JUMP_KEPT`, `game/shield.ts`).
- The troll, walking into the raised shield, is pushed back a tile and raises its club there and then: the
  club and the wave are not stopped by the shield, so on the floor he is hit as without it, and up on a rock
  out of the club's reach the round ends with its hint and it backs off (`shoveTroll`, `game/troll.ts`).
- The plough is as 0024 says: charging into the shield it backs off to rest with the round's hint, and comes
  again after every rest (tested, so it cannot be frozen either).

## Consequences
- Tests in `rules.test.ts`: the kept jump (and that it is gone after a tenth of a second), the troll at the
  mouth with the shield, on the floor and on a rock, and the plough with the shield over forty seconds.
- The shield's lessons in line 2 are unchanged: nothing there asks for a jump straight out of the shield
  except the serpent's tail.

## Not chosen
- Letting the jump key drop the shield at once: then a jump pressed by mistake mid-stance would let a throw
  through.
- Letting the troll ignore the shield altogether: it would have walked through him, the one boss whose body
  hurts.
