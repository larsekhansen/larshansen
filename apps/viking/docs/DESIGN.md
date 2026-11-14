# Vikingfjorden: how it is built

A side-view game built the way the front page is built. The reasons (one cloth for all three games, the style bible) are in [`docs/games/PLAN.md`](../../../docs/games/PLAN.md), the levels' plan in [`docs/games/LEVELS.html`](../../../docs/games/LEVELS.html); this file says what is here.

## The parts

| Where | What |
|---|---|
| `src/levels/types.ts` | What a level is, as data: id, rune, name, landmark, pinned sky, the text map and its legend, ramps, carriers, ledges on a beat, cannons, signs, doors, and its art. |
| `src/levels/langkaia.ts`, `akershus.ts`, `radhuset.ts`, `slottet.ts`, `holmenkollen.ts` | The five built levels. Levels 4 and 5 build their maps with `build.ts` (strokes, not typed-out rows). |
| `src/levels/index.ts` | The ten in order (name, rune, place, built), and one loader per level: every level after Langkaia is fetched when first needed. |
| `src/levels/routes/` | The scripted routes through levels 4 and 5, for the tests and for `?debug&auto`. |
| `src/levels/kart.ts` | The line map, built as a level from the visitor's progress. |
| `src/game/play.ts` | The rules of a level, pure: a step function over the body, the clock, flags, cannons, drums, sheep, hearts and lives, pits, benches, skilling and the brown cheese, the dash, enemies, the bracteate and the rune. The page and the tests run the same code. |
| `src/game/enemies.ts` | The five kinds of enemy as small pure rules: walker, spiky, flyer, thrower, jumper. |
| `src/game/progress.ts` | `localStorage["viking.progress"]`: levels cleared, best time per level, bracteates found, most skilling per level, levels cleared without losing a heart. Forgiving of missing, old or broken data. |
| `src/main.ts` | The page: which scene the address shows, the header, the card, sounds and sparks, the camera, drawing, the maze. |
| `src/render/` | Tiles and water for any level, the far layers, the longship, sheep, runes, bracteates, the T-bane entrance. |

The kit (`packages/pixelkit`) holds the map reader, the physics with moving ground and surfaces (ice, an inrun), the dash, flags, cannons and drums, ledges on a beat, the camera, doors, props and the scene helpers.

## The rules

- **Movement**: the kit's physics with the front page's constants, 60 steps a second: run 1.6, a jump 46 px high and 54 px far. The **raven's feather** from the maze gives a second jump in the air (91 px high, 101 px far): on when `localStorage["viking.feather"] === "1"`, or with `?feather`. It is read again when he comes out of the mound. With `viking.featherGold === "1"` the pompom and the feather pixels are gold.
- **A level** starts at `S` and ends at its rune: the clock stops, the rune flies to its slot in the header, and a card shows the time, the best, and the bracteate. "Onward" goes to the line map at the next station, "Once more" starts the level again.
- **Hearts and lives**: three hearts; an enemy's touch, something thrown, or a fall into water or a pit takes one, knocks him back and leaves him blinking and safe for a second and a half. Falls put him back at the last flag or bench (or the last firm ground where there is none yet). No hearts left: a life goes and he starts at the last flag or bench with full hearts. No lives left: a plain Game over card, and the level starts over with three lives; nothing cleared or found is lost. Lives and skilling go with him from level to level during a visit; 100 skilling or a slice of brown cheese is a life.
- **Benches**: up at a bench to sit; the hearts fill and the bench is where falls bring him back.
- **Enemies** (from Slottet on): walkers and flyers are beaten by landing on them (higher with the jump held); spiky things hurt from above too; throwers lob on a beat after a one-second wind-up; jumpers leap out of water after a ripple. A beaten enemy puffs into squares and gives a skilling.
- **Surfaces**: ice has little grip, and the red rails stop a slide; an inrun has none at all, draws him on and lets his speed climb past a run; leaving the ground faster than a run keeps the speed in the air.
- **The ski pole** (from clearing Holmenkollen): a dash of three tiles in ten steps, level, once each time in the air.
- **Flags** (checkpoints): touched once, the front page's flag goes up the pole, and falls bring him back there. Forwards only.
- **Moving ground** (carriers): rafts that bob, a ferry that crosses, lifts. He is carried with them, and drawn on the same whole pixels as they are.
- **Cannons**: walk in, a third of a second in the barrel (the arc is shown, dotted), then the shot. In the air the keys only lean on the flight.
- **Ledges on a beat** (the bells): two seconds there, one second of the maze's warning shimmer, two gone. Neighbours are a step apart.
- **The gold bracteate**: one per level, only reachable with the feather. Kept once found, counted in the header.
- **Doors**: T-banen at each level's start goes back to the map; Hjem goes to the front page's Opera; Runesmia (`/qr/`) and Verkstedet (GitHub) are sheds on Langkaia's quay. On the map, a station opens when the level before it is cleared.

## Checking

`bun test` plays each level with a scripted player (`src/game/bot.ts`) using the real rules: each must be cleared with the single jump, raising every flag (levels 4 and 5: without losing a heart, and taking at least a minute); with the feather each bracteate is reached. A search with the real `stepBody` (`src/game/reach.ts`), over a world where every moving thing is everywhere at once, every ledge on a beat is always there and every enemy and sheep is a trampoline all along its patrol, with the ski pole's dash, proves each bracteate cannot be reached without the feather; the five searches run side by side in workers. `rules.test.ts` tests hearts, lives, pits, benches, skilling, the enemies, the drum and the dash on small made-up levels. Screenshots come from the harness (`?debug&steps=N&keys=...`, `?debug&auto`, `tools/shots.ts`).
