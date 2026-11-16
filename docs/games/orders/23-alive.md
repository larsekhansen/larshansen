# Order 23: alive

Written 16 November 2026, after orders 21 and 22. Lars, in the conversation he saved in
`post/gemini-gamedesign-nov-16-2026`: the game has "shoddy enemy design and parallax design …
hard to see the enemies, not that engaging". Order 22 answered "hard to see" with paint. This
order answers "not that engaging" with what the research record
(`docs/games/research/2026-11-16-reference-games.md`) measured in three loved games and found
missing in ours: frames, a shadow under everything that moves, depth that drifts, and a little
more forgiveness at an edge.

The grain (how big a pixel is) is Lars's choice from order 22's study and is not decided here.
Everything in this order is drawn at today's grain and must survive either answer: keep frames
as data (maps and poses), not as code that assumes a size.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, the research record,
  `docs/games/GRAIN.md`, ADRs 0003, 0014, 0035, 0036, 0039 to 0043 and order 22's ADR, orders 19
  and 22, `packages/pixelkit/src/person.ts`, `apps/viking/src/render/sprite.ts`, `feel.ts`,
  `packages/pixelkit/src/stage.ts`.
- `git fetch origin`; branch `alive` from `origin/main`. First commit: this order, as
  `docs/games/orders/23-alive.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0014 stands. ADR 0003 stands except for section 4 below, which is the only change to
  `JUMP` and gets its own record.
- No route, box or speed changes. Sloppy run files for Langkaia, Holmenkollen, Nordmarka and
  Gamlebyen on seeds 201 to 260: byte-identical before and after sections 1 to 3; after section
  4 they will differ, so take them before it and show that no seed does worse after it.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`. The hero is shared
  with the front page: new frames are opt-in for the viking game.
- First script under 60 kB (about 0.5 kB of room): frames and depth go in lazy chunks.

## 0. How the frames are drawn

`docs/games/GRAIN.md` recommends way 3 (same grain, better drawn: per-pixel maps with three to
five tones per material and a lit side), starting with him and Langkaia's rat, pigeon and gull.
Lars has not chosen yet, but way 3 changes no grid and is what his words ask for ("they need
more detail. espeiclally small items"), so the new frames of section 1 are drawn that way from
the start, using the study's maps and export tools as the beginning: him everywhere, every
enemy of line 1's first three levels, and the small things (skilling, cheese, shield, feather,
bracteate). Other enemies get their frames in their present drawing style if redrawing them all
does not fit; say which. The maps load outside the first script. Roles, outlines and the
palette test of ADR 0044 hold for every tone. The front page keeps its hero as he is (28
identical pictures).

## 1. Frames

