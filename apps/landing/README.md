# Landing page

The front page of larshansen.dev: a small viking platform game whose doors lead
to the other apps. React 19 mounts it, PixiJS 8 draws it, and everything — art,
animation, sound — is generated in code (no image or audio assets).

```bash
bun run dev:landing    # from the repo root — http://localhost:5173
bun run build:landing  # type-check + production build
bun test               # in apps/landing — physics and level tests
```

- Design, decisions and what is left to do: [docs/DESIGN.md](docs/DESIGN.md)
- Add or change a destination: edit `DOORS` in `src/game/level.ts`. It drives
  both the in-world door and the HTML nav link. (The `<noscript>` links in
  `index.html` are a separate copy — update those too.)
- Handy URL parameters: `?hour=23`, `?season=winter`, and in dev `?x=1700`.
