# 0026. Korketrekkeren: the one level where he cannot stop

Decided 2026-11-14 by the order 15 implementer, on the planner's order (order 15, level 13; the plan
for line 2, `docs/games/PLAN-LINE-2.md`, which names the sledge run "the first to drop if it does not
feel like the same game"). Builds on [0003](0003-fixed-body-constants.md) and [0024](0024-the-shield-is-a-held-stance.md).

## Context
Every other level lets him stop anywhere: the keys are his, and the world only pushes, carries or
throws him. Korketrekkeren is a sledge run from Frognerseteren to Midtstuen, and a sledge does not
stop. The plan wanted it as line 2's breather (as Slottet is line 1's) with about 45 seconds of riding.
Two things had to hold: the body's run and jump do not change (0003), and the body never stands on a
slope (the kit's ramps are for a few stairways, not a hillside).

## Decision
- **The ride.** Between the top of the run and Midtstuen (`RIDE`) he sits on the sledge. Each step, before
  his body moves, the level's own rules (`LevelDef.rules.intent`, in the level's file) take his keys:
  left, right, the dash and the shield are gone; his speed is set to the stretch's (`speedAt`), and he is
  marked as thrown (`launched`) so the physics keeps that speed in the air as it does after a cannon.
  He can jump (the same jump, from the same ground) and **duck**: down, the shield's key, lies him back on
  the sledge. Ducking he cannot jump. The shield stays packed until Midtstuen, and the level says so once,
  on the sign by the sledge (with its own line for a touch screen, where the button is "Shield").
- **The speed** is the level's, set stretch by stretch, never over twice his run (1.2 at the top, 1.5
  with the sledgers and branches, 1.4 at the crossing, 2.2 down the steep bit to the gap, 1.4 in the trees,
  slowing to 0.8 at Midtstuen). It is not gained on the way down: the slope is a picture.
- **The run** is drawn steep, but there is no slope in the physics. It is a stair of narrow ledges four
  pixels wide, each a whole pixel or two lower than the one before (the rocking deck's way, `deck.ts`,
  without the rocking): the level's own moving ground (`LevelDef.grounds`) gives the physics the one
  ledge under his middle, and carries him onto it when it is within four pixels of his feet. Three snow
  bumps rise two pixels a ledge and drop six at once, so he leaves the ground for a moment. The gap is
  four tiles with no ledges at all.
- **A hit** costs a heart and nothing else: no knock-back while he rides (`Play.riding`), and he rides on,
  blinking. **Off the run** (into the gap) he is put back at the last flag, which stands on the run, and he
  is on the sledge again at once.
- **Ducking** lowers his head by seven pixels against what hangs at head height (`Play.ducking`, `DUCK`):
  the branches and the crossing's barrier are hazards at that height. Nothing else changes.
- **Seeing ahead.** On the sledge the camera looks ahead by 28 % of the view's width
  (`LevelRules.lead`), so he is drawn left of the middle; a test plays the route through the real camera
  (`follow`) at four widths, the narrowest the page allows (240 art pixels) and an upright phone among
  them, and holds every obstacle in view at least 1.2 seconds before he reaches it.
- **Reduced motion**: no screen shake (the kit's jolt is off), no speed lines behind him.
- **The reach search** carries him along the run at the stretch's speed (`LevelRules.carry`, as a push)
  and does not try the dash from there, since the sledge takes it away.

## What keeps it fair
- He never has to choose when; only whether. Every obstacle is seen for over 1.2 s, and the answers are
  the two things he can always do: jump or duck. Nothing needs a jump and a duck at once.
- The barrier's beat (lights blinking for a second before it comes down, two seconds down) decides only
  whether he ducks, never whether he can get through.
- Sledgers are slower than he is and set off when he is ten tiles behind, so he catches each one in the
  middle of the screen; landing on one is a stomp, as on any walker.
- The gap is the one jump over nothing; its flag is thirteen tiles before it, and the landing has nothing
  on it for eight tiles.
- Sloppy player, 30 runs: about one heart a run at ±4, no Game over (`tools/review/line2/`).

## Consequences
- `Play` has two flags (`riding`, `ducking`) and `LevelDef` a `rules` slot (its own enemies, ground, keys,
  an after-step hook, the search's carry and the camera's lead), shared with Vigelandsparken's statues and
  Østensjøvannet's swans. The ride's code is in Korketrekkeren's file, not the first script.
- Since order 16, while he rides the help line says that down ducks (and that he cannot walk), and on a touch
  screen the Shield button says Duck; the sign by the sledge says the button turns into Duck.
- On the sledge he is drawn seated (three pixels lower, as on a bench), the sledge under him; ducking, the
  level draws him lying back and the page hides his sprite.
- The standing measure (`tools/review/standing.ts`) counts riding on the sledge as moving: his speed is
  his own there, not the ground's.

## Not chosen
- A slope in the physics, with gravity drawing him down it: the body would change on one hillside, and
  the speed would depend on where he jumped.
- Letting him brake: the plan's idea is the one level he cannot stop on.
- The shield on the sledge: down would mean two things on one level; ducking is what a sledge has.
- A train on the crossing: it could not be ducked under, and he cannot choose when he arrives.
