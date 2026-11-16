# 0046. Everything that moves has frames and a shadow

Decided 2026-11-16 by the planner (order 23, sections 1, 2 and 5), after Lars said of the game in the conversation he
saved: "shoddy enemy design and parallax design … hard to see the enemies, not that engaging". Order 22 answered "hard
to see" with paint; this answers "not that engaging" with what the research record
(`docs/games/research/2026-11-16-reference-games.md`) found in three loved games and missing in ours. Carried out by the
order 23 implementer. Drawn at the grain Lars chose ([0045](0045-the-grain-same-grid-better-drawn.md)).

## Decision
- **Frames are picked from state the game already keeps**: speed, on the ground, time since landing, the dash, the
  shield, a seat, a hit, an enemy's own clock and the distance it has covered. No box, speed or timing changed; the
  sloppy player's runs are byte-identical (order 23's hand-back).
- **Him** (`apps/viking/src/alive/him.ts`): a breath of two frames (a second each) and a blink now and then; a run of four
  frames timed to the distance he covers, three pixels a frame, so a planted foot goes back exactly as far as he goes
  forward and holds on the ground (tested); rising, the top of a jump and falling as three poses; landing squashed for four
  steps, six and deeper from higher than three tiles; a lean into the dash; braced behind the shield; sitting (leaning back
  as the sledge's run drops, forward as it rises); thrown back by a hit until he lands; pushing into a door. Drawn on the
  text canvas by `render/feel.ts` (the page gives the kit's overlay an alpha of nought once that file is here); the front
  page keeps its own person, byte for byte. While the helmet comes down onto him at a door the old person is drawn.
- **Every enemy and harmless mover**: an idle of two frames or more, a move cycle of three or four, the wind-up a pose
  (order 19's, kept), and a death of three frames (hit, fold, gone) from its own shape within the eight steps the squash
  took (`alive/death.ts`). The enemies of line 1's first three levels are drawn as per-pixel frames (`alive/foes.ts`,
  `render/looks.ts`, `levels/akershus.ts`); every other look gets its frames from `parts` (`alive/parts.ts`, which left
  the first script): a cycle of four by distance (legs by `stride`, the body down as a foot lands and up as it passes, the
  legs stretched to meet it), a breath when still, a flyer's rise and fall at half its wing beat, a jumper's stretch rising
  and squash falling. Stone does not breathe (a statue he watches). The troll breathes asleep and walks in four frames; the
  plough's wheels turn and its engine ticks over parked; sheep walk. `alive/frames.test.ts` holds it for every look of
  every level (the census, `alive/census.ts`).
- **Reduced motion** keeps the breath and the cycles (they are how he reads state), not the landing's squash, the fold of
  a death, or anything that shakes.
- **A shadow under everything that moves** (`alive/shadows.ts`): him, enemies, sheep, what is thrown, carriers over ground,
  the troll and the plough. A soft ellipse 1.2 times its width (an outlined enemy's as drawn) and a quarter of that high,
  on the ground below it, smaller and fainter the higher it is (gone eight tiles up), also under him in the air (where he
  will land) and under a gull (how high it is). Over a pit or water, none: a faint one on the water came within 9.6 of his
  blue and read as a dark patch. Black at a share of the ground's light (an edge of 0.22, a middle of 0.41 at most), so
  the same step darker under every sky as the night's tint goes over it with the ground; held by the palette test: every
  colour of every level's ground under a shadow stands 10 or more off every role's colours but his blue (as the water is
  not held against it under the tints). From ellipses drawn once: copies, no rectangles.
- **The alert mark** (section 5): over anything at the moment it turns on him (a statue or a guard waking, a swan's
  warning, a thrower taking aim at him within its reach, the troll rising, the plough starting up) a "!" in the hurt red
  with a dark edge springs up, swells and shrinks twice in its first 24 steps and stands to 40 (still and whole with
  reduced motion), with order 19's sound where that moment has one (a statue's grind, the swan's hiss, the troll's waking).
  An arrow at the screen's edge for a thrower or flyer about to come into view within a second: tried, see the hand-back.

## Consequences
- Every tone is held by the palette test: the enemy palette gained `plumDark` and `whiteShade`; his tunic's and skin's
  ramps are named in `ROLES.him` (the tunic's three held by day off every field).
- First script: from 59.85 to about 59.4 kB gzipped: the shared enemies' and the small things' old drawings and `parts`
  left it for `feel`'s file, which every scene waits for (a scene opens without it only if it never comes, and then shows
  plain boxes for enemies and coins).
- A level author's rule (DESIGN): a new enemy has an idle, a cycle, a wind-up pose if it throws, and is drawn as frames.

## Not chosen
- Frames by the clock for the run: the feet slide. Distance holds them.
- A shadow on the water: see above.
- Redrawing every enemy as frames in this order: the scope Lars's choice set is him, the first three levels' enemies and the
  small things; the rest are listed in order 23's hand-back for later orders, a level at a time.
