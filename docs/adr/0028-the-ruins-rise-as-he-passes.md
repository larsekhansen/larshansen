# 0028. Gamlebyen: stones that rise as he passes, a map that changes, two worlds searched

Decided 2026-11-15 by the order 16 implementer, on the planner's order (order 16, level 16: "the ruins
rebuild as he passes ... never a dead end: the dead-end search must pass with every stone both risen and not").

## Context
Every level so far had a map that never changed: moving ground was carriers and ledges on a beat, laid over
the tiles. Gamlebyen's idea needs walls and ledges that appear for good when he comes near, and twice a wall
behind him that closes the way back. The reach search proves the bracteates and the dead ends on a fixed map.

## Decision
- **Letters that rise.** `Z` (a wall stone, solid once risen) and `z` (a ledge stone, one-way once risen) are
  open on the map as written; `LevelDef.risen` names them. A stone rises when his middle is within six tiles
  across and seven up or down, takes 20 steps, and stays; one that would rise where his body is waits until he
  has moved off it. The two walls that close the way back (`CLOSERS`) rise only once he is three tiles past
  them; from his side they are four rows high, from the side he came two (a jump), so a fall that puts him
  back before one never leaves him stuck.
- **A level's ground may change its map.** `Grounds.map(state, base)` wraps the map a play is played on
  (`newPlay` asks for it): its `isSolid`, `isOneWay` and `supports` see the risen stones. The stones' state is
  the ground's state (plain arrays), so a copied play (the review tools' look-ahead) rebuilds its map from it.
- **Two worlds searched.** The reach worker runs Gamlebyen with every stone risen (the rune reached, no dead
  end, no spot from which the rune is reached only by falling) and with none, from the start and from every
  flag (no dead end: before its stones rise, every stretch can still be left by the rune or by a fall that
  puts him back). The bracteate must be out of reach in all of them.
- **The tower that builds itself** is the level's own moving ground: a block that rises a pixel a step while he
  stands on it, from the far bank to the town wall's walk, and sinks back once he has been off it three
  seconds; the search takes it at every height.
- **The guards that were statues** are the level's own rule for its walkers (`LevelRules.enemy`): calm and still
  (harmless, not to be touched) until he comes within five tiles, then they walk.

## Consequences
- The none-risen world from the start reaches only the park (the gable stops it): the dig in the park is
  there so that a fall is within reach. The search costs about 30 s of CPU in its worker; the suite stays
  under its budget.
- `rules`-only changes are in Gamlebyen's file; `play.ts` gained one line, `types.ts` two fields.

## Not chosen
- Stones as carriers: a carrier is a one-way ledge; it cannot be a wall.
- Searching the real order of rising (a search over spots and stone states): far larger, for what the two
  extremes and the per-flag starts already cover. Not proven: a mixed state (a wall risen behind him, a ledge
  ahead not yet) is not searched as such.
