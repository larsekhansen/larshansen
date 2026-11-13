# Work order 3: the maze as a scene, Jernhaugen

Read first: `docs/games/PLAN.md` (sections 3, 4 and 6 closely), all of `packages/pixelkit/src`,
all of `apps/viking/src` (the scene you plug into, and the model for structure), and the old maze
in `apps/iron-maze/src` (short; read all of it, including `messages/messages.js` for its voice).

## Goal

1. A new package `packages/maze` (`@larshansen/maze`): the old Iron Maze rebuilt as a top-down
   pixel scene on the kit. Levels 1 to 3 (the three old maps), steering, the curse, standing
   stones, snakes, the raven's voice, sound.
2. The viking game's door **Jernhaugen** opens that scene inside the same page.
3. `apps/iron-maze` becomes a thin page around the same scene. React, jQuery and every image,
   font and audio file of the old game are deleted.

## Rules for this repository

- Bun only. Do not commit, push or switch branch. Do not start dev servers on 5197 or 5199.
- Do not change how the front page looks or behaves. Do not touch `apps/qr`, `apps/portfolio`.
- TypeScript strict; no `any`. No image, font or audio files. Style bible (PLAN section 3) binds.
- Structure and naming follow `apps/landing` and `apps/viking`.

## The package

```
packages/maze/
  package.json    "@larshansen/maze", exports "./*": "./src/*.ts", depends on "@larshansen/pixelkit": "workspace:*"
  src/levels.ts   the maps and snake tables
  src/rules.ts    pure game rules, no DOM          + rules.test.ts
  src/levels.test.ts
  src/render.ts   drawing
  src/i18n.ts     strings nb/en
  src/scene.ts    createMaze(...): wires rules, input, drawing, sound
```

### How it plugs in

The host page owns the canvases, the loop and the header. The scene is driven by it:

```ts
export interface MazeHost {
  stage: Stage;                      // from the kit
  input: Input;                      // from the kit
  sfx: Sfx;                          // from the kit
  lang: Lang;
  el: HTMLElement;                   // the stage element, for pointer events
  say(text: string): void;           // aria-live announcer
  onLeave(result: { cleared: boolean }): void;   // he walked out, or cleared the last level
}
export interface Maze {
  step(): void;                      // one physics step, 60 per second
  render(alpha: number, elapsedMs: number): void;
  resize(): void;
  destroy(): void;                   // removes its pointer listeners
  hud(): { level: number; of: number; name: string; ms: number; deaths: number };
}
export function createMaze(host: MazeHost, opts?: { level?: number }): Maze
```

If `apps/viking`'s kit types are named differently after order 2, use the real names.

### Levels (`levels.ts`)

32 x 20 tiles of 16 px. `#` wall, `.` floor, `S` start pad (2 x 2), `F` finish (2 x 2),
`o` standing stone. These are the three old maps with stones added. Use them as given.

```
1 "Inngangen"
################################
################################
################################
################################
#####..................#########
#####..................#########
#####..##############..#########
#####..##############..#########
#####..##############..#########
#####..######o.........#########
#####..######..........#########
#####..######.##################
#####..######.########......####
#####..######.########......####
#......######..........####.....
#......######..........####.....
#.SS.######################..FF.
#.SS.######################..FF.
#....######################.....
################################

2 "Ormegropa"
################################
################################
#............................###
#.##..........................##
#.##########################..##
#..#########################o.##
#..###........................##
#..###........................##
#..###.......................###
#..###.######.########.#########
#..###.######.########.#########
#..###.#########################
#..###o#########################
#..###.#########################
#....#.####################.....
#....#..........................
#.SS.#.......................FF.
#.SS.######################..FF.
#....######################.....
################################

3 "Jernporten"
################################
################################
#...........######........##....
##..###......####....###..###..#
##..###..##..###......##...##..#
##..###..##..###..##..##...##..#
##..###..##..###.####.##....#..#
##..###..##..##..####..#....#..#
##..###..o..###..####..#..#....#
##..###....####..####..#..#....#
##..###....####..####..#..##...#
##..###....####..####..#..##...#
##..###....####..####..#..##...#
##..###..#..####.####.##..###..#
##..###..#..####..##..##..###...
#....##..##..###......##..###...
#.SS.#...##...###....###..##.FF.
#.SS.#...###........###....#.FF.
##..#########################..#
################################
```

