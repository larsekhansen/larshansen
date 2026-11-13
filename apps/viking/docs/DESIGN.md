# Vikingfjorden: how it is built

A side-view game built the way the front page is built. The reasons (one cloth for all three games, the style bible) are in [`docs/games/PLAN.md`](../../../docs/games/PLAN.md), the levels' plan in [`docs/games/LEVELS.html`](../../../docs/games/LEVELS.html); this file says what is here.

## The parts

| Where | What |
|---|---|
| `src/levels/types.ts` | What a level is, as data: id, rune, name, landmark, pinned sky, the text map and its legend, ramps, carriers, ledges on a beat, cannons, signs, doors, and its art. |
| `src/levels/langkaia.ts`, `akershus.ts`, `radhuset.ts` | The three built levels. |
| `src/levels/index.ts` | The ten in order; seven are planned only (name, rune, place). |
| `src/levels/kart.ts` | The line map, built as a level from the visitor's progress. |
| `src/game/play.ts` | The rules of a level, pure: a step function over the body, the clock, flags, cannons, sheep, the bracteate and the rune. The page and the tests run the same code. |
| `src/game/progress.ts` | `localStorage["viking.progress"]`: levels cleared, best time per level, bracteates found. Forgiving of missing or broken data. |
| `src/main.ts` | The page: which scene the address shows, the header, the card, sounds and sparks, the camera, drawing, the maze. |
| `src/render/` | Tiles and water for any level, the far layers, the longship, sheep, runes, bracteates, the T-bane entrance. |

The kit (`packages/pixelkit`) holds the map reader, the physics with moving ground, flags, cannons and ledges on a beat, the camera, doors, props and the scene helpers.

## The rules

- **Movement**: the kit's physics with the front page's constants, 60 steps a second: run 1.6, a jump 46 px high and 54 px far. The **raven's feather** from the maze gives a second jump in the air (91 px high, 101 px far): on when `localStorage["viking.feather"] === "1"`, or with `?feather`. It is read again when he comes out of the mound. With `viking.featherGold === "1"` the pompom and the feather pixels are gold.
- **A level** starts at `S` and ends at its rune: the clock stops, the rune flies to its slot in the header, and a card shows the time, the best, and the bracteate. "Onward" goes to the line map at the next station, "Once more" starts the level again.
- **Water, or off the bottom of the map**: back to the last flag touched, or to the last firm ground where there is no flag yet. Nothing else hurts. No lives.
- **Flags** (checkpoints): touched once, the front page's flag goes up the pole, and falls bring him back there. Forwards only.
- **Moving ground** (carriers): rafts that bob, a ferry that crosses, lifts. He is carried with them, and drawn on the same whole pixels as they are.
- **Cannons**: walk in, a third of a second in the barrel (the arc is shown, dotted), then the shot. In the air the keys only lean on the flight.
- **Ledges on a beat** (the bells): two seconds there, one second of the maze's warning shimmer, two gone. Neighbours are a step apart.
- **The gold bracteate**: one per level, only reachable with the feather. Kept once found, counted in the header.
- **Doors**: T-banen at each level's start goes back to the map; Hjem goes to the front page's Opera; Runesmia (`/qr/`) and Verkstedet (GitHub) are sheds on Langkaia's quay. On the map, a station opens when the level before it is cleared.

## Checking

`bun test` plays each level with a scripted player (`src/game/bot.ts`) using the real rules: each must be cleared with the single jump, raising every flag, well inside its target time; with the feather each bracteate is reached. A search with the real `stepBody` (`src/game/reach.ts`), over a world where every moving thing is everywhere at once and every ledge on a beat is always there, proves each bracteate cannot be reached without the feather. Screenshots come from the harness (`?debug&steps=N&keys=...`, `tools/shots.ts`).
