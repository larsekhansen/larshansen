# 0007. The maze is an optional bonus stop

Lars, 2026-11-13: "Somehow make the maze game much better and incorporate as a bonus level.
Remove the music from it. But make a fork, so the original isn't lost. Or a copy."

## Decision
- Jernhaugen is a side stop on the line map (a dip between stations 1 and 2) and has a second
  door on the mound in Nordmarka. It is never required for a rune.
- Clearing maze level 3 gives the raven's feather, a double jump; clearing all seven turns it
  gold. The feather's only use in the levels is reaching the gold bracteates and some secrets.
- "Much better" was built as: a ghost of your best run, marks and pars per level, teleport
  stones, impact effects, a finish card per level (order 9).
- No music. `nomusic.test.ts` guards it.
- The original is kept on the branch `iron-maze-original` and in the archived repository
  `larsekhansen/iron-maze`.
- The maze still stands alone at maze.larshansen.dev (`apps/iron-maze`).

## Consequences
- A visitor who dislikes mazes loses nothing but ten bracteates.
- The branch is drawn as a dip in the walkable line because a side view has no way to leave a
  line for a lower branch without a drop-through key.

## Not chosen
- Making the feather required for later levels. It would have made the maze compulsory.
- Hearts or enemies in the maze. It keeps its own rules.
- Deleting the standalone maze site.
