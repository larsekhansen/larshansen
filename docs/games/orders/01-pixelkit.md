# Work order 1: shared pixel kit, front page unchanged

Read `docs/games/PLAN.md` sections 2, 3 and 7 first. Then read all of `apps/landing/src`.

## Goal

Move the generic parts of the front page game into a new workspace package,
`packages/pixelkit` (`@larshansen/pixelkit`), and make `apps/landing` import them from there.
**The front page must look and behave exactly as before.** This is a mechanical refactor. Do not
improve, rename for taste, reformat, or fix anything you happen to notice; write those down in your
report instead.

## Rules for this repository

- Bun only: `bun install`, `bun test`, `bun run build`. Never npm, npx, pnpm or yarn.
- Work on the current branch (`games-same-cloth`). Do not push, do not switch branch, do not
  commit; leave the changes in the working tree for review.
- Do not touch `apps/viking`, `apps/iron-maze`, `apps/qr`, `apps/portfolio`, `.github` or `infra`.
- Keep the existing comments with the code they describe when you move it.
- TypeScript strict; no `any`, no `@ts-ignore`.

## The package

```
packages/pixelkit/
  package.json     name "@larshansen/pixelkit", private, type module, version 0.1.0,
                   "exports": { "./*": "./src/*.ts", "./chrome.css": "./src/chrome.css" },
                   script "test": "bun test", devDependencies as apps/landing (typescript, @types/bun)
  tsconfig.json    same compiler options as apps/landing, include ["src"]
  src/...
```

No build step and no `build` script: apps import the TypeScript source and Vite compiles it.
`apps/landing/package.json` gets `"dependencies": { "@larshansen/pixelkit": "workspace:*" }`, and
`bun install` at the repository root updates `bun.lock`.

Imports look like `import { R, view } from "@larshansen/pixelkit/paint";`.

## What moves where

| New file in `packages/pixelkit/src` | Comes from | Notes |
|---|---|---|
| `config.ts` | `apps/landing/src/game/config.ts` | Whole file: `TILE`, `STEPS_PER_SECOND`, `STEP_MS`, `PLAYER`, `MOVE`, `JUMP`. Landing's own `config.ts` is deleted and its imports repointed. |
| `paint.ts` | `render/paint.ts` | Whole file. |
| `loop.ts` | `game/loop.ts` | Whole file. |
| `input.ts` | `game/input.ts` | Whole file. |
| `oslo.ts` | `game/oslo.ts` | Whole file, with `oslo.test.ts` moved beside it. |
| `sky.ts` | `render/sky.ts` | Whole file. |
| `person.ts` | `render/sprite.ts` | Whole file. Keep the export name `playerPixels`. |
| `physics.ts` | `game/physics.ts` | Generalised, see below. `physics.test.ts` moves with it. |
| `i18n.ts` | `game/i18n.ts` | Only `pickLang` and the `Lang` type. The strings stay in landing. |
| `stage.ts` | `main.ts` | New module, see below. |
| `chrome.css` | `styles.css` | See below. |

Stays in `apps/landing`: `main.ts`, `game/level.ts`, `game/doors.ts`, `game/i18n.ts` (strings),
`render/backdrop.ts`, `render/buildings.ts`, `render/ground.ts`, `render/text.ts`, and their tests.
`render/text.ts` is not moved in this order; it is tied to doors and districts and is split in
order 2 when a second scene shows what is really shared.

### physics.ts: a world interface

Today `physics.ts` imports `WORLD_W, isOneWay, isSolid, rampAt` from landing's `level.ts`. In the
kit it takes them as a parameter:

```ts
export interface World {
  width: number;                              // world width in art pixels
  isSolid(c: number, r: number): boolean;
  isOneWay(c: number, r: number): boolean;
  rampAt(x: number): number | null;
}
export function stepBody(b: Body, intent: Intent, world: World): StepResult
```

`moveX` and `moveY` take `world` too. The arithmetic must not change at all: same order of
operations, same constants. `apps/landing/src/game/level.ts` exports
`export const WORLD: World = { width: WORLD_W, isSolid, isOneWay, rampAt };` and landing passes it.
The moved `physics.test.ts` needs a world: give it landing's real one by keeping the test file in
`apps/landing/src/game/physics.test.ts` (importing `stepBody` from the kit and `WORLD` from
`./level`) rather than moving it. Its assertions must not change.

### stage.ts: canvases and scaling

Extract from `main.ts`, without changing what they do:

- creation of the scratch canvas and the depth canvases (`DEPTHS`, `depth()`),
- `layout()` (the sizing part: everything except `boards = layoutBoards(...)` and `camera(0, true)`),
- `pass()` and `nudge()`.

Suggested shape (adjust if the code asks for it, but keep it this small):

```ts
export interface Stage {
  px: HTMLCanvasElement; ui: HTMLCanvasElement;
  g: CanvasRenderingContext2D;                 // context of px
  depths: { factor: number; canvas: HTMLCanvasElement; g: CanvasRenderingContext2D }[];
  depth(factor: number): CanvasRenderingContext2D;
  resize(): void;                              // the sizing part of layout()
  pass(onto: CanvasRenderingContext2D, draw: () => void, phase: Phase, haze?: number): void;
  nudge(canvas: HTMLCanvasElement, fracX: number): void;
}
export function createStage(opts: { stage: HTMLElement; px: HTMLCanvasElement; ui: HTMLCanvasElement; factors: number[] }): Stage
```

`pass` reads the sky phase from a parameter instead of landing's module variable `sky`. Landing's
`layout()` becomes: `stage.resize(); boards = layoutBoards(...); camera(0, true);`.

The scaling numbers in `layout()` (192, 180, 280, 120, 1.2) stay as they are, as named options
with those defaults if you like, or simply in place.

### chrome.css

Move from `apps/landing/src/styles.css` the rules that are page furniture and not specific to the
Oslo scene: `:root` variables, the `*` reset, `html, body` (but leave the `background:` gradient
line in landing, it is the Oslo sky), `body.touch`, `.sr-only`, `.bar`, `.me`, `.apps` and its
children including `.here`, `.stage` and its canvases, `.help`, `.noscript`, `.pad` and its buttons.
If a rule is clearly about the Oslo scene only, leave it. Landing's `main.ts` then imports
`"@larshansen/pixelkit/chrome.css"` before `"./styles.css"`. The resulting cascade must be the
same: same selectors, same order of declarations for any property that appears in both files.

## Acceptance

1. `bun install` at the root succeeds and `bun.lock` changes only by the new workspace entries.
2. In `apps/landing`: `bun run build` succeeds, `bun test` passes with the same 28 tests in total
   across landing and the kit (count them before you start: `cd apps/landing && bun test`). Tests
   that moved to the kit run there with `cd packages/pixelkit && bun test`.
3. `cd packages/pixelkit && bunx tsc --noEmit` is clean. (`bunx tsc` is fine; it is Bun's runner.)
4. `bun run build` at the root still builds every app.
5. No file in `apps/landing/src` imports something that now lives in the kit through a relative
   path; no dead copies are left behind.
6. `git diff --stat` shows moves and import changes, not rewrites. The reviewer will compare
   screenshots of the front page before and after and they must be identical to the pixel, in day,
   evening, night and winter skies, while walking and jumping. If you changed any arithmetic,
   draw order, CSS order or timing, this will catch it.
7. `?debug` still exposes `window.__game` with the same fields.

## Report back

A short list: files created, files deleted, anything in the order that did not fit the code and
what you did instead, and anything you noticed that looks wrong but left alone.
