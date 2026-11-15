# Decision records for the games

One file per decision that shaped the front page game, Vikingfjorden, the maze and the shared kit.
Each says what was decided, why, what follows from it, and what was considered and not chosen.
Start with [`../games/HANDOVER.md`](../games/HANDOVER.md).

Who decided is stated in each record: **Lars** (the owner, in his own words), or **the planner**
(Claude, acting on Lars's leave to decide). Decisions by the planner are easier to reverse; ask
Lars before reversing one of his.

| # | Decision | Decided by | State |
|---|---|---|---|
| [0001](0001-front-page-is-the-cloth.md) | The front page is the look and the code all three games share | planner, on Lars's request | holds |
| [0002](0002-code-drawn-pixels-no-asset-files.md) | Art is rectangles drawn in code; no image, font or audio files | planner | holds |
| [0003](0003-fixed-body-constants.md) | Run and jump never change; the world and abilities add behaviour | planner | holds |
| [0004](0004-levels-as-data-one-pure-runner.md) | A level is data; one pure runner plays any of them | planner | holds |
| [0005](0005-checking-without-a-player.md) | Scripted players, a reach search, a debug harness and byte-identical screenshots stand in for playtests | planner | holds, with known limits |
| [0006](0006-ten-levels-lars-hansen-line-map.md) | Ten levels spelling LARS HANSEN, on a T-bane line map of Oslo | Lars (ten, Oslo, him); planner (the rest) | holds; extended by 0025 |
| [0007](0007-maze-as-optional-bonus.md) | The maze is a bonus stop, never required; no music; the original kept on a branch | Lars (bonus, no music, keep a copy); planner (the rest) | holds |
| [0008](0008-hearts-lives-enemies-pits.md) | Enemies, hearts, lives and pits | Lars | holds, adjusted by 0017 and 0018; supersedes "nothing kills" |
| [0009](0009-mario-length-levels.md) | Each level about as long and as good as a Mario level | Lars | holds (its clear-time floor adjusted by 0020); supersedes the plan's column counts |
| [0010](0010-benches-dash-bosses.md) | Benches, an earned dash, two bosses: mechanics borrowed, nothing recognisable | Lars (a splash of Hollow Knight); planner (which) | holds |
| [0011](0011-levels-on-demand-60kb.md) | Levels load on demand; the first script stays under 60 kB gzipped | planner | holds; enforced by 0035 |
| [0012](0012-saved-progress.md) | What is saved, under which keys, and how old saves are treated | planner | holds |
| [0013](0013-plan-implement-review.md) | One session plans and reviews, Opus implements, each batch merges and deploys | Lars | holds |
| [0014](0014-personal-details-discreetly.md) | Personal details go in quietly; no addresses, nothing explained | Lars | holds |
| [0015](0015-solid-header-in-viking.md) | The viking game's header is solid, not frosted | implementer, accepted by planner | holds; Lars has not seen it |
| [0016](0016-two-languages-dry-voice.md) | Norwegian and English, in a dry voice | earlier work, kept | holds |
| [0017](0017-game-over-at-a-boss.md) | Game over at a boss goes on from its bench, three lives, the boss whole again | planner (order 12) | holds; adjusts 0008; adjusted by 0033 |
| [0018](0018-the-blinking-fall-and-the-visit.md) | A fall while blinking is free; a visit remembers the cheese and paid skilling | planner (order 12) | holds; adjusts 0008 |
| [0019](0019-the-view-on-an-upright-phone.md) | On an upright phone the viking view stays 240 art px wide | planner (order 12) | holds; adjusted by 0021 |
| [0020](0020-waiting-is-not-length.md) | The scripted clear's floor is 40 s (80 s), now that waits are cut | planner (order 12) | holds; adjusts 0009's measure |
| [0021](0021-the-upright-view-stands-him-two-thirds-down.md) | On an upright screen he stands two thirds down; the ground goes on under him, the far layers sit behind the street | planner (order 13) | holds; adjusts 0019 |
| [0022](0022-the-plough-hurts-only-while-it-moves.md) | The plough hurts only while it moves; standing still it is in his way; running into him shows the round's hint | planner (order 13) | holds |
| [0023](0023-what-hurts-keeps-its-light-after-dusk.md) | After dusk enemies keep a rim of light and eye-shine; the place's name stands on a plate | planner (order 13) | holds; adjusted by 0039 (every enemy's eyes, platforms' tops keep light) |
| [0024](0024-the-shield-is-a-held-stance.md) | The shield: held down on the ground it comes up in six steps and stops throws and charges from in front; a held stance, not a parry | planner (order 14) | holds; adjusted by 0032 |
| [0025](0025-line-2-viking.md) | Line 2: six more levels spelling VIKING, orange, leaving at Stortinget, opened by Nabolaget; stations not built are under construction | planner (plan for line 2, shown to Lars; order 14) | holds; extends 0006; completed by 0030 |
| [0026](0026-the-sledge-he-cannot-stop.md) | Korketrekkeren: on the sledge he cannot stop; the speed is the level's by stretch, the run a stair of narrow ledges; jump or duck | planner (order 15) | holds |
| [0027](0027-the-sea-serpent.md) | The sea serpent: the shield sends its ball back and dazes it, a stomp on its head; its tail jumped; its neck in his way, never a hurt | planner (order 16) | holds; adjusted by 0031 |
| [0028](0028-the-ruins-rise-as-he-passes.md) | Gamlebyen's stones rise as he passes and stay; a level's ground may change its map; the reach search with every stone risen and with none | planner (order 16) | holds |
| [0029](0029-the-hesitating-player.md) | The review's hesitating player; Østensjøvannet's lily pads hold him longer for it | planner (order 16) | holds |
| [0030](0030-the-end-of-line-2.md) | All sixteen built: nothing under construction; VIKING on Gamlebyen's card; the map's line totals, longship and lanterns | planner (order 16) | holds; completes 0025; adjusted by 0031 (the longship at anchor) |
| [0031](0031-the-serpent-made-good.md) | The serpent's fight is the whole quay; its ball flies at his height; true hints; two rises a round, its tail after its ball; presence; the dawn, the torches out, the rune rising to a dragon prow | planner (order 17) | holds; adjusts 0027, 0030 |
| [0032](0032-the-shield-keeps-a-jump-and-the-troll-comes.md) | A jump pressed while the shield is up is kept a tenth of a second; the troll raises its club at a raised shield | planner (order 17) | holds; adjusts 0024 |
| [0033](0033-a-lost-life-at-a-boss.md) | A lost life in a boss's fight never puts him further back than its bench; a flag on the serpent's quay | planner (order 17) | holds; adjusts 0017 |
| [0034](0034-the-sloppy-player-made-honest.md) | The review's sloppy player made honest: four artefacts gone, fresh seeds, every move measured; what that did to line 2's targets | planner (order 17) | holds |
| [0035](0035-the-budget-enforced.md) | The build fails if the first script is over 60 kB gzipped | planner (order 17) | holds; enforces 0011 |
| [0036](0036-drawn-once-and-copied.md) | Stonework and other unchanging drawing is drawn once and copied; `?debug&perf` measures a frame | planner | holds; amended by 0041 |
| [0037](0037-out-to-the-map-after-a-level.md) | After a level the card has one action, to the map, at the station just cleared; any key, a tap, or six seconds | planner (order 18) | holds |
| [0038](0038-valerenga.md) | The tenth station is shown as Vålerenga; its id stays `nabolaget` | planner (order 18) | holds |
| [0039](0039-colour-says-what-a-thing-is.md) | Colour says what a thing is: roles and their palettes (enemies outlined and a quarter larger, platforms' standing tops, pickups, him, the bosses' "now"), held by a test | planner, Lars (order 18) | holds; adjusts 0023 |
| [0040](0040-felt-at-a-glance.md) | Every event answers at once, where it happened, in its role's colour, with a sound and a still answer under reduced motion; the hold after a hit is the picture's only; things to use marked in one cyan; his rim after dusk | planner (order 19) | holds; builds on 0039 |
| [0041](0041-off-the-screen-is-not-drawn.md) | What is off the screen is not drawn; the dark in rectangles, not rows; large unchanging pieces kept as strips, alike shapes stamped; scenery added is drawn so | planner (order 20) | holds; amends 0036 |
| [0042](0042-flat-places.md) | Flat places found by a walk along every route at both sizes and given what the place has, as scenery drawn once and copied; far layers may rise with a climbed view | planner (order 20) | holds; builds on 0039, 0041 |

To add one: copy the shape of an existing file, take the next number, add the row here. To
reverse one: write a new record that says "supersedes 00NN" and mark the old row "superseded by".
