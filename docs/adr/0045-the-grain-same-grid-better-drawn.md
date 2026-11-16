# 0045. The grain stays; the drawings get better: same grid, better drawn

Decided 2026-11-16 by Lars, after order 22's study (`docs/games/GRAIN.md`): "do way 3 like you suggested. for the
pixels". Answers his worry of order 22: "i just fear i made a blunder with the pixel design. or rather that the pixels
are too big. they need more detail. espeiclally small items." First carried out by order 23.

## Context
Order 22's study measured the grain and drew the same subjects (him, the rat, the pigeon, a skilling, the cheese, the
shield, a bracteate, the flag, the bench) three ways on two scenes (Langkaia's quay, Stortinget's platform), at a laptop's
and a phone's size. Two loved games with pixels as large as ours (Celeste Classic, Shattered Pixel Dungeon) look fine
because every pixel is placed by hand with three to five tones per material; ours were drawn with rectangles in code, one
tone per material. The research record (`docs/games/research/2026-11-16-reference-games.md`) came to the same.

## Decision
**Way 3: the same grid, better drawn.** The art pixel stays the size it is. Figures and small things are drawn as
per-pixel maps: rows of letters, each letter a colour from a ramp of three to five tones per material, with a lit side and
a shaded side, eyes, a hand; painted once into the sprite cache, as the enemies already are, so a frame costs what it cost.
New drawings are made this way (DESIGN's rule for level authors). The maps are data, so a later change of grain would be
the same maps at another scale.

## Consequences
- Order 23 drew him (every frame), the enemies of line 1's first three levels (Langkaia's pigeon, gull and rat;
  Akershus's crow, guard and brazier; Rådhuset's standing gull and the scooter) and the skilling and the cheese this way
  (`apps/viking/src/alive/`, `render/looks.ts`, `levels/akershus.ts`). Every other drawing is still in the old style; the
  order's hand-back lists each (kind, level, file), for the next orders to redraw a level at a time.
- Every tone is a role's colour and is held by the palette test (ADR 0039, 0044): the enemy palette gained two shades
  that pass (`plumDark`, `whiteShade`; no darker orange, green or pink does), his tunic and skin ramps are named in
  `ROLES.him`.
- No change to the kit, the front page (its 28 pictures byte-identical), hit boxes or ADR 0003.

## Not chosen
- **Way 1, finer small things** (him, the enemies and what he takes on a grid twice as fine): a canvas at twice the view's
  resolution in the kit, every map four times the pixels, mixed grain where a fine foot meets a coarse plank, and on an
  upright plain screen the half pixels cannot be shown at all. Kept as a later step for him and the pickups alone if they
  still read as blobs on a phone after way 3.
- **Way 2, everything twice as fine**: every drawing in the game (364 drawing functions in the levels, the map, the kit
  the front page shares) at four times the pixels, every canvas at twice the resolution (which a phone with three device
  pixels a point cannot show evenly), the front page's 28 pictures, and the first script's budget, for a gain the study's
  pictures did not show on a phone.
