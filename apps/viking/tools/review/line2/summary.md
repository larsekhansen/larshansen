# Line 2: Bygdøy by the sloppy player

Measured 14 November 2026 for order 14 (`../README.md` says what each tool is): `bun sloppy.ts levels=bygdoy ks=2,4 seeds=30` (timing errors only), `bun obstacles.ts levels=bygdoy ks=2,4 seeds=40`, `bun standing.ts bygdoy`, `bun worstwait.ts bygdoy`, `bun waits.ts`. The sloppy player holds the shield as it holds a direction, each edge off by up to ±k steps. `bun sloppy.ts ks=0` clears all eleven levels 1/1.

Wanted by the order: about 1.5 hearts a run at ±4, at most 2; no Game over at ±2 or ±4; no single jump over 0.4 hearts a try.

## Runs

| Level | k | clear | game over | off route / gave up / time out | hearts lost per run | lives lost per run | median clear (s) |
|---|---|---|---|---|---|---|---|
| bygdoy | ±2 | 30/30 | 0/30 | 0/0/0 | 0.7 | 0.07 | 91 |
| bygdoy | ±4 | 30/30 | 0/30 | 0/0/0 | 1.8 | 0.17 | 113 |

## Where hearts are lost (4-column bins)

| k | place (cols) | what | hearts per run |
|---|---|---|---|
| ±2 | 40–43 | flyer:gull | 0.47 |
| ±2 | 56–59 | flyer:gull | 0.10 |
| ±2 | 160–163 | walker:rat | 0.07 |
| ±2 | 108–111 | fall | 0.03 |
| ±2 | 64–67 | walker:crab | 0.03 |
| ±4 | 40–43 | flyer:gull | 1.03 |
| ±4 | 56–59 | flyer:gull | 0.17 |
| ±4 | 140–143 | fall | 0.13 |
| ±4 | 12–15 | fall | 0.10 |
| ±4 | 60–63 | flyer:gull | 0.07 |
| ±4 | 64–67 | walker:crab | 0.07 |

The gull over the first boathouse's roof (cols 40–43) is most of it: it flies at the height of a man walking on the roof, and the sloppy player walks into its low swoops. A person can wait for it, or walk the sand under the roof past the crab.

## Every jump and ride on its own (40 tries each)

22 jumps and rides, the hops over the balsa bundles among them. Worst hearts a try: ±2 0.00, ±4 0.00. All made without a heart lost: ±2 97.5 %, ±4 97.5 %. The rows are `obstacles-bygdoy.json`.

## Standing and waits

```
bygdoy: clear 80.0 s; standing still 31.9 s (40%): on fixed ground 20.9 s (26%), riding 11.0 s (14%)
```

Standing is 40 % of the scripted clear: the waits for the ferry, the decks and the rafts, and the shield held in the yard (about 2 s for each of the stones it stops). Worst wait on arrival at each wait (`worstwait.ts`; the yard's rows are the whole of each stretch, walking and standing behind the shield):

```
bygdoy
   5.7 s worst, 2.6 s mean: the ferry at the quay (col 11)
   2.1 s worst, 0.3 s mean: out over the water (col 13)
   5.4 s worst, 2.2 s mean: the ferry at the pier (col 18)
   3.9 s worst, 1.5 s mean: Fram's deck level with the gallery (col 76)
   3.3 s worst, 1.1 s mean: Fram's bow up (col 88)
   3.3 s worst, 1.0 s mean: Gjøa's stern up (col 108)
   5.0 s worst, 2.1 s mean: the raft at the shore (col 121)
   4.3 s worst, 1.8 s mean: the reed boat at the rock (col 138)
   3.3 s worst, 1.3 s mean: the first oar out (col 163)
   3.2 s worst, 1.3 s mean: the second oar out (col 164)
   3.2 s worst, 1.3 s mean: the third oar out (col 165)
   3.2 s worst, 1.3 s mean: the fourth oar out (col 167)
   8.0 s worst, 5.6 s mean: through the yard to 3400, the shield up as each sling whirls (col 201)
   5.6 s worst, 4.3 s mean: through the yard to 3544, the shield up as each sling whirls (col 212)
   4.5 s worst, 3.5 s mean: through the yard to 3768, the shield up as each sling whirls (col 221)
```

```
bygdoy: clear 80.0 s; standing still 31.9 s (40%); waits >=1 s: 12, >3 s: 3
   5.3s @col 11 row 19 [the ferry at the quay]
   3.7s @col 76 row 15 [Fram's deck level with the gallery]
   3.2s @col 88 row 14 (riding) [Fram's bow up]
   2.6s @col 123 row 19 (riding) [the raft at its far end]
   2.2s @col 141 row 19 (riding) [the reed boat at its far end]
   2.1s @col 213 row 19 [through the yard to 3544, the shield up as each sling whirls]
   2.1s @col 222 row 19 [through the yard to 3768, the shield up as each sling whirls]
   2.1s @col 210 row 19 [through the yard to 3400, the shield up as each sling whirls]
   standing still within a thrower's reach: thrower@208: 4.2 s, thrower@217: 7.8 s, thrower@226: 3.6 s
```

## Line 1 spot-check after order 14 (±4, 30 runs) against `../after13/`

| Level | clear | game over | hearts lost per run | after order 13 (clear, game over, hearts) |
|---|---|---|---|---|
| langkaia | 28/30 | 0/30 | 1.5 | 27/30, 0/30, 1.5 |
| akerselva | 28/30 | 1/30 | 2.3 | 27/30, 1/30, 2.4 |

Line 1's scripted clears are unchanged (`standing.ts` gives the same seconds as `../after13/standing.txt`).
