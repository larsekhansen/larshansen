# Jernhaugen

At [maze.larshansen.dev](https://maze.larshansen.dev). This began as "Mouse Maze", built in a few days at Ironhack as the first project of the coding bootcamp: move the mouse pointer through a maze without touching the cursed walls, with a few snakes and some taunts, in React and jQuery, and MC Hammer playing.

It is now a top-down pixel scene in a burial mound, built like the front page and the viking game on the shared kit (`packages/pixelkit`), and the bonus stop of [Vikingfjorden](../viking): the door at the burial mound opens it, clearing level 3 gives the raven's feather (a second jump in the fjord), and clearing all seven turns it gold. The maze itself, with its seven levels, rules, drawing, steering, the raven's voice, the three marks per level, the ghost of your best run and the teleport stones, lives in [`packages/maze`](../../packages/maze). This app is only a thin page around it: the header bar, the level display, mute, and a small finish card with every level's marks that links to Vikingfjorden on larshansen.dev, where the feather can be used. There are no image, font or audio files, and no music: the only sounds are the kit's short synthesised blips.

```bash
bun run dev:iron-maze    # from the repo root
bun run build:iron-maze  # type-check + production build
bun test                 # in packages/maze: levels, rules, records, ghosts, the scripted player, no music
```

Keys: arrows or WASD to steer, Shift for small steps, 1 to 7 for a level already reached, Esc to leave, M to mute.

## Checking it without a person

`?level=3` starts at that level. `?debug` exposes `window.__game = { maze, state, view, input, frame }`; `frame(now)` steps the game by hand. With `?debug`, also:

- `steps=N` runs N physics steps at load and then draws one frame at once, so `firefox --headless --screenshot` (which draws no frames of its own) shows a real moment of the game;
- `bot=keys` or `bot=pointer` lets the scripted player steer during those steps, `portals` lets it take teleport stones;
- `walk=dx,dy` steers him by that much every step instead, and `at=c,r` puts him on a tile first;
- `ghost` (or `ghost=keys`) records the scripted player's clear of the level as its ghost;
- `records=demo` or `records=all` fills in made-up records (four or six levels cleared), `levels` opens the level list, `end` shows the finish card.

For example `?debug&level=2&bot=keys&portals&steps=874` is the moment after the teleport on level 2, and `?debug&level=1&walk=-1,0&steps=40` is a curse. Errors in debug mode are shown in the help line, since a screenshot has no console.
