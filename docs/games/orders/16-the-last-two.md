# Order 16: Bjørvika, Gamlebyen and the serpent

Written 15 November 2026, after order 15 (PR #60) was merged and deployed. Levels 15 and 16 of
`docs/games/PLAN-LINE-2.md`, the third boss, and the end of line 2. Read the plan, and HANDOVER's
"Line 2" section for the list of places a new level touches.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0008, 0011,
  0014, 0016 to 0026, the plan, the two bosses (`game/troll.ts`, `game/plough.ts`, their tests and
  how their hints and Game over work: ADRs 0017 and 0022), and Østensjøvannet as the newest level.
- `git fetch origin`; branch `the-last-two` from `origin/main`. Commit as you go (this order first:
  it is untracked), Bjørvika green before Gamlebyen. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 (`MOVE`, `JUMP` fixed) and ADR 0014 (privacy) stand.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`.
- First script: 58.83 kB now; it must end at or under 59.5 kB. Any module not listed in `OWN` in
  `apps/viking/vite.config.ts` lands in the first script: the serpent's rules and both levels'
  own code must come with their levels. If Bjørvika uses `deck.ts`, move it out of Bygdøy's chunk.

## First: small things left from order 15

1. On the sledge the help line still says "Hold down for the shield": there it should say down
   ducks (and on touch, the button's word should be Duck while he rides).
2. Østensjøvannet's far hide: the rising sun reads as a grey disc under the twilight tint. It is
   the level's last picture: make it a sunrise.
3. Østensjøvannet measures 1.2 hearts a run at ±4 against about 2.5 wanted, because the sloppy
   player never hesitates. Do not make the pads narrower. Give the review tools a **hesitating
   player**: the same routes, but before a share of its moves (say one in five, seeded) it stands
   0.5 to 1.5 s first. Run it on Østensjøvannet and on two older levels for comparison, and put
   the numbers in `tools/review/line2/`. If the lake is still under about 2 hearts a run for a
   hesitating player at ±4, lengthen the long crossing or bring the two swans' stretches closer;
   if it is over 3.5, ease it.

## 15. Bjørvika (rune N), evening, high up

The idea: **crane hooks that carry him, and he chooses when to let go.** A hook swings or travels
on a beat; standing on its block he rides; stepping or jumping off is his choice, so the skill is
picking the moment, with wide landings. Ekeberg's gusts return on the open floors (the reach
search already knows gusts).

Beats: the quay at street level with the Opera's white slope far off and a sign; the site gate
and the first hoist up (a lift, no wait over 5 s); open floors of a half-built tower with rebar
(hazard, lit at its edge) and a welder whose sparks fall on a beat; the first hook, low over a
net, where a miss costs nothing; hooks between two towers over the drop, each landing at least
four tiles wide; a floor with gusts and loose sheeting as moving ledges; the shield place: a
riveter's crew throwing bolts across a girder walk, crossed with the shield raised between
throws; a bench in the site hut on the roof; the long traverse of three hooks in a row with a
flag before it; the rune on the top crane's cab, with the fjord and the town below at dusk.

The cranes are the reference to Lars and that is enough: no names, no street.

Everything a level has, as in order 15's list (220 to 280 columns; clear 40 s or more; 8 to 20
enemies; 40 to 80 skilling; cheese; feather-only bracteate; one or two benches; flags at most
about 45 columns apart; two to four signs; no enemy within three tiles of a take-off or landing
over a drop; no forced wait much over 5 s; standing share at or under 36 %).

## 16. Gamlebyen (rune G), night, the finale

The idea: **the ruins rebuild as he passes.** A ruin's missing stones appear, as ledges and walls,
when he comes within a few tiles, and stay. So the way forward is revealed by going forward, and
twice a wall that rises behind him closes the way back (never a dead end: the dead-end search
must pass with every stone both risen and not). By the end the town is a thousand years younger:
torches for street lamps, a stave-built hall, longships at the quay.

Beats: the metro stop and the park's low ruined walls under street lamps, a sign; the first
church ruin rebuilding as he climbs it; the bishop's wall with guards who were statues a moment
ago (walkers); the water mirror that was the old shoreline, with stepping stones that rise; a
tower that builds itself under his feet (he rides it up: a carrier, no wait); the shield place:
archers on the wall, crossed with the shield; the market street by torchlight with a bench and a
flag; the quay with longships; the boss's bench; the serpent; the rune G on the prow of the last
longship.

About 240 to 270 columns before the fight. Night rules of ADR 0023 (rims, eye-shine, bright
skilling) apply, and torches light their surroundings.

## The serpent

On a quay of about 24 columns with three places it can rise: left, middle, right, each marked in
the water by a ring of foam for 1.5 s before it comes up (a still ring under reduced motion).

- A round: it rises, rears for a second (the tell), and spits a ball of brine straight along the
  quay at him. With the shield raised and facing it, the ball goes back and dazes it: its head
  sinks to the quay's edge for 4 s, and a stomp on the head is the hit. Then it dives and rises
  somewhere else. Three hits.
- Without the shield the ball costs a heart. Its body does not hurt while it is dazed or diving.
  If he stands with his back to it, the ball hits. Between spits it sweeps its tail once along
  the quay, low and slow, to be jumped (seen coming at least 1 s).
- After each hit it is a little quicker to spit, never under a second of tell.
- Hints on screen as the other bosses have: a line when it first rises; after a round with no
  dazing, the hint that the shield sends the ball back; after a dazing with no stomp, the hint to
  jump on its head. Ten idle seconds repeats the round's hint.
- Game over in the fight goes on from the boss's bench with three lives (ADR 0017).
- Its rules are data and a small module of its own, tested like the troll's and the plough's:
  the daze window, the hit, the tail, the hints, Game over, reduced motion, and that every one of
  ten naive strategies (those in `tools/review/bosses.ts`, extended to it) either wins or sees the
  hint within 10 s, with none at Game over in under 75 s.
- When it is beaten the water goes still, dawn comes over the fjord, and the rune can be taken.

Sloppy player wanted: Bjørvika about 3 hearts a run at ±4 (at most 3.5); Gamlebyen about 3.5 (at
most 4.5) with at most 2 Game overs in 30; no Game over at ±2 in either; no single jump over 0.4
hearts a try. Run the hesitating player on both as well.

## The end of line 2

- With all six runes: the header's VIKING is whole, and Gamlebyen's card says so in one dry line
  and names what is left to find (bracteates, best times). The card's "the rest is under
  construction" line goes; no station is under construction any more, so remove what only that
  state needed if it is not worth keeping (say which you chose).
- The map: all sixteen stations, both lines' best times, and something small that changes when
  both lines are complete (lights along the viaducts, a longship in the fjord under the map). It
  must fit the first-script limit or load lazily.

## Look at it

Six spots a level at 1280 x 800, two at 390 x 844, the serpent in each of its states, its hints,
the Game over card at it, the finished map and header. No large flat areas, nothing dark on dark,
banner readable. Fix what you see before handing back.

## Docs

DESIGN (hooks, the rebuilding ruins, the serpent, the level table complete), HANDOVER (line 2 as
built; what order 17's review should attack), an ADR for the serpent and one for any other
decision, `tools/facts.ts` and LEVELS.html with both levels and pictures
(`docs/games/shots/15-bjorvika.png`, `16-gamlebyen.png`, a fresh `kart-line2.png`), and
`PLAN-LINE-2.md` marked as built with where the build left the plan.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three and a half minutes;
  `tsc --noEmit` and `bun run build` clean.
- First script at or under 59.5 kB gzipped.
- Front page 28 of 28 byte-identical.
- All fourteen earlier levels: scripted clears pass; spot-check two with the sloppy player.

## Hand back

1. Per item: done, partly (with the number), not done and why.
2. Pictures in `/tmp/shots-last/`, named for what they show.
3. Per level: columns, scripted clear, enemies, skilling, flags, sloppy and hesitating tables,
   worst jump, worst wait, standing share. The serpent: the strategies table.
4. Every line of text added or changed, both languages.
5. Departures, doubts, found and not fixed; what an adversarial reviewer should look at first.
6. Branch, commits, test results, first-script size, front page comparison.
