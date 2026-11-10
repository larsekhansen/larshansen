# Work order 4: maze features and levels 4 to 7

Read first: `docs/games/PLAN.md` section 6, `docs/games/orders/03-maze-core.md` (what exists),
all of `packages/maze/src`, and how `apps/viking/src/main.ts` and `apps/iron-maze/src/main.ts`
host the scene.

## Goal

The maze grows from three levels to seven, with four new mechanics, records, a way to replay
levels, and the feather awarded after level 7 instead of level 3.

## Rules for this repository

As in order 3: Bun only; no commit, push or branch switch; no dev servers on 5196 to 5199; the
front page must not change; TypeScript strict; no asset files; the style bible binds; every
string in nb and en.

## New mechanics (all in `rules.ts`, pure, each with tests)

**Rune key and iron gate** (`k`, `g`). A gate tile is wall until the level's key has been picked
up (his centre in the key's tile). Then the gate slides open over 30 steps and is floor. A curse
does not take the key back. Drawn: the key as a small iron key with a glowing rune, bobbing one
pixel; the gate as iron bars with a rune plate, bars retracting upward when it opens. Sounds:
`pickup`, `gate`.

**Crumbling floor** (`c`). Looks like floor with cracks. From the first step on which his body
overlaps a `c` tile, that tile shakes (one pixel, alternating) for 120 steps and then falls:
it becomes a pit. A pit curses like a wall. On a curse every `c` tile of the level is restored.
Drawn: cracks widen in three stages over the 120 steps; the pit is near-black with a one-pixel
lighter rim on its top edge. Sound: a low `land`-like thud when a tile falls.

**Sliding walls** (table per level, like snakes): `{ at: [col, row], w, h, period, offset }`.
With `t = (steps + offset) % period`: the block is wall while `t < period / 2`, floor
otherwise. For the last 60 steps before it becomes wall it shimmers as a warning (an outline
that blinks every 8 steps). If it becomes wall while his body overlaps it: curse. Sliders keep
running during a curse and are not reset by it, so waiting is always possible. Drawn: the wall
stone rising out of the floor over 6 steps, sinking over 6.

**Dark levels** (flag per level). The pass is drawn as usual and then everything farther than 46
art pixels from him is covered in near-black, stepping to full visibility through two rings
(46 to 40: 60% dark, 40 to 34: 30% dark), drawn as rectangles per row so it stays pixel art, no
gradient. Lit standing stones and the finish doorway each keep their own clear circle of radius
20. The raven's bubble is always visible.

## Levels

Level 3 gains a key and a gate: put `k` at column 15, row 10 and `g` at columns 29 and 30 of
row 13 (zero-based, in the map from order 3).

New maps, to use as given:

```
4
################################
################################
###########################....#
########..ccccc############.FF.#
########..###############...FF.#
########..ccccccc.....ccc......#
########..#######.....ccc..#####
###################c############
###################c############
###################c############
###################c############
###################c############
###################c############
###################c############
#....############....###########
#.SS.############....###########
#.SS......ccccccc.o..###########
#.........ccccccc....###########
#################....###########
################################
5
################################
################################
##.............o.............###
##...........................###
##..#######################..###
##..#######################..###
##..#######################..###
##..###......................###
##..###......................###
##..###..#######################
##..###..#######################
##..###..#######################
##..###........o.......#########
##..###................#########
#....################..####....#
#.SS.################.......FF.#
#.SS.################.......FF.#
#....######################....#
################################
################################
6
################################
################################
##..###########........#####..##
##..###########........#####..##
##..........o....####..#####..##
##...............####..#####..##
########..#####..##...........##
########..#####..##...........##
########..##.....##..###..######
########..##.....##..###..######
##........##..#####..###..######
##........##..#####..###......##
##..########..#####..###......##
##..########....o....#######..##
#....#######.........######....#
#.SS.#######..#############.FF.#
#.SS.##.......#############.FF.#
#....##.......#############....#
################################
################################
7
################################
################################
###########################....#
###k....###################.FF.#
###.....###################.FF.#
######..###################....#
######..####################gg##
######...................###..##
######...................###..##
###############.#######..###..##
###############.#######..###..##
###############.#######..###..##
###############.####o.........##
###############.####..........##
#....#########...###############
#.SS.#########...###############
#.SS.....ccccc.o.###############
#........ccccc...###############
##############...###############
################################
```

Names: 4 "Råttent gulv", 5 "Skyveveggene", 6 "Mørket" (dark), 7 "Haugbonden".

Sliders, level 5:

| at | w | h | period | offset |
|---|---|---|---|---|
| [9, 2] | 1 | 2 | 180 | 0 |
| [20, 2] | 1 | 2 | 180 | 90 |
| [27, 5] | 2 | 1 | 160 | 40 |
| [18, 7] | 1 | 2 | 140 | 0 |
| [12, 7] | 1 | 2 | 140 | 70 |
| [11, 12] | 1 | 2 | 120 | 0 |
| [18, 12] | 1 | 2 | 120 | 60 |

Level 7: snakes `[8, 7] to [14, 7]` period 220 and `[22, 8] to [17, 8]` period 220; one slider
`{ at: [26, 12], w: 1, h: 2, period: 150, offset: 0 }`. Level 7's finish pad is the
mound-dweller's chamber: draw a stone seat with a seated figure in grave-grey (9 x 12, two
dim eye pixels that follow him left or right) above the pad, and the raven's feather (5 x 9,
black with a blue sheen pixel) floating over the `F` tiles, bobbing.

