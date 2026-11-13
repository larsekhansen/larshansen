# Work order 7: one kit for levels

Read first: `CLAUDE.md`, `docs/games/PLAN.md` sections 3 (style bible) and 9, `packages/pixelkit/src`
(all of it; it is small), `apps/landing/src`, `apps/viking/src`. `docs/games/LEVELS.html` is the
plan this order serves (ten Oslo levels for the viking game); you do not build levels here.

## Goal

The front page (`apps/landing`) and the viking game (`apps/viking`) already share the engine in
`packages/pixelkit`. They still each keep their own copy of everything a level is made of. Move
that into the kit, so order 8 can add ten levels to the viking game without a third copy, and so
the two games are provably the same cloth: same map reader, same camera, same doors, same props,
same colours, same physics.

## Rules for this repository

- Bun only (`bun install`, `bun test`, `bun run build`); never npm, npx, pnpm or yarn.
- Work on the current branch `games-same-cloth` in this checkout. Do not push, do not switch
  branch, do not touch `main`. Commit your work at the end (one or a few commits, messages in the
  style of `git log`, ending with the line
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- TypeScript strict. No asset files: all art is filled rectangles drawn in code. No new
  dependencies.
- Do not touch `packages/maze` or `apps/iron-maze`: another worker is changing them right now.
- Headless on this Pi: Chromium cannot render; Firefox can draw Canvas 2D but fires no animation
  frames. See "The harness" below.
- Dev servers: use ports 5180 to 5189 only, and stop them when done.

## Step 0: the harness (do this first, before any refactor)

Both apps start their loop with `requestAnimationFrame`, so headless Firefox screenshots are blank.
Add to both apps, under `?debug` only: `?steps=N` runs N fixed physics steps synchronously at load
and then draws one frame synchronously (no rAF needed), with the clock frozen so two runs give the
same pixels (water glints, smoke, clouds, snow all derive from the step count or a fixed time).
Optional `?keys=` plays a script while stepping, for example `keys=r60,j1,r30` (r right, l left,
j jump, u up/enter, n nothing; number = steps held). Existing `?sky=` and `?x=` keep working.

Add `tools/shots.ts` (run with `bun tools/shots.ts <outDir> <url>...`) that screenshots each URL
with `firefox --headless --window-size=1280,800 --screenshot <file> <url>`, one at a time, into
`outDir`, named after the URL's path and query. Document it in `docs/games/PLAN.md` section 9 in
three lines.

Then, **before changing anything else**, capture the reference set from a built preview of each app
into `/tmp/shots-before/`: front page at `?debug&steps=1&sky=` each of `day`, `evening`, `night`,
`winter`, `17mai`, and at `x=` positions that show every district (at least four), plus
`?debug&steps=200&keys=r200&sky=day`. Same idea for the viking game (five skies, five places).
Commit the harness on its own.

## What moves into the kit

Names are suggestions; keep the kit's existing plain style (small modules, pure where possible,
comments that say why).

1. **`tilemap.ts`**: one reader for text maps. Given rows, a legend (which letters are solid, which
   are one-way) and ramps, it returns `cols`, `rows`, `width`, `height`, `tileAt`, `isSolid`,
   `isOneWay`, `rampAt`, `find(letter)` and the `World` the physics takes. Districts
   (`districtAt`) too. `apps/landing/src/game/level.ts` and `apps/viking/src/game/level.ts` shrink
   to their data plus calls into it. Unit tests in the kit.
2. **`doors.ts`**: `Door`, `buildDoors`, `doorAt`, `readAppLinks`: one copy (the two apps' versions
   differ slightly; keep every field either needs).
3. **`camera.ts`**: the look-ahead (22 px) and 130 ms ease, horizontal and vertical, as one pure
   function both `main.ts` files call.
4. **`walkto.ts`** (or inside a `scene.ts`): click or tap to walk there, giving up after three
   seconds of getting no closer. Pure state machine plus tests; both apps use it.
