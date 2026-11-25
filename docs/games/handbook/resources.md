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
| `&natural` | Every invader drawn as its natural self (as the rune's ring leaves it), for a picture of a figure in place plain beside the glammed one (order 38) |
| `&card` | The level's card at its end over it, as its rune would show it, with the progress pretended (`&cleared=…`): line 1's ending on Vålerenga with every rune of line 1, line 2's on Gamlebyen with all, the encore's (order 30) |
| `&touch` | Show the touch pad without a touch screen (order 21) |
| `&where=x,y` / `&look=x,y` / `&strip` | Camera and crop helpers |
| `&grain=0\|1\|2\|3\|depth` | The pixel study (order 22); a chunk of its own |
| `&fall=<steps>` | The falling feather (order 25) |
| `&shield` | Give him the shield |
| `&touch&note=pole\|shield\|sledge` | The pad's note of what just changed on the help line, as the page shows it (order 33): the pole's comes under Holmenkollen's card otherwise |
| `&say=<key>` | The level's boss says that line of its words in its bubble (order 33): `missBite` at the encore, which needs two hits otherwise; `shout1` to `shout4` his shouted lines (order 34: under the harness the music never saw him wake, so they show only so) |
| `&told&level=N&steps=S[&bot=keys\|pointer\|finger][&portals]#jernhaugen` | The maze inside the page, stepped (order 36): its own harness, `packages/maze/src/debug.ts` (also `walk`, `at`, `records`, `ghost`, `levels`, `perf&post`); the same on maze.larshansen.dev without `/viking/`, `told` or the hash. `bot=finger` plays the level with synthetic touches through the scene's own touch code. Step 0 is black (the fade): take 30 |
| `&where=<wx>,<wy>` | Where that world point is on the screen, written into the picture's two bottom-left pixels (x as red and green, then y): a script crops round it (order 19; order 40 measured every tell with it) |
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
| `apps/viking/tools/figures.ts` | Every figure the game draws (order 35): a PNG sheet each at four times size, states in rows, no words in the pictures, and `figures.json` (each one's name in English and Norwegian, its levels, its states in row order, since order 37 each `{ en, nb }`, and a prop's pieces' keys in `pieces`), from the game's tables (`src/alive/figures.ts`; `alive/figures.test.ts` holds that every kind a level uses is listed and named). Since order 36 the bosses and Loki have the outline the page gives them in each state, and the maze's figures are on it (`maze-*.png`, met in `jernhaugen`). Since order 38 what a look draws plain (a ripple, a splash, ballast) is left without an outline, as the page leaves it, and the maze's raven is drawn whole. `bun tools/figures.ts <dir>`, about half a minute; nothing it writes is committed |
| `packages/maze/tools/runs.ts` | The maze's rules held step for step (order 36): the scripted player on every level of any checkout, both speeds, both ways where there are teleport stones, each run fingerprinted; `--ghosts=<file>` writes the ghosts, `--replay=<file>` reads another checkout's back. `bun packages/maze/tools/runs.ts [<checkout>]` |
| `packages/maze/src/reduced.test.ts`, `warning.test.ts`, `joins.test.ts` | The maze (order 36): nothing blinks with reduced motion (since order 37 also the scene itself, drawn through a curse, a level's end and its card: no shake, nothing round the view, the fade a little a step); nothing harmless in the warning red or the curse's reds; the joins with its two pages (the feather the fjord reads, records and ghosts per page, the mute) |
| `packages/maze/src/heading.test.ts` | Which of his drawings the maze shows (order 37): no steady diagonal at any angle changes it more than once (keys, a mouse, a jittering finger), a corridor's way taken in a few steps, standing keeps it, his ghost's walk by distance |
| `apps/viking/src/game/wayout.test.ts` | The maze's way out inside the page (order 37), on a stand-in history: Back where the way in made an entry, the line map where it did not or Back does not answer |
| `apps/viking/tools/facts.ts` | Writes LEVELS.html's FACTS block from the levels |
| `apps/viking/tools/pictures.ts`, `pictures.tsv` | Retakes LEVELS.html's pictures |
| `apps/viking/tools/review/` | The sloppy and hesitating players, reach and dead-end checks, boss studies, `edgecmp.py`; one folder of results per order (`o18` … `o31`); a README |
| `apps/viking/tools/glance/diffcrop.py` | Before and after of what changed (order 28): two folders of the same addresses from two builds, each pair cropped to the pixels that differ, side by side |
| `packages/pixelkit/src/text.test.ts` | A bubble keeps off the safe sides (order 37); since order 42 it has no edge unless a page asks for one (the front page never does), and asked, a line a pixel wide |
| `apps/viking/tools/glance/` | Contact sheets (`sheet.py`, `enemyshots.ts`, `platformshots.ts`), the level walk (`walk.ts`, `strips.ts`), `perf.ts` (since order 35 every place in one browser, about two seconds a place; `--each` a browser a place), `flat.py` (flat places), `frames.ts` and `framesheet.py` (frame sheets: since order 27 each figure glammed, natural and its ending), `stomp.ts` (a stomp's strip of frames), `invasion.ts` (where the invaders' scenery may stand), `tones.ts` (which tones pass the palette test), `yellows.ts`, `hand.ts` (phone states; since order 41 `--lang=nb-NO`), `haze.ts`, `fore.ts` |
| `apps/viking/src/render/palette.test.ts` | The colour rules as a test; since order 41 also what is drawn over a level against every level's ground under every sky (the pad's words at rest, pressed and dimmed, read from the stylesheet; the plate, the help line, a bubble's words; the "!" and the edge arrow) |
| `apps/viking/src/levels/kart.test.ts` | The line map's boards under its stations never meet one another, at a phone's width upright and on its side and on a laptop, with best times or without (order 41); since order 42, on a touch screen they keep clear of the pad's bottom row and, at the line's start, of a notch, walking him the whole line as the page frames the map (`frame` with the pad's room), at 390 x 844, 844 x 390, 360 x 640 and 667 x 375 with and without a notch, and the lift that costs is at most 48 px |
| `apps/viking/tools/review/o42/before.md` | What is in the viking page's first script, module by module (bytes, own gzip, share), and what each is needed by (order 42); how it was read: the scratch scripts in `~/.cache/claude-scratch-larshansen/o42/bin/` (`stats.config.ts`, a build that writes each chunk's modules and the import graph; `table.py`, `who-uses.py`, `exported-only.py`, `modtable.py`; `logserve.ts` and `requests.sh`, what the page asks for as it opens) |
| `apps/viking/tools/review/o41/before.md` | Every screen that is not a level on one table (order 41): how each element was photographed and measured; the scratch tools (`screens.ts`, a copy of `hand.ts` that writes every element's place; `measure.py`; `overcontrast.ts`) are in `~/.cache/claude-scratch-larshansen/o41/bin/` |
| `apps/viking/src/alive/far.ts` | The far view's brush (order 43): `farPiece` paints a landmark's silhouette once in its material's tones and keeps it, `drawFar` copies it into a far layer with its foot on a world y and lights about half its windows after dusk; `farPieces` lists every piece painted, for tools |
| `apps/viking/src/alive/langkaiafar.ts` | Langkaia's own far view (order 44): Hovedøya, Lindøya with its cabins, two islets, Ekeberg's hillside; in `feel`'s file, asked for through the props kit's hook (`TEXTURED.prop("islands")`), as Langkaia is the first script's level |
| `apps/viking/tools/review/o44/after.md` | The rest of the far view (order 44): order 43's table with new marks, each place drawn and where it stands, and how it was looked at: the scratch scripts in `~/.cache/claude-scratch-larshansen/o44/bin/` (`pair.sh` and `pairsheet.py`, the same addresses from origin/main's build and the work build side by side; `crop.py`; `places.ts`, where he stands along a level for the harness's `x` and `y`; `wip.sh`, `farbuild.sh` and `serve.sh`, a work build and its far-only twin served on 5187 and 5188; `measure.sh`, the hand-back's batch; `perfcmp.py`) |
| `apps/viking/tools/review/o43/before.md` | Every far view on one table (order 43), and how it was looked at: the scratch scripts in `~/.cache/claude-scratch-larshansen/o43/bin/` (`addresses.py` and `shootsets.sh`, the look-first batch; `farcolours.ts`, every far colour as each sky leaves it against every role; `farmeasure.py` and `fartable.py`, the far view measured in pictures, from a scratch build that draws the far layers alone and one that draws the sky alone; `silhouettes.ts`, each far piece alone at four times; `behind.py`, whether what changed between two builds lies behind the play) |
| `apps/viking/src/alive/upright.ts` | The upright phone's brush (order 45): `skyBand` (what a level's tall sky holds), `underBand` (its ground going on down into its own dark, in layers; since order 46 into its own material's tones, `deep`, and `DEEP_WATER` with its depth strips), `inTheGround` (stones, roots); asked for by a level's `art.sky` and `art.under`, which the page calls only where the view is taller than wide |
| `apps/viking/src/render/upright.test.ts`, `uprightframe.ts`, `upright.worker.ts` | The upright frame (order 45): every level drawn as the page draws it upright at four places, framed by the page's camera with the pad, at 390 x 844 and 360 x 640, in a canvas of typed arrays (`uprightframe.ts`), four levels at a time in workers: no plain band over his head or under his feet takes more than a fifth of the screen under the bar, but by name; the hooks' colours off every role; nothing they draw moves with reduced motion |
| `apps/viking/tools/review/o45/before.md`, `after.md` | Every level upright on one table (order 45), and how it was looked at: the scratch scripts in `~/.cache/claude-scratch-larshansen/o45/bin/` (`upright.ts`, a copy of `hand.ts` that lays the page out again and reads its canvases row by row; `bands.py`, the shares of the screen; `places.ts`, five places and a track every 40 world pixels from each route; `sweep.ts` and `sweepsum.py`, a whole level in one browser and each landmark's share showing, against `scrpatch.py`'s scratch build that notes every far piece drawn; `pair.sh` and `twosheet.py`, before over after; `final.sh`, the hand-back's batch) |
| `apps/viking/tools/review/o46/after.md` | The rest of the upright phone (order 46): the three tries for the dark below and the choice, the pad's numbers over the band, the levels filled, the three flat places, order 45's table with new marks, and how it was looked at: the scratch scripts in `~/.cache/claude-scratch-larshansen/o46/bin/` (`up.sh`, order 45's `upright.ts` for an address list; `threesheet.py`, three builds' pictures in rows; `mkuf.sh`, a copy of `render/uprightframe.ts` with its passes exported, which `flats.ts` (each scene's flat bands as the test measures them), `rows.ts` (each row under his feet, and the composite as a picture) and `padnums.ts` (the pad's measures over the band) import; `farcheck.ts`, far pieces washed and tinted as the warning test does against every role; `de.ts`, colours against every role; `handback.py`) |
| `apps/viking/src/alive/thrown.test.ts` | After dusk what is thrown keeps a pixel of the dark between its red outline and its glow (order 39) |
| `apps/viking/src/alive/takes.test.ts` | After dusk what he takes has a line of the level's dark round it, on the pixels beside its shape and no others; none by day, none round what cannot be taken; the line never near the red or a role, and 30 or more off the edge it goes round (order 40) |
| `apps/viking/src/render/tells.test.ts` | No tell it names smaller than a stated number of pixels at any step of it, with motion and with reduced motion: the three jumpers, a wall closing behind him, a lily pad and a bundle about to sink, a gust coming (order 40); the welder's sparks, Bjørvika's gust, Gamlebyen's stone that sinks, the heron (order 41) |
| `apps/viking/tools/review/o40/takes.tsv`, `tells.tsv` | What he takes under every sky after dusk, before and after the line; every tell in order 39's table ranked in place by size, contrast and length (order 40); how, in `o40/before.md` (the scripts are in `~/.cache/claude-scratch-larshansen/o40/bin/`) |
| `apps/viking/tools/review/o39/rim.tsv`, `props.tsv` | Every boss state, carrier, thrown thing, pickup and prop measured in place against what is round it, by day and under its level's own sky (order 39); how, in `o39/before.md` (the scripts are in the scratch folder: `~/.cache/claude-scratch-larshansen/o39/bin/`) |
| `apps/viking/src/alive/frames.test.ts` | Every look's frames (order 23); since order 38 every flyer's beat as shapes (any two frames 8 pixels or more apart at their best overlay) and every level's figures apart by silhouette (12 pixels or more) |
| `apps/viking/src/game/frame.test.ts` | He is never under a touch button, all routes, five sizes |
| `apps/viking/src/render/reduced.test.ts` | Nothing blinks with reduced motion (order 30; since order 31 by drawing, not by reading the source): every level's scenery across the whole level and every thing in it as the route finds it, recorded call by call at several steps of the clock with the world held, as in a browser; bosses, ledges' warnings, the map; the cards' CSS; since order 32 jumpers and the kit's carriers recorded where they are, and what `render/feel.ts` draws; since order 39 every jumper's tell a still mark at every step of it (with `render/feel.test.ts`: every wind-up, turn and lean with reduced motion too) |
| `apps/viking/src/render/lights.test.ts`, `lightcensus.ts`; `apps/viking/tools/glance/lights.ts` | After dark every light is lit and nothing else glows (order 32, ADR 0054): a census of every light every scene registers, by the function that registers it, and what a later pass draws over it; `bun tools/glance/lights.ts [--sky=night\|evening\|twilight\|own] [--levels=a,b] [--json]` prints it |
| `apps/viking/src/render/night.test.ts` | Vålerenga's lane's dark, kept as paths, against `drawNight` pixel by pixel in a stand-in canvas that fills rectangles, paths and clips; the lane's night still with reduced motion (order 33) |
| `apps/viking/src/render/warning.test.ts` | Harmless things keep off the warning red: every view of every level, what he meets with the paint on top, no more than 12 pixels within 10 of it but by name (order 33; the props piece by piece in `alive/props.test.ts`); since order 34 the scenery and the ground too, each far layer washed by its haze, no more than 24 pixels a view; since order 35 every light a level registers (none within 10, any within 12 named: Bjørvika's crane lights), and the two tests share one walk; since order 43 every colour of the far, mid and near layers over six pixels of a view, as each sky leaves it, 10 or more off the warning red, the paint and every role's colours, but by name, on the same walk; since order 44 the line map's too, and that no far, mid or near layer draws differently under another sky (the premise that makes the day's walk tinted exact) |
| `apps/viking/src/game/tune.test.ts` | The encore's tune (order 34, ADR 0055): deterministic, whole bars, every note's range and volume, a layer fewer a hit, the plain notes after the third, silence muted or with no sound, the audition, the shouted lines only while he struts or poses |
| `apps/viking/src/game/words.test.ts` | Every word kept by language, in every module and every level, in both languages with the same keys, lines and arguments (order 31, ADR 0016) |
| `apps/viking/src/levels/lazy.test.ts` | What the first script draws without `feel`'s file (ADR 0053); since order 42, that every level and the map draws its own carriers, ledges on a beat, cannons and drums (the first script has no plain drawing of them) |
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