The map edge counts as wall (columns and rows outside the map are solid).

Snakes, level 2 only, as `{ from: [col, row], to: [col, row], period }` where the snake's centre
moves between the two tile centres and back, easing in and out, one full there-and-back per
`period` steps:

| from | to | period (steps) |
|---|---|---|
| [8, 7] | [16, 7] | 300 |
| [27, 7] | [18, 7] | 300 |
| [14, 15] | [14, 16] | 110 |
| [22, 16] | [22, 15] | 110 |

### Rules (`rules.ts`, pure, tested)

State: `{ level, x, y, lit: number (index of the last lit stone, -1 for start), stones, snakes,
steps, deaths, phase: "play" | "cursed" | "cleared", phaseSteps }`. One function
`stepMaze(state, intent)` where `intent` is `{ dx, dy }` in art pixels for this step, already
limited by the scene to the allowed speed.

- **Body**: 6 x 6, `x, y` its centre. Each step it moves by `dx` then `dy`.
- **Curse**: if the body overlaps any wall tile after a move, or a snake's box (12 x 6 lying along
  its direction of travel), the phase becomes `cursed` for 40 steps: he does not move, then he
  is back at the last lit stone (or the start pad), `deaths` goes up by one, and the snakes go
  back to their starting phase. Unlike a platformer, walls do not stop him; touching is losing.
  That is the game.
- **Standing stone**: when his centre is inside a stone's tile, it becomes the lit one.
  A stone is floor, not wall.
- **Finish**: his centre inside an `F` tile: phase `cleared`.
- **Level clock**: counts steps from his first move in the level, not while cursed-waiting on
  the pad before moving.
- **Movement limits** (enforced in `scene.ts`, tested through a helper `limit(dx, dy, max)`):
  at most 1.6 px per step by pointer or touch, 1.2 by keys or gamepad, 0.6 with Shift or the jump
  action held.

Tests: wall touch curses; a 6 x 6 body fits through a one-tile corridor without touching; stones
light; respawn goes to the last lit stone; snake box collision; snake position over a period
returns to its start; finish clears; `limit` caps diagonal speed. `levels.test.ts`: each map is
32 x 20, has a 2 x 2 `S` and a 2 x 2 `F`, and a flood fill over floor tiles reaches `F` and every
`o` from `S`; every snake's line lies on floor.

### Steering (`scene.ts`)

- **Mouse** (pointer type mouse or pen): the target is the pointer's position in the world. Each
  step he moves toward it by at most 1.6 px and stops within 0.5 px. The pointer does not need to
  be pressed. Until the pointer has moved inside the stage at least once in this level, there is
  no target (so he does not walk into a wall at load).
- **Touch**: on pointerdown remember the finger; on pointermove add the finger's movement,
  converted to art pixels, to a pending offset; each step he consumes up to 1.6 px of it.
  Lifting the finger clears what is left.
- **Keys and gamepad**: left, right, up, down actions from the kit's input, eight directions.
  Using them clears the mouse target until the pointer moves again.
- **Leaving**: the start pad of level 1 has a doorway on its left wall drawn as daylight; the
  `enter` or `up` action while standing on the level 1 start pad, or the header's back link,
  calls `onLeave({ cleared: false })`. Escape does the same from anywhere.
- After the last level is cleared: store `viking.feather = "1"` in `localStorage`, play `fanfare`,
  show the end bubble, then `onLeave({ cleared: true })` after the visitor presses a key, clicks
  or taps.

### Look (`render.ts`)

