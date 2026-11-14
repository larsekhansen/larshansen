# Order 15: Vigelandsparken, Korketrekkeren, Østensjøvannet

Written 14 November 2026, after order 14 (PR #59) was merged and deployed. Levels 12, 13 and 14 of
`docs/games/PLAN-LINE-2.md`. Read the plan, and HANDOVER's "Line 2" section for the list of places
a new level touches.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0011, 0014,
  0016 to 0025, the plan, and Bygdøy (`levels/bygdoy.ts`, its route and tests) as the model.
- `git fetch origin`; branch `three-stations` from `origin/main`. Commit as you go (this order
  first: it is untracked), one level at a time, each level green before the next. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 (`MOVE`, `JUMP` fixed) and ADR 0014 (privacy) stand.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`.
- First script: 58.96 kB now; it must end at or under 59.5 kB. Each level is its own lazy chunk.
  `sink.ts` sits in Bygdøy's chunk: move it to a chunk both Bygdøy and Østensjøvannet fetch.

## First: two things left from order 14

1. **Bygdøy's gull over the first boathouse** costs about one heart a run at ±4, more than half the
   level's total: move it or lift it so a roof-walker's head is clear. Wanted: Bygdøy at or under
   1.5 hearts a run at ±4.
2. **The slingers' yard** teaches the shield, but a careless walker gets through about half the
   time. Make the lesson certain and kind: the first slinger alone, throwing on a short steady beat
   straight along a corridor he cannot jump out of (a low roof), so walking without the shield is
   always hit and walking with it never is; then the other two as now. Bygdøy's standing share
   (40 %) should come down under 36 %: shorten the stands, not the lesson.

## The three levels

Each: 220 to 280 columns; scripted clear 40 s or more; 8 to 20 enemies; 40 to 80 skilling; one
brown cheese; one bracteate only the feather reaches; one or two benches; flags at most about 45
columns apart; two to four signs, dry, both languages, nothing personal beyond what is said below;
one place that needs the shield; no enemy within three tiles of a take-off or landing over a pit
or water; no forced wait much over 5 s; standing share at or under 36 %. Route, scripted clear,
level measure, reach and dead-end searches, feather proof, loading board, station on the map, rune.

### 12. Vigelandsparken (rune I), by day, eerie and funny

The idea: **statues move only while his back is turned.** A statue is an enemy that walks toward
him while he faces away and is stone (harmless, solid to stand on) while he faces it. Looking is
his facing, nothing more; no timing window.

Beats: the gate and the bridge with its rows of bronze figures (the first statue alone, on flat
ground, with a sign that says nothing more than that the park is quiet); the angry boy on the
parapet, who stomps on a beat and shakes loose a ledge (a jumper); the fountain, whose jets are
timed lifts (carriers, at most 5 s to wait); the rose garden with two statues, one on each side,
so he must choose which to watch and use the one he faces as a step; a place where a statue must
be led, by turning away, onto a pressure plate or under a ledge and then used as a step; the
climb up the column of figures (ledges shaped as limbs, a flyer or two well clear of landings);
the shield place: figures on the plateau throw rings and he crosses with it raised; the rune at
the wheel of life.

Tests of the statue rule on a small made-up level. The reach search must treat a statue as a
possible step anywhere along its walk.

### 13. Korketrekkeren (rune K), winter afternoon, the breather

The idea: **a sledge he cannot stop.** From Frognerseteren down to Midtstuen. On the sledge he
moves right at a set speed that the level changes by stretch (never over twice his run); he can
jump (the same jump) and duck (down: under barriers and branches; the shield is the same key, so
on the sledge down is duck and the shield is stowed, and the level says so once). A hit costs a
heart and he keeps riding, blinking. Falling off the track puts him back at the last flag on the
sledge.

About 45 s of riding in a level of 240 to 280 columns of track drawn steep in the picture but flat
or stepped in the physics (ADR 0003: no slopes for the body; say in the ADR how the ride is
done). Beats: the start hut where he takes the sledge (walking, a sign, a bench); the first bends
with snow bumps only; other sledgers, slower, to jump; low branches to duck; a metro line crossing
with barriers that drop on a beat he can read from far off; a jump over a gap in the track with a
long clear landing; a stretch in the trees at dusk with lanterns; the finish at Midtstuen where
the sledge stops and the rune stands. The shield place is at the walking start or finish (snowball
throwers at the hut), since it is stowed on the sledge.

Wanted with the sloppy player: about 1 heart a run at ±4, no Game over. Every obstacle visible at
least 1.2 s before it arrives, at every screen width including 390 x 844 (he is drawn left of
centre on the sledge so he sees ahead; test the lead time from the camera, not by eye). Reduced
motion: no screen shake, and the speed lines are off.

Write the ADR for the ride (next number 0026): why one level breaks the stop-anywhere rule, what
keeps it fair.

### 14. Østensjøvannet (rune I), early morning, quiet

The idea: **lily pads that sink, and swans that mind their water.** A swan patrols a stretch and
only comes for him after he has been in its stretch 4 s (it lowers its neck and hisses for a
second first: a clear tell, with a still version for reduced motion); leaving the stretch calms
it. So the level asks him to keep moving over sinking pads without rushing blind.

Beats: the path from the metro and the first bird hide (a sign about the lake, dry); reeds and a
boardwalk with a duck or two as walkers; the first pads over shallow water (a fall costs a heart
and puts him back; the first three pads have firm stones between); the first swan, with pads wide
apart enough that crossing takes about 3 s; mist rolling in that hides the far bank but never the
next pad; a heron that stands as a tall step and flies off 60 steps after he lands on it; coots
that throw nothing but peck (the shield place: a row of nesting gulls diving, crossed with the
shield raised between dives); the island with the bench; the long crossing with two swans whose
stretches meet; the rune at the far hide, with the sun coming up over the lake.

No school, no street, no names of people: the lake is the reference and that is enough.

## Difficulty wanted (sloppy player, 30 runs, hearts a run at ±4)

Vigelandsparken about 2 (at most 2.5); Korketrekkeren about 1 (at most 1.5); Østensjøvannet about
2.5 (at most 3). No Game over at ±2 in any; at most 1 in 30 at ±4. No single jump over 0.4 hearts
a try. Numbers into `apps/viking/tools/review/line2/`.

## Look at it

Six spots a level at 1280 x 800, two at 390 x 844, the night tint where a level can be dark, the
map with four stations open. No large flat areas, nothing dark on dark, banner readable, signs not
overlapping. Fix what you see before handing back.

## Docs

DESIGN (rules: statues, the sledge, pads and swans; the level table), HANDOVER, ADR 0026 (the
ride) and others for any decision made, `tools/facts.ts` and LEVELS.html with the three levels and
their pictures in `docs/games/shots/` (`12-vigelandsparken.png`, `13-korketrekkeren.png`,
`14-ostensjovannet.png`), the card on the last built station.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three minutes; `tsc --noEmit` and
  `bun run build` clean.
- First script at or under 59.5 kB gzipped.
- Front page 28 of 28 byte-identical.
- Line 1 and Bygdøy: scripted clears pass; Bygdøy no worse with the sloppy player.

## Hand back

1. Per item: done, partly (with the number), not done and why.
2. Pictures in `/tmp/shots-three/`, named for what they show.
3. Per level: columns, scripted clear, enemies, skilling, flags, sloppy table, worst jump, worst
   wait, standing share.
4. Every line of text added or changed, both languages.
5. Departures, doubts, found and not fixed; what order 16 (Bjørvika, Gamlebyen, the serpent)
   should know, and the first-script room left.
6. Branch, commits, test results, first-script size, front page comparison.
