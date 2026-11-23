# Resources: tools, addresses, pages, references, where things live

## Where things live on the Pi

| Thing | Where | Note |
|---|---|---|
| The repository | `/home/lars/projects/larshansen` | Implementers work here on a branch |
| The live webroots | see `infra/README.md` | Written only by the deploy |
| Front page references | `/tmp/shots-before-jernhaugen/` (28 PNGs), addresses in `/tmp/shots-urls.txt` (the `:5180` lines) | **Lost on reboot.** HANDOVER says how to re-create |
| Finished rounds' pictures and working files | `/home/lars/.cache/claude-scratch-larshansen/` | Safe to delete; `ref/` holds the cloned reference games |
| A session's scratchpad | `/tmp/claude-1000/<project>/<session>/scratchpad/` | RAM; gone with the session |
| Private notes about Lars's places | the session memory directory, `lars-oslo-personal-places.md` | Never in the repository (ADR 0014) |
| Lars's own file | `post/gemini-gamedesign-nov-16-2026` | Untracked on purpose; ask before committing |

## Pages published for Lars (private artifacts on his claude.ai account)

| Page | Address | Made from | Update when |
|---|---|---|---|
| The levels as built | https://claude.ai/artifact/6WbxEBdR12SnkGk3Ktoi7r | `docs/games/LEVELS.html` with `docs/games/shots/*.png` (20 files), root `docs/games` (absolute path) | Any level's picture or the legend changes |
| The pixel study (three ways) | https://claude.ai/artifact/4QQTQh88FBinev3Z2MhRWP | `docs/games/GRAIN.md`'s content as a page, with `docs/games/shots/grain/*.png` | Not again: the choice is made (ADR 0045) |
| Every figure, as redrawn | https://claude.ai/artifact/2zVH3Eq6cauR3qyigeijrf | Since order 35 (and the maze's since order 36): `bun tools/figures.ts <dir>` in `apps/viking` (a sheet a figure and `figures.json` with each one's name in both languages, its levels and its states); before, the implementers' frame sheets | After every round that redraws figures (not republished since order 27) |

To update a page from a later session, pass its address as `url` when publishing, after reading
it once. The figures page was assembled by a small script from the hand-back folders; rebuild
it the same way: group the sheets (him and small things, enemies, bosses, harmless), one full
width picture per figure inside a sideways-scrolling box, `image-rendering: pixelated`.

## Debug addresses (the harness)

All on `/viking/` with `?debug`. HANDOVER, "Checking", has the full account.

