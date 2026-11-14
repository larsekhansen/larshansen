# Adversarial review of the three games, 14 November 2026

Reviewer: Claude (Opus 5.5), asked to find what is wrong, weak, unfair, incoherent or untested in
Vikingfjorden (`apps/viking`), Jernhaugen (`packages/maze`) and the front page (`apps/landing`).
Nothing under `apps/`, `packages/`, `infra/` or `.github/` was changed. Checkout: `main` at
`b5d1a3a`, level with `origin/main`.

Everything below was measured with the real rules (`game/play.ts`, `packages/maze/src/rules.ts`)
on this Pi, or read from the code with line numbers. Where something is only reasoned, it says
**suspected**. "Column" is a 16-pixel map column; x is in art pixels; ±k is a timing error of up to
k physics steps (one step is 1/60 s, so ±4 is ±67 ms).

The scripts are in the scratchpad (paths in "How to rerun" at the end). The main one is the
sloppy player: `.../scratchpad/review/sloppy.ts`.

---

## 1. Verdict

**Would a first-time player get from level 1 to the ending?** A careful one, yes. With every key
press and release off by up to ±2 steps (±33 ms), every level was cleared in 70–100 % of 30 runs,
losing 0.4–3.1 hearts per level and about three lives over the whole line; the median clear took
63–137 s against the scripted 62–94 s. A casual player (±4, ±67 ms) is another matter: 33 of 300
runs ended in Game over, which restarts the whole level, and four levels lost 5 or more hearts per
run (Langkaia 5.3, Holmenkollen 5.7, Nordmarka 5.4, Ekeberg 5.9). The maze, by contrast, is forgiving:
levels 1–6 cleared in 20 of 20 runs at ±4 with under one curse per run, and level 7 in 20 of 20 at ±2.

Two things a player cannot get out of without the restart button exist in the game today: a sealed
pit right of Rådhuset's clock tower and a 3-tile slot right of the palace in Slottet.

**Where they would most likely quit:**
1. **Nordmarka's troll (level 7).** No naive strategy lands even one hit (0 of 10); six of ten end in
   Game over within 22–48 s, and Game over sends him back to the start of the forest. Even the sloppy
   player, which knows exactly what to do and only times it ±4 steps off, ended in Game over at the
   troll in 8 of 30 runs.
2. **Langkaia (level 1), already.** At ±4 it is the fourth hardest of the ten: the rafts' gaps, the drifting
   raft and the two gulls cost 5.3 hearts per run and 5 of 30 runs ended in Game over. A first level
   should not be where people learn that water costs a life.
3. **Ekeberg's hollow (level 9):** one hedgehog at the lip of a dip before a gusty pond costs
   1.97 hearts per run at ±4 (14 lives in 30 runs), the worst single spot in the game.
4. **Holmenkollen (level 5):** spiky hedgehogs on and beside the ice, a fire basket and a kid
   throwing at the same few columns, then up to 16 s waiting for one chair and two 10 s lift waits.

**The ten things to fix, most important first**

1. **Seal the two dead ends** (B1, B2): Rådhuset cols 209–227 at row 48 (water or a way back up),
   Slottet cols 247–251 (extend the terrace). Add the dead-end graph search to the tests.
2. **Game over at a boss should not cost the level, and the troll must explain itself on screen**
   (C1): restart Game over at the boss's bench; make the dawn band unmistakable and show the hint
   after a failed round.
3. **After Game over, R / the restart button / Back give one life** (F1): one-line fix in
   `openScene`.
4. **Take enemies off the take-off and landing of jumps, and spiky ones off ice** (A1, D3, D4, D5):
   Nordmarka's hedgehog at the first bog (38 knock-ins), Ekeberg's at the hollow, Akershus's braziers
   in front of the first two cannons, Holmenkollen's on the icy steps, Langkaia's gull over the
   meeting rafts; and a fall while he still blinks should not take a second heart.
5. **Make level 1 a first level** (E3, A1): wider rafts or 2-tile gaps, the gulls off the take-offs.
   Give Slottet (level 4, by far the easiest) one real twist, so the line rises.
6. **Move three throwers away from flags** (B3): Akerselva 160, Nordmarka 192 (beside the troll's
   sign), Nabolaget 100. Standing on them costs a heart in 1–4 s.
7. **Cut the long single-carrier waits** (E2): Holmenkollen's chair (worst 15.7 s + 7.7 s ride) and
   tower lift (10.5 + 10.3 s), Rådhuset's ferry (11 s) and swing (8.9 s), Nordmarka's moose (9.9 s),
   Akershus's hoist (9.3 s).
8. **Stop click/tap-to-walk from walking into water** (G2), and drop "or click where you want to go"
   from the levels' help line.
9. **Run the tests in the deploy** (K1). Today nothing checks the scripted routes before `main` goes
   live.
10. **Check upright phones** (D2, suspected): the view is ~131–148 art px wide there, narrower than a
    thrower's reach, and nobody has looked.

Smaller ones worth an afternoon: ↑ at Langkaia's first door sends a new player home (G1); the feather
moment replays on every maze re-clear (G3); the dash is taught only with keyboard words (G5); the
plough's telegraph and the hit blink vanish with reduced motion (C4, G6); Nabolaget's flags are 90
columns apart (A2); enemies at night in level 1 (H6); first-script margin and debug code in it (K2, K3).


---

## 2. Findings by section

### A. An imperfect player

**What I did.** `sloppy.ts` plays each level's own scripted route (`levels/routes/*.ts`) through the
real `stepPlay`, with a person's timing laid over it.

- *How the routes were perturbed.* The routes are closed-loop moves (each step a move looks at the
  level and returns keys), so a fixed key list could not simply be shifted. Instead every **edge**
  of every key (direction changing, jump key going down or up, the dash) is shifted by its own
  random offset in [−k, +k] steps. Late edges are a delay; early edges come from a look-ahead:
  each step the level and the route are cloned and played k steps ahead with perfect keys, so the
  player can press "before the route would". The route's walks hold the jump key without pressing
  it; that is treated as not held. A change made early whose cause never comes (he stopped short,
  so the stop stays ahead) is corrected after 2k+2 steps, as a person notices. The second profile
  also drops 3 % of jump presses entirely and holds 15 % of direction releases 1–2k steps too long.
- *After a mistake.* The rules put him back (flag, bench, last firm ground, start); the route is
  picked up at the move the perfect run was on at that spot. A jump that went nowhere is jumped
  again; a fall to a lower floor with no heart lost is climbed back from the nearest place the
  perfect run stood on that floor (that is the "falls with no heart lost" column). If there is no
  such place, the run ends **off route** (he fell somewhere the route never goes; I checked each
  such place by hand, see "What I could not check"); after 15 tries at one place it ends **gave
  up**; after four times the perfect run's length plus a minute it ends **time out**.
- *Checks of the harness.* At k = 0 every level clears exactly as the tests do (10/10). Picked up
  from each of the 47 flags and benches at six different level clocks, the perfect route reaches the
  rune (`resume.ts`; the exceptions are in B).
- *Per jump.* `obstacles.ts` takes every jump and ride of every route on its own, from the perfect
  run's exact state at the start of the walk up to it, and counts how often it costs a heart at ±2
  and ±4, 40 tries each. These numbers do not depend on how the sloppy player recovers.
- *Warning and walk-back.* For every enemy hit, the time that enemy had been on a 1920 × 1080
  screen (385 × 207 art px, look-ahead included); for every thrown hit, the time since the wind-up
  began; for every respawn, the seconds of the perfect run between where he was put back and where
  he was lost.

How to read ±k: ±2 is ±33 ms on every key, a careful adult; ±4 is ±67 ms, a casual player or a
child; ±8 (±133 ms) is someone fighting the keyboard.

**A1. Outcomes, timing errors only** (30 runs per level and k; three lives; outcomes other than clear or Game over are explained under the table)

