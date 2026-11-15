# The games: handover

Read this first if you are about to work on the front page game (`apps/landing`), Vikingfjorden
(`apps/viking`), the maze Jernhaugen (`packages/maze`, `apps/iron-maze`) or the shared kit
(`packages/pixelkit`). It says what exists, how it came to be, what was decided and not decided,
what is known to be weak, and how to work here without breaking things.

Written 2026-11-14 by Claude (the planning and reviewing session), for whoever comes next; brought up to
date by order 15's implementer on 15 November, by order 16's the same night, by order 17's the next day, by order 18's after that, and by order 19's. Keep it current: when something here stops being true,
change it in the same commit.

## Where to look for what

| You want | Read |
|---|---|
| What the code is and the rules of the game as built | [`apps/viking/docs/DESIGN.md`](../../apps/viking/docs/DESIGN.md), [`apps/viking/README.md`](../../apps/viking/README.md) |
| Why things are the way they are | the decision records in [`docs/adr/`](../adr/README.md) |
| The look: tiles, person, palette, voice | [`PLAN.md`](PLAN.md) §3 (style bible) and §4 (one person) |
| How to check anything on this Pi | [`PLAN.md`](PLAN.md) §9, and "Checking" below |
| What each implementer was told to build | [`orders/`](orders/), one file per order |
| The plan for line 2 (six more levels, VIKING) | [`PLAN-LINE-2.md`](PLAN-LINE-2.md) |
| The levels as built, with a screenshot of each | [`LEVELS.html`](LEVELS.html) (see the note below) |
| Hosting and deploy | [`../../infra/README.md`](../../infra/README.md), [`../../CLAUDE.md`](../../CLAUDE.md) |

**About `LEVELS.html`.** It began as the plan (13 November) and was rewritten on 14 November to
describe the game as built: real screenshots (`shots/`), column counts, clear times, enemies and
rules read from the levels and their tests, and a last section on where the build left the plan.
The plan's hand-drawn sketches are in the file's git history. Its numbers (columns, scripted clear,
enemies, skilling, flags, benches) are written into the page's FACTS block by
`bun tools/facts.ts` in `apps/viking`: run it when a level changes. The words are by hand. The same
page is published as a private artifact on Lars's claude.ai account.

## What exists

- **The front page** (`apps/landing`): a walk through Gamle Oslo with doors to the other apps. It
  is the reference for the look. The door at the top of the Opera is a secret and leads to the
  viking game; it is deliberately not in the header.
- **Vikingfjorden** (`apps/viking`, served at `/viking/`): a T-bane line map with two lines.
  Line 1 has ten levels, one per rune of LARS HANSEN: Langkaia, Akershus festning, Rådhuset,
  Slottet, Holmenkollen, Akerselva, Nordmarka, Stortinget, Ekeberg, Vålerenga (shown so since order 18;
  its id is still `nabolaget`, ADR 0038). Each is 220 to 280
  columns with enemies, three hearts, lives, pits, benches, skilling, secrets and a gold bracteate.
  Two bosses: the troll in Nordmarka and the snow plough in Vålerenga. Clearing Holmenkollen gives
  the ski pole (a dash). With all ten runes the helmet turns gold. Line 2 (orange, VIKING, ADR 0025)
  leaves at Stortinget and opens when Vålerenga is cleared: Bygdøy (order 14) gives the shield (ADR
  0024); Vigelandsparken, Korketrekkeren (the sledge he cannot stop, ADR 0026) and Østensjøvannet came
  with order 15, Bjørvika (crane hooks) and Gamlebyen (the ruins that rise as he passes, ADR 0028; the sea
  serpent, ADR 0027) with order 16. All sixteen are built; with all six of line 2 the header's VIKING is gold,
  and with all sixteen the map gets a longship at anchor at the end of the line and lanterns (ADR 0030, 0031).
- **Jernhaugen** (`packages/maze`; alone at maze.larshansen.dev through `apps/iron-maze`, and
  inside the viking game at `#jernhaugen`): seven maze levels. It is a bonus stop on the line and
  is never required. Clearing its level 3 gives the raven's feather (a double jump); all seven
  make it gold. The feather is what reaches the bracteates.
