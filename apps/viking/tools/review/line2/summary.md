# Line 2 by the sloppy player

Measured 14 and 15 November 2026: Bygdøy for order 14, and again after order 15's two fixes; Vigelandsparken,
Korketrekkeren and Østensjøvannet for order 15. `../README.md` says what each tool is. From this folder:
`bun sloppy.ts levels=<id> ks=2,4 seeds=30` (timing errors only), `bun obstacles.ts levels=<id> ks=2,4 seeds=40`,
`bun standing.ts <id>...`, `bun worstwait.ts <id>...`, `bun waits.ts`. The sloppy player holds the shield (and on
the sledge the duck, the same key) as it holds a direction, each edge off by up to ±k steps. `bun sloppy.ts ks=0`
clears all fourteen levels 1/1.

Wanted by order 15, hearts a run at ±4: Bygdøy at most 1.5; Vigelandsparken about 2 (at most 2.5);
Korketrekkeren about 1 (at most 1.5); Østensjøvannet about 2.5 (at most 3). No Game over at ±2, at most 1 in 30 at
±4, no single jump over 0.4 hearts a try.

## Runs (30 each)

| Level | k | clear | game over | off route / gave up / time out | hearts lost per run | lives lost per run | median clear (s) |
|---|---|---|---|---|---|---|---|
| bygdoy | ±2 | 30/30 | 0/30 | 0/0/0 | 0.5 | 0.00 | 79 |
| bygdoy | ±4 | 30/30 | 0/30 | 0/0/0 | 1.2 | 0.07 | 103 |
| vigelandsparken | ±2 | 30/30 | 0/30 | 0/0/0 | 1.1 | 0.07 | 67 |
| vigelandsparken | ±4 | 30/30 | 0/30 | 0/0/0 | 2.1 | 0.33 | 90 |
| korketrekkeren | ±2 | 30/30 | 0/30 | 0/0/0 | 0.2 | 0.07 | 49 |
| korketrekkeren | ±4 | 30/30 | 0/30 | 0/0/0 | 1.0 | 0.20 | 52 |
| ostensjovannet | ±2 | 30/30 | 0/30 | 0/0/0 | 1.0 | 0.10 | 52 |
| ostensjovannet | ±4 | 30/30 | 0/30 | 0/0/0 | 1.2 | 0.10 | 62 |

Bygdøy measured 0.7 and 1.8 after order 14: the gull over the first boathouse (1.03 a run at ±4) now flies two
rows higher, and the yard's first slinger stands alone past a low passage (below).

**Østensjøvannet is under its mark**: 1.2 at ±4 against the 2.5 wanted. Its danger is lingering: a pad goes
under after two thirds of a second, and a swan comes for a man who has been in its water four seconds. The route
never lingers (it runs onto a pad and leaps from its end, steering to the next), and the sloppy player's errors
are timing, not hesitation, so it crosses each swan's stretch in about the route's three and a half seconds; no
swan came for it in 60 runs. What it loses is to the ducks and coots, the jump onto the heron and the jump off the
stone in the long crossing. Narrower pads made it lose more, but to a chain of late leaps drifting off the pads'
ends (the route's plan, not a person's mistake), so they were widened again. A hesitating player would be the
measure for this level; the review of line 2 (order 17) or Lars's own play should judge it.

## Where hearts are lost (4-column bins)