| Add | Does |
|---|---|
| `&level=<id>&x=<px>&steps=N&sky=day\|night` | Start in a level at a place, step N times, draw one frame |
| `&keys=…` | Hold keys for those steps |
| `&auto&steps=N` | Play the scripted route in the page |
| `&perf` (`&on=<event>&skip=6`) | Count rectangles and copies in a frame |
| `&steps=0&on=<event>&skip=N` | A picture of the moment: stepped to the event (`stomp`, `rune`, `hurt`, `boss:hit` ...) and N steps on (order 27) |
| `&reduced` | Reduced motion |
| `&card` | The level's card at its end over it, as its rune would show it, with the progress pretended (`&cleared=…`): line 1's ending on Vålerenga with every rune of line 1, line 2's on Gamlebyen with all, the encore's (order 30) |
| `&touch` | Show the touch pad without a touch screen (order 21) |
| `&where=x,y` / `&look=x,y` / `&strip` | Camera and crop helpers |
| `&grain=0\|1\|2\|3\|depth` | The pixel study (order 22); a chunk of its own |
| `&fall=<steps>` | The falling feather (order 25) |
| `&shield` | Give him the shield |
| `&touch&note=pole\|shield\|sledge` | The pad's note of what just changed on the help line, as the page shows it (order 33): the pole's comes under Holmenkollen's card otherwise |
| `&say=<key>` | The level's boss says that line of its words in its bubble (order 33): `missBite` at the encore, which needs two hits otherwise; `shout1` to `shout4` his shouted lines (order 34: under the harness the music never saw him wake, so they show only so) |
| `&told&level=N&steps=S[&bot=keys\|pointer\|finger][&portals]#jernhaugen` | The maze inside the page, stepped (order 36): its own harness, `packages/maze/src/debug.ts` (also `walk`, `at`, `records`, `ghost`, `levels`, `perf&post`); the same on maze.larshansen.dev without `/viking/`, `told` or the hash. `bot=finger` plays the level with synthetic touches through the scene's own touch code. Step 0 is black (the fade): take 30 |
| `&safe=left\|right\|sides\|upright` (or `t,r,b,l` in CSS pixels) | A pretended notch and home bar (order 37), in both pages and the maze in them: every stylesheet reads a safe area as `var(--safe-*, env(safe-area-inset-*))`. With `&touch` for the pad |
| `&live=<frames>` | After the stepped start, that many frames as the page runs them, a sixtieth of a second each (the camera easing, which a stepped page snaps), and the camera's move in each on the help line (order 37): `?debug&told&touch&pole&safe=right&level=bygdoy&auto&steps=1923&live=80#bygdoy` |
| `&walkin=N`, `&out`, `&after=N` | Through a door once the page has loaded (N steps holding up), out of the maze by its own way out, and N steps of what he comes back to (order 36): `?debug&told&level=nordmarka&x=2372&steps=1&walkin=60&out&after=30#nordmarka` |
| `&music=band\|drums\|bass\|riff\|lead\|intro\|plain` (or a list, `drums,bass`) | The level's music at once, whatever its boss does, only those parts (order 34: the encore's tune). Sound starts with the first key or touch; headless Firefox plays none |

Level ids: `langkaia`, `akershus`, `radhuset`, `slottet`, `holmenkollen`, `akerselva`,
`nordmarka`, `stortinget`, `ekeberg`, `nabolaget` (shown as Gamle Oslo, ADR 0055; Vålerenga from order 18 to 33), `bygdoy`,
`vigelandsparken`, `korketrekkeren`, `ostensjovannet`, `bjorvika`, `gamlebyen`.

Pictures: `bun tools/shots.ts [--size=390x844] [--wait=30000] [--lang=nb-NO] <out-dir> <url>…` from the root (`--lang`: the game in Norwegian, order 30),
against `bun run preview` of the built app (ports 5184 to 5189; 5180 for the front page). Since order 35 a waited picture is taken as soon as a
`?debug` page says it has drawn (`--wait` is the most it waits), and a picture with nothing drawn in its middle is named BLANK (the run ends
with 3). The encore mid-fight with a shouted line: `?debug&told&level=encore&auto&steps=330#encore` (or 440, 760, 1030), `--wait=30000`.

## Hearing the encore's tune (order 34)

Nobody can hear anything on the Pi: headless Firefox plays no sound. For Lars, on a phone or a computer with sound on (the header's
speaker button), after a first tap or key (browsers allow sound only then):

- The encore as it plays, with every rune pretended: https://larshansen.dev/viking/?debug&told&cleared=all#encore (walk onto the stage:
  the intro as Loki wakes, the band, a layer fewer with each hit, the plain notes at the end).
- The loop at once, a part at a time: https://larshansen.dev/viking/?debug&told&level=encore&music=band#encore, and `music=drums`, `bass`,
  `riff`, `lead`, `intro`, `plain`, or a list such as `music=drums,bass`.

The notes are written out in `apps/viking/src/game/tune.ts` and in `apps/viking/tools/review/o34/after.md`.

## Tools in the repository

