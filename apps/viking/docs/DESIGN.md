# Vikingfjorden: how it is built

A second scene built the way the front page is built. The reasons (one cloth for all three games, the style bible, what the maze will become) are in [`docs/games/PLAN.md`](../../../docs/games/PLAN.md); this file says what is here.

## The world

One text map of 144 columns x 20 rows of 16 px, in `src/game/level.ts`, read the way the front page's map is read. Left to right:

| Columns | Place | Notes |
|---|---|---|
| 0 to 14 | Landingsplassen | The landing stone where he arrives, the boathouse with the door **Hjem**, the title carved in runes on a standing stone. |
| 15 to 22 | The beach | Grass, then sand. A sheep. |
| 23 to 28 | The jetty | Planks on posts standing in the water. |
| 29 to 52 | The fjord | The moored longship (deck = ledge on row 15, yard = ledge on row 9, a crate on deck), a skerry with a rune. The ship bobs one pixel in the drawing only. |
| 53 to 75 | The farm | Fence, a second sheep, the longhouse whose turf roof is a ramp. |
| 76 to 92 | Runesmia | An open smithy with a glowing forge, and crates stacked as steps. |
| 93 to 110 | Jernhaugen | The burial mound (a ramp), standing stones on top, a stone-framed door at its foot. |
| 111 to 143 | The cliff | Rock steps to a plateau, the cabin with the door **Verkstedet**, a stave-church-like tower with a rune on its gallery, a gap, and the beacon rock. |

Doors (`DOORS`): `home` / Hjem to `/`, `qr` / Runesmia to `/qr/`, `maze` / Jernhaugen to the maze scene below (its `href`, `https://maze.larshansen.dev/`, is only for visitors without JavaScript), `github` / Verkstedet to `https://github.com/larsekhansen`. The same four are plain links in the header of `index.html`.

## The rules

- **Movement**: the kit's physics (`packages/pixelkit/src/physics.ts`) with the front page's constants, 60 steps a second. A **double jump** is a reward from the maze (Jernhaugen, below): it is on when `localStorage["viking.feather"] === "1"` or the URL has `?feather`. Without it, runes 3, 7 and 8 (the ship's yard, the church tower, the beacon) cannot be reached; a bubble at the mound door says so.
- **Water**: feet in a `~` tile put him back on the last ground he stood on, facing the water. No penalty.
- **Runes** (`run.ts`): touching a rune's tile collects it. The ten slots in the header fill in order. They are drawn from `RUNE_STROKES` (`runes.ts`) rasterised to 9 x 11 pixels, on a small stone that bobs one pixel; a collected rune leaves a faint outline.
- **The run**: the clock starts on his first step and stops on the tenth rune. The best time is kept in `viking.best`. R or the header button starts again.
- **All ten**: fanfare, sparks, the helmet turns gold and stays gold (`viking.crowned`), and the finish card shows.
- **Sheep** (`sheep.ts`): they walk four tiles either side of where they stand, graze, and turn. Landing on one from above is a bounce (`bounce(body, 7)`) and a bleat; the sheep squashes one pixel for six steps.
- **Doors, click to walk, signs, banners**: as on the front page (`main.ts` follows `apps/landing/src/main.ts`: `goal`, `stuck`, the marker, the highlight, the fade).

## Jernhaugen: the second scene

`main.ts` holds a `scene` of `"fjord"` or `"maze"`. The door `maze` fades out like the others and then sets `location.hash = "#jernhaugen"`; `syncScene` (on `hashchange` and at start) enters or leaves the mound to match the address, so Back works and `/viking/#jernhaugen` opens inside it. Entering does `import("@larshansen/maze/scene")` (and the maze's `i18n` and `rules`), so the fjord's entry script does not carry the maze. The maze gets the kit's `stage`, `input` and `sfx`, and `main.ts`'s loop calls its `step()` and `render()` instead of the fjord's, so the run timer is paused. The header swaps the rune slots, restart button and clock for the level name, `n / 3`, the level clock and the curse count (`body.in-maze`), the touch pad is hidden, and the help line shows the maze's. When the maze reports `cleared: true` the double jump is on at once and the mound's bubble stops showing. Leaving puts him at the mound door with a fade in. The code of the scene itself is in [`packages/maze`](../../../packages/maze/src): `levels.ts` (three maps), `rules.ts` (pure, tested), `render.ts`, `scene.ts` (steering, sound, the raven's words) and `i18n.ts`.

## Files

```
index.html, src/styles.css     the page: header bar (links, rune slots, clock, restart, mute), stage, finish card, touch pad
src/main.ts                    wires everything: loop, input, rules, camera, render order, debug handle
src/game/level.ts              the map, ramps, doors, districts, finders for runes, signs, sheep
src/game/run.ts                the timer and rune rules (pure)       run.test.ts
src/game/sheep.ts              sheep behaviour (pure)
src/game/runes.ts              RUNE_STROKES and their pixel grids
src/game/doors.ts, i18n.ts     doors from the map; every string in nb and en
src/render/backdrop.ts         mountains (0.12), far shore and water (0.2), headlands and islets (0.4)
src/render/tiles.ts            ground, water, planks, rock, crates, ledges, drawn from the map
src/render/props.ts            the buildings, the ship, the doors, signs, the beacon
src/render/actors.ts           sheep and runes
src/render/text.ts             boards, bubbles, the banner, the person (kit helpers on the text canvas)
```

The shared kit does the rest: sky (the real Oslo clock, same `?sky=` and T key), stage and depth canvases, physics, input, sound (`sfx.ts`, mute remembered as `larshansen.muted`), the person with `outfit: "viking"`.

## How to check

- `bun test` in `apps/viking`: the map is well formed, every door and sign stands on something solid, and `reach.test.ts` floods the map from the start: with one jump exactly runes 0, 1, 2, 4, 5, 6 and 9 and all four doors can be reached, with a double jump all ten. Keep it passing when the map changes.
- `bun run build` in `apps/viking`; the script is about 58 kB.
- `?debug` exposes `window.__game = { body, shown, state, view, input, step, frame, doors, runes }`. A headless browser that fires no animation frames can call `__game.frame(now)` by hand. `?feather` gives the double jump and `?x=<art px>` drops him at that x, on the highest thing there.
- Still needs a person: how it feels at real speed, sound, touch, a gamepad.
