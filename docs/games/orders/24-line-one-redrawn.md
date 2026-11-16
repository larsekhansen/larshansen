# Order 24: line 1 redrawn

Written 16 November 2026, after order 23 (PR #69). Lars chose way 3 for the pixels (ADR 0045:
"do way 3 like you suggested. for the pixels"): same grid, every figure and small thing a
per-pixel map with a ramp of tones and a lit side. Order 23 did him, the first three levels'
enemies, the skilling and the cheese. This order finishes line 1 and the things every level
shares, and settles what order 23 left open. Line 2's own kinds are order 25.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, `docs/games/GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036, 0039 to 0048, order 23, `apps/viking/src/alive/`,
  `apps/viking/tools/review/o23/old-style.md` (your work list) and `o23/sloppy-edge.md`.
- `git fetch origin`; branch `line-one-redrawn` from `origin/main`. First commit: this order, as
  `docs/games/orders/24-line-one-redrawn.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port and any headless browser you started when done.
- ADR 0003 and ADR 0014 stand. No route, box, speed or timing changes except section 3, which
  moves things in level data and says so. Sloppy run files for Slottet, Akerselva, Stortinget
  and Nordmarka on seeds 201 to 260: byte-identical before and after sections 1 and 2.
- Front page 28 pictures byte-identical. First script under 60 kB (59.44 now): maps live in
  lazy chunks, each level's own kinds in that level's chunk.

## 1. Way 3 for the rest of line 1

From `old-style.md`, redraw as per-pixel frames (idle, cycle, wind-up, three-frame death, as
order 23's test demands), each with three to five tones a material, a lit side, an eye where it
has one, inside ADR 0044's outlines and palette test:

- **Shared looks** (`render/looks.ts`): hedgehog, grill, kid, wasp, fox, owl, squirrel.
- **Line 1's own kinds**: hotdog (Slottet); salmon, duck (Akerselva); bat, anthill (Nordmarka);
  pigeonfly, trackrat, umbrella, trolley (Stortinget); magpie (Ekeberg); cat (Vålerenga).
- **Bosses of line 1**: the troll and the plough, every state. They are big: spend the tones on
  form (a lit shoulder, a shaded belly, the plough's blade catching light), keep every tell of
  orders 19 and 22 exactly where it is.
- **Harmless movers of line 1**: sheep, the moose, Slottet's parade children, banner bearers
  and King's Guard (kept sprites: keep them kept).
- **Thrown things** of the kinds above (snowball, acorn, and so on).
- **Small things every level has**: the shield (carried and on his back), the feather, the
  bracteate, the rune stone, the ski pole, the bench, and the flag inside the viking game only
  (the kit's flag is shared with the front page: give the game its own, in three frames with
  the level's wind, and leave the kit's alone).

Each must read at 390 x 844 at its real size: look at every one there before calling it done.
If a natural colour now passes the palette test where order 22 could not find one (the brown
rat), say so; do not force it.

## 2. Left from order 23

1. Water laps at quays (two or three frames, drawn once and copied) in Langkaia, Akershus,
   Rådhuset, Akerselva; torches and lamps flicker where there are any (Akershus, Nordmarka,
   Gamlebyen), off with reduced motion.
2. The sea serpent's frames (breathing while reared, the daze) even though its pixels wait for
   order 25.
3. The troll's eyes in the dark follow its walking bob.
4. Things in front: Langkaia's mast is a one-pixel black line the full height of the screen and
   reads as a tear in the picture. Give every thing in front a shape a person recognises at a
   glance (a mast with a yard and a furled sail's edge, a lamp post with its head, a trunk with
   bark) and a dark tone of the level's own air rather than black; none may cross the banner or
   a sign's bubble. Look at each at both sizes.
5. Smoke from a chimney or two and birds far off where a level's sky is empty (scenery rule of
   ADR 0039), if the perf budget holds.
6. On a touch screen he is drawn above bubbles and the banner since order 23: check that no
   bubble's text is hidden by him where he must read it (benches, signs), and fix by moving the
   bubble, not him.

## 3. The edge: the places that got worse

ADR 0048 keeps ten steps of forgiveness though the sloppy player did worse on 31 of 1,920 runs.
Find out why at each place named in `o23/sloppy-edge.md` (Langkaia's deck pigeon at column 205,
Akershus's keep guards, Vålerenga's terrace dash and first roofs, the two Stortinget and six
Ekeberg runs that leave the route): replay a worse seed step by step and say what the late jump
did. Then, per place: move the enemy or the edge by a tile so the late jump no longer lands in
it, or show it is the bot's noise and not something a person meets. Wanted: no level's hearts
lost a run higher with 10 than with 6 at ±2 or ±4, and no run that left the route. If that
cannot be had without harming a level, say so plainly with the numbers: going back to 6 or to 8
is then a choice to put to Lars, not to make.

## 4. Docs

`old-style.md` carried forward to `o24/` with what is left for order 25; DESIGN, HANDOVER; an
ADR only if section 3 changes a decision; LEVELS.html pictures retaken.

## Measures that must hold

- `bun test` green in all four packages; `tsc --noEmit` and `bun run build` clean; first script
  under 60 kB.
- Front page 28 of 28 byte-identical.
- Run files as said above; after section 3 a fresh table for all sixteen levels.
- Perf: no place more than 200 rectangles a frame over `o23/perf.md`, none over 15,000.

## Hand back

1. Per item: done, partly, not done and why.
2. Pictures in `/tmp/shots-line1/`: a frame sheet per figure at four times size, and each at its
   real size at 390 x 844 on its own level by day and under its own sky; before and after.
3. Section 3: per place, what happened and what was done; the table.
4. Perf, tests, first-script size, front page comparison.
5. What only a person can judge, as a list for Lars.
6. Departures, doubts, found and not fixed. Branch and commits. Confirm no preview server or
   headless browser of yours is left running.
