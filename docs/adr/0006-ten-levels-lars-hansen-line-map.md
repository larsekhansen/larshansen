# 0006. Ten levels spelling LARS HANSEN, on a line map

Lars, 2026-11-13: "make the viking game longer. Levels. 10 levels. Theme is Oslo. And me." The
shape is the planner's.

## Decision
- Ten levels, one rune each; the ten runes spell LARS HANSEN, and each place starts with its
  letter: Langkaia, Akershus festning, Rådhuset, Slottet, Holmenkollen, Akerselva, Nordmarka,
  Stortinget, Ekeberg, Nabolaget.
- The level select is a T-bane line map you walk along (`#kart`). A station opens when the level
  before it is cleared.
- Each level has one idea (its mechanic) and one picture (the screen worth sending to a friend).
- The journey starts where the front page ends (the Opera) and ends where the front page begins
  (home, in Gamle Oslo).

## Consequences
- Level names cannot change without breaking the spelling. Nabolaget is "the neighbourhood" so
  that the last N could be home wherever home is; home is named in its signs (0014).
- The order of mechanics is a ladder: each level adds one thing, level 10 adds none.

## Not chosen
- A world map with free choice of level. The line is simpler and is itself an Oslo thing.
- Fewer, longer levels. Lars said ten.
- Real geography for the line's order. The letters decide the order.
