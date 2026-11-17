# Order 29: the encore, and the measures

Measured on 17 November 2026 on branch `the-encore` (from `origin/main` at `88979db`, after order 28). Pictures (outside the
repository) in `~/.cache/claude-scratch-larshansen/o29/shots/`: `sheet/` (Loki's frames at each stage of losing his glamour, and plain),
`strips/` (each tell from its start to the move it tells of: `club-strip.png`, `charge-strip.png`, `bite-strip.png`, and the frames),
`arena/` (the park on arrival, Loki posing, the stage gone plain: 1280 x 800 and 390 x 844, by day and at night), `map/` (the map with
runes missing from both builds, `before/` and `after/`), `map-with-stop/` (every rune: the stop, unseen and seen, both sizes, day and night),
`words/` (the banner in both languages, each line as it is said, the ending card, a hint in both languages, and `every-line.png`, every line
of the encore and its alternatives as bubbles).

## What was built

| Item | Done? |
|---|---|
| (a) The stop and the arena, gated | done: the stop past the longship only with every rune (`levels/kart.ts`); the stage in Middelalderparken (`levels/encore.ts`); `#encore` opens only then (`main.ts`, `levelOpen`) |
| (b) Loki with one borrowed attack and three hits | done: the club (the troll's), the pose, three stomps, a piece off each (`game/loki.ts`, `render/loki.ts`) |
| (c) The other two attacks | done: the charge (the plough's) and the bite (the serpent's); each phase brings in its move first, a missed opening goes on to the next |
| (d) Words | done: banner, waking line, a line a piece, his leaving line, the ending card, four hints; both languages; alternatives (`game/story.ts`, the encore's block) |
| (e) Sound and lights | done: the tells in the bosses' voices, four new stings (`stab`, `snap`, `piece`, `houselights`); the lights sweep, the ball turns, the neon; all plain when he is plain; still with reduced motion |
| (f) Docs | done: ADR 0052, ADR 0050 amended, DESIGN, HANDOVER, the handbook, LEVELS.html (`17-encore`, `kart-encore`, `kart-end` taken again), this folder |

## Tells, against the three bosses'

| | Tell | Steps | Borrowed from | The boss's own |
|---|---|---|---|---|
| The club | raised over his head, in the violet | 60 | the troll's club | `TROLL_STEPS.windup` 60 |
| The charge | on one knee revving, beacons in the violet | 60 | the plough's rev | `PLOUGH_STEPS.windup` 60 |
| The bite | the ring of foam (45 following, 45 holding), in the violet | 90 | the serpent's ring | `SERPENT_STEPS.ring` 90 (its rear 90, 75, 60) |

The shortest of the bosses' tells is 60 steps; none of Loki's is shorter (`levels/encore.test.ts`, by the constants and in play).

## The sloppy and hesitating players (`fresh.ts`, seeds 201 to 260)

| | ±2 | ±4 | ±8 | hesitating ±2 | hesitating ±4 |
|---|---|---|---|---|---|
| clear | 60 of 60 | 60 of 60 | 60 of 60 | 60 of 60 | 60 of 60 |
| hearts a run | 0.08 | 0.65 | 0.72 | 0.08 | 0.67 |
| median time | 23.6 s | 27.0 s | 28.3 s | | |

Where the hearts go: his body as he struts at him (±2: 5 in 60 runs; ±4: 26; ±8: 30), and the club's wave (±4: 13; ±8: 13). Against
the serpent's level (Gamlebyen: ±2 0.47, ±4 1.07 hearts a run for the whole level) the encore is easier, as the order asked ("no harder
than the serpent"). Remember what the sloppy player is: the route's plan (which knows every answer) with a person's timing; a person
who does not yet know which move is coming will lose more.

## No rule of any other level changed

The sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, on `origin/main` (`88979db`, a worktree) and on the branch with every
part of the order in it: every run's record byte-identical (`cmp`).

| Level | md5 of the runs, before and after | ±2 | ±4 |
|---|---|---|---|
| Langkaia | `dd2406a1c3c0` | clear 59/60, 0.15 hearts a run | clear 55/60, 0.77 |
| Nordmarka | `58bfcf501657` | clear 59/60, 0.65 | clear 56/60, 2.00 |
| Bjørvika | `1fdbdf511c68` | clear 60/60, 0.52 | clear 60/60, 1.60 |
| Gamlebyen | `54db73ff6304` | clear 60/60, 0.47 | clear 59/60, 1.07 |

What changed in the shared rules is one line in `play.ts` (`Boss.ends`, which no other boss has) and the page's routing, card and map
for a level with no rune.

## The map

`map.md`: with any rune missing, 40 of 40 pictures byte-identical to `origin/main`'s (20 addresses at two sizes).

## Perf

`perf-390.tsv` and `perf-1280.tsv` (`tools/glance/perf.ts`, the places in `places.tsv`): in the arena at 390 x 844 the most is 2,303
rectangles a frame (Loki posing), at 1280 x 800 2,069 (the club raised). The budget is 15,000.

## Tests, types, builds, budget, front page

From `docs/games/handbook/scripts/review.sh` on the branch's last code:

- `tsc --noEmit` clean in all four; `bun run build` at the root clean.
- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 445 pass (428 after order 28, and the 17 of
  `src/levels/encore.test.ts`), none failing; the viking suite 211 s, the reach search with it as before.
- The first script: 59.34 kB gzipped as vite reports it (59.07 after order 28; GNU `gzip -c` 59,355 bytes). What it gained: the
  stop on the map with every rune (`kartMap`'s width and door, the door in `kartDef`), `#encore` among the routes and its gate,
  `Boss.ends` in `play.ts`, the card for a level with no rune and the best time it keeps. The encore itself is a chunk of its own
  (`encore`, 8.7 kB gzipped, with Loki's rules and drawing), its route another (1.0 kB, only under `?debug&auto`); its words
  are in `feel`'s file (38.22 to about 38.9 kB gzipped).
- The front page: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`. Nothing in `packages/` or `apps/landing` changed.
