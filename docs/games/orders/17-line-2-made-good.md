# Order 17: line 2 made good

Written 15 November 2026, after the adversarial review of line 2
(`docs/games/reviews/2026-11-15-line-2.md`). The review found no blocker: nothing traps him and
both a careful and a casual player get through. It found five majors and twenty minors. This order
fixes all of them; the ids below are the review's. Read the whole review first: its evidence and
suggested fixes are part of this order unless this order says otherwise.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0011, 0014,
  0016 to 0030, the review, and `apps/viking/tools/review/README.md`.
- `git fetch origin`; branch `line-2-made-good` from `origin/main`. First commit: this order, the
  review, and the review's new scripts in `apps/viking/tools/review/` (all untracked now). Commit
  as you go. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 (`MOVE`, `JUMP` fixed) and ADR 0014 (privacy) stand.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`.
- First script: 59.18 kB now; at or under 59.5 kB at the end. J1: make the build or a test **fail**
  over 60 kB, so the budget is enforced and not remembered.
- Measure with fresh seeds (the review used 101 to 200), not the seeds the levels were tuned on.

## 1. The serpent's fight (D1, B1, G1, and the D minors)

- **D1.** The fight's ground and the planks must be the same thing. From the bench to the quay's
  far end the ball flies, the tail sweeps and the hints are true; there is no place on the planks
  where the fight stalls. A hint is only shown when it is true: "hold the shield up" never to a
  player who held it up. Test: for every column he can stand on from the bench to the end, a
  shield held facing it sends the ball back, and no strategy in the strategies tool stalls for
  ever (every one ends, by a win or a Game over, or keeps getting true hints).
- **B1.** A flag at the boss's bench (or sitting is not needed: arriving on the fight quay sets the
  return point). The same check for the troll and the plough: losing one life must never send him
  further back than losing all three.
- **G1, presence.** The serpent is the last thing in the game and must look it: a neck at least
  three times his height and thick in proportion, a head with a jaw, an eye and a crest that reads
  as a head when dazed on the planks, coils showing in the water between rises, a tail that reads
  as a tail, a pale underside and a lit rim so it stands off the night (ADR 0023), water falling
  from it as it rises, the quay's torches lighting it. Up and visible for well over half the
  fight: shorten the rests (the review measured 7 s; about 3 s), keep every tell at a second or
  more. The hit boxes may stay what they are if the fairness numbers hold; if the bigger body
  needs bigger boxes, re-measure.
- **G1, the ending.** When it is beaten: the water stills, the sky turns over several seconds to a
  real dawn (not a disc beside the moon), the town's torches go out one by one, the rune rises to
  the prow, and only then, once he takes it, the card. The last longship's prow is a carved
  dragon head. Reduced motion: the same states without the movement.
- The fight as a fight: understood, it is over in 30 s at 1.35 hearts. Make it the hardest honest
  thing in the game: after the first hit it rises twice in a round (two balls from two places, the
  second with its own full tell), after the second the tail follows the ball closely. Wanted for
  a sloppy player at ±4 who knows the answer: 2 to 3 hearts a fight, Game over in at most 3 of
  60, a fight of 45 to 70 s. Naive strategies: none at Game over under 75 s, a true hint within
  10 s for all.

## 2. The difficulty of line 2 (I1, A1, A3, and the A minors)

Line 2 should start about where Akerselva is and rise. Wanted at ±4 with fresh seeds, hearts a
run: Bygdøy 1.5 to 2, Vigelandsparken 2 to 2.5, Korketrekkeren 1 to 1.5 (the breather),
Østensjøvannet 2.5 to 3, Bjørvika 3 to 3.5, Gamlebyen 3.5 to 4.5 with the serpent a real part of
that; no Game over at ±2 anywhere; at most 2 in 100 at ±4 except Gamlebyen (at most 6). No single
place over 0.4 hearts a try, measured by a tool that tries **every** move over a drop or water
whatever it is called (fix `obstacles.ts`: the review says it only tries moves named jump or leap).

Raise difficulty by asking more of what each level teaches, not by narrower jumps or enemies on
landings:

- **A1.** Gamlebyen's stepping stones: not six maximum-width jumps. Vary them (some rise late,
  some wide, one pair with a stone that sinks back), none over 0.4 a try.
- **A3.** The owl over the dig at Gamlebyen's start goes or moves; the jump test must also catch
  flyers above a take-off or landing.
- **Bygdøy**: a second rocking deck crossing with a thrower who needs the shield mid-crossing (a
  firm place to stand and raise it).
- **Vigelandsparken**: a longer stretch with statues on both sides and a ledge on a beat, so he
  must turn his back on one.
- **Østensjøvannet**: the long crossing longer, the two swans' waters overlapping.
- **Bjørvika**: the three-hook traverse with hooks on different beats and a gust; a second
  riveters' walk where the shield must be dropped and raised twice; rebar where a careless
  let-go lands. It is the second-to-last level and should feel like it.
- The other A minors as the review suggests.

## 3. What line 2 teaches and gives must be seen (C3, F1, F2, and the rest of C and F)

- **C3.** The help line comes back when what it says changes: the first time he has the shield,
  when he mounts the sledge, when he gets the pole; for a few seconds, then hides again. The
  shield's first lesson at Bygdøy shows the key on screen at the passage itself.
- **F1.** The map's banner names the line he is on.
- **F2.** The longship that rewards sixteen runes is in clear view (not under the help line) and
  stays; it is the game's last picture, so make it worth it.
- **C1.** The shield must not freeze the troll: with the shield up at the arena's mouth the troll
  still comes, and the shield does not stop its club (ADR 0024 says the fight is unchanged; make
  that true and test it). Check the plough the same way.
- Every other C and F minor as the review suggests, or say why not.

## 4. Look and words (G and H minors, H1 to H3)

- **H1.** "Hopp på hodet" beside water reads as diving in: "Hopp på hodet dens." or
  "Tramp på hodet." **H2.** "På kjelken er pil ned å dukke." becomes "På kjelken dukker du med
  pil ned." **H3** and the rest as listed in the review.
- Gamlebyen's risen stones must stand off the night; Bjørvika's far Opera drawn properly (the
  white slope and the glass, as on the front page); every G minor as the review suggests.

## 5. Tools and docs (A5, J1, J2, and the rest of J)

- A5: fix the three harness artefacts, the broken "mistakes" profile among them.
- J2: the docs' stale figures. DESIGN, HANDOVER, the ADRs touched, `tools/facts.ts`, LEVELS.html
  (numbers, and fresh pictures of Gamlebyen, the serpent and the finished map in
  `docs/games/shots/`), `PLAN-LINE-2.md`'s "as built" note. New ADRs for decisions made.
- After-numbers in `apps/viking/tools/review/line2-after/`.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three and a half minutes;
  `tsc --noEmit` and `bun run build` clean; first script at or under 59.5 kB, enforced at 60.
- Front page 28 of 28 byte-identical.
- No dead ends, mixed stone states included (take the review's script into the tests if it is
  quick enough, or a sample of it).
- Line 1: scripted clears pass; no level worse with the sloppy player (spot-check three).

## Hand back

1. Every finding id in the review: fixed, partly (with the number), or not and why. All of them.
2. Pictures in `/tmp/shots-good/`: the serpent in every state before and after, the ending as a
   sequence, the map with the longship, the help line returning, each changed place.
3. The difficulty table for all sixteen levels at ±2 and ±4 with fresh seeds, the per-place table
   for line 2, the serpent's strategies and sloppy-fight numbers.
4. Every changed line of text, both languages.
5. Departures, doubts, found and not fixed.
6. Branch, commits, test results, first-script size, front page comparison.