| Level | k | clear | game over | off route / gave up / time out | hearts lost per run | lives lost per run | median clear (s) |
|---|---|---|---|---|---|---|---|
| langkaia | ±2 | 30/30 | 0/30 | 0/0/0 | 1.5 | 0.17 | 77 |
| langkaia | ±4 | 21/30 | 5/30 | 1/3/0 | 5.3 | 1.43 | 148 |
| langkaia | ±8 | 0/30 | 19/30 | 9/0/2 | 6.4 | 2.03 | – |
| akershus | ±2 | 22/30 | 0/30 | 8/0/0 | 1.6 | 0.10 | 78 |
| akershus | ±4 | 9/30 | 0/30 | 21/0/0 | 1.5 | 0.03 | 92 |
| akershus | ±8 | 0/30 | 0/30 | 30/0/0 | 0.9 | 0.03 | – |
| radhuset | ±2 | 26/30 | 0/30 | 4/0/0 | 0.7 | 0.00 | 94 |
| radhuset | ±4 | 18/30 | 0/30 | 3/9/0 | 2.3 | 0.27 | 153 |
| radhuset | ±8 | 0/30 | 5/30 | 0/25/0 | 2.6 | 0.77 | – |
| slottet | ±2 | 30/30 | 0/30 | 0/0/0 | 0.4 | 0.00 | 73 |
| slottet | ±4 | 27/30 | 0/30 | 0/3/0 | 0.6 | 0.00 | 76 |
| slottet | ±8 | 24/30 | 0/30 | 1/5/0 | 1.5 | 0.17 | 112 |
| holmenkollen | ±2 | 30/30 | 0/30 | 0/0/0 | 2.7 | 0.40 | 63 |
| holmenkollen | ±4 | 13/30 | 7/30 | 4/1/5 | 5.7 | 1.57 | 102 |
| holmenkollen | ±8 | 0/30 | 17/30 | 13/0/0 | 5.8 | 1.80 | – |
| akerselva | ±2 | 30/30 | 0/30 | 0/0/0 | 2.2 | 0.33 | 76 |
| akerselva | ±4 | 27/30 | 1/30 | 2/0/0 | 4.1 | 1.07 | 100 |
| akerselva | ±8 | 2/30 | 18/30 | 10/0/0 | 6.3 | 2.03 | 159 |
| nordmarka | ±2 | 27/30 | 2/30 | 0/1/0 | 2.1 | 0.47 | 70 |
| nordmarka | ±4 | 15/30 | 11/30 | 0/3/1 | 5.4 | 1.53 | 90 |
| nordmarka | ±8 | 1/30 | 28/30 | 1/0/0 | 8.7 | 2.87 | 123 |
| stortinget | ±2 | 28/30 | 0/30 | 2/0/0 | 1.1 | 0.03 | 74 |
| stortinget | ±4 | 20/30 | 0/30 | 10/0/0 | 1.9 | 0.23 | 101 |
| stortinget | ±8 | 6/30 | 1/30 | 13/0/10 | 3.0 | 0.53 | 221 |
| ekeberg | ±2 | 21/30 | 0/30 | 9/0/0 | 3.0 | 0.53 | 88 |
| ekeberg | ±4 | 9/30 | 9/30 | 12/0/0 | 5.9 | 1.67 | 136 |
| ekeberg | ±8 | 1/30 | 28/30 | 1/0/0 | 8.9 | 2.93 | 174 |
| nabolaget | ±2 | 21/30 | 2/30 | 7/0/0 | 3.1 | 0.83 | 137 |
| nabolaget | ±4 | 16/30 | 0/30 | 14/0/0 | 3.2 | 0.67 | 146 |
| nabolaget | ±8 | 0/30 | 2/30 | 28/0/0 | 4.1 | 0.97 | – |


"Off route" at Akershus is mostly falls off the wall-walk into the ward and the ditch, from where
the route has no move (both have a way back; B5). At Nabolaget it is mostly the church tower (cols
125–132, rows 4–9), where the route keeps trying to stomp a crow that has flown on; at Stortinget the
track bed at cols 79–81 and 155–157; at Ekeberg the quarry floor; at Langkaia the yard between the
sheds (col 30) and the hut on the pier (col 114); at Holmenkollen the first gully (col 31). "Gave up" at Rådhuset is the
carillon (col 182) and, at ±8, the very first bells (col 16). None of these is a level fault except
where B1 and B2 say so; they mean "a person would have had to find his own way here".

**A2. ±4 plus mistakes**: 3 % of jump presses never happen, 15 % of direction releases held 1–2k steps too long (30 runs per level)

| Level | k | clear | game over | off route / gave up / time out | hearts lost per run | lives lost per run | median clear (s) |
|---|---|---|---|---|---|---|---|
| langkaia | ±4 | 3/30 | 17/30 | 3/1/6 | 6.0 | 1.90 | 125 |
| akershus | ±4 | 0/30 | 0/30 | 22/0/8 | 1.0 | 0.07 | – |
| radhuset | ±4 | 3/30 | 13/30 | 0/6/8 | 6.2 | 1.80 | 233 |
| slottet | ±4 | 24/30 | 0/30 | 1/4/1 | 0.9 | 0.13 | 87 |
| holmenkollen | ±4 | 6/30 | 8/30 | 5/0/11 | 6.0 | 1.70 | 90 |
| akerselva | ±4 | 17/30 | 5/30 | 3/0/5 | 3.7 | 0.97 | 96 |
| nordmarka | ±4 | 9/30 | 13/30 | 0/2/6 | 5.7 | 1.70 | 89 |
| stortinget | ±4 | 13/30 | 0/30 | 11/0/6 | 1.9 | 0.23 | 156 |
| ekeberg | ±4 | 3/30 | 9/30 | 3/0/15 | 4.9 | 1.43 | 111 |
| nabolaget | ±4 | 3/30 | 2/30 | 16/0/9 | 3.9 | 0.97 | 274 |


**A3a. Where hearts are lost at ±2 (all runs pooled; columns in 4-column bins)**

| Level | place (cols) | what | hearts per run | lives lost there (all runs) |
|---|---|---|---|---|
| langkaia | 216–219 | flyer:gull | 0.57 | 2 |
| langkaia | 128–131 | flyer:gull | 0.33 | 0 |
| langkaia | 72–75 | fall | 0.10 | 0 |
| langkaia | 104–107 | walker:pigeon | 0.10 | 0 |
| akershus | 240–243 | walker:guard | 0.63 | 3 |
| akershus | 32–35 | spiky:brazier | 0.37 | 0 |
| akershus | 76–79 | walker:guard | 0.13 | 0 |
| akershus | 80–83 | walker:guard | 0.10 | 0 |
| radhuset | 100–103 | walker:scooter | 0.53 | 0 |
| radhuset | 132–135 | walker:pigeon | 0.10 | 0 |
| radhuset | 48–51 | walker:pigeon | 0.07 | 0 |
| radhuset | 8–11 | walker:pigeon | 0.03 | 0 |
| slottet | 76–79 | walker:pigeon | 0.33 | 0 |
| slottet | 128–131 | walker:scooter | 0.03 | 0 |
| holmenkollen | 60–63 | spiky:hedgehog | 0.77 | 0 |
| holmenkollen | 96–99 | shot:kid | 0.60 | 2 |
| holmenkollen | 92–95 | shot:kid | 0.33 | 2 |
| holmenkollen | 196–199 | spiky:grill | 0.27 | 2 |
| akerselva | 224–227 | fall | 0.47 | 3 |
| akerselva | 116–119 | flyer:wasp | 0.43 | 4 |
| akerselva | 148–151 | spiky:hedgehog | 0.43 | 0 |
| akerselva | 200–203 | fall | 0.27 | 1 |
| nordmarka | 24–27 | spiky:hedgehog | 0.37 | 0 |
| nordmarka | 68–71 | spiky:hedgehog | 0.33 | 4 |
| nordmarka | 72–75 | fall | 0.30 | 3 |
| nordmarka | 68–71 | fall | 0.17 | 0 |
| stortinget | 148–151 | spiky:umbrella | 0.33 | 0 |
| stortinget | 28–31 | flyer:pigeonfly | 0.17 | 0 |
| stortinget | 136–139 | walker:scooter | 0.17 | 0 |
| stortinget | 140–143 | spiky:umbrella | 0.13 | 0 |
| ekeberg | 196–199 | flyer:crow | 0.67 | 6 |
| ekeberg | 104–107 | shot:squirrel | 0.60 | 2 |
| ekeberg | 60–63 | spiky:hedgehog | 0.47 | 0 |
| ekeberg | 192–195 | flyer:crow | 0.27 | 1 |
| nabolaget | 32–35 | flyer:crow | 0.53 | 2 |
| nabolaget | 36–39 | fall | 0.40 | 2 |
| nabolaget | 204–207 | fall | 0.37 | 7 |
| nabolaget | 104–107 | shot:kid | 0.30 | 2 |


**A3b. Where hearts are lost at ±4 (all runs pooled; columns in 4-column bins)**

| Level | place (cols) | what | hearts per run | lives lost there (all runs) |
|---|---|---|---|---|
| langkaia | 96–99 | fall | 0.87 | 7 |
| langkaia | 72–75 | fall | 0.67 | 4 |
| langkaia | 128–131 | flyer:gull | 0.63 | 5 |
| langkaia | 216–219 | flyer:gull | 0.43 | 5 |
| akershus | 32–35 | spiky:brazier | 0.37 | 0 |
| akershus | 76–79 | walker:guard | 0.27 | 1 |
| akershus | 80–83 | walker:guard | 0.13 | 0 |
| akershus | 108–111 | walker:guard | 0.10 | 0 |
| radhuset | 100–103 | walker:scooter | 0.63 | 1 |
| radhuset | 128–131 | fall | 0.33 | 3 |
| radhuset | 148–151 | thrower:gull | 0.27 | 1 |
| radhuset | 120–123 | fall | 0.27 | 2 |
| slottet | 128–131 | walker:scooter | 0.20 | 0 |
| slottet | 76–79 | walker:pigeon | 0.20 | 0 |
| slottet | 172–175 | flyer:gull | 0.13 | 0 |
| slottet | 216–219 | flyer:gull | 0.03 | 0 |
| holmenkollen | 92–95 | spiky:grill | 1.03 | 2 |
| holmenkollen | 164–167 | fall | 0.97 | 14 |
| holmenkollen | 160–163 | fall | 0.70 | 8 |
| holmenkollen | 60–63 | spiky:hedgehog | 0.67 | 1 |
| akerselva | 116–119 | flyer:wasp | 1.00 | 6 |
| akerselva | 224–227 | fall | 0.53 | 5 |
| akerselva | 200–203 | fall | 0.43 | 1 |
| akerselva | 64–67 | fall | 0.43 | 3 |
| nordmarka | 68–71 | spiky:hedgehog | 0.80 | 7 |
| nordmarka | 72–75 | fall | 0.77 | 6 |
| nordmarka | 68–71 | fall | 0.70 | 7 |
| nordmarka | 200–203 | troll:stuck | 0.33 | 0 |
| stortinget | 144–147 | spiky:umbrella | 0.30 | 0 |
| stortinget | 44–47 | walker:trolley | 0.27 | 0 |
| stortinget | 148–151 | spiky:umbrella | 0.23 | 3 |
| stortinget | 260–263 | rail | 0.13 | 0 |
| ekeberg | 80–83 | spiky:hedgehog | 1.97 | 14 |
| ekeberg | 88–91 | fall | 0.73 | 9 |
| ekeberg | 84–87 | spiky:hedgehog | 0.47 | 2 |
| ekeberg | 104–107 | shot:squirrel | 0.40 | 4 |
| nabolaget | 56–59 | walker:cat | 0.40 | 2 |
| nabolaget | 28–31 | walker:cat | 0.37 | 0 |
| nabolaget | 32–35 | flyer:crow | 0.37 | 0 |
| nabolaget | 104–107 | shot:kid | 0.20 | 2 |