`levels.test.ts` additions: every map is 32 x 20; with gates treated as wall the key is reachable
and the finish is not (levels with a gate); with gates open the finish and every stone are
reachable; every slider and snake lies on floor tiles; every level has a path from `S` to `F`
when crumbling tiles are treated as floor.

## The raven's new lines

| When | nb | en |
|---|---|---|
| level 3 start (replaces the old one) | Ingen ormer her. Bare jern, og en port som vil ha en nøkkel. | No snakes here. Only iron, and a gate that wants a key. |
| key taken | Der gikk porten opp. Et sted. | A gate just opened. Somewhere. |
| level 4 start | Gulvet er eldre enn deg. Ikke stå stille. | The floor is older than you. Don't stand still. |
| level 4 curse, pit | Det var et hull der. Nå er det et hull der med deg i. | There was a hole there. Now there is a hole with you in it. |
| level 5 start | Veggene flytter seg. De blunker før de biter. | The walls move. They blink before they bite. |
| level 5 curse | Du ble vegg. | You became wall. |
| level 6 start | Noen har slukket lyset. Det var meg. | Someone put the lights out. It was me. |
| level 7 start | Haugbonden sitter innerst. Han er ikke morgenfugl. | The mound-dweller sits at the far end. Not a morning person. |
| level 7 curse | Så nær. Altså, ikke egentlig. | So close. Well, not really. |

Keep the after-the-last-level lines from order 3; they now come after level 7.

## Records and replay

- `localStorage["maze.records"]`: JSON, per level `{ ms, deaths }`, the best time and, separately,
  the fewest deaths. Updated when a level is cleared. Shown in the header HUD beside the level
  clock as the best time for the current level (as the fjord shows its best).
- `localStorage["maze.reached"]`: the highest level number entered. Entering the maze starts at
  that level, not at 1 (a visitor who comes back continues). After level 7 is cleared it resets
  to 1.
- Level select: the keys 1 to 7 jump to a level that has been reached; on touch and for mouse
  users the level label in the header is a button that opens a small cream panel (same style as
  the finish card) listing the seven levels with their best time and deaths, the unreached ones
  greyed out. Picking one starts it.
- The feather (`viking.feather`) is awarded after level 7, no longer after level 3. If a browser
  already has the feather from the three-level version, it keeps it.

## In the viking game

- The header HUD in the maze shows `4 / 7`.
- After the maze reports `cleared: true`: back in the fjord, a short moment at the mound door: the
  feather floats down onto him (reuse the maze's feather drawing at side view, 5 x 9), a bubble
  says the feather line, and the double jump is on. The first time he double-jumps, three
  black feather pixels drift down from where he jumped.
- `apps/viking/src/game/reach.test.ts` is unchanged and must still pass.

## Acceptance

1. `packages/maze`: `bun test`, `bunx tsc --noEmit` pass, with tests for each new mechanic.
2. `apps/viking`, `apps/iron-maze`, `apps/landing` build; their tests pass. Viking's entry script
   stays under 70 kB; the maze chunk is separate.
3. With `?debug&level=N` each of the seven levels draws when stepped; each can be cleared by
   moving him along the corridor in the debug handle (the reviewer will do this).
4. Records survive a reload; `maze.reached` behaves as described.
5. The front page is pixel-identical.

## Report back

Files, departures and why, test and build output, sizes, and what you think is weak or too hard.
