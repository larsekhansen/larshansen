# Vikingfjorden

The game behind the secret door at the top of the Opera on [larshansen.dev](https://larshansen.dev), served at `/viking/`. A viking-helmeted version of the same person walks a fjord: a longship to climb, sheep to bounce on, a burial mound, a smithy, a cliff and a beacon, and ten runes spelling LARS HANSEN to collect against the clock.

It is built exactly like the front page (`apps/landing`): plain TypeScript, Canvas 2D, pixel art drawn in code with rectangles, and the shared kit in `packages/pixelkit`. There is no React, no PixiJS, and no image, font or audio file. The why is in [`docs/games/PLAN.md`](../../docs/games/PLAN.md).

```bash
bun run dev:viking     # from the repo root: http://localhost:5173/viking/
bun run build:viking   # type-check + production build
bun test               # in apps/viking: map, reach, doors and run rules
```

- How it works, what it contains and how to check it: [docs/DESIGN.md](docs/DESIGN.md).
- The doors lead back out. They are in `DOORS` in `src/game/level.ts`, and the plain links in `index.html` are the same list (they work without JavaScript).
- Useful URL parameters: `?debug` (exposes `window.__game`), `?sky=day|evening|twilight|night|winter|17mai`, `?x=<art px>` (places him), `?feather` (gives the double jump). Keys: R restarts the run, M mutes, T steps through the skies.