Top-down, the camera centred on him and clamped to the map, eased as on the front page. Drawn in
one pass through the kit's `stage.pass` with the phase `"night"`, so the mound is dark and its
lights glow through the kit's light list. That is how the front page does night, and it is why
this scene belongs to the same game.

- **Floor**: packed earth in two close browns with sparse flagstones, from a seeded pattern so it
  is the same every visit.
- **Walls**: the front page's ruin stone (`STONE` and `stoneColumn` in
  `apps/landing/src/render/buildings.ts`; move them into the kit's `paint.ts` or `palette.ts` if
  they are not there yet, landing unchanged). A wall tile that has floor directly below it shows
  a 5 px front face in the darker stone with iron studs (two `iron` pixels), which gives the
  maze height. Walls next to floor carry a one-pixel rust-red line on the floor side: the curse.
  It pulses slowly between two reds.
- **Start pad**: flagstones with a carved ring. **Finish**: a doorway of daylight, with a `pool`
  light. **Standing stones**: a grey stone 6 x 9 with one rune; when lit it has a `soft` light and
  the rune glows in `runeGlow`.
- **Torches**: on every wall tile whose column and row are both multiples of 6 and that has floor
  below it: two flame pixels flickering between two yellows, registered as a `lamp` light.
- **Him**: from above, 8 x 8, by `playerPixels` with a new `view: "top"` option in the kit: helmet
  as an iron disc, the white pompom as the centre 2 x 2, shoulders in sweater blue left and right
  of it, and a torch pixel in the hand toward his facing. A `pool`-like light follows him.
  Walking alternates two frames (shoulders shift by one pixel).
