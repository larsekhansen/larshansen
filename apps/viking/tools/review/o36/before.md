# Order 36, item 1: the maze as it was, looked at first

Taken on 22 November 2026 on branch `the-maze-catches-up` from builds of the maze as it was (`origin/main`'s drawing; the only change
in those builds is the stepped harness, `@larshansen/maze/debug`, which draws nothing: the maze's own page's pictures from it are the
same as `origin/main`'s build at the addresses compared). Pictures, outside the repository, in
`~/.cache/claude-scratch-larshansen/o36/shots/before/` (`levels/` every level at its middle in both hosts at 390 x 844, 360 x 640,
844 x 390 and 1280 x 720; `start/` the first level as it opens, with `&touch` and without, in both languages, at the four sizes;
`reduced/` every level with reduced motion; `moments/` a curse, the level list, the card after level 3, a ghost, a teleport, the last
chamber and the end card, 390 x 844 in both languages and 1280 x 720), `shots/four/before/` (fifteen places at 1280 x 850, four screen
pixels an art pixel) and `shots/item1/` (each figure at four times beside the viking game's thing of the same kind). 141 pictures in
`before/`, none blank once the start pictures were taken after the fade (at step 0 the level is still black under its fade-in).

## The harness the maze did not have

The maze inside Vikingfjorden had no stepped harness: `?debug&steps=N#jernhaugen` stepped the page's scene behind it and drew the
mound once at its first step. Its own page had one in its main script. Both now use one module, `packages/maze/src/debug.ts` (the
viking page fetches it only under `?debug`, so no visitor carries it): `level`, `bot=keys|pointer|finger`, `portals`, `walk`, `at`,
`records=demo|all`, `ghost`, `levels`, `steps`, `perf` (with `post=<port>`), `reduced` on the maze's own page, and the page says when
its picture is drawn (`tools/shots.ts --wait`). Addresses: `/viking/?debug&told&level=3&bot=keys&steps=560#jernhaugen` and
`maze.larshansen.dev/?debug&level=3&bot=keys&steps=560`.

## What the maze draws, and the viking game's thing of the same kind

At four times (`shots/item1/<name>.png`: the maze on the left, the viking game on the right).

| Thing | The maze before | The viking game now | Flat? Clash? Readable on a phone? |
|---|---|---|---|
| Him (`him.png`, `him-sheet.png`) | A disc seen from above, 10 x 10: an iron helmet dome with a white pompom, blue shoulder pixels, a skin pixel and a flame for the torch (the kit's `person.ts`, `view: "top"`) | 10 x 14 frames in ramps (lit helmet and shaded rim, lit face and shaded back of the head, the tunic lit at the front with its knit, a cape, trousers and boots lit on their edge), a breath, a blink, a run of four by distance (`alive/him.ts`) | **Not the same man.** On an upright phone a grey dot with a blue rim: nothing says viking |
| Walls (`walls-floor.png`) | The front page's stonework (`stoneColumn`: blocks 6 x 4 in three flat tones, no lit edge, no foot), a front face of five pixels in one dark tone with two iron studs a tile; under the night tint a blue-grey wallpaper | The textured set: blocks lit on their top, a shaded foot, moss in shadowed joints; walls with depth | Flat, and the front page's, not the mound's; the iron the mound is named for is two pixels a tile |
| Floor | One earth colour with twelve single-pixel specks a tile and a flagstone in one tile of seven | Earth under a top band, pebbles lit on their top, tufts, a lit top and shaded foot | A flat field; no depth where it meets a wall |
| The hill round the tunnels | One near-black with a speck now and then | (Nordmarka's dark, `dark.png`) | Flat by design, but nothing in it |
| Snakes (`stone-adder.png`) | Bands of the old game's green and purple, a dark outline, a red tongue | What hurts and moves: a near-black line and the warning red round it (ADR 0044), in the glamour's neon | **Clashes**: no warning red, so it does not say "hurts" in the game's language; its colours are neither the mound's nor the glamour's |
| Standing stones | A pale rectangle, one lit edge, a dark rune; the rune blue once lit | Flags and benches: frames with ramps; a tick once done | Flat |
| The rune key (`key.png`) | A pale blue-grey iron key with a dark outline | What he takes is copper and amber gold with a pale glint (`COIN`) | Not in the colours of what he takes |
| The iron gate (`gate.png`) | Bars in three tones, lit and shaded, a rune plate | | Already drawn with a ramp: kept |
| Teleport stones (`portal.png`) | Discs of a rim and a stone, one lit line, a blue rune, a glow while they work | | Round and lit on one line: nearly there |
| Crumbling floor (`crumble.png`) | Slabs lit on top and left, shaded foot and right, cracks in three stages, a pit | | Already drawn with a ramp: kept |
| Sliding walls (`slider.png`) | The front page's stonework rising out of a groove, a white outline that blinks before it wakes | | Flat; **its warning blinks with reduced motion** |
| The door on (`door.png`) | A frame of the front page's stonework round a dark square with a torch, or daylight on the last level | Doors with their corners in the use cyan (ADR 0039, order 19) | **No read**: nothing says "use this" |
| The start pad, the entrance (`pad-entrance-raven.png`) | Pale flat slabs in three tones and a ring; a doorway of stonework with daylight | | Flat |
| The raven | 7 x 6 in three flat colours; it blinks now and then, with reduced motion too | | Flat; tiny at 390 inside the viking page |
| The mound-dweller and the feather (`chamber-feather.png`) | A grey figure 9 x 12 in three flat colours on a stone seat; the feather the old 5 x 9 drawing (`maze/feather.ts`), gold | The feather of order 24 (a vane with its sheen lit along its edge, a pale quill) | The prize in the mound is not the feather that falls onto him in the fjord |
| The dark level (`dark.png`) | The kit's torch circle; the lit stones and the door clear | Nordmarka's headlamp and the dark | Readable; kept |
| The ghost (`ghost.png`) | The top-view disc, pale | | As him |
| The curse (`curse.png`) | Him rust red all over, a rust-red frame round the view, a burst | The hurt red flash on him | Readable; kept |
| The card and the level list (`card.png`, `level-list.png`) | The kit's cream card, the stones of the marks drawn flat in a little canvas; buttons 30 tall | The same cream card; on a touch screen buttons 56 tall | The same family; the marks' stone flat; small targets on a phone |
| The maze's own page (`start/index_*`) | The front page's frosted bar (the mound shows through as a grey haze), two rows at 390 | Vikingfjorden's solid cream bar (ADR 0015) | Not the same house |

Torches on the walls (a stick and a bracket of three pixels, the flame a light), the curse's line along every wall (rust red, pulsing)
and the daylight in the doorways were read as they are.

## What the help says on a phone, and what reads at phone size

- **The help line names keys on a touch screen**, in both hosts: "Mouse, finger or arrow keys to steer, Shift for small steps, Esc
  to leave." / "Musa, fingeren eller piltastene for å styre, Shift for små skritt, Esc for å gå ut." (`start/*touch*`).
- **Inside the viking page it never goes**: it stays over the foot of the mound for the whole visit (`moments/viking_*steps-1210*`:
  still up behind the card after level 3). On the maze's own page it goes at his first move.
- **On the maze's own page at 390 wide it runs off both edges** in Norwegian (`start/index_debug_touch_level-1_steps-30_390x844_nb-NO.png`):
  it is one line that does not wrap (the kit's `.help`).
- **The raven's words run off the right edge** at 390 wide in both hosts when the line is long (the card after level 3: "The
  mound-dweller yields. The raven's feather is yours:" cut; the chamber: "… Not a morni").
- **Inside the viking page the maze is small on an upright phone**: the page keeps its view at least 240 art pixels wide (ADR 0019),
  so at a device pixel ratio of 3 an art pixel is 1.33 CSS pixels (in the pictures, at ratio 1, one): the whole map's width shows and
  him, the raven and the snakes are a few pixels each. On the maze's own page the view is 130 art pixels wide upright (three CSS
  pixels an art pixel at ratio 3). Not changed: the viking page's rule for its stage (ADR 0019) is the levels' too.
- **On touch inside the viking page the page dropped its touch styles in the mound** (the `touch` class): the bar's buttons and the
  way out ("Vikingfjorden") are not thumb targets there, nor the cards' buttons; the maze's own page has none either.
- **Reduced motion**: the sliding walls' warning blinks four times a second with reduced motion; an adder's tongue flicks three times
  a second; the raven blinks. Everything else that moves by the clock already held (torches, the curse's pulse, his torch, the key's
  bob, the screen's shake, the curse's frame, the bursts).

## Ranked

1. **Him is not the same man** (a disc from above). Everything else in the game was redrawn around him; in the mound he is not there.
2. **The phone**: the help line names keys on touch, never goes inside the viking page, runs off the screen on the maze's own page;
   the raven's words run off the screen; the touch styles are dropped in the mound.
3. **The snakes** do not say "hurts" in the game's language (no warning red) and are in neither palette.
4. **Walls, floor and hill** are flat fields; the lining is the front page's stonework; there is no depth where the floor meets a wall.
5. **Reduced motion**: the sliders' warning and the adders' tongue blink.
6. **The key and the door** without the kit's read (what he takes, what he uses).
7. **The stones, the raven, the mound-dweller, the pad, the doorways** are flat; **the feather** over the last finish is not the
   fjord's.
8. **The maze's own page**: the front page's frosted bar, two rows upright, no thumb targets.

The order puts touch and help (item 2) before the redraw (item 3). My list puts him first, but item 2 is mostly small fixes and costs
nothing done first, so the items were done in the order's order; him was the first thing drawn in item 3, and the walls and ground the
second, as the order asks.

## Rectangles a frame, before (`?debug&perf`, 390 x 844, each level where the scripted player is at its middle)

| Level | The maze's own page | Inside the viking page |
|---|---|---|
| 1 Inngangen | 496 rects, 388 colours, 2 images | 671, 563, 2 |
| 2 Ormegropa | 873, 767, 2 | 1,399, 1,193, 2 |
| 3 Jernporten | 623, 487, 2 | 988, 852, 2 |
| 4 Råttent gulv | 1,016, 910, 2 | 1,422, 1,316, 2 |
| 5 Skyveveggene | 577, 469, 2 | 1,051, 843, 66 |
| 6 Mørket | 886, 780, 2 | 1,143, 1,037, 2 |
| 7 Haugbonden | 1,070, 946, 2 | 1,279, 1,155, 2 |

(Inside the viking page the view is wider, so more is drawn. Level 5's 66 copies there are the sliders' stonework from the kit's kept
squares.)
