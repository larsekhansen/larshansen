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
| Every figure, as redrawn | https://claude.ai/artifact/2zVH3Eq6cauR3qyigeijrf | The implementers' frame sheets (`/tmp/shots-*/frames`, `sheets-after`), one per figure, latest round wins | After every round that redraws figures: orders 26 and 27 both will |

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
| `&touch` | Show the touch pad without a touch screen (order 21) |
| `&where=x,y` / `&look=x,y` / `&strip` | Camera and crop helpers |
| `&grain=0\|1\|2\|3\|depth` | The pixel study (order 22); a chunk of its own |
| `&fall=<steps>` | The falling feather (order 25) |
| `&shield` | Give him the shield |

Level ids: `langkaia`, `akershus`, `radhuset`, `slottet`, `holmenkollen`, `akerselva`,
`nordmarka`, `stortinget`, `ekeberg`, `nabolaget` (shown as Vålerenga, ADR 0038), `bygdoy`,
`vigelandsparken`, `korketrekkeren`, `ostensjovannet`, `bjorvika`, `gamlebyen`.

Pictures: `bun tools/shots.ts [--size=390x844] [--wait=5000] <out-dir> <url>…` from the root,
against `bun run preview` of the built app (ports 5184 to 5189; 5180 for the front page).

## Tools in the repository

| Where | What |
|---|---|
| `tools/shots.ts` | Headless Firefox screenshots |
| `apps/viking/tools/facts.ts` | Writes LEVELS.html's FACTS block from the levels |
| `apps/viking/tools/pictures.ts`, `pictures.tsv` | Retakes LEVELS.html's pictures |
| `apps/viking/tools/review/` | The sloppy and hesitating players, reach and dead-end checks, boss studies, `edgecmp.py`; one folder of results per order (`o18` … `o28`); a README |
| `apps/viking/tools/glance/diffcrop.py` | Before and after of what changed (order 28): two folders of the same addresses from two builds, each pair cropped to the pixels that differ, side by side |
| `apps/viking/tools/glance/` | Contact sheets (`sheet.py`, `enemyshots.ts`, `platformshots.ts`), the level walk (`walk.ts`, `strips.ts`), `perf.ts`, `flat.py` (flat places), `frames.ts` and `framesheet.py` (frame sheets: since order 27 each figure glammed, natural and its ending), `stomp.ts` (a stomp's strip of frames), `invasion.ts` (where the invaders' scenery may stand), `tones.ts` (which tones pass the palette test), `yellows.ts`, `hand.ts` (phone states), `haze.ts`, `fore.ts` |
| `apps/viking/src/render/palette.test.ts` | The colour rules as a test |
| `apps/viking/src/game/frame.test.ts` | He is never under a touch button, all routes, five sizes |
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
