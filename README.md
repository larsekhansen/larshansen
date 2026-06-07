# larshansen

Personal monorepo. A platform-game landing page whose doors lead to the other apps — all self-hosted on a Raspberry Pi at home.

Managed with **[Bun](https://bun.sh) workspaces — Bun only** (no npm/npx/pnpm/yarn).

## Structure

```
apps/
├── landing/      # PixiJS platform game — the front page (React 19 + Pixi 8)
├── portfolio/    # CV / about site (React 18 + Vite + styled-components + zustand)
└── iron-maze/    # React + jQuery maze game (migrated from CRA to Vite)
packages/         # shared code (empty for now)
```

## Getting started

```bash
bun install            # install all workspaces

bun run dev:landing    # platform game        (http://localhost:5173)
bun run dev:portfolio  # CV site              (http://localhost:3000)
bun run dev:iron-maze  # maze game

bun run build          # build every app
bun run build:landing  # build a single app
```

## History

`larshansen` is the consolidation of two older repos plus assorted personal projects.
The git history of each imported app is preserved in this repo (imported via subtree merge):

- `apps/landing` ← `larshansen.dev` (the original landing-page game experiment)
- `apps/portfolio` ← `larshansen_dev` (`frontend/`)
- `apps/iron-maze` ← `iron-maze`