**A3c. Respawns, knock-backs, warnings** (all k pooled)

| Level | respawns | walk back: median / 90th pct / max (s of the perfect run) | falls to a lower floor with no heart lost, per run (median climb back, s) | knocked into water or a pit | hurt within 2 s of being put back | enemy hits with under 0.5 s on screen | off-route places (count) |
|---|---|---|---|---|---|---|---|
| langkaia | 283 | 2.2 / 10.5 / 12.5 | 4.7 (0.5) | 10 | 6 | 0 of 103 | col 30 row 15 (10), col 114 row 16 (3), col 211 row 13 (1) |
| akershus | 6 | 19.9 / 19.9 / 19.9 | 0.5 (0.7) | 0 | 0 | 1 of 120 | col 50 row 35 (17), col 128 row 35 (8), col 124 row 33 (4) |
| radhuset | 84 | 0.8 / 6.8 / 14.6 | 10.5 (0.8) | 0 | 2 | 0 of 86 | col 16 row 48 (24), col 182 row 32 (10), col 200 row 16 (6) |
| slottet | 9 | 3.1 / 8.9 / 8.9 | 1.3 (1.7) | 0 | 0 | 0 of 70 | col 200 row 19 (8), col 133 row 27 (1) |
| holmenkollen | 156 | 4.1 / 8.4 / 9.4 | 0.0 (3.9) | 0 | 3 | 0 of 305 | col 31 row 13 (10), col 214 row 14 (6), col 242 row 25 (2) |
| akerselva | 250 | 3.8 / 10.0 / 13.4 | 0 | 2 | 6 | 0 of 150 | col 39 row 14 (6), col 142 row 23 (5), col 143 row 23 (1) |
| nordmarka | 269 | 7.5 / 9.3 / 24.8 | 0 | 39 | 2 | 0 of 182 | col 216 row 18 (5), col 202 row 14 (1) |
| stortinget | 23 | 4.3 / 17.9 / 20.4 | 5.4 (0.5) | 0 | 0 | 0 of 142 | col 80 row 19 (12), col 258 row 19 (6), col 155 row 19 (4) |
| ekeberg | 148 | 3.2 / 11.8 / 18.8 | 5.2 (0.7) | 8 | 0 | 0 of 487 | col 155 row 18 (9), col 150 row 18 (7), col 145 row 18 (6) |
| nabolaget | 109 | 13.3 / 21.7 / 41.2 | 0.6 (0.5) | 6 | 0 | 0 of 214 | col 132 row 4 (20), col 125 row 9 (12), col 28 row 12 (5) |


