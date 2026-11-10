# larshansen

Personal monorepo, self-hosted on this Raspberry Pi. See `README.md` for the layout and `infra/README.md` for hosting.

## Before starting any work

**Run `git fetch origin` and compare with `origin/main` first.** The checkout on the Pi is often behind GitHub, because work also lands through pull requests from other machines.

```bash
git fetch origin && git status -sb && git log --oneline HEAD..origin/main
```

If that last command prints anything, the checkout is stale: update it and read what changed before planning. In November 2026 a whole replacement for the front page was built from a checkout three commits behind, where the front page had already been rebuilt. It was salvaged as `apps/viking`, but only by luck.

## Things that are easy to get wrong

- **Pushing to `main` deploys to the live site.** A self-hosted runner on this Pi builds every app and rsyncs them to the nginx webroots (`.github/workflows/deploy.yml`). Other branches deploy nothing.
- **Bun only.** No npm, npx, pnpm or yarn. `bun install`, `bun run dev:<app>`, `bun test` inside an app.
- **Headless browsers on this Pi are limited.** Chromium cannot render headless here (the 16k-page kernel), and headless Firefox has no WebGL and fires no animation frames. Canvas 2D pages can be checked by stepping the game by hand (`apps/landing` exposes `window.__game` with `?debug`); anything WebGL needs a person with a normal browser.
- **The front page's secret.** The door at the top of the Opera in `apps/landing` leads to `apps/viking` and is deliberately not listed in the header.