| Level | k | place (cols) | what | hearts per run |
|---|---|---|---|---|
| bygdoy | ±2 | 56–59 | flyer:gull | 0.23 |
| bygdoy | ±2 | 64–67 | walker:crab | 0.10 |
| bygdoy | ±4 | 108–111 | fall | 0.17 |
| bygdoy | ±4 | 208–215 | the passage's slinger (run into) and its stones | 0.44 |
| bygdoy | ±4 | 56–59 | flyer:gull | 0.13 |
| vigelandsparken | ±2 | 120–123 | statue (the rose garden's first) | 0.47 |
| vigelandsparken | ±2 | 144–147 | statue (the courtyard's) | 0.30 |
| vigelandsparken | ±4 | 120–123 | statue (the rose garden's first) | 0.73 |
| vigelandsparken | ±4 | 140–155 | statue (the courtyard's, led to the wall) | 0.94 |
| vigelandsparken | ±4 | 88–91 | fall (off the jet onto the bowl) | 0.27 |
| korketrekkeren | ±4 | 80–83, 96–99 | the sledgers | 0.54 |
| korketrekkeren | ±4 | 112–115, 152–155 | a branch, the barrier (ducked late) | 0.30 |
| korketrekkeren | ±4 | 184–187 | fall (the gap) | 0.17 |
| ostensjovannet | ±2 | 20–23 | walker:duck | 0.37 |
| ostensjovannet | ±2 | 204–207 | walker:coot | 0.30 |
| ostensjovannet | ±4 | 88–91 | fall (onto the heron) | 0.33 |
| ostensjovannet | ±4 | 20–23 | walker:duck | 0.30 |
| ostensjovannet | ±4 | 180–183 | fall (off the stone in the long crossing) | 0.13 |

## Every jump and ride on its own (40 tries each)

| Level | jumps and rides | all made without a heart lost, ±2 | ±4 | worst hearts a try at ±4 |
|---|---|---|---|---|
| bygdoy | 22 | 97.5 % | 97.5 % | 0.03 (a leap on the beach, col 44) |
| vigelandsparken | 12 | 100.0 % | 92.5 % | 0.10 (off the jet onto the bowl, col 87) |
| korketrekkeren | 9 | 100.0 % | 75.0 % | 0.25 (the gap, col 175) |
| ostensjovannet | 33 | 87.5 % | 75.0 % | 0.25 (off the stone, col 181) |

The rows are `obstacles-<level>.json`. On the sledge each stretch of the ride counts as one ("over the
sledgers", "duck the branches" ...); all but the gap are made every time on their own.

## Standing and waits

```
bygdoy: clear 69.2 s; standing still 20.4 s (30%): on fixed ground 9.5 s (14%), riding 10.9 s (16%)
vigelandsparken: clear 51.9 s; standing still 5.7 s (11%): on fixed ground 4.7 s (9%), riding 1.0 s (2%)
korketrekkeren: clear 48.4 s; standing still 1.0 s (2%): on fixed ground 1.0 s (2%), riding 0.0 s (0%)
ostensjovannet: clear 48.5 s; standing still 1.3 s (3%): on fixed ground 1.3 s (3%), riding 0.0 s (0%)
```

Bygdøy's share was 40 %: the yard's stands are shorter (the route raises the shield as a stone is about to come,
not for the whole wind-up), and the clear is 69 s, not 80. On the sledge he is moving (the speed is his own there,
ADR 0026), so the ride does not count as standing.

The longest forced waits (`worstwait.txt`, `waits.txt`): Bygdøy's ferry at the quay, 5.7 s worst on arrival, as
before; Vigelandsparken's jet, stood under until it comes down and lifts him, 5.1 s worst; its loose slab 2.0 s.
Korketrekkeren and Østensjøvannet have no waits (`worstwait.txt` lists their rides and shield stretches whole).

## The passage under the loft (Bygdøy)

From the prow, at every moment of the passage slinger's 100-step beat: a man who holds right through the passage
is hit 100 times in 100; one who stops and raises the shield whenever a stone is within 72 px is hit 0 times
(tested). The other two slingers hit a careless walker at 44 % of the moments over their 110-step beat.

## Line 1 spot-check after order 15 (±4, 30 runs) against order 14's

| Level | clear | game over | hearts lost per run | after order 14 (clear, game over, hearts) |
|---|---|---|---|---|
| langkaia | 28/30 | 0/30 | 1.5 | 28/30, 0/30, 1.5 |
| akerselva | 28/30 | 1/30 | 2.3 | 28/30, 1/30, 2.3 |

Line 1's scripted clears are unchanged (the tests).
