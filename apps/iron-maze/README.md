# Jernhaugen

At [maze.larshansen.dev](https://maze.larshansen.dev). This began as "Mouse Maze", built in a few days at Ironhack as the first project of the coding bootcamp: move the mouse pointer through a maze without touching the cursed walls, with a few snakes and some taunts, in React and jQuery, and MC Hammer playing.

It is now a pixel scene in a burial mound seen from above, its walls' faces showing, built like the front page and the viking game on the shared kit (`packages/pixelkit`), and the bonus stop of [Vikingfjorden](../viking): the door at the burial mound opens it, clearing level 3 gives the raven's feather (a second jump in the fjord), and clearing all seven turns it gold. Since order 36 (ADR 0056) it is drawn in the viking game's grain: him from that game's own sheet, standing on the mound's floor with a torch; the mound's own iron-bound lining, packed earth and dark hill as per-pixel pieces lit from the top left; adders outlined in the warning red; the key in the gold of what he takes, the door's corners in the cyan of things to use. On a touch screen the help line says what a finger does (drag anywhere to steer), the raven's words wrap, and every button is a thumb's target. The maze itself, with its seven levels, rules, drawing, steering, the raven's voice, the three marks per level, the ghost of your best run and the teleport stones, lives in [`packages/maze`](../../packages/maze). This app is only a thin page around it: the header bar, the level display, mute, and a small finish card with every level's marks that links to Vikingfjorden on larshansen.dev, where the feather can be used. There are no image, font or audio files, and no music: the only sounds are the kit's short synthesised blips.

```bash
bun run dev:iron-maze    # from the repo root
bun run build:iron-maze  # type-check + production build
bun test                 # in packages/maze: levels, rules, records, ghosts, the scripted player, no music
```

Keys: arrows or WASD to steer, Shift for small steps, 1 to 7 for a level already reached, Esc to leave, M to mute. On a touch screen: drag a finger anywhere (he follows its movement, not its place); let go and he stands.

## Checking it without a person

`?level=3` starts at that level. `?debug` exposes `window.__game = { maze, state, view, input, frame }`; `frame(now)` steps the game by hand. With `?debug` (`packages/maze/src/debug.ts`, shared with the maze inside Vikingfjorden, where the same addresses work after `/viking/?debug&told&…#jernhaugen`), also:

- `steps=N` runs N physics steps at load and then draws one frame at once, so a headless Firefox (which draws no frames of its own) shows a real moment of the game; the page tells `tools/shots.ts --wait` when its picture is drawn;
- `bot=keys` or `bot=pointer` lets the scripted player steer during those steps, `portals` lets it take teleport stones; `bot=finger` makes the scripted player's moves with a finger on a touch screen (synthetic pointer events through the scene's own touch code) and writes how the level went on the help line;
- `walk=dx,dy` steers him by that much every step instead, and `at=c,r` puts him on a tile first;
- `ghost` (or `ghost=keys`) records the scripted player's clear of the level as its ghost;
- `records=demo` or `records=all` fills in made-up records (four or six levels cleared), `levels` opens the level list, `end` shows the finish card;
- `touch` shows the page as on a touch screen, `reduced` with reduced motion;
- `perf` measures a frame (rectangles, colours, copies), and with `post=<port>` sends the line to a small server on this machine.

For example `?debug&level=2&bot=keys&portals&steps=874` is the moment after the teleport on level 2, and `?debug&level=1&walk=-1,0&steps=40` is a curse. Errors in debug mode are shown in the help line, since a screenshot has no console.

Inside Vikingfjorden, `?debug&told&level=nordmarka&x=2372&steps=1&walkin=60&out&after=30#nordmarka` walks him into the mound once the page has loaded and back out into Nordmarka, and `?debug&told&level=3&bot=keys&steps=1300&out&after=90#jernhaugen` is the feather's moment at the mound's stop on the map.

`bun packages/maze/tools/runs.ts [<checkout>] [--ghosts=<file>] [--replay=<file>]` plays the scripted player on every level of any checkout and fingerprints each run step by step, and writes and replays the ghosts: the maze's rules held step for step against another checkout.