**A4. Every jump on its own** (`obstacles.ts`: 40 tries each, from the perfect run's exact state at the start of the walk up to it; a try fails when a heart is lost before the next move)

| Level | jumps and rides | all made without a heart, ±2 | ±4 | hearts expected on the jumps alone, ±2 | ±4 | the three worst at ±4 (start col → end col: share of tries that cost a heart) |
|---|---|---|---|---|---|---|
| langkaia | 24 | 98% | 17% | 0.0 | 1.5 | 96→102 leap at 1584: 38%; 191→194 leap at 3072: 32%; 137→143 leap at 2240: 30% |
| akershus | 30 | 20% | 4% | 1.2 | 2.2 | 116→136 into the cannon: 68%; 235→243 jump to 3912: 62%; 31→54 into the cannon: 40% |
| radhuset | 24 | 95% | 35% | 0.1 | 0.9 | 127→131 jump to 2120: 38%; 194→200 leap at 3151: 20%; 23→27 jump to 472: 18% |
| slottet | 7 | 100% | 71% | 0.0 | 0.3 | 122→136 leap at 2128: 15%; 211→222 jump 1: 12%; 222→226 jump 1: 5% |
| holmenkollen | 9 | 95% | 32% | 0.1 | 0.9 | 5→38 leap at 496: 45%; 167→170 jump 1: 28%; 159→161 jump 1: 10% |
| akerselva | 15 | 81% | 22% | 0.2 | 1.3 | 64→66 jump 1: 35%; 202→204 jump 1: 32%; 230→232 jump 1: 28% |
| nordmarka | 8 | 12% | 9% | 1.6 | 2.0 | 64→73 leap at 1136: 50%; 163→197 jump 1: 38%; 4→64 leap at 976: 32% |
| stortinget | 17 | 90% | 54% | 0.1 | 0.6 | 77→83 leap at 1262: 22%; 256→260 leap at 4126: 15%; 73→77 jump 1: 7% |
| ekeberg | 15 | 26% | 10% | 1.0 | 1.8 | 141→158 across on the sheep: 57%; 50→75 leap at 1200: 32%; 87→92 leap at 1422: 32% |
| nabolaget | 28 | 83% | 46% | 0.2 | 0.7 | 122→125 jump 1: 28%; 153→159 leap at 2496: 22%; 30→37 leap at 544: 10% |


**A-findings.**

**A1. major — the places that kill, with what is there** (from A3 and A4; ±2 unless said):

| Level | place | what is there | cost |
|---|---|---|---|
| Langkaia | cols 69–82 | the first sauna rafts: gaps from a bobbing deck (`levels/langkaia.ts:157–160`) | 0.67 falls/run at ±4 (cols 72–75); jumps 69→75 and 75→82 cost a heart in 13 % and 18 % of tries at ±4 |
| Langkaia | cols 96–102 | off the drifting raft onto the quay | 0.87 falls/run at ±4, 7 lives; the jump costs a heart in 38 % of tries at ±4 |
| Langkaia | cols 125–131 | the gull over the meeting rafts knocks him into the water (10 knock-ins) | 0.33/run, 0.63 at ±4 |
| Langkaia | cols 191–194 | from the bobbing rowing boat to the longship | 32 % of tries at ±4 |
| Langkaia | cols 216–219 | the gull at the yard's end, at the mast top; a hit drops him to the deck | 0.57/run |
| Akershus | cols 32–42 and 116–122 | a brazier in front of each of the first two cannons (`levels/akershus.ts:176`, `:182`) | the walk into those cannons costs a heart in 38 % and 45 % of tries (A4) |
| Akershus | cols 240–244 | a guard where the battlements' jump lands | 0.63/run |
| Rådhuset | cols 100–103 | the e-scooter: a fast (1 px/step), 12 px tall walker (`levels/radhuset.ts:143`) | 0.53/run |
| Rådhuset | cols 120–131 | the pool bells over the fountain (water under them) | 0.27 + 0.33 falls/run at ±4 |
| Holmenkollen | cols 60–63, 84–99 | hedgehogs at and on the ice, the fire basket, the kid throwing at the same stretch (D4) | 0.77 + 0.93/run; 1.03 at ±4 for the fire basket |
| Holmenkollen | cols 160–167 | the sinking slabs | 0.70 + 0.97 falls/run at ±4, 22 lives |
| Akerselva | cols 116–119 | a wasp under the wheel's take-on | 0.43/run, 1.00 at ±4 |
| Nordmarka | cols 67–72 | a hedgehog patrolling the take-off of the first bog, in the dark (`levels/nordmarka.ts:136`) | 38 knock-ins into the bog; 0.80 + 0.70 + 0.77/run at ±4 |
| Stortinget | cols 140–151 | two spiky umbrellas in the passage | 0.46/run |
| Ekeberg | cols 80–84 | a hedgehog at the lip of the hollow (`levels/ekeberg.ts:169`), then a gust over the pond | **1.97/run at ±4, 14 lives: the worst single place in the game** |
| Ekeberg | cols 141–158 | the quarry: three bounces in a row on 12 px sheep standing in water | **a heart in 55 % of tries at ±2**, 57 % at ±4 (A4) |
| Ekeberg | cols 192–199 | the crow inside the gust at the cliff | 0.94/run, 7 lives |
| Nabolaget | cols 28–39, 56–59 | the crow over the first washing line and the gap after it, the cats on the ridges | 0.53 + 0.40/run; cats 0.77 at ±4 |
| Nabolaget | cols 204–207 | the tram's slot after the plough: a 3-tile water gap, the last jump of the game | 0.37/run, 7 lives |

The common shape: **an enemy at the take-off or landing of a jump over water** (Langkaia's gull, Akershus's braziers at the cannons, Nordmarka's hedgehog at the bog, Ekeberg's hedgehog at
the hollow and crow in the gust, Holmenkollen's hedgehogs on ice). Each is two problems in one move
and the knock-back makes the second one a fall (D5). **Fix:** at least 3 tiles between any enemy's
patrol and any jump's take-off or landing, as the flag rule already does for flags; a test for it
next to the flag test.

**A2. major — falls cost little walking, deaths cost a lot.** Median walk-back after a fall is
0.8–7.5 s of the perfect run (table A3c), which is humane. The exceptions: Nabolaget (median 13.3 s,
max 41.2 s: flags at cols 10, 100 and 161, so a fall anywhere on the roofs between 10 and 83 goes
back to col 10, and a life lost at the plough or the slot after it goes back to the bench at 163)
and Akershus (19.9 s, every respawn there is the long one). Game over costs the whole level: in
this study 33 of 300 runs at ±4 ended in Game over, 11 of them in the last third of the level.
**Fix:** a flag every ~40 columns in Nabolaget (one on the church roof); consider letting Game
over restart at the last bench.

**A3. major — "no warning" is not the problem; crowding is.** No enemy hit came from an enemy on
screen for under half a second (1 of 1 859 hits: a rat in the Akershus ditch at col 128, on screen 0.3 s after a fall into it),
and every thrown hit had its full wind-up. Hearts are lost to enemies seen in time but placed where
the jump and the enemy have to be solved at once (A1), and to max-width gaps (3 tiles, ~4 steps of
take-off window at a full run: 54 px jump over 48 px).

**A4. measured — the line of difficulty.** Hearts lost per run at ±4: Langkaia 5.3, Akershus 1.5,
Rådhuset 2.3, Slottet 0.6, Holmenkollen 5.7, Akerselva 4.1, Nordmarka 5.4, Stortinget 1.9, Ekeberg
5.9, Nabolaget 3.2. At ±2: 1.5, 1.6, 0.7, 0.4, 2.7, 2.2, 2.1, 1.1, 3.0, 3.1. It is a zigzag, level
1 is the fourth hardest at ±4, and level 4 is the easiest in the game by a wide margin (see E3).

### B. Softlocks and dead ends

**What I did.** (1) `deadends.ts`: a graph version of `game/reach.ts`'s search (same moves, same
generous world: every carrier everywhere it ever goes, ledges on a beat always there, enemies and
sheep as trampolines), recording which landing spot leads to which, from the start, with the
abilities each level guarantees (single jump; the ski pole from Akerselva on; never the feather).
A spot is a dead end when neither the rune nor any fall into water or a pit (a respawn) can be
reached from it. Because the search world is more generous than the real one, a dead end it finds
is at least as dead in the game. (2) `resume.ts`: from every flag and bench, at six different level
clocks, the perfect route picked up from that point. (3) `standflag.ts` / `savepoints.ts`: every
flag and bench checked against throwers, flyers and jumpers that reach it. (4) The bosses after a
lost life (section C).

| Level | spots searched | dead ends |
|---|---|---|
| Langkaia, Akershus, Akerselva, Nordmarka, Stortinget, Ekeberg, Nabolaget | 1 069 – 5 600 each | none |
| Rådhuset | 4 987 | **75 spots: row 48, cols 209–227** |
| Slottet | 5 991 | **19 spots: row 19, cols 247–251** |
| Holmenkollen | 3 220 | none found, but the search cannot model the inrun's speed, so it never reaches the rune; not conclusive for the jump itself |

Resumed from all 47 flags and benches the route raises or sits at, × 6 clocks, the perfect route
reaches the rune from every one, except a few starts where an enemy out of step knocks it somewhere
it has no move for (Rådhuset flag 195 → the tower roof, see B1; Stortinget flag 133; Ekeberg flag 71
→ the quarry) and one Game over at the plough from Nabolaget's first flag.

**B1. blocker — Rådhuset has a sealed pit right of the east tower: no way out but the restart
button.** `levels/radhuset.ts:44` lays the square's ground from col 96 to the map's end
(`b.ground(96, COLS - 1, G)`), and `:54` puts the east tower block at cols 197–208, rows 16–47.
Cols 209–227 at row 48 are open pavement with a 32-tile brick wall on the left and the world's edge
on the right. Walking off the right end of the tower's roof (row 16, cols 197–208), off the
balcony (row 6) or the parapet, or riding the clock hand's tip round its right side, drops him 33
tiles with no damage into it; nothing there can hurt him, so he cannot even die out. Evidence: the
graph search above; in the sloppy runs 4 of 30 at ±2 and 3 of 30 at ±4 missed the clock hand and
landed on the tower roof (x ≈ 3200, row 16), one walk from the edge (an earlier version of the
harness walked off it in 2 of 30 runs at ±2 and stayed there). Screenshots:
`shots/viking_debug_steps-2_level-radhuset_x-3352.png` (him at the bottom of the pit) and
`shots2/viking_debug_steps-2_level-radhuset_x-3200_y-200.png` (the tower roof under the clock,
where a missed clock-hand jump lands). **Fix:** put water (a fountain basin)
or a pit at the bottom of cols 209–227 so a fall there respawns him at flag 195, or wall the roof's
right edge, or put a ladder/lift back up.

**B2. blocker — Slottet has a 3-tile slot right of the palace that cannot be climbed out of.**
`levels/slottet.ts:62` fills the palace terrace at cols 212–246, rows 16–18; cols 247–251 are open
down to the street at row 19. From the street the terrace top is 48 px up; the jump is 46 px.
Walking right off the terrace (where the Guard sets him down and from where the balcony is climbed)
drops him in; no enemy, no water. Graph search: 19 spots, no exit. Screenshot
`shots2/viking_debug_steps-2_level-slottet_x-3992_y-280.png`. **Fix:** extend the terrace to the
map's edge (fill 247–251 to row 16), or lower the slot floor to water.

**B3. major — three flags stand inside a thrower's reach, so being put back there costs a heart.**
`THROW_REACH` is 7 tiles (`game/enemies.ts:57`); the test that keeps enemies off flags
(`levels/levels.test.ts:200–206`) uses 3 tiles plus the patrol, which throwers (range 0) pass.
Standing still on the flag after a respawn (simulated, `standflag.ts`, three different clocks
each):

| Flag | thrower | first heart lost after |
|---|---|---|
| Akerselva col 160 | gull col 166 (`levels/akerselva.ts:209`) | 2.1 – 3.8 s |
| Nordmarka col 192 (the last flag before the troll) | squirrel col 186 (`levels/nordmarka.ts:143`) | 1.3 – 3.0 s |
| Nabolaget col 100 | kid col 106 (`levels/nabolaget.ts:215`) | 1.1 – 2.8 s |

Nordmarka's is the worst: the clearing's sign (col 190) that explains the troll is also in the
squirrel's reach, so reading the instructions gets him pelted. **Fix:** move those three throwers
at least 8 tiles from the flags, or have throwers hold fire for 3 s after a respawn; extend the test
to `THROW_REACH` for throwers.

**B4. checked, nothing:** carriers all come back (every carrier is periodic; path carriers reappear
after `wait`); no bench or flag has a walker, flyer or jumper on it; the troll and the plough after a
lost life go back to sleep/parked with their hits kept and wake again when he walks in
(`troll.ts:65`, `plough.ts:179`); a parked plough is passable, so he cannot be stuck behind it.
Hazards in Stortinget throw him a tile up; I checked all three have open space above
(`hz.ts`). Being carried into a wall slides him off the carrier (`physics.ts:250–279`); I found no
crush.

**B5. minor — one-way falls that cost no heart but a long climb.** The sloppy player's "fell to a
lower floor" events (table A3c) put numbers on these. The ones a human will feel: Rådhuset's carillon
(a missed bell drops him to the middle roof; the swinging bell then has to be met in step again,
up to 8.9 s of waiting, see E), Akershus's wall-walk gaps at cols 62–63 and 69–71 (into the ward,
13 tiles down; harmless, it is where the route goes next anyway), Akershus's outer wall into the
ditch at cols 46–51 (four ledges back up), the secret room at Slottet cols 131–138 (escapable).

### C. The two bosses

**What I did.** `bosses.ts`: from the bench before each boss, three lives, ten naive strategies,
five minutes each, real rules (the strategies hop over whatever blocks them, as a person does).
`bossref.ts` times the perfect fights.

