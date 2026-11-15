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

## Order 16: the hesitating player, Bjørvika, Gamlebyen, the serpent (15 November)

From this folder: `bun sloppy.ts levels=<id> ks=2,4 seeds=30 [hesitate=0.2]`, `bun obstacles.ts levels=bjorvika,gamlebyen
ks=2,4 seeds=40`, `bun standing.ts`, `bun worstwait.ts`, `bun bosses.ts gamlebyen`. `bun sloppy.ts ks=0` clears all
sixteen 1/1. The hesitating player (`hesitate=0.2`, ADR 0029) is the sloppy player that also stands 0.5 to 1.5 s before
one move in five, seeded, where a person would stop to look (on the ground, not riding, not right after a wait).

Wanted by order 16, hearts a run at ±4: Bjørvika about 3 (at most 3.5); Gamlebyen about 3.5 (at most 4.5) with at most 2
Game overs in 30; no Game over at ±2; no single jump over 0.4 hearts a try. Østensjøvannet for the hesitating player:
between about 2 and 3.5.

### The lake and the hesitating player (30 runs each)

| Level | player | ±2 hearts (game over) | ±4 hearts (game over) |
|---|---|---|---|
| ostensjovannet, as order 15 left it | hesitating | 7.2 (21) | 7.3 (18) |
| ostensjovannet, lily pads 1.7 s, a swan that caught him lets him be | hesitating | 3.7 (0) | 2.6 (1) |
| ostensjovannet, as now | sloppy | 1.0 (0) | 1.2 (0) |
| langkaia | hesitating | 0.1 (0) | 1.4 (0) |
| bygdoy | hesitating | 1.1 (0) | 2.0 (0) |

At ±4 the eased lake's hesitating player loses 1.1 hearts a run to its swans (none before) and 0.5 to falls; at ±2 more
of its pauses fall in a swan's stretch (2.0 to swans), so ±2 measures worse than ±4 there.

### Bjørvika and Gamlebyen (30 runs each)

| Level | player | k | clear | game over | hearts lost per run | lives lost per run | median clear (s) |
|---|---|---|---|---|---|---|---|
| bjorvika | sloppy | ±2 | 30/30 | 0 | 1.1 | 0.03 | 88 |
| bjorvika | sloppy | ±4 | 30/30 | 0 | 1.6 | 0.10 | 107 |
| bjorvika | hesitating | ±2 | 30/30 | 0 | 1.6 | 0.10 | 98 |
| bjorvika | hesitating | ±4 | 30/30 | 0 | 1.8 | 0.30 | 112 |
| gamlebyen | sloppy | ±2 | 30/30 | 0 | 1.3 | 0.00 | 90 |
| gamlebyen | sloppy | ±4 | 30/30 | 0 | 2.9 | 0.27 | 111 |
| gamlebyen | hesitating | ±2 | 30/30 | 0 | 1.4 | 0.07 | 103 |
| gamlebyen | hesitating | ±4 | 30/30 | 0 | 3.3 | 0.27 | 120 |

**Both are under the mark**, Bjørvika well under (1.6 against about 3): its hooks cost almost nothing once the hop off
at the far end became a step (that hop cost half a heart a try at ±4, over the limit), and what it loses is to walkers
(each 0.1 to 0.2) and the rebar. Gamlebyen is 2.9 against about 3.5: the serpent's tail 1.1, the water mirror's stepping
stones 0.4, the guards and the market's animals the rest. Where hearts go at ±4:

| Level | place (cols) | what | hearts per run |
|---|---|---|---|
| bjorvika | 12–15 | pigeon on the quay | 0.23 |
| bjorvika | 24–27, 64–67, 132–135 | the rats by the gate, on the open floor, on the third tower | 0.17 each |
| bjorvika | 112–115, 180–183 | the pigeons on the second tower and the girder | 0.13 each |
| gamlebyen | 244–255 | the serpent's tail | 1.10 |
| gamlebyen | 76–79 | a guard on the bishop's wall | 0.27 |
| gamlebyen | 104–111 | falls between the stepping stones | 0.40 |
| gamlebyen | 208–211 | the dog | 0.20 |

### Every jump on its own (40 tries each), standing and waits

| Level | jumps tried | all made without a heart lost, ±2 | ±4 | worst hearts a try at ±4 |
|---|---|---|---|---|
| bjorvika | 15 | 95.0 % | 79.4 % | 0.07 (the leap over the second rebar, col 68) |
| gamlebyen | 8 | 100 % | 95.0 % | 0.00 |

`obstacles.ts` tries the moves named jump or leap: Gamlebyen's stepping-stone leaps and the traverse's hops are named
otherwise and are not in it; from the runs above the stepping stones cost 0.4 a run over six leaps (about 0.07 a try),
the serpent's tail about 0.37 a try (three a run).
(Wrong, as the review of line 2 found (A1): tried on their own the stones cost 0.20 to 0.50 a try at ±4.
Order 17 changed them and made `obstacles.ts` try every move; see `../line2-after/obstacles.txt`.)

```
bjorvika: clear 60.1 s; standing still 15.8 s (26%): on fixed ground 2.7 s (4%), riding 13.1 s (22%)
gamlebyen: clear 96.3 s; standing still 24.3 s (25%): on fixed ground 22.7 s (24%), riding 1.6 s (2%)
```

Longest waits on arrival (`worstwait.ts`): Bjørvika's hoist 4.4 s, a sheet over a shaft in the calm between gusts 5.8 s
worst; Gamlebyen's tower 1.6 s, its stepping stones under a third of a second. The wall walk with the archers lists
7.5 s, but that is the whole walk with the shield, not a wait; the serpent's fight is left out, as the other bosses'.

### The serpent against ten naive strategies (`bosses-gamlebyen.txt`)

Every one sees its first hint within 5 to 7 s. Three reach Game over, at 85, 94 and 182 s; seven are alive at 300 s. None
wins: the answer is the shield.

### Line 1 and line 2 spot-checks (±4, 30 runs)

| Level | clear | game over | hearts lost per run | before order 16 |
|---|---|---|---|---|
| bygdoy | 30/30 | 0 | 1.2 | 1.2 |
| vigelandsparken | 30/30 | 0 | 2.1 | 2.1 |

The scripted clears of all fourteen earlier levels pass (the tests).
