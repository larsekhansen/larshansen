# 0009. Each level about as long and as good as a Mario level

Lars, 2026-11-13: "I want each level about as good and long as a Mario level. NES or SNES."
Supersedes the column counts in `LEVELS.html` (110 to 190) and the three short levels of order 8.

## Decision
The measure every level is held to by `levels.test.ts` (order 10 rule 6):
- 220 to 280 columns. (World 1-1 is about 210 tiles; this screen shows about 20.)
- A scripted clear of at least 60 s (level 10: 90 s), reached by distance, not waits. (Since
  order 12, 40 s and 80 s: the waits were cut; see [0020](0020-waiting-is-not-length.md).)
- Four sections: teach the new thing where it cannot fail, practise it over a small drop, twist
  it with something from an earlier level, end on a set piece with the rune.
- Something to do on every screen.
- 40 to 80 skilling, tracing the good line and rewarding the high route.
- Two or three secrets; one holds the bracteate (feather), one the brown cheese.
- A flag near the middle and before the set piece; one or two benches; two to four signs.
- A flourish when the rune is taken.

## Consequences
- The first three levels were rebuilt (batch D) and their old best times cleared once (0012).
- Levels are built with strokes (`levels/build.ts`), not typed-out rows.
- The test measure is the definition of "a level". Change it on purpose, not by accident.

## Not chosen
- Sub-areas, pipes to bonus rooms, or a mid-level change of scene. One scrolling map per level.
- A timer that kills. The clock only counts up for a best time.