| Strategy (from the bench) | Troll: hits / hearts / result | Plough: hits / hearts / result |
|---|---|---|
| walk in, stand still facing it | 0 / 1 / stalemate on the rock at col 199 | 0 / 0 / stalemate (it cycles windup–charge–stuck at the line) |
| hold right, hop when blocked | 0 / 1 / stalemate | 1 / 9 / **Game over in 42 s** |
| hold right, jump whenever down | 0 / 1 / stalemate | 1 / 4 / one life lost |
| walk in, stand still any way | 0 / 1 / stalemate | 0 / 0 / stalemate |
| walk in, jump in place facing it | 0 / 0 / stalemate | 0 / 0 / stalemate |
| middle of the arena, stand facing it | 0 / 9 / **Game over in 36 s** | 0 / 9 / **Game over in 59 s** |
| middle, jump constantly | 0 / 9 / **Game over in 29 s** | 0 / 9 / **Game over in 58 s** |
| wake it, hide at the left edge | 0 / 9 / **Game over in 48 s** | 0 / 0 / stalemate |
| run to the far right edge | 0 / 9 / **Game over in 37 s** | 1 / 9 / **Game over in 41 s** |
| run at it, jump when close (stomp instinct) | 0 / 9 / **Game over in 22 s** | 0 / 9 / **Game over in 26 s** |

Perfect fights: troll 26.3 s from waking to stone (hits at 8.8, 18.6, 25.0 s); plough 27.9 s
(hits at 9.3, 19.4, 26.7 s), of which 11.3 s is standing on the terrace waiting for it to stick
(table E1).

**C1. major — neither boss can be beaten by accident, and trying costs the whole level.** No naive
strategy hits the troll even once; six of ten reach Game over in 22–48 s, and Game over restarts
Nordmarka from its start (69 s of perfect play, more for a real player). The plough gets at most
one accidental hit (the washing line throws him onto the cab). The troll's rule is three
conditions at once (`troll.ts:157`: stuck after a slam, its centre inside this round's dawn band,
him on the floor within 6 tiles facing it), and the dawn band moves each round
(`levels/nordmarka.ts:121–125`: cols 203–208, 210–215, 217–222). The only words are the sign at
col 190 ("Lure it into the light, and look it in the eye") and screen-reader-only announcements
(`main.ts:799–815` call `say()`, which writes to an `sr-only` element). **Fix:** show the dawn band
as an unmissable shaft on the floor that pulses while the club is stuck; after the first failed
cycle show the hint in a bubble over the troll; and make Game over at a boss restart at the boss's
bench with full lives, not at the level's start. Knowing the rule is not enough either: the sloppy
player, which plays the route's correct troll strategy, ended in Game over at the troll in 8 of 30
runs at ±4 (1 of 30 at ±2); the wave has to be jumped within a few steps of the slam while backing
off the club.

**C2. minor — standing on rocks or on the terrace is a permanent safe spot.** The troll "waits
under him" (`troll.ts:145`) while he stands on the rock at col 199 or the ledges at row 14; the
plough loops windup/charge/stuck at the washing line forever while he stays on the terrace. Not a
softlock (he can step down), but a confused player gets no nudge. **Fix:** after ~10 s of
stalemate, have the troll back off to the far end, which shows the dawn band.

**C3. checked:** lost life mid-fight resets the boss to sleep/parked with hits kept, and the dawn
band for the next hit is still the right one (`dawnNow` uses `hits`). Game over mid-fight:
`openScene` builds a fresh boss. Leaving through T-banen mid-fight: the level is rebuilt on return.
There is no state where the fight cannot end: the troll always walks toward him on the floor, the
plough always drives toward him once awake. The Hjem door (col 214) stands in the plough's arena
behind its parking spot; reaching it before the plough is beaten leaves the level without the rune
(a nit; the door is honest).

**C4. minor (suspected for touch and reduced motion) — the plough's charge telegraph mostly
disappears with reduced motion.** `levels/nabolaget.ts:924` makes the beacon steady
(`beat = view.reduced ? 1 : …`) and `:930`, `:940`, `:885` drop the glow, the exhaust and the shake,
leaving an 8 px roll back as the only sign of the one-second windup. **Fix:** keep a still
telegraph (beacon on a different colour, or a "!" board) under reduced motion.

### D. Throwers and other unfair hits

**What I did.** `throwers.ts` lists every thrower and every place the perfect route stands still in
its reach; the sloppy runs record, for every enemy hit, how long that enemy had been on a
1920 × 1080 screen (385 × 207 art px) and, for every hit by something thrown, the time since the
wind-up began; and every fall into water or a pit within 1.5 s of a hit ("knocked in").

| Level | thrower (col, row) | beat | where the route stands still in reach |
|---|---|---|---|
| Rådhuset | gull 40, 47; gull 150, 47 | 3.0 s, 3.3 s | none (the route stomps both first) |
| Holmenkollen | kid 33, 8; kid 98, 13; kid 214, 24 | 3.0, 3.0, 3.2 s | none |
| Akerselva | gull 166, 25 | 3.2 s | none; but flag 160 is in reach (B3) |
| Nordmarka | squirrel 111, 14; squirrel 186, 17 | 3.3, 3.5 s | none; flag 192 and the sign at 190 in reach (B3) |
| Ekeberg | squirrel 93, 9; squirrel 107, 9 | 3.3, 3.5 s | **1.9 s waiting for the pond's gust at cols 87–88** |
| Nabolaget | kid 50, 7; kid 106, 16 | 3.5, 3.7 s | none; flag 100 in reach (B3) |

**D1. checked: no hit without warning on a landscape screen.** Of 1 859 enemy hits in the sloppy
runs (table A3c), one came from an enemy on screen for less than half a second (a rat in the
Akershus ditch at col 128, 0.3 s, after a fall into the ditch); every thrown hit had the full
one-second wind-up first. The beat is never shorter than the 1.5 s blink, so no thrower
can stun-lock him alone.

**D2. major (suspected; computed from `stage.ts:45–47`, not seen) — on a phone held upright the
view is 131–148 art px wide, smaller than a thrower's reach.** The tall-screen rule picks k = 8–9
for a 390 × 844 phone, so he sees ~74–87 px ahead and ~43–52 px behind (look-ahead 22). A thrower
up to 112 px behind him throws from off screen; a walker coming at him is on screen for well under
the one second ADR 0008 promises (87 px at 1.95 px/step closing speed is 45 steps). **Fix:** cap
`k` so the view is at least ~240 art px wide on tall screens (ask to rotate if needed), and/or make
`THROW_REACH` depend on `view.w`.

**D3. major — Akershus: a brazier stands in front of each of the first two cannons.** The spiky
braziers at col 35 (`levels/akershus.ts:176`) and col 119 (`:182`) sit on the walk into the cannons
at col 42 and col 122. Spiky things cannot be stomped, so he must hop a 12 px brazier and land short
of the barrel. Per-jump test (A4): walking into the first cannon costs a heart in 38 % of tries at
±2 (40 % at ±4), into the second in 45 % (68 %). These are the first two spiky things of the game.
**Fix:** put each brazier 4+ tiles before its cannon with flat ground between, or on the far side.

**D4. major — Holmenkollen: spiky hedgehogs patrol the top of the icy steps and the ice itself.**
`levels/holmenkollen.ts:190–192`: a hedgehog at col 62 (range 1) on the path just before the first
icy step (ice at row 11, cols 65–71), a hedgehog at col 87 (range 2) on the ice of row 13
(cols 82–90), a fire basket at col 94, and the kid at col 98 throwing at the same stretch. On ice he
cannot stop; a spiky thing cannot be stomped. At ±2 the hedgehog at col 62 costs 0.77 hearts per
run and the kid's snowballs at cols 92–99 0.93; at ±4 the fire basket at col 94 costs 1.03. **Fix:**
keep spiky enemies off and next to ice (make the col 87 one a walker, which can be stomped), and
move the kid back so the steps are one problem at a time.

**D5. minor — being knocked back into water is a second heart, and the knock-back cannot be
steered.** `hit()` (`play.ts:320–331`) launches him at 1.8 px/step with `launched = true`, so the
keys only lean on the flight (0.05/step, `physics.ts:153–156`): ~2.5 tiles of knock-back he cannot
correct. The fall then takes another heart regardless of the blink (`play.ts:583–592` never looks at
`safeUntil`). Measured (table A3c): 38 times in 90 Nordmarka runs the hedgehog at col 68 knocked him into the first bog (cols 71–72); 10 times Langkaia's gull at col 131 into the water by the meeting rafts; 8 times Ekeberg's squirrel at col 93 into the pond at col 89; 6 times Nabolaget's cat at col 58 off the roofs. **Fix:** while blinking, a fall should only
put him back, not take a heart; or shorten the knock-back near edges.

**D6. checked:** Langkaia's gull over the meeting rafts flies at roof height as the route says; the
sloppy player is still hit there (0.33–0.63 hearts per run) because people jump onto the cabin
roofs, which the gull does reach. Worth a look (move its wave up 6 px or make the roofs not
needed).

### E. Waiting and pacing

**What I did.** `waits.ts`: every stretch of the perfect route standing still with no key held.
`worstwait.ts`: for every wait move of every route, arriving at that spot at every moment of the
level's clock (every 15 steps over 30 s), how long until the route can go on. `quiet.ts`: stretches
of 15+ columns with no enemy, gap, carrier, timed ledge, zone, hazard or cannon.

**E1. The perfect route's waits.**