Nothing here changes a box or a timing: frames are picked from state the game already has
(speed, on ground, time since landing, an enemy's own clock). Reduced motion: idle and cycles
still play (they are how he reads state); squash, stretch and anything that shakes do not.

**Him.** Idle: breathing (2 frames, about 2 a second) and a blink now and then. Run: at least
four frames, timed to distance covered, not to the clock, so feet do not slide. Rising and
falling as two different poses, with a frame between at the top. Landing: a squash for 4 to 6
steps, deeper after a long fall. A lean into the dash. A pose behind the shield. On the sledge:
sitting, leaning with the slope, ducking. Hurt: a pose for the frames he is thrown back.
Climbing, hanging from a hook, pushing a door, if the game has those states.

**Every enemy and harmless mover** (list them all from `KIND` and the levels' own drawings):
an idle of at least two frames; a move cycle of three or four; the wind-up of order 19 as a
pose, not only a flash; a death of three frames (hit, fold, gone) in place of the squash alone,
inside the time the squash takes now. Bosses: the same for each phase.

**Things.** Skilling turn (4 frames) and glint; flags fly (3 frames, with the wind of the
level); water laps at quays; torches and lamps flicker; the rune stone glows when he is near.
Only where the perf budget holds.

Show: one sheet per figure with every frame at four times size, and a strip of the run cycle
against the ground at the speed he walks, proving the feet hold.

## 2. A shadow under everything that moves

A soft dark ellipse on the ground below him, every enemy, every harmless mover, every thrown
thing and every carrier: about 1.2 times the thing's width and a quarter of that high at rest,
smaller and fainter the higher it is above the ground, gone over a pit or water (or a faint
one on the water if that reads). It is on the ground under him also while he is in the air: it
shows where he will land. Drawn under sprites and over tiles, from a cache; darker than the
ground by a fixed step under every sky, never a role colour (palette test). Flyers cast one on
the ground below, which is how a player judges a gull's height.

No more than 150 rectangles a frame added at any place.

## 3. Depth

1. **The receding plane.** Water (Langkaia, Bjørvika, Bygdøy, Gamlebyen, Akerselva, Østensjø-
   vannet), snow fields (Holmenkollen, Korketrekkeren) and the fjord on the map: thin strips,
   each a little faster than the one above it and drifting a little faster, from the horizon to
   the lane. Each strip drawn once and copied (ADR 0036).
2. **More speeds.** List every level's layers and speeds (order 22 began the list). Where a
   level has fewer than five distinct speeds between sky and lane, split what it has (near
   trees from far trees, the near row of houses from the skyline) rather than draw more.
3. **Drift.** Clouds everywhere, slowly, each layer at its own pace; smoke from chimneys;
   birds far off; a boat on the fjord; the T-bane far away where it would be. Never in a role
   colour, never near the lane.
4. **Something in front of him**, now and then: a lamp post, a mast, a trunk, reeds, a rope,
   passing at 1.5 to 2 times the camera's speed, dark and plain, at most a tenth of the view's
   width, **never** within six tiles ahead of a jump, a pit, an enemy's patrol or a pickup, and
   never over a touch button's reach (ADR 0043). A test holds the "never" from the level data.
   Three or four per level at most. Off with reduced motion if it distracts: decide by looking.

Order 22's haze and value band hold for everything added. Perf: no place more than 400
rectangles a frame over order 22's table, none over 15,000.

## 4. More forgiveness at an edge

`JUMP.coyoteSteps` from 6 (0.10 s) to 10 (0.17 s; Celeste Classic gives 0.20 s). It can only
help: show it with the sloppy player on all sixteen levels (no seed does worse, count how many
do better) and with the reach search (nothing new becomes reachable that skips a gate, a key or
a boss: if something does, name it and keep 6 there by fixing the place, not the number). A new
ADR recording that ADR 0003's promise is "no route gets harder", quoting the measurements.

## 5. An alert mark

A small mark over anything at the moment it turns on him (the guard waking, the swan's warning,
the troll rising, a thrower taking aim): it swells and shrinks twice, in the hurt role's red
with a dark edge, with order 19's sound for that moment. An arrow at the screen's edge for a
thrower or flyer about to enter the view, within one second of entering, if it reads well at
390: try it, show it, keep it only if it helps.

## 6. Docs

DESIGN (frames as a rule for level authors: what every new enemy must have), HANDOVER, ADRs
(frames and shadows; depth; the edge), LEVELS.html pictures retaken where a place changed.

## Measures that must hold

- `bun test` green in all four packages; `tsc --noEmit` and `bun run build` clean; first script
  under 60 kB.
- Front page 28 of 28 byte-identical.
- Run files as said above.
- A test that every kind in `KIND` has idle, move and death frames, and that no frame's
  drawing leaves the box the sprite cache gives it.
- Perf table for every level at 390 x 844, before and after.

## Hand back

1. Per section: done, partly, not done and why.
2. Pictures in `/tmp/shots-alive/`: frame sheets, the run strip, shadows by day and night, each
   level's depth before and after at both sizes, the foreground things, the alert mark.
3. The edge: the sloppy player's table and the reach search's answer.
4. Perf, tests, first-script size, front page comparison.
5. What only a person at speed can judge, as a list for Lars.
6. Departures, doubts, found and not fixed. Branch and commits.
