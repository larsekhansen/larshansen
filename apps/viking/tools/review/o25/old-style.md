# Order 25: what is still drawn in the old style

Lars chose way 3 (ADR 0045): figures and small things drawn as per-pixel frames with a ramp of tones and a lit side.
Order 23 drew him, the first three levels' enemies, the skilling and the cheese that way; order 24 the rest of line 1 and
what every level shares (`../o24/old-style.md`); order 25 line 2's own and what was still left anywhere. **Nothing that
moves or is picked up is drawn in the old style now**, with the exceptions below, each for a reason given. No look of any
level draws through `parts`' rectangles any more (`grep "parts(" src/levels src/render` finds none); `parts` is what
`drawFoe` places a frame with.

## Done in order 25

- **Bygdøy** (`src/levels/bygdoy.ts`): the crab (claws that snap, legs in four by the distance), the penguin (a black back,
  a white front, a waddle), the slinger (plum or pink, a beard and a cap; its sling goes round over its head in four
  frames while it winds up) and its stone (turning in two).
- **Vigelandsparken** (`src/levels/vigelandsparken.ts`): the statues and the bronzes as one figure in four poses: watched,
  in the park's own granite with lichen and bronze with verdigris (calm); walking, the enemy's plum or orange with the
  poison green of lichen or verdigris, eyes open, a stiff stride in four frames. The moment one turns is the change of
  colour and outline and the "!", as before (`feel.test.ts` holds the outline's change). The Angry Boy (standing,
  stamping, leaping, coming down), the ring-throwers (on their pedestals, breathing, a ring raised) and their rings.
- **Korketrekkeren** (`src/levels/korketrekkeren.ts`): the sledgers (a kid on an orange sledge: sitting, riding with its
  scarf streaming, leaning in to push off, pulled off); and found on the walk: **the sledge** and **him lying back on it to
  duck**, which was the one picture of him still in rectangles.
- **Østensjøvannet** (`src/levels/ostensjovannet.ts`): the swans (gliding, hissing, coming at him with their wings up),
  the coots, the nesting gulls (on the nest, rising to dive) and their dives, the heron (standing, looking back, making
  ready, flying off). The lake's duck is Akerselva's mallard, shared now (`src/render/looks.ts`).
- **Bjørvika** (`src/levels/bjorvika.ts`): the riveters and their bolts; found on the walk: the welder on the beam.
- **Gamlebyen** (`src/levels/gamlebyen.ts`): the bishop's guards (stone, then woken with the halberd levelled), the
  archers (the bow drawn as they wind up), the geese, the dog, the arrows (tumbling when stopped) and the serpent's ball.
- **The sea serpent**, every state: its head a map (jaw shut, dropping open, open to spit; dazed with its eye shut and
  tongue out), its neck, coils and tail in five tones of scale from a moonlit ridge, its belly's plates, its crest, its
  fin; the ring, the swelling throat and the stars over its dazed head in the "now" violet, where they were.
- **Found on the walk, line 1**: the crowds along Karl Johan (Slottet) and under the ski jump (Holmenkollen), people
  shaded with their flags waved (`person`, `crowdFlag` in `src/alive/things.ts`, each copied).
- **Section 2**: the wasp (larger, its bands and waist plain), the flying pigeon (fuller, drawn for its kept box), the
  track rat's rising frame (stretched out nose first), the kid's hat (a bobble hat), the troll's lit side after dusk.

Looks drawn for the box their level keeps (Bjørvika's and Gamlebyen's, the lake's coot, Stortinget's flying pigeon and
track rat) are drawn at that height (`drawFoe`'s `fit`), not squashed to it, so no row of their pixels is lost.

## Looked at on the walk and left as they are

Every level was walked a place every forty columns at 1280 x 800, and the line map at three places with every station
cleared (pictures in `/tmp/shots-line2/walk/`, not committed).

| Thing | Where | Why it stays |
|---|---|---|
| Carriers: ferries, rafts, boats, trams, trains, hooks, the moose's back, the longships he crosses on | many | What he stands on (ADR 0039, 0044): drawn in their own materials with the paint on top. None carries a drawn passenger or crew. |
| The longship at anchor on the line map | `src/levels/kartArt.ts` | A picture that bobs, drawn a column at a time; it has no crew. Redrawing it is scenery, not a figure. |
| Gulls far off and over the water (`gull`, five pixels) | `src/render/backdrop.ts` | Already pixel by pixel at their size; scenery, quieter than every role. In the first script. |
| The sailing boat on the fjord's plane | `src/alive/depth.ts` | Seven pixels, far; scenery. |
| Figures that never move: the fountain's giants, the plateau's groups, the bridge's bronzes, the Monolith, the reliefs, shadows in Vålerenga's windows | Vigelandsparken, Vålerenga | Scenery. They are drawn with `figure` and its like, as the park's stone is. |
| The taken rune flying to the header | `src/main.ts` | The rune's own glyph, cell by cell, in its glow. |
| The plain shapes `render/pickups.ts` and `render/actors.ts` keep | the first script | Drawn only if `feel`'s file never comes. |
