# Work order 9: the maze, made better, as the bonus level

Read first: `CLAUDE.md`, `docs/games/PLAN.md` sections 3 (style bible), 4 and 6,
`docs/games/orders/03-maze-core.md` and `04-maze-features.md` for what exists, then all of
`packages/maze/src` and `apps/iron-maze/src`.

## Where things stand

The 2019 mouse maze was rebuilt as "Jernhaugen": a top-down pixel scene in `packages/maze`, seven
levels, pointer / touch / keys / gamepad steering, the iron curse, standing-stone checkpoints,
snakes, keys and gates, crumbling floor, sliding walls, a dark level, records, level select, a
raven that talks, and a raven's feather as the prize. It is mounted by `apps/iron-maze`
(maze.larshansen.dev) and loaded on demand inside `apps/viking`.

The original game (React, jQuery, MC Hammer) is preserved on the branch `iron-maze-original` and
in the archived repository `larsekhansen/iron-maze`. Nothing of it needs keeping here.

The owner's words: "make the maze game much better and incorporate as a bonus level. Remove the
music from it." The maze becomes an optional bonus stop in the viking game (another worker builds
that side). Your job is the maze itself.

## Rules for this repository

- Bun only; never npm, npx, pnpm or yarn. Run `bun install` first if `node_modules` is missing.
- You work in your own git worktree. Commit there (messages in the style of `git log`, ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). Do not push.
- **Touch only `packages/maze/**`, `apps/iron-maze/**`, and additive changes to
  `packages/pixelkit/src/palette.ts` and `packages/pixelkit/src/sfx.ts`** (new swatches, new
  sounds; never change existing ones). Another worker is rewriting `apps/viking`, `apps/landing`
  and the rest of the kit at the same time; anything else you touch will conflict.
- Keep `createMaze(host, opts)` and the `MazeHost` / `Maze` interfaces source-compatible: you may
  add optional fields, not remove or rename.
- TypeScript strict. No asset files of any kind: no audio, image or font files. All art is filled
  rectangles in code, per the style bible. No new dependencies.
- Headless on this Pi: Chromium cannot render; Firefox draws Canvas 2D but fires no animation
  frames. Dev servers on ports 5190 to 5195 only; stop them when done.

## What to build

1. **No music, provably.** There must be no audio file in the repo under `packages/maze` or
   `apps/iron-maze`, no looping sound, and nothing that plays before the first key or tap. Sound is
   only the kit's short synthesised blips behind the shared mute (`larshansen.muted`). Add a test
   that fails if any file with an audio extension exists under those two folders, and state in the
   report what you found.

2. **A ghost of your best run.** While playing a level, record his position every step (compact:
   two small integers per step, capped at three minutes). When a run beats the level's best time,
   store it (`maze.ghost.<level>` in localStorage, compressed enough to stay under ~20 kB per
   level; delta or run-length encoding is fine). On later attempts the ghost walks the level beside
   him as a pale, half-transparent version of the top-view person, starting when he first moves.
   Pure encode/decode with tests; a ghost never collides with or affects anything. Hidden with
   reduced motion? No: it is information, keep it, but no trail effects.

3. **Three marks per level.** Cleared; cleared without a curse; cleared under a par time (set a par
   per level from your scripted clear at key speed, times 1.6, rounded to 5 s). Stored with the
   records, shown as three notches on that level's stone in the level select and on the finish
   card. Pure rule with tests.

4. **Teleport stones.** A new tile pair (two letters of your choice per pair in the map legend):
   stepping onto one moves him to its twin, with a one-second cool-down so he does not bounce back,
   a short blue shimmer on both, and a new `teleport` blip in `sfx`. Pure rule with tests. Use them
   in at least two existing levels where they make the route more interesting (a shortcut that
   costs a risk), without making any level longer than its 30 to 90 second target.

5. **Feel.** Make being cursed, lighting a stone, picking up a key and finishing a level each read
   clearly and feel good at 60 steps a second, inside the style bible (filled rectangles, no
   rotation, no blur, no gradients): a few frames of freeze and a rust-red burst of square
   particles on a curse, dust at his feet when he walks, the torch flickering by a pixel, the raven
   turning its head toward him, the gate sliding rather than vanishing, the finish doorway
   brightening as he nears. All of it off or flattened under `prefers-reduced-motion`
   (`view.reduced`).

6. **Fairness pass.** Play every level by script at key speed and at pointer speed (the tests from
   order 4 do this; keep them green and extend them to the changed levels). Every corridor at
   least one tile wide. No blind deaths: a snake or sliding wall must be visible (or in the dark
   level, audible/hinted by its shimmer) before it can reach him. Fix what fails.

7. **The feather rule changes** (the maze is now a bonus, so its prize comes sooner):
   - Clearing level 3 for the first time gives the raven's feather: the maze itself writes
     `localStorage["viking.feather"] = "1"`, and the raven says so
     (nb: "Haugbonden gir seg. Ravnefjæra er din." / en equivalent already exists in
     `apps/viking/src/game/i18n.ts` as `featherLine`; put your own copy in the maze's i18n).
   - Clearing all seven writes `localStorage["viking.featherGold"] = "1"`: the feather turns gold
     (`drawFeather` gets a gold option).
   - `onLeave({ cleared })` keeps its meaning (true when the last level was cleared this visit).
     Add an optional `feather: "plain" | "gold" | null` to what `onLeave` reports, saying what was
     newly won this visit.
   - On maze.larshansen.dev the keys land on the wrong host, as today; keep the existing card that
     says the feather waits at `/viking/#jernhaugen`.

8. **The standalone page** (`apps/iron-maze`): title, help line and finish card still match the
   kit's furniture; the header link back goes to `https://larshansen.dev/viking/?from=maze`. Add
   `?debug&steps=N` there: N physics steps run synchronously at load, then one frame is drawn
   synchronously, so `firefox --headless --screenshot` shows a real state (`&level=` already
   exists). Use it to look at your own work: take screenshots of every level and of a curse, a lit
   stone, a ghost, a teleport and the level select, and look at them.

## Acceptance

1. `bun test` passes in `packages/maze` (all 93 existing tests still there and green, plus yours)
   and `packages/pixelkit`; `bun run build` passes in `apps/iron-maze` and `apps/viking`.
2. All seven levels cleared by the scripted player at key speed and pointer speed.
3. The audio-file test exists and passes.
4. Every new string exists in nb and en.
5. `apps/viking` builds and its tests pass without you having edited it.

## Report back

What you changed, what you looked at in the screenshots and what you fixed because of them, each
departure from this order and why, test and build output, and what you think is still weak about
the maze as a game.
