# Landing page

The front page of [larshansen.dev](https://larshansen.dev): a small platform game set in Gamle Oslo. You walk from the wooden houses at Kampen, past Botanisk hage at Tøyen, Grønland Basar and the ruins in Middelalderparken, down to Deichman and the Opera in Bjørvika. Every house is one of the apps. Stand at a door and press up to go in.

Plain TypeScript and Canvas 2D, no framework. The art is drawn in code at low resolution and scaled up by whole pixels, so it stays sharp on every screen.

```bash
bun run dev    # http://localhost:5173
bun test       # physics, the map, Oslo time and language
bun run build
```

## How it fits together

| File | What it does |
| --- | --- |
| `index.html` | The header links are the list of apps. The game reads them, so one link is one door, and the links work without the game. |
| `src/game/level.ts` | The world as a text map, the Opera roof as a slope, and the districts. |
| `src/game/physics.ts` | Movement, jumping, tiles you can jump up through, and slopes. |
| `src/game/loop.ts` | Runs physics at a fixed 60 steps per second, so the game plays the same at 60 and 120 Hz. |
| `src/game/oslo.ts` | Oslo time, sunrise and sunset, and the sky that follows them. |
| `src/game/i18n.ts` | Norwegian for Norwegian browsers, English for everyone else. |
| `src/render/` | The sky, the city behind the street, the landmarks, the street and the words. |
| `src/main.ts` | Input, doors, the camera and the main loop. |

## Adding a house

1. Add a link with `data-door="<id>"` to the header in `index.html`. Use a `<span data-soon>` instead of a link while the app is not ready.
2. Put a door letter on the map in `src/game/level.ts` and map it in `DOOR_TILES`.
3. Draw the building in `src/render/buildings.ts`.

The tests check that every house has a link and every link has a house.

## Looking at every sky

The sky follows the real time in Oslo. Add `?sky=day`, `evening`, `night`, `twilight`, `winter` or `17mai` to the address to see the others.
