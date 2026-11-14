# 0001. The front page is the cloth

Decided 2026-11-10 by the planner in `docs/games/PLAN.md` §2, confirmed by Lars on 2026-11-13
("make the two games share style, art and physics; pixel art") and again on 2026-11-14
("remember to use the pixel style from the front page").

## Context
Three games lived in one repository and looked like three sites: the front page (Canvas 2D,
code-drawn pixels), a viking game (PixiJS, React, smooth vector shapes, 505 kB) and a maze (DOM
divs, jQuery, PNG tiles, 5 MB mostly audio). The table in `PLAN.md` §1 lists the differences.

## Decision
The front page is the reference. The viking game and the maze are rebuilt in its style on its
code, moved into `packages/pixelkit`. Same person (10 by 14 pixels, red hat, blue sweater), same
16 px tiles, same swatches, same real-Oslo sky, same sign boards and header.

## Consequences
- Every kit change is gated on the front page staying byte-identical (see 0005).
- A new screenshot that does not look like the front page's game is a defect.
- The viking game dropped React and PixiJS; the maze dropped React and jQuery.

## Not chosen
- Making the viking game's smooth style the reference: it was the least finished and the heaviest.
- Three looks with a shared header only: would not have been "one cloth".