| Level | perfect clear | standing still | waits ≥ 1 s | > 3 s | longest |
|---|---|---|---|---|---|
| Langkaia | 64.9 s | 13.2 s (20 %) | 4 | 2 | 3.6 s for the first meeting raft (col 121) |
| Akershus | 62.0 s | 6.3 s (10 %) | 2 | 0 | 2.4 s for the hoist (col 141) |
| Rådhuset | 93.1 s | **45.7 s (49 %)** | 12 | 5 | 6.1 s for the carillon in step with the swing (col 182) |
| Slottet | 64.6 s | 31.0 s (48 %) | 9 | 4 | 6.1 s for the Guard (col 197) |
| Holmenkollen | 62.3 s | 25.3 s (41 %) | 3 | 3 | **9.8 s for the chair (col 137)** |
| Akerselva | 66.4 s | 23.3 s (35 %) | 11 | 2 | 4.0 s for a bucket (col 113) |
| Nordmarka | 69.3 s | 30.1 s (43 %) | 7 | 5 | 6.2 s for the troll (col 202) |
| Stortinget | 63.6 s | 24.1 s (38 %) | 5 | 4 | 8.2 s riding the train through the tunnel |
| Ekeberg | 68.7 s | 19.9 s (29 %) | 5 | 2 | 7.9 s riding the tram up the trestle |
| Nabolaget | 94.4 s | 17.1 s (18 %) | 4 | 2 | 6.4 s for the plough to stick (col 173) |

("Standing still" includes riding a carrier without a key held.)

**E2. major — single carriers with long rounds make forced waits of 10–16 s.** Worst case on
arrival (`worstwait.ts`):

| Wait | worst | mean | source |
|---|---|---|---|
| Holmenkollen, a chair at this end (col 137) | **15.7 s** (+7.7 s ride) | 6.9 s | one chair, `period: 1000` (`levels/holmenkollen.ts:180`) |
| Rådhuset, the ferry at the quay (col 75) | 11.0 s (+5.5 s ride) | 4.6 s | `period: 720` (`levels/radhuset.ts:105`) |
| Holmenkollen, the tower lift bottom / top (cols 204–205) | 10.5 s + 10.3 s | 4.2 + 4.2 s | `speed: 0.6, wait: 150` (`:182`) |
| Nordmarka, the moose (col 87) | 9.9 s (+4.8 s ride) | 4.5 s | `period: 640` (`levels/nordmarka.ts:110`) |
| Akershus, the hoist (col 141) | 9.3 s | 4.2 s | `levels/akershus.ts:155` |
| Rådhuset, bell 9 with the swing coming back (col 188) | 8.9 s | 4.1 s | swing `period: 600` (`:109`) |
| Rådhuset, the carillon in step with the swing (col 182) | 8.6 s | 3.8 s | |
| Slottet, the Guard (col 197) | 7.1 s | 3.3 s | |
| Stortinget, locals at platforms 1 and 2 | 6.6 s, 6.2 s | 2.9, 2.5 s | |

Holmenkollen's chair alone can be 23 s of watching one chair cross a gully, and its lift two waits
of up to 10 s each, after which a missed lip sends him back to the same lift (the test allows 25 s
for that loop, `levels.test.ts:287`). **Fix:** two chairs out of phase (halves the worst wait), the
tower lift at speed 1.2 with a 60-step wait, a second moose or a shorter round.

**E3. minor — the difficulty is a zigzag, and level 1 is one of the hardest.** By hearts lost per
run at ±4 (table A1): Langkaia 5.3, Akershus 1.5, Rådhuset 2.3, Slottet 0.6, Holmenkollen 5.7,
Akerselva 4.1, Nordmarka 5.4, Stortinget 1.9, Ekeberg 5.9, Nabolaget 3.2. Slottet (level 4) is by far
the easiest level in the game; Langkaia (level 1) loses as many hearts as Nordmarka with its boss.
Rådhuset is not harder than Holmenkollen by hearts; it is harder by *retries*: the carillon and the
clock hand cost no hearts when missed but send him back to wait again, and 9 of 30 runs at ±4 gave
up after 15 tries at one place. **Fix:** soften Langkaia's raft gaps (2 tiles instead of 3, wider
rafts) and give Slottet one real twist; for Rådhuset, shorten the swing's round so a missed bell
costs 3–4 s, not 9.

**E4. nit — quiet stretches.** Langkaia's first 46 columns (2.3 screens: the Opera roof, the sheds,
the crates) have nothing that can hurt or move; the first enemy is at col 48. Intended as "teach",
but the sloppy player and a first-time player both walk it in ~15 s. Also quiet: Akershus 45–64,
Rådhuset 55–75 and 208–227 (the dead-end pit), Slottet 132–157 and 220–251, Holmenkollen 0–28,
64–84 and the ski jump itself (set piece), Nordmarka 116–137, Ekeberg 118–141 and 202–226,
Nabolaget 111–138. Stortinget has none.

### F. Rules at the edges

**F1. major — after Game over, the restart button, R, Back or a header link give him one life,
not three.** `main.ts:824–826` sets `session.lives = 0` on Game over; only the card's two buttons
put it back to `LIVES` (`:678–691`). `restartLevel()` (`:606–609`, wired to the header button at
`:693` and to R at `:1273`) and any hash change (`sync()` → `openScene`, `:241`) build the next
play with `lives: session.lives`, which `newPlay` clamps to `Math.max(1, …)` (`play.ts:243`). So a
player who presses R at the Game over card (the restart icon is right there) starts with one life,
and one who leaves with Back carries one life into the next level. **Fix:** in `openScene`, use
`session.lives > 0 ? session.lives : LIVES`, or reset it in `showOver` paths.

**F2. minor — R and the header restart refill nothing but keep the lives, so the brown cheese and
the skilling can be farmed.** `restartLevel` keeps `session.lives` and `session.purse`; every
`newPlay` puts the cheese and all skilling back. Restart, walk to Langkaia's cheese (~40 s), restart:
+1 life each time. Harmless, but it makes the life count meaningless for a patient player. **Fix:**
remember cheese taken per visit per level.

**F3. minor — a fall always takes a heart, even while he blinks** (`play.ts:583–592`; see D5).

**F4. checked, correct:** 100 skilling is a life at exactly 100, across levels (carried by
`session.purse`, `main.ts:879`), twice; cheese taken and then a death is kept (not re-collectable)
until the level restarts; best times only improve; bracteates are saved on pickup, before the clear
(`main.ts:833–838`); `readProgress` survives garbage, arrays, wrong types, missing `v` (then clears
the first three levels' times once), unknown ids (kept, harmless); the pole with `?cleared=` and for
real both come from `hasPole`; the ending is shown once (`home = !had && allRunes`, `main.ts:849`),
and a replay of Nabolaget after it says "Ten of ten runes"; a long frame gap is clamped to 100 ms and
5 steps per frame (`loop.ts`), so a slow device runs slow rather than skipping through walls; keys
are let go on blur and tab switch (`input.ts:91–94`); a dash at the world's edge or into a wall ends
at once (`dashStep` returns false) and a ground dash can repeat after 33 steps (24 rest + 10 dash);
standing on two carriers rides the first; being carried into a wall slides him off.

**F5. nit — `?feather` and `?pole` work without `?debug`** (`main.ts:139–141`), so anyone can get
the double jump and keep the bracteates it reaches. Probably fine on a personal site; say so in
DESIGN.

**F6. nit — a found bracteate is drawn and collectable again on every replay**
(`main.ts:1011`): the gold sound and announcement play again. Mario draws a taken coin as an
outline.

### G. The joins and the untested paths

Read in the code (not driven in a browser unless said):

- **Front page → viking** (`apps/landing/src/game/level.ts:56` → `/viking/?from=oslo`; `main.ts:1332–1365`):
  first visit starts in Langkaia standing at Hjem with the helmet moment; later visits start on the
  map at the furthest open station. Correct.
- **G1. minor — at Langkaia's start he stands in front of Hjem, and ↑ (which jumps everywhere
  else) takes him back to the front page.** `main.ts:1360–1364` puts him at the home door;
  `play()` (`:863–865`) turns ↑ at a door into going in, and `intentFrom` (`scene.ts:351–357`)
  suppresses the jump there. A visitor who jumps with ↑ leaves the game on his first key. **Fix:**
  step him one tile right of the door after the helmet moment, or require ↑ to be pressed twice
  at a door he arrived through.
- **G2. major (verified in code) — click/tap to walk walks straight into the water.** `wirePointer`
  is live in every level (`main.ts:1262–1269`); `walkStep` (`walkto.ts:47–57`) walks toward the
  point and hops only when stuck against a wall, never at an edge. The help line invites it
  ("Or click where you want to go"). A child tapping the screen on a tablet walks him off Langkaia's
  quay. **Fix:** in levels, keep pointer walking for doors only (or stop at edges), and drop the
  sentence from the help line there.
- **Doors in levels:** T-banen (all ten, `#kart`), Hjem (Langkaia `/?from=viking`, Nabolaget `/`),
  Runesmia (`/qr/`, Langkaia and Akerselva), Verkstedet (GitHub), Jernhaugen (Nordmarka, `#jernhaugen`),
  Quintle (Stortinget; padlocked because it has no href and no header link: `doors.ts` `soon`).
  All present in the maps (`levels.test.ts:133–144`).
- **Maze → Nordmarka vs → map:** going in through Nordmarka's mound sets `moundFrom`
  (`main.ts:741–743`); leaving resumes the same play with the feather re-read (`:423–442`).
  Going in from the header link or the map returns to the map. Correct by reading.
