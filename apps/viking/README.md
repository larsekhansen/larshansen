# Vikingfjorden

The game behind the secret door at the top of the Opera on [larshansen.dev](https://larshansen.dev), served at `/viking/`. A viking, a fjord, a longship, sheep to bounce on, and ten runes spelling LARS HANSEN to collect against the clock.

React 19 mounts it, PixiJS 8 draws it, and everything — art, animation, sound — is generated in code. There are no image or audio files.

```bash
bun run dev:viking     # from the repo root — http://localhost:5173/viking/
bun run build:viking   # type-check + production build
bun test               # in apps/viking — physics and level tests
```

- Design, decisions and what is left to check: [docs/DESIGN.md](docs/DESIGN.md)
- The doors lead back out. Change them in `DOORS` in `src/game/level.ts`; that list drives both the in-world door and the HTML link. The `<noscript>` links in `index.html` are a separate copy.
- Handy URL parameters: `?hour=23`, `?season=winter`, and in dev `?x=1700`.
