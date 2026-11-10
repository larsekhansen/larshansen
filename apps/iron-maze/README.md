# Jernhaugen (Iron Maze)

At [maze.larshansen.dev](https://maze.larshansen.dev). This began as "Mouse Maze", built in a few days at Ironhack as the first project of the coding bootcamp: move the mouse pointer through a maze without touching the cursed walls, with a few snakes and some taunts, in React and jQuery.

It is now a top-down pixel scene in a burial mound, built like the front page and the viking game on the shared kit (`packages/pixelkit`). The maze itself, with its three levels, rules, drawing, steering and the raven's voice, lives in [`packages/maze`](../../packages/maze) and is also what the door at the burial mound in [Vikingfjorden](../viking) opens. This app is only a thin page around it: the header bar, the level display, mute, and a small finish card that links to `/viking/#jernhaugen` on larshansen.dev, where the prize (the raven's feather) can be used. There are no image, font or audio files; the sound is synthesised.

```bash
bun run dev:iron-maze    # from the repo root
bun run build:iron-maze  # type-check + production build
bun test                 # in packages/maze: levels and rules
```

Useful URL parameters: `?debug` (exposes `window.__game = { maze, state, view, input, frame }`, and `frame(now)` steps the game by hand) and `?level=2` (starts at that level). Keys: arrows or WASD to steer, Shift for small steps, Esc to leave, M to mute.