- **G3. minor — the feather moment replays, in plain colours, every time the last maze level is
  cleared again.** `main.ts:387` passes `r.feather ?? (r.cleared ? "plain" : null)`; on a re-clear
  `feather` is null and `cleared` true, so `featherPending = "plain"` and the moment and its line
  ("The raven's feather is yours") play again, drawn plain even for a gold holder. **Fix:** pass
  only `r.feather`.
- **The ending from a stored save:** `clearLevel` → `allRunes` → `viking.crowned` set, card with both
  languages. Correct by reading; not driven (needs a stored save and a real clear).
- **Header in every scene:** on the map the clock, hearts and restart hide (screenshot
  `shots2/..._kart.png`); lives show the session's count — which is 1 after F1.
- **G4. minor — the touch "Go in" button is the sit button at a bench, still labelled "Go in", and
  the "↑ sit down" hint is not shown on touch** (`main.ts:1195`, `pageFollows`). **Fix:** relabel
  the button at a bench.
- **G5. minor — the dash is taught for keyboards only.** The Akerselva sign says "Shift or X"
  (`levels/akerselva.ts:904`), the Holmenkollen card says the same (`game/i18n.ts:40`); the help line never mentions
  it; touch players have a Dash button no sign names. **Fix:** a touch variant of the sign and card
  line ("the Dash button").
- **Keyboard help text** (`game/i18n.ts:12`, `:61`): matches the keys (arrows, Space, ↑ at doors, click);
  it omits ↑ = jump, the dash, R and T; benches get a hint on the spot.
- **G6. minor — reduced motion removes the blink after a hit entirely** (`main.ts:1185`), so a
  reduced-motion player cannot see that he is safe for 1.5 s. **Fix:** draw him at 50 % instead of
  blinking.
- **Mute** is the kit's (`larshansen.muted`), shared. Not exercised (no sound on the Pi).
- **G7. nit — the maze is called "Iron Maze" in the front page's header and "Jernhaugen" in the
  viking header and game** (`apps/landing/index.html:24`). Pick one (Jernhaugen).

### H. Coherence: is it one game?

**What I did.** 60 screenshots at six standable spots per level, plus the bosses, the cards, the
map with all ten cleared, night/tint variants and the live front page (`shots/`, `shots2/`).

**Holds together.** The person, the clouds, the sun, the hills, the header, the sign boards, the
skilling, the flags and the bench are the same objects drawn the same way in all ten levels and on
the map; the type and the dry voice are consistent; the front page's houses and the levels' houses
share outline weight and cladding. Nordmarka and Nabolaget at night, Ekeberg in its evening and
Holmenkollen in snow read as the same world under different skies.

**H1. minor — large flat areas.** The outer face of Akershus's wall (cols 30–45, a uniform brick grid,
`x-376` shot), Rådhuset's tower faces (three windows on a screen of brick), Stortinget's rock above
the platforms (rows 0–9, identical stone rows; whenever the camera rises it fills the screen),
Ekeberg's quarry wall (identical panels), the water fields at the bottom of Ekeberg and Langkaia.
Known in the handover; confirmed.

**H2. minor — trams sink into the ground.** Ekeberg's tram mid-move shows a dark bogie block through
the street surface (`shots2/viking_debug_steps-90_level-ekeberg_x-344.png`, x ≈ 350–378). Known.

**H3. nit — the district banner is faint.** White title over pale sky with a light outline; over
Ekeberg's Scream bands and Holmenkollen's snow it is hard to read for the first quarter second, at
full opacity readable (`steps-90` shot). Over Ekeberg's bands it never has much contrast.

**H4. nit — the yellow house reads brown at night.** Confirmed (`x-3500` Nabolaget shot). Known.

**H5. words.** All signs exist in both languages, two lines at most, no exclamation marks. Notes:
- Holmenkollen (`levels/holmenkollen.ts:568`) "Snøkanonen lager snø. Og flyr deg over juvet." — *flyr deg* is not idiomatic;
  "Og sender deg over juvet."
- Stortinget's sign label "Dørene lukkes" (`levels/stortinget.ts:855`) is left Norwegian in English. It is a quote, not a place
  name (ADR 0016 keeps only place names); either intended (then fine) or "Doors closing".
