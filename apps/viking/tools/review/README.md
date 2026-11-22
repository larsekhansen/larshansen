# The review's tools

The scripts the adversarial review of 14 November 2026 used
(`docs/games/reviews/2026-11-14-adversarial.md`), kept so a change to the rules or a level can be
measured the same way again. They import the game from `../../src` and the kit from
`../../../../packages/*/src`, so they run against whatever the checkout holds. Bun only; Python 3 for
the tables. They are not tests: `bun test` does not run them and the build does not include them.

Run everything from this folder.

| Script | What it does | Run |
|---|---|---|
| `sloppy.ts` | the sloppy player: each level's scripted route through the real rules, every key edge off by up to ±k steps (the shield's key too); with `hesitate=0.2` the hesitating player, which also stands 0.5 to 1.5 s before one move in five (ADR 0029); `RECOVER` holds the ways back a person takes that the route never needs (Bjørvika's net, St. Clement's floor) | `bun sloppy.ts levels=radhuset ks=2,4 seeds=30 [hesitate=0.2] out=out/x.jsonl` |
| `tryroute.ts`, `reachone.ts`, `tune-bjorvika.ts` | for building a level: play one route once and print where each move began; run one level's reach and dead-end search as the tests' worker does (both worlds for a level whose stones rise); set Bjørvika's beats so its route meets each hook, sheet, gust and shower as it comes | `bun tryroute.ts bjorvika BJORVIKA BJORVIKA_ROUTE`, `bun reachone.ts gamlebyen`, `bun tune-bjorvika.ts` |
| `runall.sh` | the whole study: timing errors ±2/±4/±8 (`out/t-*.jsonl`), ±4 with mistakes (`out/m-*.jsonl`), every jump alone (`out/obstacles-*.json`); four processes at a time, 13 to 25 min on the Pi (more when runs go their full length) | `./runall.sh` |
| `summary.py`, `agg.py`, `hurts.py` | the tables of the review's section A from those files | `python3 summary.py` |
| `obstacles.ts` | every move of every route on its own (whatever it is called; walks, waits and sitting aside), 40 tries from the perfect run's state on fresh seeds; marks the moves in the air over water or a pit and lists any over 0.4 hearts a try (`allmoves.ts` is now this) | `bun obstacles.ts levels=langkaia ks=2,4 seeds=40` |
| `fresh.ts`, `fresh_summary.py` | the sloppy or hesitating player on fresh seeds (101 on), and section A's tables from those runs (`fs-`, `fh-`, `l1s-`, `l1h-` files in a folder) | `bun fresh.ts levels=gamlebyen ks=2,4 seeds=100 first=101 out=<dir>/fs-gamlebyen.jsonl`, `python3 fresh_summary.py <dir>` |
| `serpent2.ts`, `fighttime.ts`, `nobench.ts`, `serpent-walkin.ts` | the serpent against twenty strategies (Game over and "Try again" included); the route's own fight with timing errors; a life lost at the serpent without sitting at its bench; a walk-in past its first place | `bun serpent2.ts seconds=600`, `bun fighttime.ts` |
| `onemove.ts`, `resume-why.ts`, `phases.ts`, `mixed.ts`, `shieldcases.ts`, `statues.ts`, `shots-lang.ts`, `contact.py` | the review of line 2's other tools: one move tried alone, what hurts a route resumed from a flag, each boss phase's step (for screenshot addresses), Gamlebyen's dead-end search in mixed stone states (about 40 minutes), line 1's bosses with the shield, the room round every statue, screenshots in Norwegian, a contact sheet | as in `docs/games/reviews/2026-11-15-line-2.md` |
| `resume.ts` | the perfect route picked up from every flag and bench at six clocks | `bun resume.ts` |
| `deadends.ts` | the dead-end graph search, as the review ran it (the test suite now finds dead ends in the reach search's own graph: `deadEnds` in `src/game/reach.ts`, run in `reach.worker.ts`) | `bun deadends.ts radhuset` |
| `standflag.ts`, `savepoints.ts`, `throwers.ts` | throwers against flags, benches and the route's waits | `bun standflag.ts` |
| `bosses.ts`, `bossref.ts` | naive strategies against the troll, the plough and the serpent; the perfect fights' timing | `bun bosses.ts [nordmarka|nabolaget|gamlebyen]` |
| `waits.ts`, `worstwait.ts`, `quiet.ts` | the perfect route's standing still; the worst wait on arrival at each wait; quiet stretches | `bun waits.ts` |
| `standing.ts` | the perfect route's standing still, split into standing on the map's own ground and standing on what is not the map's: moving ground, the bells on their beat ("riding") | `bun standing.ts [level...]` |
| `mazesloppy.ts`, `mazegeo.ts` | the maze with a sloppy player; stones and arrivals against snakes and sliders | `bun mazesloppy.ts ks=0,2,4 seeds=20` |
| `edge.ts`, `edgecmp.py` | the edge's forgiveness (order 23, ADR 0048): the reach search with and without a longer forgiveness, and a late jump off an edge as a move of its own (`--where` names the spots only the longer one reaches); the sloppy player's runs with 6 and with 10 steps compared seed by seed | `bun edge.ts [level ...] [--where]`, `python3 edgecmp.py <runs with 6> <runs with 10>` |
| `edgeplace.ts`, `coyote.ts` | the edge's places (order 24): one seed replayed with 6 and 10 steps of forgiveness side by side, where the runs part, what the late jump did there and every heart after (`--steps`, `--after=<steps>`); the sloppy player on fresh seeds with the forgiveness set | `bun edgeplace.ts langkaia 4 205 --steps`, `bun coyote.ts coyote=6 levels=langkaia ks=2,4 seeds=60 first=201 out=<file>` |
| `urls.ts` | screenshot addresses at six standable spots per level | `bun ../../../../tools/shots.ts <dir> $(bun urls.ts 6)` with `apps/viking` built and served on 5181 |

`bun sloppy.ts ks=0` must print `clear 1/1` for all sixteen levels: at k = 0 the harness reproduces the
scripted clear exactly. If it does not, a route or the harness has drifted from the rules.

`o33/` holds order 33's (the lane behind the church, and room to breathe): each item done or not, and the measures (`after.md`); the rectangles a frame at 390 x 844 at order 32's places and every stretch of Vålerenga's lane by night and by day (`places.tsv`) on `origin/main` (`perf-390-before.tsv`), on the branch with item 1 alone (`perf-390-after-lane.tsv`, every place) and on its last build (`perf-390-after.tsv`: Vålerenga, the levels item 2 recoloured, Langkaia and the map).
`o32/` holds order 32's (lights after dark): the table of every light in every level, the encore and the map, and its decisions (`before.md`); each item done or not, and the measures (`after.md`); the rectangles a frame at 390 x 844 by day and at night on `origin/main` and the branch (`perf-390-before.tsv`, `perf-390-after.tsv`, `places.tsv`).
`o31/` holds order 31's (loose ends and a second look): each item done or not, and the measures (`after.md`); the words orders 21 to 30
added, in both languages, where each was seen at 360 wide (`words.md`); the second look's table of flat things (`before.md`); the rectangles a
frame at 390 x 844 on `origin/main`, after items 1 to 5 and on the branch's last build, at order 30's places, the walk's and the shafts'
(`perf.md`, `perf-390-before.tsv`, `perf-390-after5.tsv`, `perf-390-final.tsv`, `places.tsv`).
`o30/` holds order 30's (small debts): each debt paid or not, and the measures (`after.md`); every enemy kind met in more than one level, its
level's two neons and how far each is from that level's fields (`leans.tsv`, from `../glance/leanplaces.ts`); the rectangles a frame against
order 29's places and four more, on the branch and on `origin/main` (`perf-390.tsv`, `perf-390-before.tsv`, `places.tsv`).
`o29/` holds order 29's (the encore): the sloppy and hesitating players at the encore, the run files of four levels byte-identical,
the tells against the bosses', the map's pictures with runes missing byte-identical (`map.md`, `mapurls.sh`) and the arena's rectangles a
frame (`after.md`, `perf-390.tsv`, `perf-1280.tsv`, `places.tsv`). The encore is in `common.ts`'s levels (with the pole and the shield).
`o18/`, `o19/` and `o20/` hold those orders' numbers (order 20's: every level's rectangles a frame before and after at its
walk's places, `perf.md`, and the flat places marked by `../glance/flat.py` and what each was given, `flat.md`). `o21/` holds order 21's: every screen state at five phone sizes before and after (`before.md`, `after.md`, made by
`../glance/hand.ts` and `hand-table.ts`), and the rectangles a frame of every level's walk (`perf.md`). `o28/` holds order 28's: every thing still flat and the decision for each (`before.md`), what became of each, the shots' trail, the ground's own band and the worktree's first script (`after.md`), the rectangles a frame against order 27's table and the line map's before and after (`perf.md`, `perf-after.tsv`). `o27/` holds order 27's: the run files byte-identical before and after, the tests and the first script (`after.md`), the rectangles a frame against order 26's table (`perf.md`, `perf-after.tsv`). `o26/` holds order 26's: every surface of the lane before and what it became (`before.md`), the measures (`after.md`: the
identical runs, tests, budget, the front page, figures against the ground, the surfaces' local contrast), the rectangles a frame
against order 23's table (`perf.md`, `perf-after.tsv`), and each level's ground against the roles before and after
(`ground-after.json` here and `../../src/alive/ground-before.json`, which the palette test reads, both from `../glance/ground.ts`). `o25/` holds order 25's: what is still drawn in the old style, which is scenery, each with its reason (`old-style.md`), the rectangles a frame against order 23's table (`perf.md`), and the identical runs, tests and budget (`after.md`). `o24/` holds order 24's: the edge place by place and the tables with 6, 8 and 10 steps (`sloppy-edge.md`), the rectangles a frame against order 23's code (`perf.md`), the identical runs, tests and budget (`after.md`), and what is still drawn in the old style (`old-style.md`). `o23/` holds order 23's: the reach search and the sloppy player with the edge's longer forgiveness (`reach-edge.txt`,
`sloppy-edge.md`), the rectangles a frame against order 22's code (`perf.md`), the identical runs, tests and budget
(`after.md`), and every drawing still in the old style (`old-style.md`). `o22/` holds order 22's:
every yellow the game paints and what became of each (`yellows.md`, from `../glance/yellows.ts`), the rectangles a frame
against order 21's code (`perf.md`), and the identical sloppy runs, tests and budget (`after.md`).
`line2-after/` holds line 2 after order 17, measured with the tools as order 17 left them (ADR 0034: four artefacts of the sloppy player were found and fixed, so earlier numbers are not comparable with these): the outcome tables and where hearts go for line 1 and line 2 on fresh seeds (`tables.md`), every move on its own (`obstacles.txt`, `obstacles-<level>.json`), the serpent's strategies and fight, Gamlebyen's stones in 52 worlds of risen and unrisen stones, no dead end (`mixed.txt`), and three line 1 levels run on the code before order 17 (the same numbers within a run in a hundred). `line2/` holds line 2's (Bygdøy, order 14; Vigelandsparken, Korketrekkeren and Østensjøvannet, order 15, with Bygdøy again; Bjørvika, Gamlebyen, the serpent and the hesitating player, order 16): the sloppy player at ±2 and ±4, every jump and ride on its own (`obstacles.ts` also tries the sledge's stretches, the statues' steps and the lake's pad-to-pad leaps), the standing and the waits, and a line 1 spot-check; `summary.md` there has the tables. `before/` holds the review's own numbers (the tables, the per-jump results, the dead ends, the boss
strategies and waits as measured at `b5d1a3a`); `after/` the same after order 12; `after13/` the same
after order 13, with `standing.txt` (the routes' standing still split into fixed ground and riding). The raw `.jsonl`
runs are not kept; `out/` is where a new run writes them and is not committed.

Limits: the sloppy player is the route's plan with a person's timing, not a person. It never finds a
better line, and after a fall to a place the route never visits it stops ("off route") rather than
improvising.
