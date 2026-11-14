# 0004. A level is data; one pure runner plays it

Decided 2026-11-13 by the planner (order 8), extended in order 10.

## Decision
- A level is one file, `apps/viking/src/levels/<id>.ts`, exporting a `LevelDef` (`types.ts`): a
  text map with a legend, ramps, carriers, timed ledges, cannons, zones, hazards, enemies, signs,
  doors, an optional boss, and its art.
- The rules are pure functions in `apps/viking/src/game/play.ts` and small modules beside it
  (`enemies.ts`, `troll.ts`, `plough.ts`). No drawing, no storage, no clock but the step count.
  The page (`main.ts`) and the tests run the same code.
- The line map is itself a level, built from the visitor's progress (`levels/kart.ts`).
- A mechanic that more than one scene could use is a small tested module in the kit.

## Consequences
- A level can be played by a script in a test, which is what makes 0005 possible.
- Timed things run on the level's step count, so a level is the same on every visit.
- A boss used by one level loads with that level through `LevelDef.boss`. The troll predates
  that slot and is run by `play.ts` directly; moving it into the slot is unfinished tidying.

## Not chosen
- A level editor or a binary map format. Text maps are reviewable in a diff.
- Rules inside the page loop. The first viking game had that and could not be tested.
