# 0024. The shield is a held stance, not a parry

State (order 17): adjusted by [0032](0032-the-shield-keeps-a-jump-and-the-troll-comes.md): a jump pressed while it is up is kept a tenth of a second; the troll, walking into it, raises its club there, so Nordmarka's fight is unchanged in fact.

Decided 2026-11-14 by the order 14 implementer, on the planner's order (order 14, step 3; the plan
for line 2, `docs/games/PLAN-LINE-2.md`). Adds an ability, as [0003](0003-fixed-body-constants.md)
asks: `MOVE` and `JUMP` do not change.

## Context
Line 2 gives one ability, as line 1 gave the ski pole: a shield from the longship at Bygdøy, needed
once in each of levels 12 to 16 and against the sea serpent. The sloppy player (the route's plan
with a person's timing off by up to ±4 steps) is the measure of fairness here; a move that must be
pressed inside a window of a few steps is one it fails, and so does a person on a phone.

## Decision
- **Holding down on the ground raises it**, facing the way he faces. It takes six steps to come up
  and stays up as long as down is held. While it comes up and while it is up he cannot walk, jump or
  dash; he can turn, and then it comes up again the other way. Let go, and it is down at once. In the
  air it does not come up.
- **Up, it stops what is thrown at him from in front**: a throw coming at him across (faster than
  0.3 px a step towards him) that reaches its face, his front or his head is stopped and falls,
  harmless (`Shot.spent`). Held up and tilted, it covers his head against a lob from in front.
- **Up, it holds off what runs into him from in front at his height**: a walker, a spiky thing or a
  flyer is pushed back a tile along its ground and turned away; a boss is pushed back a tile through
  its own `shoved` rule (the plough then backs off to rest and shows the round's hint, as when it runs
  into him; the troll steps back). No harm to him.
- **It does not stop** a fall, a stone dropping on him from above (hardly moving across), anything
  from below (a jumper out of the water, the troll's wave along the ground), the troll's club coming
  down, the third rail, or anything from behind.
- **Where**: given at Bygdøy's prow, a map mark `y` (`MARKS.shield`), with its own moment (a fanfare
  and his bubble: "The shield is yours. Hold down to raise it."). From the level after Bygdøy on he
  always has it, as the pole from Akerselva on; once Bygdøy is cleared he has it everywhere
  (`hasShield`). `?shield` gives it for checking, as `?pole` does. On a touch screen the Shield button
  beside Dash, shown only once he has it; with both, the pad's buttons are made smaller to fit.
- **Down meant nothing in a level before**: at a bench, up sits (as before); down there raises the shield.
- **Lazily**: the rules and the drawing are `game/shield.ts`, a chunk of their own, fetched when he
  has the shield or goes to Bygdøy or beyond; `play.ts` runs them through `Play.shield`
  (`ShieldRules`), as it runs the troll's and the plough's through their slots.
- With reduced motion the shield is drawn down until it protects and then up, with no steps between.

## Why a held stance and not a parry window
A parry (press at the moment a throw arrives, a few steps wide) is a test of timing. At ±4 steps of
error the sloppy player would miss most windows narrower than nine steps, and the cost of a miss is a
heart. A held stance moves the skill from *when exactly* to *whether*: he sees the thrower's arm go up
for a full second, stops, holds down, and the six steps to raise it fit many times inside that
second. What it costs him is time and movement (he cannot walk while it is up), which is the trade a
level can design around: walk, stop and raise, walk.

## Consequences
- A thrower's lob is no threat to a player who stands with the shield up facing it; the line 2
  levels put their throwers where standing still is the question (Bygdøy's slingers lead their
  target, so walking on under them is what hurts).
- A thrower that faces one way may be blind nearer than its usual one and a half tiles (`EnemyDef.blind`):
  Bjørvika's riveters and Gamlebyen's archers throw from above and lead their man, and from within four tiles
  their bolt would come down too steeply (slower across than 0.3 px a step) for the shield; they do not throw
  then (order 16).
- The sea serpent's ball is the shield's answer to the third boss ([0027](0027-the-sea-serpent.md)).
- Line 1's bosses meet a shield on a return visit: the plough charging into it backs off as if it had
  run into him; the troll's club and wave go through, so Nordmarka's fight is unchanged.
- The rules tests (`rules.test.ts`, "the shield") cover a stone from the front, from behind and from
  above, a walker's charge and a boss's, the plough, a jumper from below, the raising time, no walking
  and the reduced-motion drawing.

## Not chosen
- A parry window, for the reasons above.
- A shield that blocks from every side, or from above: then standing still with it up would be the
  answer to everything, and the lob from above would have no counter but walking.
- A timed shield (up for a while, then a rest): a second rule to learn for no gain; holding a key is
  the simplest thing a person can do.
- Pushing him back instead of the enemy: knock-back near water is what ADR 0018 had to soften.
