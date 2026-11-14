# The review's tools

The scripts the adversarial review of 14 November 2026 used
(`docs/games/reviews/2026-11-14-adversarial.md`), kept so a change to the rules or a level can be
measured the same way again. They import the game from `../../src` and the kit from
`../../../../packages/*/src`, so they run against whatever the checkout holds. Bun only; Python 3 for
the tables. They are not tests: `bun test` does not run them and the build does not include them.

Run everything from this folder.

| Script | What it does | Run |
|---|---|---|
| `sloppy.ts` | the sloppy player: each level's scripted route through the real rules, every key edge off by up to ±k steps | `bun sloppy.ts levels=radhuset ks=2,4 seeds=30 out=out/x.jsonl` |
| `runall.sh` | the whole study: timing errors ±2/±4/±8 (`out/t-*.jsonl`), ±4 with mistakes (`out/m-*.jsonl`), every jump alone (`out/obstacles-*.json`); four processes at a time, 13 to 25 min on the Pi (more when runs go their full length) | `./runall.sh` |
| `summary.py`, `agg.py`, `hurts.py` | the tables of the review's section A from those files | `python3 summary.py` |
| `obstacles.ts` | every jump and ride of every route on its own, 40 tries from the perfect run's state | `bun obstacles.ts levels=langkaia ks=2,4 seeds=40` |
| `resume.ts` | the perfect route picked up from every flag and bench at six clocks | `bun resume.ts` |
| `deadends.ts` | the dead-end graph search, as the review ran it (the test suite now finds dead ends in the reach search's own graph: `deadEnds` in `src/game/reach.ts`, run in `reach.worker.ts`) | `bun deadends.ts radhuset` |
| `standflag.ts`, `savepoints.ts`, `throwers.ts` | throwers against flags, benches and the route's waits | `bun standflag.ts` |
| `bosses.ts`, `bossref.ts` | naive strategies against the troll and the plough; the perfect fights' timing | `bun bosses.ts` |
| `waits.ts`, `worstwait.ts`, `quiet.ts` | the perfect route's standing still; the worst wait on arrival at each wait; quiet stretches | `bun waits.ts` |
| `mazesloppy.ts`, `mazegeo.ts` | the maze with a sloppy player; stones and arrivals against snakes and sliders | `bun mazesloppy.ts ks=0,2,4 seeds=20` |
| `urls.ts` | screenshot addresses at six standable spots per level | `bun ../../../../tools/shots.ts <dir> $(bun urls.ts 6)` with `apps/viking` built and served on 5181 |

`bun sloppy.ts ks=0` must print `clear 1/1` for all ten levels: at k = 0 the harness reproduces the
scripted clear exactly. If it does not, a route or the harness has drifted from the rules.

`before/` holds the review's own numbers (the tables, the per-jump results, the dead ends, the boss
strategies and waits as measured at `b5d1a3a`); `after/` the same after order 12. The raw `.jsonl`
runs are not kept; `out/` is where a new run writes them and is not committed.

Limits: the sloppy player is the route's plan with a person's timing, not a person. It never finds a
better line, and after a fall to a place the route never visits it stops ("off route") rather than
improvising.