- **Snakes**: 12 x 6, green `#3f8f3a` with purple `#7a3f9a` bands (the old game's colours), a red
  one-pixel tongue that flicks, body bending by one pixel as it moves.
- **Cursed**: for the 40 steps the wall line around him flashes, he turns rust red, the screen
  shakes one pixel (not with reduced motion), `curse` sound.
- **The raven**: sits on the wall above the start pad of every level, 7 x 6, black with a grey
  beak, blinks. Its lines appear as the kit's speech bubble.

### The raven's lines (`i18n.ts`)

Short and dry, from the old game's voice. One line shows at a time.

| When | nb | en |
|---|---|---|
| level 1 start | Før musa gjennom haugen. Ikke rør veggene. | Guide yourself through the mound. Don't touch the walls. |
| level 1 curse | Ha. Jernforbannelsen tok deg. En gang til? | Hah. The iron curse got you. Again? |
| level 2 start | Å, du kom deg hit? Jaja. Pass deg for ormene. | Oh, you actually made it? Well. Mind the snakes. |
| level 2 curse, wall | Seriøst? Veggen? | Really? The wall? |
| level 2 curse, snake | Ormene spiser sånne som deg. Prøv igjen. | The snakes eat your sort. Try again. |
| level 3 start | Flaks: ingen ormer her. Bare jern. | Lucky you: no snakes here. Only iron. |
| level 3 curse | Jernveggene forbanner deg til et liv uten fritid! | The iron walls curse you with no free time, ever! |
| stone lit | Steinen husker deg. | The stone remembers you. |
| after the last level | Haugbonden gir seg. Ravnefjæra er din: hopp en gang til i lufta. | The mound-dweller yields. The raven's feather is yours: jump once more in mid-air. |
| after the last level, standalone | Fjæra venter i Vikingfjorden. | The feather waits in Vikingfjorden. |
| help | Styr med musa, fingeren eller piltastene. Shift for små skritt. Esc for å gå ut. | Steer with the mouse, a finger or the arrow keys. Shift for small steps. Esc to leave. |

Fix "Før musa" to "Før deg" if the visitor is not using a mouse; simplest is to use
"Kom deg gjennom haugen. Ikke rør veggene." for everyone. Use that.

### Sound

Kit `sfx`: `step` every 14 steps of walking, `curse`, `stone`, `door` on finish, `fanfare` at the
end, and a quiet `bleat`-free hiss for a snake within 40 px (add `hiss` to the kit: a 120 ms
filtered noise burst).

## In the viking game

- The door `maze` no longer navigates. Going in fades out as other doors do, then the page
  switches scene: `location.hash = "#jernhaugen"`, the fjord stops stepping and drawing, the maze
  is created and driven by the same loop. Loading `/viking/#jernhaugen` directly starts in the
  maze. The browser's Back, or leaving the maze, returns to the fjord with him standing at the
  mound door.
- The maze is loaded with a dynamic `import("@larshansen/maze/scene")` the first time it is
  entered, so it does not add to the fjord's entry script (which must stay under 70 kB).
- The maze's camera must keep him clear of the fixed header bar, the way the fjord's camera does
  after order 2 (it may scroll above the map's top by the bar's height).
- While in the maze the header shows, in place of the rune slots and run timer: the level name,
  `2 / 3`, the level clock and the death count. The run timer of the fjord is paused.
- The touch pad in the maze: hidden (touch steers by dragging). The help line shows the maze's
  help text.
- When the maze reports `cleared: true`, the fjord turns the double jump on at once, and the
  bubble at the mound door no longer shows.
- The header link for the maze keeps its `href` to `https://maze.larshansen.dev/` for visitors
  without JavaScript, but with JavaScript a click on it enters the scene.

## `apps/iron-maze`

Delete `src/` entirely (React, jQuery, PNG, JPG, fonts, MP3, WAV), `public/manifest.json`, and the
`react`, `react-dom`, `jquery`, `@vitejs/plugin-react` dependencies. New, small, TypeScript:

- `index.html` modelled on `apps/viking/index.html`: header bar with "Lars Hansen", links
  "Vikingfjorden" (`https://larshansen.dev/viking/`) and "Gamle Oslo" (`https://larshansen.dev/`),
  the level HUD, mute. `<title>Jernhaugen · larshansen.dev</title>`, description in the same tone.
- `src/main.ts`: creates the kit stage, input, sfx, loop, and `createMaze`. `onLeave` with
  `cleared: true` shows a small cream finish card with the standalone line and a link to
  `https://larshansen.dev/viking/#jernhaugen`; with `cleared: false` it goes to
  `https://larshansen.dev/viking/`.
- `package.json`: `build` is `tsc --noEmit && vite build`, `test` is omitted (tests live in the
  package), `tsconfig.json` as viking's. `vite.config` as TypeScript, no base path.
- `?debug` exposes `window.__game = { maze, state, view, input, frame }` and `?level=2` starts
  there, in both hosts.
- Rewrite `apps/iron-maze/README.md`: what it was (built in a few days at Ironhack as "Mouse
  Maze"), what it is now, how to run it.

## Acceptance

1. `bun install` at the root; `jquery` is gone from `bun.lock`.
2. `packages/maze`: `bun test` and `bunx tsc --noEmit` pass.
3. `apps/viking`, `apps/iron-maze`, `apps/landing`: `bun run build` passes; viking and landing
   tests pass; root `bun run build` builds everything.
4. `git ls-files apps/iron-maze | grep -E "\.(mp3|wav|png|jpg|ttf|woff)$"` prints nothing.
   `apps/iron-maze/dist` is under 100 kB in total.
5. The front page is pixel-identical (reviewer checks).
6. In both hosts with `?debug`, stepping `frame` draws the maze; moving him into a wall curses
   and returns him to the pad; walking the corridor clears level 1 and loads level 2.
7. `.github/workflows/deploy.yml`: add a smoke test for the maze host next to the others, using
   the same `curl` with `-H "Host: maze.larshansen.dev"`, expecting `Jernhaugen` in the page.
8. `README.md` at the root and `apps/viking/docs/DESIGN.md` mention the new scene and package.

## Report back

As before: files, departures and why, test and build output, sizes, and what you think is weak.
