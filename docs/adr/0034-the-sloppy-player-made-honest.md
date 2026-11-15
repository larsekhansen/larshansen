# 0034. The sloppy player made honest, and what that did to line 2's targets

Decided 2026-11-15 by the order 17 implementer, while carrying out order 17's A5 ("fix the three harness
artefacts") and measuring line 2 on fresh seeds. The review's tools are in `apps/viking/tools/review/`;
[0005](0005-checking-without-a-player.md) says why they stand in for players, [0029](0029-the-hesitating-player.md)
what the hesitating player is.

## Context
The review of line 2 found three artefacts in the sloppy player (A5): a walk that overshoots loops for ever
(the "mistakes" profile), a fall at Bygdøy's ferry resumed at the walk onto the ferry instead of the wait for
it, and a walk that carries him onto the sledge never ending. Working on the serpent, order 17 found three
more, two of them large:
- the look-ahead copied the boss's state shallowly, so the serpent's ball and tail (objects of their own)
  were moved k extra steps every step of a run with timing errors: at ±4 they flew five times as fast;
- a jump pressed early (by the timing error) reached the game while the route, asked on the real state, saw
  him already in the air and only held the key, never pressed it, so the key was let go at once: a hop of a
  few pixels wherever a route presses only from the ground (the serpent's tail, Nordmarka's wave);
- a walk to where the perfect run stood, after being put back on the sledge, ran up to ten seconds with the
  route's own moves (the ducks, the jumps) not asked at all.
A short walk through a wall was also taken as walkable (St. Clement's gable).

## Decision
- The look-ahead copies the boss's state deeply; an early press is held while the route holds the key; a
  person's walk is done within 4 px once it has gone past and back and past again, and is over once it has
  carried him onto the sledge; after a fall the route resumes at the wait before the place when it was at
  the same place; a wall between him and a place is never walkable (`sloppy.ts`).
- `obstacles.ts` tries every move of a route, whatever it is called, on fresh seeds, and marks the moves in
  the air over water or a pit, the ones held to 0.4 hearts a try (`allmoves.ts` is now it).
- Line 2 is measured on fresh seeds (101 to 200), not the seeds its levels were tuned on.

## Consequences
- Every level loses fewer hearts than before, line 1 too; numbers from before order 17 are not comparable
  with later ones. Line 1's were rerun (`line2-after/`, with three levels also run on the code from before
  order 17: the same numbers, so order 17's changes did not make line 1 worse).
- Order 17's targets for line 2 (Bygdøy 1.5 to 2 hearts a run at ±4 rising to Gamlebyen 3.5 to 4.5) were set
  on the old numbers. After order 17's changes, line 2 at ±4 is Bygdøy 0.85, Vigelandsparken 2.41,
  Korketrekkeren 0.21, Østensjøvannet 0.73, Bjørvika 1.64, Gamlebyen 1.04, against line 1's Akerselva 2.40
  and Ekeberg 2.80: it does not rise, and only Vigelandsparken is on its mark. Retuning six levels against
  the honest measure is left for a later order, with these numbers as its starting point.
- The serpent's fight, measured honestly, is easy for a player who knows the answer (under a tenth of a
  heart at ±4); [0031](0031-the-serpent-made-good.md) says why it was not made a reflex test.

## Not chosen
- Keeping the old numbers comparable by keeping the artefacts: the point of the tools is to stand in for a
  person, and a person who presses jump a little early jumps a little early.
