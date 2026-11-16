# 0041. What is off the screen is not drawn, and the dark is drawn in rectangles, not rows

Decided 2026-11-15 by the order 20 implementer, on the planner's order (order 20, section 1). Amends
[0036](0036-drawn-once-and-copied.md), whose list of what was still heavy it works through.

## Context
After ADR 0036, `?debug&perf` at 390 x 844 still found three levels far over the rest: Nordmarka 16,600 to
29,100 rectangles a frame (its dark and the headlamp's pass about 10,000 of them where the night changes along
the view), Bygdøy 21,500 to 22,900 wherever he stood, Korketrekkeren 15,000 to 15,800 wherever he stood. The last
two were the same number everywhere because most of it was drawn off the screen: whole-level drawing (Fram and
her hall, the ship hall, the run's 870 ledges and its hillside, fifty spruces along Nordmarka's path, the gorge)
went out every frame, and the canvas threw it away. A rectangle costs its call whether or not it lands.

## Decision
- **What cannot be on the street's canvas is not drawn.** `seen(x0, x1)` (`packages/pixelkit/src/kept.ts`) says
  whether world x0 to x1 is on it; a level's drawing that spans the level asks before it draws a piece
  (Bygdøy's pier, beach, boathouses and storehouses; Korketrekkeren's hut, gap, branches and dusk; Nordmarka's
  undergrowth), and Korketrekkeren's run draws only the ledges and hillside on the screen.
- **Large pieces that never change are kept as strips** (`keptStrips`, 128 px wide, each drawn once and copied):
  Bygdøy's Fram with her hall and Gjøa, the Kon-Tiki hall, the ship hall with the longship, the loft, the
  museum's gable; Nordmarka's gorge (`kept`). Their lit windows are registered every frame outside the kept
  drawing, so they still come on after dark.
- **Shapes that look alike wherever they stand are stamped** (`stamp`): drawn once in their own frame and copied
  to where they stand, on the street or on a far layer: Nordmarka's spruces (the path's, the nearer rows and the
  trunks behind) and Korketrekkeren's.
- **The dark is drawn in rectangles.** `merged` (`packages/pixelkit/src/dark.ts`): a piece of a row of the dark
  that is the same as one in the row above (the same x, width and darkness) makes that one a row taller instead
  of being filled again. Away from the lights every row of the night is alike, so a frame's dark is a few hundred
  rectangles, not one per row per piece. Nordmarka's headlamp pass does the same with its two kinds of piece
  (behind the street, then over the soil), so every pixel gets the same fills in the same order as before.
- **`kept` packs pieces of any size** onto shared 512 px sheets, shelf by shelf, each drawn clipped to its own
  cell (so a strip of a larger drawing takes only its part); before, each size had sheets of its own, which a
  hundred spruce heights would have filled with sheets.
- **Chunks.** `kept.ts` is a chunk of its own, fetched by the levels that keep or stamp (Stortinget, Nordmarka,
  Bygdøy, Korketrekkeren, and since order 20's flat places Rådhuset, Vålerenga, Østensjøvannet and Gamlebyen),
  and so is `dark.ts` (Nordmarka and the maze's dark level): the first script went from 59.43 to 58.94 kB
  gzipped.

## The rule that goes with it
As in ADR 0036: the pictures are byte-identical. Order 20 compared the build before and after at both sizes:
Nordmarka 19 of 19 at 1280 x 800 and 19 of 19 at 390 x 844 (every twentieth column, the dark middle and the
troll's arena, facing both ways, by day); Bygdøy and Korketrekkeren 36 of 37 at each size (the 37th is a place
where a slinger hits him on the first step, so the page holds its picture and nothing new is drawn at all: at
step 0 it is identical); Stortinget (whose `kept` changed) 14 of 14 at each; the front page 28 of 28.

## Consequences
- Rectangles a frame (`?debug&perf`), before and after:

  | | 1280 x 800 | 390 x 844 |
  |---|---|---|
  | Nordmarka, the start | 13,822 → 3,348 | 23,772 → 4,242 |
  | Nordmarka, the dark middle (column 175) | 15,277 → 4,547 | 17,354 → 5,459 |
  | Nordmarka, the troll's arena (column 210) | 15,725 → 4,480 | 18,289 → 5,426 |
  | Nordmarka, worst of its walk | | 29,101 → 5,744 |
  | Bygdøy, every twentieth column | | 21,454 to 22,940 → 5,764 to 7,343 |
  | Korketrekkeren, every twentieth column | | 14,975 to 15,789 → 3,429 to 3,726 |

  Every level's walk before and after is in `apps/viking/tools/review/o20/perf.md`.
- A level that draws something across its whole length should ask `seen` first, or keep it; a shape repeated
  along a level should be stamped. Scenery added since (order 20's flat places, ADR 0042) is drawn so.
- Order 21 did Stortinget the same way (its halls, shafts, escalators, cavern and trains drawn only where on the screen,
  its far rock stamped in 128-pixel blocks: 27,900 to 29,900 rectangles a frame at 390 x 844 to 3,600 to 9,950) and
  Slottet (the ground under the street kept tile by tile, its slopes only on the screen: 13,300 to 17,800 to 9,000 to
  9,800); every level is now under 15,000 at every place of its walk; the pictures byte-identical
  (`apps/viking/tools/review/o21/perf.md`).
- Not done: the far layers' columns (`column`, a rectangle per screen column per layer: 700 to 1,500 a frame
  at 390 wide), the kit's tiles and Stortinget's far rock (27,000 to 30,000 a frame at 390 x 844, now the
  heaviest level) are still drawn every frame; colours are still set on every rectangle.