- "Game over" is English in Norwegian too (deliberate; fine).
- The boss lines ("Brøytebilen våkner. Den er det siste før du er hjemme.", the troll's lines) are
  only announced to screen readers (`say()`), never shown; sighted players never read them.
- Terms are consistent: skilling, brakteat/bracteate, skistav/ski pole, ravnefjær/raven's feather,
  waffle hearts only in code.

**H6. minor — at night, level 1's enemies are dark on dark.** Langkaia follows the real Oslo
clock, so in winter most evening visitors play it at night. Under the night tint the rat on the
pier is a dark shape on dark planks (`shots2/viking_debug_steps-2_level-langkaia_x-2344_sky-night.png`,
x ≈ 815) and the skilling are dim. The pigeons and the rat are the first enemies a new player meets.
**Fix:** give enemies a one-pixel light rim or eye-shine at night (Nordmarka's eyes already do this),
or pin Langkaia to dusk at the latest.

### I. The maze

**What I did.** `mazesloppy.ts`: the maze's own route planner (copied so its state can be cloned),
key speed, every edge of the horizontal and vertical keys shifted ±k, corner tolerance 2.5 px; on a
curse he wakes at the last lit stone (real rules) and the route is picked up at the nearest
waypoint. `mazegeo.ts`: every stone, the start and every teleport arrival against every snake path
and slider.

| Level | ±0 | ±2 | ±4 | ±8 | where the curses are at ±4 |
|---|---|---|---|---|---|
| level 1 Inngangen (par 25 s) | 1/1, 0.0 curses, 15 s | 20/20, 0.0 curses, 15 s | 20/20, 0.1 curses, 16 s | 20/20, 2.6 curses, 30 s | wall@(13,14) ×1, wall@(22,13) ×1 |
| level 2 Ormegropa (par 25 s) | 1/1, 0.0 curses, 23 s | 20/20, 0.1 curses, 23 s | 20/20, 0.6 curses, 25 s | 20/20, 2.5 curses, 34 s | snake@(14,15) ×6, snake@(22,15) ×4, wall@(1,2) ×1 |
| level 3 Jernporten (par 30 s) | 1/1, 0.0 curses, 20 s | 20/20, 0.0 curses, 21 s | 20/20, 0.0 curses, 23 s | 3/20, 46.4 curses, 164 s |  |
| level 4 Råttent gulv (par 15 s) | 1/1, 0.0 curses, 8 s | 20/20, 0.0 curses, 9 s | 20/20, 0.0 curses, 9 s | 20/20, 1.5 curses, 20 s |  |
| level 5 Skyveveggene (par 25 s) | 1/1, 0.0 curses, 21 s | 20/20, 0.3 curses, 22 s | 20/20, 0.6 curses, 24 s | 20/20, 3.1 curses, 46 s | slider@(11,12) ×3, slider@(17,12) ×3, slider@(8,3) ×3, slider@(19,3) ×1, slider@(19,7) ×1 |
| level 6 Mørket (par 15 s, dark) | 1/1, 0.0 curses, 11 s | 20/20, 0.0 curses, 11 s | 20/20, 0.1 curses, 12 s | 20/20, 1.7 curses, 18 s | wall@(25,11) ×1 |
| level 7 Haugbonden (par 35 s) | 1/1, 0.0 curses, 21 s | 20/20, 0.4 curses, 21 s | did not finish (see below) | did not finish | at ±2: snake@(12,7) ×5, snake@(10,7) ×2, snake@(21,7) ×1 |


Level 7's runs at ±4 and ±8 did not finish in eight minutes: the copied route planner replans
with a 100-step look-ahead after every curse near its four snakes, which is slow, not a sign of a
problem in the level. At ±2 it is cleared 20 of 20, with its curses all on the snakes' lines in row 7.

**I1. checked:** no snake ever touches a stone, the start pad or a teleport arrival (closest
approach > 20 px everywhere); a teleport cannot land him in a wall (he arrives at the tile centre,
5 px clear). Level 5's arrival at (12,6) sits directly above a slider at (12,7): pressing down on
arrival while it is up curses him (nit; move the twin one tile up).

**I2. nit — Jernporten (level 3) has one corner that a very sloppy player cannot take.** At ±8 only
3 of 20 runs cleared it, with 46 curses per run, against 20 of 20 at ±4 with none: one turn of a
one-tile corridor needs better than ±8 steps (±10 px at key speed). Fine for a bonus level; worth
knowing if the maze is ever made required.

**I3. checked:** leaving the maze returns to Nordmarka or the map as in G; the feather moment issue
is G3. Pointer steering and the dark level were not driven beyond the maze's own tests.

### J. Docs vs code

- **J1.** `apps/viking/docs/DESIGN.md` (Enemies): "walkers and flyers are beaten by landing on them";
  in the code throwers and jumpers are too (`enemies.ts:42–48`, `stomp: true`), and the routes stomp
  throwers. Also: "a dash … once each time in the air": it also works on the ground, with a 24-step
  rest (`play.ts:37`, `:477`).
- **J2.** `docs/games/HANDOVER.md` "Margins": first script 57.4 kB; it is 57.59 kB now (printer
  commit). Test suite "about 70 s": see K.
- **J3.** ADR 0008: "never at a flag or bench" — three flags are in a thrower's reach (B3).
  "An enemy is visible for a second before it can reach him" — not on an upright phone (D2).
- **J4.** ADR 0005 and the handover call the reach search's "proven" bracteates "very likely"; the
  same search, run as a graph, finds the two dead ends (B1, B2) that nothing else in the checking
  looked for. Add the dead-end check to the tests.
- **J5.** `docs/games/LEVELS.html` "Fairness: every corridor at least one tile wide" (maze) holds;
  "every level has 9 to 16 enemies" holds (9–16); "224 to 280 columns" holds; "52 to 79 skilling"
  holds.
- **J6.** PLAN §3 "the same header bar on all three": the front page's header has "Go straight to …
  CV, Iron Maze, QR-verkstedet, Quintle"; the viking header has "Gamle Oslo, QR-verkstedet,
  Jernhaugen, GitHub" and no "Go straight to". Different link sets and names (G7).

### K. Engineering margins

**What I did.** Built `apps/viking` (`bun run build`), read the chunk sizes, minified the candidate
modules alone with `bun build --minify` to estimate their gzip size, read `vite.config.ts`,
`.github/workflows/deploy.yml`, `levels/index.ts` and the loading path in `main.ts`, and timed
`bun test` in `apps/viking` on the Pi.

| Chunk | gzip |
|---|---|
| first script `index-*.js` | **57.59 kB** of the 60 kB budget (2.4 kB left) |
| maze scene / rules / words | 14.60 / 3.58 / 1.68 kB (lazy) |
| level chunks | 5.27 (Akershus) – 12.65 kB (Nabolaget) |

**K1. major — the deploy never runs the tests.** `deploy.yml` installs, builds (`tsc --noEmit`
and `vite build`), publishes and greps two strings. The scripted routes, the reach proofs, the
level measure and every rule test exist only on whoever remembers to run them; a push to `main`
that breaks a route ships. **Fix:** run `bun test` in `apps/viking`, `packages/maze` and
`packages/pixelkit` before "Publish", and fail the deploy on red. (Suite time below.)

**K2. minor — where 3–5 kB of the first script can come back.**
- `game/bot.ts` (the scripted player, ~1.7 kB gz) is imported statically by `main.ts:59` for
  `?debug&auto` only. Import `autopilot` dynamically together with the route (`AUTO` at
  `main.ts:1296` already fetches the route lazily).
- `game/troll.ts` (~1.3 kB gz) is only Nordmarka's; move it behind the level's boss slot as the
  plough already is (ADR 0011 lists it).
- `?debug`-only code in `main.ts` (`debugProgress`, the error-to-help handler, `__game`) and the
  harness's key parser, ~0.4 kB.
Together ≈ 3.4 kB, which takes the margin from 2.4 to ~5.8 kB.

**K3. minor — every level's chunk carries its scripted route.** `vite.config.ts`'s `LEVEL` regex
includes `routes/` so the route goes into the level's chunk: 1.0–1.4 kB gz per level that every
visitor downloads and only `?debug&auto` uses (Nabolaget's route ~1.37 kB, Akerselva's ~1.16 kB,
Rådhuset's ~1.04 kB). Put the routes in their own chunks (one per level, or one "debug" chunk).

**K4. minor — a slow or failed level fetch.** `sync()` (`main.ts:293–307`) fades the scene to dark
while the chunk loads, with no word on screen. If it takes more than 300 steps (5 s),
`stepOnce` (`:912`) reopens the map scene underneath; when the fetch then lands, the level opens
abruptly wherever he is on the map. If the fetch fails, the address is replaced with `#kart` and
the map opens with no message (`:302–305`; the same at start, `:1347–1352`). On a 2G-ish line a
12 kB chunk is several seconds. **Fix:** a board "Laster … / Loading …" over the station while
waiting, and a bubble "Kom ikke fram. Prøv igjen. / Could not load. Try again." on failure.

**K5. minor — the smoke test proves little about the game.** It checks that the first script
contains `Langkaia` and that the maze page contains `Jernhaugen`. It does not fetch one level chunk
or the maze's lazy chunks (a missing or misnamed chunk would only show in a browser), and
`setup-bun` takes `bun-version: latest`, so a Bun release can change the build under you. **Fix:**
fetch the `assets/*.js` files the first script names and check one level chunk and the maze scene
chunk return 200; pin the Bun version.

**K6. measured — test suite time.** `bun test` in `apps/viking`: 144 tests, 74.9 s wall on the Pi
(with one low-priority process beside it), against the handover's "about 70 s" of a two-minute
budget. The ten reach searches in workers dominate. Adding the dead-end search (B) would cost
roughly the same again; run it as a separate, slower job (or only on levels whose map changed).



---

## 3. What I could not check, and why

- **Feel at real speed, sound, gamepad, touch.** The Pi cannot run a browser at speed (Chromium
  cannot render headless; headless Firefox fires no animation frames). Every timing number here is
  from the rules stepped in Bun, and "±k steps" stands in for a person. Whether ±2 or ±4 is the
  right model of a first-time player is a guess; I would read ±2 as a careful adult and ±4 as a
  casual one or a child.
- **The sloppy player is a bot with a human's timing, not a human.** It follows the route's plan,
  so it never finds a shortcut or a safer line, and its recovery after an unusual fall is limited:
  runs that ended "off route" fell somewhere the route never stands (the Akershus ward and ditch,
  Stortinget's track bed, Ekeberg's quarry floor, Nabolaget's church tower), and I checked each of
  those places by hand for an exit (all have one, except B1/B2). Those runs are left out of nothing;
  the tables show them separately. Its retries are capped at 15 per place ("gave up").
- **Portrait phones** (D2) are computed from the stage's formula, not seen: `tools/shots.ts` only
  shoots 1280 × 800.
- **The maze inside the viking page, and the feather moment,** load by dynamic import after a
  stepped page has drawn; I read the code paths (G) but could not drive them. Same for the ending
  from a real stored save (needs a real clear in a real browser) and for the mute shared across the
  three pages.
- **Reduced motion** was read in the code (C4, G6), not seen.
- **The front page gate** (28 byte-identical screenshots) was not rerun: nothing in the kit
  changed.
- **Lazy-loading on a slow line** (K4) was read, not throttled.
- **Night variants** were shot for Langkaia (`sky=night`) and the pinned-night levels; not every
  level at every sky.


---

## How to rerun

All scripts live in
`/tmp/claude-1000/-home-lars-projects-larshansen/f3819549-c84a-449d-953e-29b64ae667a5/scratchpad/review/`
(the scratchpad does not survive a reboot; copy the folder somewhere if the fixer needs it later).
They import the game straight from `apps/viking/src` and `packages/*/src` by absolute path, so they
run against whatever the checkout holds. Bun only.

| Script | What it does | Run (from that folder) |
|---|---|---|
| `sloppy.ts` | **the sloppy-player harness** (section A) | `bun sloppy.ts levels=radhuset ks=2,4 seeds=30 out=out/x.jsonl` |
| `runall.sh` | the whole study: A1 (`out/t-*.jsonl`), A2 (`out/m-*.jsonl`), A4 (`out/obstacles-*.json`), four processes at a time, ~50 min on the Pi | `./runall.sh` |
| `summary.py`, `agg.py`, `hurts.py` | the tables of section A from those files | `python3 summary.py` |
| `obstacles.ts` | every jump of every route on its own (A4) | `bun obstacles.ts levels=langkaia ks=2,4 seeds=40` |
| `resume.ts` | the perfect route picked up from every flag and bench at six clocks (B) | `bun resume.ts` |
| `deadends.ts` | the dead-end graph search (B1, B2) | `bun deadends.ts radhuset` |
| `standflag.ts`, `savepoints.ts`, `throwers.ts` | throwers against flags and waits (B3, D) | `bun standflag.ts` |
| `bosses.ts`, `bossref.ts` | naive strategies against the troll and the plough (C) | `bun bosses.ts` |
| `waits.ts`, `worstwait.ts`, `quiet.ts` | pacing (E) | `bun waits.ts` |
| `mazesloppy.ts`, `mazegeo.ts` | the maze (I) | `bun mazesloppy.ts ks=0,2,4,8 seeds=20` |
| `urls.ts` | the screenshot addresses (H) | `bun tools/shots.ts <dir> $(bun urls.ts 6)` from the repo root, with `apps/viking` built and served on 5181 |

**As a regression test for the fixes.** `bun sloppy.ts ks=0` must print `clear 1/1` for all ten
levels (the harness reproduces the scripted clear exactly). Then
`bun sloppy.ts ks=2,4 seeds=30 out=out/after.jsonl` and `python3 hurts.py out/after.jsonl` give the
same hotspot tables as A3 to compare with; `bun deadends.ts <level>` must report no dead ends;
`bun bosses.ts` shows whether a naive player now gets anywhere with the troll. If a route changes,
the harness follows it (it plays the routes from `levels/routes/`).

Harness limits to keep in mind: it is the route's plan with a person's timing, not a person; it
never finds a better line, and after a fall to a place the route never visits it stops ("off
route") rather than improvising.