5. **`backdrop.ts`**: `layerWorldX`, `column`, `box`, `lit`, copied in both apps today.
6. **`props.ts`**: the things both draw or will draw: sign board on a post, crate, one-way ledge,
   plank door, lamp post, flag on a pole, leaf tree and birch, window pane. One implementation each.
   Where landing and viking draw the same thing differently today, landing's look wins and viking
   changes to match.
7. **Colours**: every hex literal in `apps/landing/src/render` and `apps/viking/src/render` moves
   to a named swatch in `palette.ts` (extend it; group by material). A literal may stay only where
   it is a one-off inside a sprite table. Values do not change.
8. **A scene runner, as far as it is honest.** The two `main.ts` files (499 and 977 lines) repeat
   the same skeleton: params, stage, input, stepper, sky, `remember`/`recall`, `say`, `camera`,
   `layout`, `pass`, `frame`, the T key for skies, the debug object. Lift what is truly the same
   into `scene.ts` as small composable helpers (not a framework with callbacks for everything).
   Target: neither app's `main.ts` contains logic the other also contains. Do not chase line counts
   by hiding app-specific behaviour behind options.

## New in the kit: things levels are built from

Order 8 needs these for the first three levels. Build them here as pure rules with unit tests and a
small drawing function each; nothing in either game uses them yet.

- **Moving ground (`carrier`)**: a one-way ledge with a position that is a pure function of the step
  count (bob up and down, travel between two points and back, go up and down a shaft). The body
  lands on it from above like any one-way ledge and is carried by its movement each step,
  horizontally and vertically, without jitter and without sinking through when it rises. Extend
  `stepBody` with an optional extra argument for the carriers near him; when it is absent the
  function behaves exactly as today (the existing physics tests must pass unchanged).
- **Flag (`checkpoint`)**: touched once, it is where he returns after a fall into water or off the
  bottom of the map. Pure: `{ reached: index | null }` and `respawnAt(...)`.
- **Launcher**: stepping into it throws him with a given velocity (a cannon: up and sideways; a
  drum: straight up, like the sheep). After a sideways launch his horizontal speed may exceed
  `MOVE.run` and is only steered gently until he lands; design this so `MOVE` and `JUMP` constants
  stay untouched and a body that was never launched moves exactly as today.
- **Ledge on a beat (`timed`)**: `timedPhase(step, { on, warn, off, offset })` returns
  `"on" | "warn" | "off"`; solid as a one-way ledge while on or warn, drawn with the maze's
  one-second warning shimmer in warn (look at how `packages/maze/src/render.ts` draws a sliding
  wall's warning, and match it without importing from the maze package).

## Acceptance

1. `bun install`, then `bun test` and `bun run build` pass in `apps/landing`, `apps/viking`,
   `apps/iron-maze`, and `bun test` in `packages/pixelkit` and `packages/maze`.
   `bunx` is not allowed; run type checks with `bun x tsc --noEmit` only if it is already how the
   repo does it, otherwise rely on the builds.
2. **Front page: every reference screenshot is byte-identical after the work** (compare with
   `cmp`). This is the hard gate; the front page is the live site's first screen.
3. Viking: reference screenshots identical, except where item 6 made a viking prop adopt landing's
   look; list each such difference in the report with the two crops.
4. No `tileAt`, `rampAt`, `districtAt`, `doorAt`, `layerWorldX`, camera easing or click-to-walk
   logic remains in either app. No hex colour literals remain in either app's `render/` outside
   sprite tables.
5. New kit modules have unit tests: tilemap, camera, walkto, carrier (including riding a rising
   and a falling platform and stepping off), checkpoint, launcher, timed.
6. Bundle sizes do not grow by more than 15 % for either app.

## Report back

What moved where (a short table), each departure from this order and why, test and build output,
bundle sizes before and after, the screenshot comparison result, and what you think is weak.