| Where | What |
|---|---|
| `tools/shots.ts` | Headless Firefox screenshots; names blank ones (order 35) |
| `tools/png.ts` | Reads and writes PNGs without a browser (order 35: `shots.ts` looks for blank pictures with it, `figures.ts` writes its sheets) |
| `apps/viking/tools/figures.ts` | Every figure the game draws (order 35): a PNG sheet each at four times size, states in rows, no words in the pictures, and `figures.json` (each one's name in English and Norwegian, its levels, its states in row order, since order 37 each `{ en, nb }`, and a prop's pieces' keys in `pieces`), from the game's tables (`src/alive/figures.ts`; `alive/figures.test.ts` holds that every kind a level uses is listed and named). Since order 36 the bosses and Loki have the outline the page gives them in each state, and the maze's figures are on it (`maze-*.png`, met in `jernhaugen`). `bun tools/figures.ts <dir>`, about a minute and a half; nothing it writes is committed |
| `packages/maze/tools/runs.ts` | The maze's rules held step for step (order 36): the scripted player on every level of any checkout, both speeds, both ways where there are teleport stones, each run fingerprinted; `--ghosts=<file>` writes the ghosts, `--replay=<file>` reads another checkout's back. `bun packages/maze/tools/runs.ts [<checkout>]` |
| `packages/maze/src/reduced.test.ts`, `warning.test.ts`, `joins.test.ts` | The maze (order 36): nothing blinks with reduced motion (since order 37 also the scene itself, drawn through a curse, a level's end and its card: no shake, nothing round the view, the fade a little a step); nothing harmless in the warning red or the curse's reds; the joins with its two pages (the feather the fjord reads, records and ghosts per page, the mute) |
| `packages/maze/src/heading.test.ts` | Which of his drawings the maze shows (order 37): no steady diagonal at any angle changes it more than once (keys, a mouse, a jittering finger), a corridor's way taken in a few steps, standing keeps it, his ghost's walk by distance |
| `apps/viking/src/game/wayout.test.ts` | The maze's way out inside the page (order 37), on a stand-in history: Back where the way in made an entry, the line map where it did not or Back does not answer |
| `apps/viking/tools/facts.ts` | Writes LEVELS.html's FACTS block from the levels |
| `apps/viking/tools/pictures.ts`, `pictures.tsv` | Retakes LEVELS.html's pictures |
| `apps/viking/tools/review/` | The sloppy and hesitating players, reach and dead-end checks, boss studies, `edgecmp.py`; one folder of results per order (`o18` … `o31`); a README |
| `apps/viking/tools/glance/diffcrop.py` | Before and after of what changed (order 28): two folders of the same addresses from two builds, each pair cropped to the pixels that differ, side by side |
| `apps/viking/tools/glance/` | Contact sheets (`sheet.py`, `enemyshots.ts`, `platformshots.ts`), the level walk (`walk.ts`, `strips.ts`), `perf.ts` (since order 35 every place in one browser, about two seconds a place; `--each` a browser a place), `flat.py` (flat places), `frames.ts` and `framesheet.py` (frame sheets: since order 27 each figure glammed, natural and its ending), `stomp.ts` (a stomp's strip of frames), `invasion.ts` (where the invaders' scenery may stand), `tones.ts` (which tones pass the palette test), `yellows.ts`, `hand.ts` (phone states), `haze.ts`, `fore.ts` |
| `apps/viking/src/render/palette.test.ts` | The colour rules as a test |
| `apps/viking/src/game/frame.test.ts` | He is never under a touch button, all routes, five sizes |
| `apps/viking/src/render/reduced.test.ts` | Nothing blinks with reduced motion (order 30; since order 31 by drawing, not by reading the source): every level's scenery across the whole level and every thing in it as the route finds it, recorded call by call at several steps of the clock with the world held, as in a browser; bosses, ledges' warnings, the map; the cards' CSS; since order 32 jumpers and the kit's carriers recorded where they are, and what `render/feel.ts` draws |
| `apps/viking/src/render/lights.test.ts`, `lightcensus.ts`; `apps/viking/tools/glance/lights.ts` | After dark every light is lit and nothing else glows (order 32, ADR 0054): a census of every light every scene registers, by the function that registers it, and what a later pass draws over it; `bun tools/glance/lights.ts [--sky=night\|evening\|twilight\|own] [--levels=a,b] [--json]` prints it |
| `apps/viking/src/render/night.test.ts` | Vålerenga's lane's dark, kept as paths, against `drawNight` pixel by pixel in a stand-in canvas that fills rectangles, paths and clips; the lane's night still with reduced motion (order 33) |
| `apps/viking/src/render/warning.test.ts` | Harmless things keep off the warning red: every view of every level, what he meets with the paint on top, no more than 12 pixels within 10 of it but by name (order 33; the props piece by piece in `alive/props.test.ts`); since order 34 the scenery and the ground too, each far layer washed by its haze, no more than 24 pixels a view; since order 35 every light a level registers (none within 10, any within 12 named: Bjørvika's crane lights), and the two tests share one walk |
| `apps/viking/src/game/tune.test.ts` | The encore's tune (order 34, ADR 0055): deterministic, whole bars, every note's range and volume, a layer fewer a hit, the plain notes after the third, silence muted or with no sound, the audition, the shouted lines only while he struts or poses |
| `apps/viking/src/game/words.test.ts` | Every word kept by language, in every module and every level, in both languages with the same keys, lines and arguments (order 31, ADR 0016) |
| `apps/viking/src/levels/lazy.test.ts` | What the first script draws without `feel`'s file (ADR 0053) |
| `apps/viking/tools/glance/leanplaces.ts` | Every enemy kind met in more than one level: where, its level's two neons and how far each is from that level's fields, by day and under its sky; the addresses of the pictures in place (order 30) |
| [`scripts/review.sh`](scripts/review.sh), [`frontgate.sh`](scripts/frontgate.sh), [`cmpfront.py`](scripts/cmpfront.py) | The planner's review of a hand-back. They carry one session's scratch path in `S`: change it |

## Reference games and what was taken from them

Read for technique and numbers only. **No code and no art was copied**; both big ones are GPL 3
and do not fit this repository. The record:
[`../research/2026-11-16-reference-games.md`](../research/2026-11-16-reference-games.md).

| Game | Source | Read for | What we did with it |
|---|---|---|---|
| Open Surge | github.com/alemart/opensurge | Parallax: many layers at many speeds, drift, strips for a receding plane, layers in front | ADR 0047 (strips, split rows, things in front) |
| Shattered Pixel Dungeon | github.com/00-Evan/shattered-pixel-dungeon | Enemy readability: dull dark floors, bright figures, drop shadows, state icons, frame counts | Haze (0044), shadows and frames (0046), the "!" mark, way 3 (0045) |
| Celeste Classic, C port | github.com/lemon32767/ccleste | How a jump feels: coyote time, buffer, apex hang, freeze frames | ADR 0048 (edge forgiveness); the apex hang not taken (ADR 0003) |

Clones are in `~/.cache/claude-scratch-larshansen/ref/` with `stats.py` (saturation, brightness
and colour counts of a folder of PNGs).

Lars's own references, from `post/`: the same two games, named by an AI search assistant; and
his statement that the games are for him and friends, never sold.

## Assets

Everything drawn is drawn in code: rectangles in the old style, per-pixel letter maps with
named tone ramps since ADR 0045 (`apps/viking/src/alive/`, `render/looks.ts`, each level's
file). There are no image files in the game. Sound is synthesised in the page; there are no
audio files (the old maze's commercial recording was removed: `docs/games/PLAN.md`). Fonts are
the system's. The only images in the repository are screenshots for the docs
(`docs/games/shots/`).

## People and accounts

- GitHub: `larsekhansen/larshansen`, public. `gh` is logged in on the Pi.
- Deploy: a self-hosted runner on the Pi (`.github/workflows/deploy.yml`), triggered by a push
  to `main`.
- Commits: the planner signs `Co-Authored-By: Claude Fable 5.2`; implementers
  `Claude Opus 5.5`.
