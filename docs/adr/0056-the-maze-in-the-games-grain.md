# 0056. The maze in the game's grain: the same man, an iron-bound mound of its own, and the maze in the hand

Decided 2026-11-22 by the planner (order 36, "the maze catches up": the roadmap's idea 8, "the maze has had none of orders 18
to 27"), with Lars away and his standing words: "keep looking for more assets that should have increased details. and consider
them with the rest of the game. interaction, fit, thematics, etc. ... remember to write docs too btw." Carried out by the order 36
implementer. Within [0003](0003-fixed-body-constants.md) and [0007](0007-maze-as-optional-bonus.md) (the maze's rules are its own and
did not change), [0039](0039-colour-says-what-a-thing-is.md) and [0044](0044-paint-says-where-to-go.md) (colour says what a thing is),
[0043](0043-the-game-in-the-hand.md) (the game in the hand), [0045](0045-the-grain-same-grid-better-drawn.md) to
[0049](0049-the-ground-is-textured.md) (the grain, frames, the ground) and [0050](0050-the-glamour.md) (neon is the glamour's).

## Context
Jernhaugen (`packages/maze`, inside Vikingfjorden at `#jernhaugen` and alone at maze.larshansen.dev) was rebuilt in order 9 in the
front page's flat style and had none of orders 18 to 35. Looked at first (`apps/viking/tools/review/o36/before.md`): he was a disc
seen from above, not the man of the fjord; the walls were the front page's stonework and the floor a flat field; the snakes had no
warning red; the key and the door had no read; the help line named keys on a phone, never went away inside the viking page and ran
off a phone's screen on the maze's own page; the raven's words ran off it too; the sliding walls' warning and an adder's tongue
blinked with reduced motion; and the maze had no stepped harness inside the viking page.

## Decision
- **The same man.** The maze draws him from the viking game's own sheet: his frames and the frames' machinery move into the kit
  (`packages/pixelkit/src/frames.ts`, `him.ts`; the viking game's `alive/` re-exports them, and its build keeps them in `feel`'s file),
  so there is one drawing of him. The mound is seen from above with its walls' faces showing (a three-quarter view), so he stands on
  its floor as the walls stand: his feet at the foot of his six-pixel body, his head over it, facing the way he last went sideways,
  running by the distance he covers, breathing and blinking standing; in his front hand a torch, its flame held still with reduced
  motion. His ghost is the same man, pale. The raven's feather over the last finish is the fjord's feather (`pixelkit/feather.ts`).
- **The mound is its own place, drawn by the game's methods** (`packages/maze/src/look.ts`, `figures.ts`): every material a ramp of
  three to five tones of one hue, light from the top left, four variants a tile by a hash of its place. The floor is packed earth with
  pebbles lit on their top left and a worn flagstone now and then, and the walls' shadow on it below and to the right of them; the
  tunnels are lined with stone in courses, each wall's front face shaded, lit on its lip, its foot in shadow and an iron band riveted
  across it, iron cramps over joints (the mound is named for iron); round the tunnels the hill's near-black earth with a buried stone
  and a root. Not a tenth viking level: no glamour, no neon, no paint, no sky. A level's still layer is a grid of colours made once a
  level (`stillPixels`) and put on a canvas in one go.
- **The kit's read where the maze has the thing.** The adders, which hurt and move, are outlined as the fjord's invaders are (the
  near-black line, the warning red) and are the mound's own natural adders, grey-brown with the zigzag, not glammed. The rune key's bow
  is the take-gold with its glint; the door on has its corners in the use cyan. The curse's rust-red line along every wall is the
  walls' warning, as before. Nothing harmless comes within 10 of the warning red or the curse's reds (`warning.test.ts`).
- **In the hand.** On a touch screen the help line says what a finger does and names no key, in both pages (`helpFor`), wraps, keeps
  off the home bar and goes at his first move (inside the viking page too); the raven's words wrap into bubbles stacked as the fjord's
  are and keep off a notch; the maze marks the page (`mz-touch`) so its cards' buttons and the level list's rows are 56 tall; the
  viking page keeps its touch styles in the mound (its bar's targets, its cards' buttons), its header in two rows; the maze's own
  page wears Vikingfjorden's solid bar, its targets 56 x 56.
- **Reduced motion**: nothing blinks: the sliding walls' warning is steady, an adder's tongue stays out, the raven does not blink
  (`reduced.test.ts`).
- **Checked as the fjord is**: one stepped harness for both pages (`packages/maze/src/debug.ts`, under `?debug` only: the viking page
  fetches it then), a finger that plays a level through the scene's own touch code (`bot=finger`), the ways into and out of the mound
  in a stepped picture (`walkin`, `out`, `after`), the joins in a test (`joins.test.ts`), the maze's figures on the page of every
  figure (`apps/viking/tools/figures.ts`).

## The rules did not change
No level's map, speed, timer, record, mark, ghost format or stored key changed: the scripted player's runs on every level, both
speeds, both ways where there are teleport stones, are identical step for step with `origin/main`'s, and ghosts written by
`origin/main` read back to the same points and the same finish (`packages/maze/tools/runs.ts`).

## Not chosen
- **Him from above, redrawn.** A second drawing of him; the order asked for the sheet if the maze could draw it at its size, and it can.
- **Front and back views of him.** A second drawing again; he faces the way he last went sideways, as many games with only side frames do.
- **The glamour in the mound.** The mound is not Oslo: the adders are its own, natural, with the red outline saying they hurt.
- **The kit's stonework for the lining**: the front page's, flat; the mound's own lining is drawn once a level, so its detail costs nothing a frame.
- **A larger maze inside the viking page on an upright phone.** The page's stage keeps the view 240 art pixels wide for its levels
  (ADR 0019), which shows the whole of the mound's width; changing it is a question for the page, not the maze.

## Consequences
- The maze's own file inside the viking page grows (its scene chunk from 14.7 to 18.4 kB gzipped: the look, the figures); his frames
  come from `feel`'s file, which the page has already. The viking page's first script grew 0.18 kB (the maze's way in under `?debug`
  and on a touch screen, the wrapped feather line). The maze's own page's script from 29.3 to 34.4 kB gzipped.
- Rectangles a frame on every level within 100 of before at 390 x 844 (`apps/viking/tools/review/o36/after.md`).
- Unplayed: none of it has been touched on a phone or seen at speed.

## Amended by order 37 (23 November 2026): his back and his face, and the maze page's first script
Order 36 did not draw front and back views of him ("a second drawing again"); half of all the walking in a maze is up and down a
corridor, where he ran sideways. Order 37 (`docs/games/orders/37-up-and-down-in-the-mound.md`) draws them, and that part of "Not
chosen" is reversed:
- **His back and his face** are the kit's `himviews.ts`: going away, the helmet's dome and rim, his nape in the skin's shade, the cape
  from his shoulders to his belt (lit on the left, a fold, its hem), his heels; coming toward, his face under the rim with the helmet's
  nose guard and his eyes, the tunic's knit, the belt and its buckle, his toes. Each stands (breathing; the face blinks) and runs in
  four frames by the distance he covers at the side run's rhythm (a step, a pass a pixel higher, the other step, the other pass), so
  his pace holds round a corner. His 10 x 14 box, his sheet's letters and ramps, lit from the top left, his torch hand held out on the
  side he faces, mirrored with his facing as the side frames are. No beard: his side sheet has none. Only the maze imports the file;
  the viking build leaves it to the maze's own (19.5 kB gzipped inside the viking page, 18.4 before), so neither the fjord's first
  script nor `feel`'s file carries it.
- **Which of his drawings shows** is `packages/maze/src/heading.ts`, drawing only: the way he moves smoothed over a few steps; his back
  or his face once that way is steeper than 60 degrees, his side once it is flatter than 30, and between the two as he was (a steady
  diagonal at any angle changes it at most once, with keys, a mouse or a jittering finger: `heading.test.ts`); he faces the way he goes
  sideways whenever his move is no steeper than about 63 degrees; standing keeps the drawing he stopped in. His ghost's walk is worked out
  once from its points (how far it has come and its drawing at each step), so its run goes by distance as his does. The ghost's stored
  format did not change.
- **The maze's own page** fetches its checking aids only under `?debug` (as the viking page does), and the kit's synth a moment after
  the page through a stand-in that keeps the shared mute: its first script from 34.40 to 31.93 kB gzipped by GNU gzip, his views and their
  heading (1.1 kB) in it. The aim was 31: not met by 0.9 kB.

The rules did not change: the scripted player's runs on every level are identical with `origin/main`'s, and its ghosts replay to the
same ends (`apps/viking/tools/review/o37/after.md`).
