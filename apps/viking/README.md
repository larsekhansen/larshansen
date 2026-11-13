# Vikingfjorden

The game behind the secret door at the top of the Opera on [larshansen.dev](https://larshansen.dev), served at `/viking/`. The same person, with a viking helmet over his hat, takes the T-bane through Oslo: a line map with a stop for each rune of LARS HANSEN, and a level at each stop. Three are built: Langkaia (L), Akershus festning (A) and Rådhuset (R). The other seven stand behind a construction fence. A branch of the line dips to Jernhaugen, the burial mound with the maze in it (`packages/maze`).

It is built exactly like the front page (`apps/landing`): plain TypeScript, Canvas 2D, pixel art drawn in code with rectangles, and the shared kit in `packages/pixelkit`. There is no image, font or audio file. The why is in [`docs/games/PLAN.md`](../../docs/games/PLAN.md), the level plan in [`docs/games/LEVELS.html`](../../docs/games/LEVELS.html).

```bash
bun run dev:viking     # from the repo root: http://localhost:5173/viking/
bun run build:viking   # type-check + production build
bun test               # in apps/viking: maps, scripted players, reach, progress
```

- How it works, what it contains and how to check it: [docs/DESIGN.md](docs/DESIGN.md).
- Addresses: `#kart` (the line map), `#langkaia`, `#akershus`, `#radhuset`, `#jernhaugen` (the maze). Back and Forward move between them.
- Useful URL parameters: `?debug` (exposes `window.__game`), `?debug&level=<id>` (any level), `?x=<px>&y=<px>` (places him), `?sky=day|evening|twilight|night|winter|17mai`, `?feather` (the double jump), `?debug&steps=N&keys=...` (the harness, see PLAN.md section 9), `?debug&cleared=langkaia,akershus&gold=langkaia` (pretend progress, not stored). Keys: R starts the level again, M mutes, T steps through the skies.
