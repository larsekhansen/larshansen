# 0036. What never changes is drawn once and copied

Decided 2026-11-15 by the planner, after Lars reported the game lagging on a phone.

## Context
Every frame redraws the whole view with rectangles. A normal view is 5,000 to 15,000 of them, which
is fine. Measured with `?debug&perf` at 390 x 844, some views were ten to forty times that: Akershus
227,000 a frame, Rådhuset 123,000, Stortinget 97,000, Langkaia 58,000. Nearly all of it was
`stoneColumn` (stonework, one rectangle per pixel) and Stortinget's `shaleTile` (64 per tile), and an
upright phone draws more of both because its view is taller.

## Decision
- **Stonework is kept.** `packages/pixelkit/src/paint.ts`: stone is drawn once into 128 px squares
  held beside the page and copied from them. `stoneColumn` keeps its meaning; `stoneWall` copies a
  whole wall in as few pieces as it crosses squares. The front page and the maze get this too.
- **`kept(key, x, y, w, h, draw)`** (`packages/pixelkit/src/kept.ts`) does the same for any small
  piece that is the same pixels every time, opaque or clear, registers no lights and stays inside
  its rectangle. Stortinget's rock tiles use it. It ships with Stortinget's file (the first script
  has no room); a second level that uses it means giving it a file of its own.
- **Not done: keeping whole tile layers.** A level's own `tile` may read the frame's state
  (Gamlebyen's rising stones do), so tiles cannot be kept wholesale without marking which are safe.
- **`?debug&perf`** draws the frame fifty times and writes on the help line how many rectangles,
  colours and copies one frame takes, how long it took, and which functions drew most (best on the
  dev server, where functions keep their names).

## The rule that goes with it
A change of this kind must leave the pictures byte-identical. This one: 106 of 106 level pictures
(16 levels at three places by day, five at night, at 1280 x 800 and 390 x 844) against the live
site, 28 of 28 front page pictures, three maze pictures.

## Consequences
- On the Pi's software renderer at 390 x 844: Akershus 400 to about 50 ms a frame, Rådhuset 263 to
  86, Stortinget 213 to 76, Langkaia 134 to 62. A phone's numbers are its own; the ratio is the point.
- First script 59.34 to 59.75 kB.
- Still heavy, not yet done: Nordmarka's dark (`drawDark` and the lamp, about 10,000 translucent
  rows a frame, 190 ms here); rectangles set their colour every time even when it has not changed;
  each frame composes five stacked canvases.