- **The kit** (`packages/pixelkit`): everything the scenes share. Physics, person, sky, palette,
  tile maps, doors, camera, carriers, flags, launchers, ledges on a beat, surfaces, zones,
  hazards, the dark, sounds, the debug harness.

## How it came to be

| When | What | Where |
|---|---|---|
| before 2026-11-10 | The front page rebuilt as the Gamle Oslo walk; a replacement front page built by mistake from a stale checkout and salvaged as `apps/viking` | PRs #45, #48; the story is in `CLAUDE.md` |
| 2026-11-10 | "Three games, one cloth": plan and orders 1 to 5. The kit extracted, the viking game and the maze rebuilt in the front page's style, the joins between the three | `PLAN.md`, `orders/01` to `05`, branch `games-same-cloth` |
| 2026-11-13 | Lars: make the games share style, art and physics; make the viking game ten levels on the theme "Oslo, and me"; make the maze much better and a bonus level without its music; keep the original. Plan page, orders 7 to 9, the level kit, the line map, three short levels, the maze bonus | `LEVELS.html`, `orders/07` to `09`, PR #49 |
| 2026-11-13 to 14 | Lars: build levels 4 to 10; each as good and long as a Mario level; enemies, lives, pits; a splash of Hollow Knight; "be a game designer, plan out something amazing; remember the pixel style from the front page". Order 10 in four batches | `orders/10`, PRs #50 (A: levels 4, 5), #51 (B: 6, 7), #52 (C: 8, 9, 10, ending), #53 (D: 1 to 3 lengthened) |
| 2026-11-14 | Lars gives the personal details: the school banner, home, Kruttverket. This handover and the decision records | branch `personal-touches` |
| 2026-11-14 | An adversarial review plays every level with a sloppy scripted player (`reviews/2026-11-14-adversarial.md`); order 12 fixes what it found about rules, fairness, pacing, the joins and the engineering | `orders/12-make-it-fair.md`, branch `make-it-fair`, PR #57 |
| 2026-11-14 | Order 13: the look (flat areas, trams, the banner, the night, upright phones, the bosses' bubbles), every line of text read again, and the last unfair places by the sloppy player's numbers | `orders/13-look-and-words.md`, branch `look-and-words`, PR #58 |
| 2026-11-14 | Lars asks for more levels; the planner plans line 2. Order 14, its groundwork: line 2 on the map, sixteen runes, the shield, the rocking deck, the sinking pad and the oar bank, and Bygdøy | `PLAN-LINE-2.md`, `orders/14-line-2-groundwork.md`, PR #59 |
| 2026-11-14 to 15 | Order 15: Bygdøy's gull and the passage under the loft; Vigelandsparken (statues), Korketrekkeren (the sledge), Østensjøvannet (swans and lily pads); a level's own rules (`LevelDef.rules`) | `orders/15-three-stations.md`, PR #60 |
| 2026-11-15 | Order 16: the sledge's help line, the lake's sunrise, a hesitating player (and the lake eased for it); Bjørvika (hooks), Gamlebyen (rising ruins), the sea serpent; the end of line 2 | `orders/16-the-last-two.md`, branch `the-last-two` |
| 2026-11-15 | An adversarial review of line 2 (`reviews/2026-11-15-line-2.md`); order 17 makes it good: the serpent's fight and ending, a lost life at a boss, what line 2 teaches and gives made visible, each level asking more of its idea, the review's tools made honest, the first script's budget enforced | `orders/17-line-2-made-good.md`, branch `line-2-made-good` |
| 2026-11-15 | Lars plays on his phone after the speed fix (PR #63): the card takes him out to the map (ADR 0037); Nabolaget is shown as Vålerenga (ADR 0038); runes that read at a glance; enemies a quarter larger, outlined, in a palette of their own; platforms with a standing top; every role's colours named and held apart (ADR 0039) | `orders/18-seen-at-a-glance.md`, branch `seen-at-a-glance` |
| 2026-11-15 | Lars: "do more design polishing like that". Order 19: every event answers at once, where it happened, in its role's colour, with a sound and a still answer under reduced motion; the hold after a hit is the picture's only; things to use in one cyan; his rim after dusk; the header between 760 and 1359 px (ADR 0040) | `orders/19-felt-at-a-glance.md`, branch `felt-at-a-glance` |

Branches worth knowing: `main` (live), `iron-maze-original` (the maze as it was before any
rebuild, music and all, kept so it is not lost; the archived repository `larsekhansen/iron-maze`
holds it too), `games-same-cloth` and `levels-4-10` (merged work branches, safe to delete).

## How the work was run

Lars set the process himself: one session plans and reviews, Opus subagents implement, and he
looks at the live result and comments. He gave leave to push, merge and deploy without asking.
See [ADR 0013](../adr/0013-plan-implement-review.md). In practice:

1. The planner writes a work order: self-contained, naming the files to read first, the rules,
   what to hand back. The implementer is assumed to know nothing else.
2. One Opus implementer per order or batch, working in the main checkout on a work branch, never
   pushing. Each of the eight implementer runs used roughly 0.7 to 0.9 million tokens and one to
   two hours.
3. The planner reviews: re-runs every test suite and build itself, re-shoots the front page and
   compares it byte for byte with the reference, looks at the implementer's screenshots, reads
   the hand-back's list of departures and weaknesses, and either sends corrections or accepts.
4. Accepted work is pushed, opened as a pull request, merged to `main`, and the deploy run is
   watched to the end and the live pages fetched.

Things that went wrong and what to do about them:

- An implementer's worktree was cut from `main` instead of the work branch. Say which branch,
  and have the implementer check `git log` before starting.
- `pkill -f "vite preview"` kills the shell that runs it. Stop servers by port: `fuser -k 5180/tcp`.
- In zsh, a bare `====` separator in a command is read as an expansion. Quote separators.
- Two agents in one checkout: one must never use `git add -A` or `git commit -a`.
- Lazy chunks shared between levels raced the headless screenshot. `vite.config` now keeps shared
  code in the first script and makes each level exactly one fetch.
- Implementers reached "a scripted clear of 60 s" by adding waits on slow rides. Orders now say:
  reach it with distance and things to do.
- Implementers sign their commits `Co-Authored-By: Claude Opus 5.5`, the model that did the
  work; the planner's own commits say `Claude Fable 5.2`. Both are in the history. Not worth
  rewriting.

## Checking, and its limits

Nothing in these games has been judged by a person at real speed before it went live. That is
the single most important fact about their state. This Pi cannot run a browser game headless:
Chromium cannot render at all, and headless Firefox draws Canvas 2D but fires no animation
frames. So everything is checked by other means ([ADR 0005](../adr/0005-checking-without-a-player.md)):

- **Scripted players.** Each level has a route (`apps/viking/src/levels/routes/`) played by
  `game/bot.ts` through the real rules in `game/play.ts`. Tests assert it clears with the single
  jump (levels 6 to 11 with the pole, Bygdøy with the shield it gives), raises every flag, loses no
  heart, and takes at least 40 s (Nabolaget 80 s; ADR 0020).
- **Reach search** (`game/reach.ts`): proves each bracteate cannot be reached without the
  feather. It is approximate: 4 px buckets, a fixed set of moves, enemies as trampolines along
  their whole patrol. It does not try a dash straight after a stomp. The same search keeps its
  graph, and the tests look in it for **dead ends**: no spot he can get to with what he is sure to
  have from which neither the rune nor a fall that puts him back can be reached (this found
  Rådhuset's sealed pit and Slottet's slot). Holmenkollen's goal is the hut at the top of the
  inrun, since the search does not model the inrun's speed.
- **The sloppy player and the review's other tools** (`apps/viking/tools/review/`, with a README):
  each route with a person's timing laid over every key (±2, ±4, ±8 steps), and the hesitating player
  that also stops 0.5 to 1.5 s before one move in five (ADR 0029), every jump on its own,
  naive strategies against the bosses, the worst wait on arrival at every wait. Not part of
  `bun test`. `before/`, `after/` and `after13/` hold the numbers from the review, after order 12
  and after order 13, and `line2/` line 2's (orders 14 and 15); `./runall.sh` reruns line 1's study in about
  20 minutes. The sloppy player holds the shield as it holds a direction. The review itself is
  [`reviews/2026-11-14-adversarial.md`](reviews/2026-11-14-adversarial.md), and line 2's
  [`reviews/2026-11-15-line-2.md`](reviews/2026-11-15-line-2.md). **Order 17 made the sloppy player honest**
  (ADR 0034: the serpent's ball and tail moved k times too fast, early jumps were let go at once, two more):
  numbers from before it are not comparable with later ones; `line2-after/` has both lines measured again on
  fresh seeds (101 to 200). Measure on fresh seeds, not the ones a level was tuned on. Remember what the
  sloppy player is: the route's plan with a person's timing. It never finds a better line, and
  "off route" and "gave up" mostly mean it fell somewhere the route never goes.
- **The harness**: `?debug&steps=N&keys=…` steps the game synchronously and draws one frame;
  `?debug&auto&steps=N` plays the scripted route in the page; `bun tools/shots.ts <dir> <url>…`
  takes the pictures with headless Firefox (`--size=390x844` for an upright phone; `--wait=5000`
  for a built page under `?debug&auto`, which fetches after the load event the picture is taken at).
- **The front page gate**: 28 reference screenshots of the front page, taken before any of this
  work. After every kit change they must be byte-identical (`cmp`). The references live in
  `/tmp/shots-before-jernhaugen` (earlier `/tmp/shots-before`) with addresses in `/tmp/shots-urls.txt` (the `:5180` lines); `/tmp` does
  not survive a reboot, so re-create them from a commit you trust if they are gone: build
  `apps/landing`, serve it with `bunx vite preview --port 5180 --strictPort`, and shoot those
  addresses.
- **The deploy** (`.github/workflows/deploy.yml`) runs the tests of `packages/pixelkit`,
  `packages/maze`, `apps/landing` and `apps/viking` before publishing (about two and a half minutes on the
  Pi since order 16, nearly all of it the viking suite) and stops on red; the viking build fails if its first
  script is over 60 kB gzipped (ADR 0035). Its smoke test greps the live viking script for `Langkaia`, fetches a level chunk
  and the maze's scene chunk named in it, and greps the maze host for `Jernhaugen`. Bun is pinned
  to the Pi's version (1.4.4).

What none of this can tell you: whether a jump feels fair, whether timing windows are humane,
whether sound, touch, gamepad or reduced motion work, whether the maze inside the viking page
behaves (it loads by dynamic import after the screenshot is taken).

## Speed

Lars found the game lagging on a phone (15 November). `?debug&perf` (ADR 0036) says what a frame
draws and who draws it. Stonework and Stortinget's rock are now drawn once and copied; a change like
that must leave the pictures byte-identical (compare against the live site with `tools/shots.ts`).
Next in line: Nordmarka's dark, colours set on every rectangle, the five stacked canvases. No one
has measured on a real phone: the numbers are the Pi's software renderer.

## Line 2: what is built, what order 17 owes

- **Built (order 14)**: line 2 on the map (orange, from Stortinget, the gate until Nabolaget, the
  hoardings), the header's second group of six runes, the shield (ADR 0024) with its touch button,
  the kit's rocking deck, sinking pad and oar bank (`deck.ts`, `sink.ts`, `oars.ts`, with tests),
  a level's own moving ground (`LevelDef.grounds`), throwers that face one way and lead
  (`EnemyDef.faces`, `lead`), and Bygdøy. Numbers in `apps/viking/tools/review/line2/summary.md`.
- **Built (order 15)**: Vigelandsparken (statues that move while his back is turned), Korketrekkeren
  (the sledge, ADR 0026) and Østensjøvannet (lily pads, swans, the heron). Each level's own rules come
  in its file through `LevelDef.rules` (its own enemies by look, ground of its own, the keys, an
  after-step hook, the reach search's carry, the sledge camera's lead); `Play` gained `riding` and
  `ducking`. A thrower may throw straight (`straight`, with `lead` aiming at where they meet) and see
  further (`reach`). `sink.ts` is a chunk of its own that Bygdøy and Østensjøvannet fetch. Numbers in
  `apps/viking/tools/review/line2/summary.md`.
- **How a new line 2 level is added now**: write `levels/<id>.ts` (Bygdøy or Vigelandsparken is the
  model; rules only it has go in its `rules`) and its route in `levels/routes/`; set `built: true` for it
  in `levels/index.ts` and add its loader there; add it to the `LEVEL` pattern in `vite.config.ts` (and
  any swatch or module only it uses to `OWN`: anything not listed lands in the first script); add it to
  `routes.ts`, `debug.ts`'s `AUTO`, `reach.worker.ts`, `levels.test.ts` (`ROUTE`, `GOLD`, `LEVELS`, `NEW`,
  `POLE`), `tools/facts.ts` and `tools/review/common.ts`. From level 12 on he has the shield in the tests
  and the tools (`hasShield: def.rune > 10`). A route on lily pads must never stand on one (run onto it,
  leap from its end): the sloppy player's corrections round a standing spot sink it.
- **Built (order 16)**: Bjørvika (crane hooks: a hop on, a step off, a hoist, rebar, a welder's sparks,
  sheets over shafts in gusts, riveters on a girder) and Gamlebyen (stones that rise as he passes and two
  walls that close behind him, guards that were statues, a tower that builds itself, archers on the wall
  walk, the harbour's longships, the sea serpent). A level's own ground may change the map it is played on
  (`Grounds.map`, `LevelDef.risen`); the reach worker searches such a level with every stone risen and, from
  the start and every flag, with none (ADR 0028). A one-way thrower may be blind nearer than a tile and a half
  (`EnemyDef.blind`). The serpent is `game/serpent.ts`, through the boss slot; its ball goes back by
  `Boss.hurts` and `shoved`; its neck is `Boss.blocks` (ADR 0027). Nothing is under construction (ADR 0030):
  the hoarding, its bubble and `moreToBuild` are gone. The review's tools gained the hesitating player
  (`hesitate=0.2`, ADR 0029) and ways back the route never takes (`RECOVER`); `tryroute.ts`, `reachone.ts` and
  `tune-bjorvika.ts` help build a level. Numbers in `apps/viking/tools/review/line2/summary.md`.
- **Order 17 (done)**: the review of line 2 (`reviews/2026-11-15-line-2.md`) and its order. The serpent
  (ADR 0031): the whole quay is its fight and its ball flies at his height, so nothing can stall it; its hints
  are only said when true; a flag on its quay, and a lost life at any boss never puts him behind its bench
  (ADR 0033); two rises a round after its first hit and its tail after each ball; a neck four times his height
  with a head, a crest, coils, a tail with a fin, lit; the dawn, the torches going out, the rune rising to a
  dragon prow before it can be taken. The shield keeps a jump pressed while it is up and the troll is not frozen
  by it (ADR 0032). The help line comes back when it changes; the shield's key shows at Bygdøy's passage; the
  map's banner names both lines; the longship lies at anchor in view. Each level asks more of its idea:
  Bygdøy's boat in the yard's slip under a slinger, Vigelandsparken's step on a beat between two statues,
  Østensjøvannet's longer crossing with overlapping swans, Bjørvika's jib girder with riveters, its traverse on
  two beats in a gust and rebar where a careless let-go lands, Gamlebyen's varied stepping stones (one late,
  one sinking) and its owl off the dig. The review's tools made honest (ADR 0034); the first script's budget
  enforced (ADR 0035). **Not met**: the order's hearts-a-run targets for line 2 (they were set on the old
  numbers): measured honestly line 2 does not rise (Bygdøy 0.85, Vigelandsparken 2.41, Korketrekkeren 0.21,
  Østensjøvannet 0.73, Bjørvika 1.64, Gamlebyen 1.04 at ±4, against Akerselva 2.40 and Ekeberg 2.80), and the
  serpent is easy for a player who knows its answer. A next order should retune the six against these numbers.
- **What order 16 handed order 17**, kept for the record: What to attack first: (1) the serpent: its neck never hurts and a ball that
  hits him ends the round with a seven-second rest, which keeps naive players alive (no Game over before
  85 s) but may make the fight slow for a person; is the ring of foam seen in time on a narrow screen (it
  rises within eleven tiles of him where it can)? (2) Gamlebyen's stones: the search proves the two extreme
  worlds and every flag's stretch before its stones rise, not every mixed state; the stones rise within six
  tiles, so a fast player may see them come up only just ahead. (3) Bjørvika and Gamlebyen measure 1.6 and
  2.9 hearts a run at ±4 against about 3 and 3.5 wanted: Bjørvika is the clearest miss (its hooks, once
  the hop off was a step, cost almost nothing; what it loses is to walkers and the rebar). (4) The hesitating player is a crude model: it
  stops on a sinking pad as readily as on a stone; the lake was eased for it (lily pads 1.7 s), the sledge's
  feel at speed and the statues' rule are still unreviewed.
- **First script**: about 59.4 kB gzipped after order 19 (its answers to events are `render/feel.ts`, a chunk fetched
  with the first scene, which took the old sparks, the beaten enemies' puff and the page's freeze with it). Before: 59.70 kB gzipped after order 18 (60 is the budget, and the build fails over it; order 18 allowed
  59.8). Earlier: 59.18 kB after order 16 (order 16 allowed 59.5). Order 15 moved Nordmarka's
  night drawing out of `main.ts` into `render/night.ts`, which comes with Nordmarka. Left to move: the enemy
  looks that two or three levels share (`render/pickups.ts`). Never alias a palette namespace in a level
  (`const P = PAINT`): it pulls the whole namespace into the first script.

## Order 18: seen at a glance

Lars played on his phone after the speed fix. Order 18 (`orders/18-seen-at-a-glance.md`, with two sections the
planner added the same day): the card after a level takes him out to the map (ADR 0037); Nabolaget is shown as
Vålerenga (ADR 0038); the header's runes are gold tiles with a tick or empty dashed slots, the level ringed;
and colour says what a thing is (ADR 0039, DESIGN's "Colour says what a thing is"): enemies a quarter larger,
outlined, in a palette of their own; what he stands on with a mint top; pickups, him and the bosses' tells held
apart; `render/palette.test.ts` holds it. What it left:
- Boxes grew only on eight levels (Holmenkollen, Nordmarka, Ekeberg, Vålerenga, Bygdøy, Vigelandsparken,
  Korketrekkeren, Østensjøvannet). On the other eight growing cost the sloppy player more than 0.3 hearts a run,
  so their enemies keep their old boxes and are drawn to them (`keepBoxes`); `tools/review/o18/summary.md`.
- His tunic's blue is held off every field by day only: under the evening tint the game's water comes within
  5 to 7 of it. (Order 19: a warm rim round him after dusk tells him apart, tested.)
- Carriers, decks and pads keep their own bodies (wood, balsa, lily pads); only their top edge is from the
  platform palette. One-way ledges are wholly in it.
- Doors, benches and signs were not recoloured; flags got the tick when raised. (Order 19: doors, benches and
  signs are marked at their corners in one cyan, `ROLES.use`.)
- Unplayed: none of it has been seen on a phone.

## Order 19: felt at a glance

Order 19 (`orders/19-felt-at-a-glance.md`, ADR 0040, DESIGN's "What just happened") made what just happened
readable: every event answers within two frames, where it happened, in its role's colour, with a sound of the
kit's synth (each its own), and with a still answer under reduced motion. The answers are `render/feel.ts`
(lazy); they read the play and never write to it. What to know:
- **The page no longer freezes the rules** after a stomp or a hit. The hold after a hit is the picture only
  (four steps). The page and the tests now run exactly the same game; `render/feel.test.ts` holds it, and the
  sloppy player's runs on Akershus, Bygdøy, Nordmarka and Gamlebyen (seeds 201 to 260) are byte-identical
  before and after (`tools/review/o19/summary.md`).
- **Looking at an event**: `?debug&steps=0&on=<event>` steps to it; `bun tools/glance/strips.ts` makes frame
  strips of every event in `tools/glance/events.tsv` (a strip is made in the page and sent to the tool, so its
  size is not the window's); `?debug&perf&on=<event>&skip=6` measures a frame with the answers in the air;
  `?debug&look=x,y` puts the camera on a point (the contact sheets' subjects; `tools/glance/sheet.py`).
- **Tells**: what gives way trembles (`Standing.soon`, `shiver`); every thrower's wind-up changes its outline by
  18 pixels or more (the gull, slinger, archer and ring-thrower were given bigger poses; a woken guard levels
  its halberd). Tested.
- **Things to use** (doors, benches, signs) are marked at their corners in `ROLES.use`, a cyan held off every
  field and role; the bubble naming the key is framed in it. **His rim** after dusk tells him from the water.
- **The header** from 760 to 1279 px (with sixteen runes to 1359) puts the run on a row of its own: it was
  pushed off the right edge, the clock and hearts with it.
- **Unplayed**: none of it has been heard or seen at speed by a person. The sounds were checked as recipes
  (each different, the near ones apart by register, direction and noise), never listened to on the Pi.

## Known weak spots, as of order 16

Most important first. Lars had not yet played when this was written; expect his comments to
reorder this list.

1. **Unplayed.** See above. Every number below is the sloppy player's, not a person's, and every
   picture a headless browser's at a device pixel ratio of 1.
2. **The line is a rising line, roughly; line 2 is not.** Measured honestly after order 17 (ADR 0034,
   `tools/review/line2-after/`, fresh seeds, ±4): Langkaia 1.2, Akershus 1.0, Rådhuset 1.5, Slottet 0.3,
   Holmenkollen 0.2, Akerselva 2.4, Nordmarka 1.7 (8 Game overs in 100, the troll's third round), Stortinget
   1.5, Ekeberg 2.8, Nabolaget 1.6 (line 1's often end off route, so these are lower bounds); Bygdøy 0.9,
   Vigelandsparken 2.4, Korketrekkeren 0.2, Østensjøvannet 0.7, Bjørvika 1.6, Gamlebyen 1.0. The older
   numbers below were measured with the artefacts. Hearts lost per run by the sloppy player at ±4 after
   order 13 (`tools/review/after13/summary.md`): Langkaia 1.5, Akershus 1.4, Rådhuset 1.6, Slottet
   0.5 (the rest before the mountain, accepted), Holmenkollen 0.6, Akerselva 2.4, Nordmarka 2.0,
   Stortinget 1.4 (accepted), Ekeberg 2.8, Nabolaget 1.6. Line 2 after order 15 (`line2/summary.md`):
   Bygdøy 1.2, Vigelandsparken 2.1, Korketrekkeren 1.0, Østensjøvannet 1.2 (the hesitating player 2.6, ADR 0029), Bjørvika 1.6,
   Gamlebyen 2.9 (order 16; wanted about 3 and 3.5). Holmenkollen is easy for the sloppy
   player because its inrun steers itself; for a person the lip is the test. Thirty runs move by
   ±0.3; `after13/compare90.txt` has ninety-run numbers for the three that looked worse than order 12.
3. **Rådhuset's carillon** is still where the sloppy player most often gives up (6 of 30 at ±4):
   the swinging bell and the bells must be met in step.
4. **Standing still.** Rådhuset 38 %, Akerselva 36 %, Stortinget 36 % and Nordmarka 34 % of the
   route stand still (`after13/standing.txt`). In the first three it is nearly all riding (bells,
   the ferry, the lift, the clock's hand; logs and buckets; trains): standing on the map's own
   ground is 13, 10 and 9 %. Nordmarka's is the troll's fight, waiting in front of the dawn for it
   to come. No forced wait is much over 5 s (Stortinget's locals 5.1 and 4.6 s worst).
5. **The bosses.** The plough now hurts only while it moves and stands in his way when still
   (ADR 0022): no naive strategy reaches Game over before 79 s, and every one sees a hint within
   10 s. A player who leans on the resting plough is never charged: the fight waits, with hints.
   Against the troll, three naive strategies still reach Game over in 72 to 80 s.
6. **The look**, order 13: flat areas broken with placed things, trams on their rails, a plated
   banner, enemies with a rim at night, the yellow house lit by its door lamp, digs that read as
   holes, upright phones that put him two thirds down (ADR 0021). Still plain: the stone under
   Akershus's quay and walls below the first courses, the Scream bands are loud, the moose and the
   troll are small, Karl Johan's window grids repeat. A tram leaving into Nabolaget's last slot is
   cut flat at the street, since the slot is narrower than the tram.
7. **Untested paths.** Returning from the maze into Nordmarka; the ending from a real stored
   save; the feather moment after the maze; the touch dash button and the Sit button; the loading
   board on a slow line (seen only with `?debug&fetch=hang`); upright phones on a real phone.
8. **Margins.** The first script is 59.34 kB gzipped of a 60 kB budget, and the build fails over it
   (ADR 0011 says what can still move out, ADR 0035 how it is enforced). The viking test suite takes about
   130 s of a three-and-a-half-minute budget, nearly
   all of it the reach and dead-end searches in sixteen workers on four cores (Gamlebyen's, eight searches
   in one worker, is the slowest).
9. **The viking header is solid cream,** not the front page's frosted bar
   ([ADR 0015](../adr/0015-solid-header-in-viking.md)); on an upright phone it wraps to three rows,
   and on a phone on its side its run group is cut at the right.
10. **The maze's words** keep the original game's taunting voice, one exclamation mark included;
   order 13 read the viking game's lines, not the maze's.
11. **Line 2 is unplayed too.** Bygdøy, Vigelandsparken, Korketrekkeren, Østensjøvannet, Bjørvika,
   Gamlebyen, the serpent, the shield and the two-line map have been seen only in still pictures and
   played only by scripts. Untested by a person: whether a hook's hop reads as a choice and not a chore;
   whether a rising stone is seen in time; the serpent's rhythm and its hints on a phone. Untested by a
   person: whether a statue's creeping reads when it is at the edge of the screen; the sledge at speed,
   the duck on a touch screen (the Shield button), the camera's lead on a real phone; whether a person
   lingers on the lake's pads long enough for its swans to matter. The shield's touch button and the pad's smaller layout with
   five buttons were not seen on a touch screen. The rocking decks' feel (carried a pixel up or down a
   step as he walks) is untested by a person. On an upright phone (in headless Firefox at a device
   pixel ratio of 1) a level's run row is cut at the right, past the lives: it was before line 2 too.

## Things considered and not done

- **Real difficulty tuning.** No level has been tuned by play. Numbers (grip 0.12, inrun cap 3.8,
  gust lengths, the troll's 60-step wind-up) are first guesses that passed a script.
- **A pogo or attack move.** Considered with the Hollow Knight borrowings; left out. The stomp is
  the only attack.
- **A map you buy, charms, currency sinks.** Skilling only make lives.
- **Wall jump or wall cling.** Not added; the body has run, jump, optional double jump, dash.
- **More than two bosses.** Kept to levels 7 and 10 on line 1; line 2 has the third, the sea serpent.
- **Enemies in the maze, or hearts there.** The maze keeps its own rules.
- **Cheaper implementers.** Lars suggested lower-tier subagents for grunt work if it saved
  tokens. Every implementer was Opus, because every order was design-heavy; small edits were done
  by the planner inline. Sonnet for whole batches was offered to Lars as a saving and not taken up.
- **Parallel implementers in worktrees.** Used once (the maze, order 9). Levels were built one
  batch at a time in one checkout, because every batch touched `play.ts`, `types.ts` and the kit.
- **A person's playtest before deploy.** Not possible in the process Lars chose; he is the playtest.
- **Sign lines of his own, the fate of the old longhouse and stave tower.** Asked on the plan
  page, not yet answered. The sheep and longship were reused. The 3D printer he did ask for: it is
  in Verkstedet's window on Langkaia (`printer()` in `levels/langkaia.ts`).
- **His childhood street.** Known to the planner, deliberately not put in the public repository
  or the game ([ADR 0014](../adr/0014-personal-details-discreetly.md)).

## If you are asked to change something

- Run `git fetch origin` and compare with `origin/main` first (`CLAUDE.md` says why).
- Bun only.
- Pushing to `main` deploys. Work on a branch.
- A change to a level: edit its file in `apps/viking/src/levels/`, then its route in
  `levels/routes/` if the path changed, run `bun test` in `apps/viking`, and look at it with the
  harness. The tests hold every level to the same measure (columns, skilling, enemies, benches,
  signs, clear time); if Lars asks for something outside it, change the measure on purpose.
- A change to how he moves: do not touch `MOVE` or `JUMP`
  ([ADR 0003](../adr/0003-fixed-body-constants.md)). Add to the world or add an ability.
- A change to the kit: re-run the front page gate.
- A new rule: pure, in `game/play.ts` or a small module beside it, with a test on a made-up
  level in `rules.test.ts`.
- Words: Norwegian and English, both, in the dry voice ([ADR 0016](../adr/0016-two-languages-dry-voice.md)).
- Drawing anything new: its colours come from its role (an enemy from `ENEMY`, outlined by the page; what he
  stands on with the standing top; DESIGN's "Colour says what a thing is", [ADR 0039](../adr/0039-colour-says-what-a-thing-is.md)).
  `render/palette.test.ts` says which colour is too near which, and by how much.
- A decision made or reversed: add or supersede a record in `docs/adr/` and update this file.
