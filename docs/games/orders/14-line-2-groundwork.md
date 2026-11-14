# Order 14: line 2's groundwork, and Bygdøy

Written 14 November 2026. Read `docs/games/PLAN-LINE-2.md` first: it is the plan this order begins.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, the ADRs in `docs/adr/`
  (0003, 0008, 0011, 0014, 0016 to 0023 at least), `docs/games/PLAN-LINE-2.md`, and one whole level
  with its route and tests as the model (Akerselva: it introduces an item).
- `git fetch origin`; branch `line-2-groundwork` from `origin/main`. Commit as you go (this order
  and the plan first: they are untracked). Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 (`MOVE`, `JUMP` fixed) and ADR 0014 (privacy) stand.
- The front page must not change: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`
  (addresses: the `:5180` lines of `/tmp/shots-urls.txt`).
- The first script is at 59.12 kB of a 60 kB budget. Everything line 2 needs must come lazily: the
  second line's map drawing, the six extra runes' strokes if they cost, the shield's rules, each
  level. The first script must end **at or under 59.5 kB**; if the groundwork cannot fit, move
  more of line 1 out first (say what).

## Step 1: line 2 on the map

- The line map (`#kart`) gets a second line in its own colour, leaving at Stortinget, with six
  stations: Bygdøy, Vigelandsparken, Korketrekkeren, Østensjøvannet, Bjørvika, Gamlebyen. Decide
  how it is drawn (a lower deck, a branch, a second screen to the right) by looking at the map at
  1280 x 800 and 390 x 844; it must read as one network and line 1 must not move.
- Line 2 opens when Nabolaget is cleared. Before that it is drawn faint, with one line on a sign
  saying so. A station whose level is not built yet says "under construction" (nb "under bygging")
  and cannot be entered; this is what orders 15 and 16 fill.
- Progress (`game/progress.ts`) takes the six new ids without disturbing stored progress of line 1:
  a visitor with ten runes keeps everything. Test that with a stored value from today's shape.

## Step 2: sixteen runes

- The header shows LARS HANSEN as now. When line 2 is open, a second group of six appears: VIKING
  (Elder Futhark, drawn as strokes like the others: V is written with the u-rune ᚢ, K ᚲ, G ᚷ,
  I ᛁ, N ᚾ). On an upright phone the header must not grow by another row because of it.
- The end card of Nabolaget tells him the second line has opened.

## Step 3: the shield

- Given at Bygdøy's longship, a moment like the ski pole's. From level 12 on he always has it
  (as the pole from Akerselva on); `?shield` for checking, noted in DESIGN like `?pole`.
- Holding down on the ground raises it, facing the way he faces. Up: thrown things that reach its
  face are stopped (they fall, harmless) and a charging enemy or boss that meets it is stopped and
  pushed back a tile without hurting him; he cannot walk or jump while it is up; it takes 6 steps
  to raise and can be held without limit. It does not stop falls, hazards from above or below, or
  anything from behind. Touch: a Shield button beside Dash, shown only once he has it.
- Down already means something at a bench (sit) and nowhere else: check, and keep sitting at a
  bench as it is.
- Rules tests on small made-up levels, as the other rules have: a thrown stone from the front,
  from behind, from above; a charge; raising time; no walking; the reduced-motion drawing.
- Write the ADR (next number 0024): what it does, what it does not, and why it is a held stance
  and not a parry window (fairness at ±4: no tight timing).

## Step 4: kit pieces

In the place the level kit lives (see DESIGN's file table), with tests:

- **A rocking deck**: a carrier whose surface tilts on a beat between two angles as steps of whole
  pixels (no slopes in the physics: it is a row of narrow ledges that rise and fall in turn), so
  standing on it he is carried up and down and slides nowhere.
- **A sinking pad**: stands firm 40 steps under him, then sinks over 30, and comes back 90 steps
  after he leaves. The reach search must treat it as the logs are treated.
- **An oar bank**: ledges on a beat (the kit has these), drawn as oars.

## Step 5: Bygdøy

Level 11, `bygdoy`, by day, 240 to 270 columns, in six beats:

1. The ferry from Rådhusbrygga lands him at the pier (a short ride; skilling over the wake).
2. The beach and the boathouses: gulls, a crab that walks sideways (a walker), the first sign.
3. The polar ship in her hall: the rocking deck, twice, the second time with one enemy on the far
   side well clear of the landing; a bench.
4. The balsa raft outside: drifting rafts with sinking pads between them.
5. The longship hall: the oar bank up to the deck; the shield at the prow; then the way out is
   past three stone-throwers who can only be passed with the shield up between throws (walk,
   stop and raise, walk). This is the shield's lesson: nothing else threatens him there.
6. The rune V on the museum's roof; the bracteate above the mast, feather only.

Signs: two to four, dry, both languages, about the ships and nothing personal. Enemies 8 to 14,
none within three tiles of a take-off or landing over water (the test from order 13 must cover the
new level by itself). Flags at most about 45 columns apart. No forced wait much over 5 s.

Give it everything a level has: route in `levels/routes/`, scripted clear in the tests, the level
measure, the reach and dead-end searches, the feather-only bracteate proof, the lazy chunk, a
loading board name.

Then the sloppy player: 30 runs at ±2 and ±4. Wanted: about 1.5 hearts a run at ±4, at most 2;
no Game over at ±2 or ±4; no single jump over 0.4 hearts a try. Numbers into
`apps/viking/tools/review/line2/`.

## Step 6: look at it

Six spots by day at 1280 x 800, two at 390 x 844, the map before and after line 2 opens, the
header with sixteen runes, the shield raised against a stone. Use `tools/shots.ts` (`--wait=5000`
for `?debug&auto` against a built page). Judge them as order 13 judged line 1: no large flat
areas, nothing dark on dark, the banner readable. Fix what you see before handing back.

## Docs

DESIGN (file table, rules, the level table now with line 2), HANDOVER (state; what orders 15 to 17
still owe), ADR 0024 (the shield) and one for line 2 itself (0025: the second line, the word, the
unlock, stations under construction), `tools/facts.ts` and LEVELS.html extended with a line 2
section and Bygdøy's picture in `docs/games/shots/11-bygdoy.png`.

## Measures that must hold

- `bun test` green in all four packages, viking's suite under two and a half minutes;
  `tsc --noEmit` clean; `bun run build` clean.
- First script at or under 59.5 kB gzipped.
- Front page: 28 of 28 byte-identical.
- Line 1's scripted clears unchanged and no line 1 level worse with the sloppy player (spot-check
  two levels at ±4 against `tools/review/after13/`).

## Hand back

1. Per step: done, partly, not done and why.
2. Pictures in `/tmp/shots-line2/`, named for what they show.
3. Bygdøy's numbers: columns, scripted clear, enemies, skilling, flags, sloppy table, worst jump,
   worst wait, standing share.
4. Every line of text added, both languages.
5. Departures, doubts, found and not fixed; what orders 15 and 16 should know (which kit pieces
   exist, how a new level is added now, how much first-script room is left).
6. Branch, commits, test results, first-script size, front page comparison.
