# 0002. Art is drawn in code; no asset files

Decided 2026-11-10 by the planner (`PLAN.md` §3), kept through every order since.

## Context
The front page draws everything with filled rectangles. The old maze shipped a commercial
recording and a film poster in a public repository.

## Decision
All art is filled rectangles from named swatches (`packages/pixelkit/src/swatches/`,
re-exported by `palette.ts`). No image files, no font files, no audio files. Text is the system
font drawn sharp by the kit. Sound is synthesised in `sfx.ts`. No black outlines. Swatches used
by one level only live in that level's own swatch file so they ship in its chunk.

## Consequences
- Nothing in the repository has a licence question. A test (`packages/maze/src/nomusic.test.ts`)
  keeps audio files out of the maze.
- Art is written by whoever writes the level, which makes it uneven: large plain areas and
  repeated grids are a standing weakness.
- New creatures are 8 to 14 px, two or three colours, a two-frame walk.

## Not chosen
- Sprite sheets or a pixel editor: better art per hour for a person, but nothing an implementer
  on this Pi can produce or check, and a second style to keep consistent.
- Keeping the old maze's music. Lars asked for it to go.
