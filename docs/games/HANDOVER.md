# The games: handover

Read this first if you are about to work on the front page game (`apps/landing`), Vikingfjorden
(`apps/viking`), the maze Jernhaugen (`packages/maze`, `apps/iron-maze`) or the shared kit
(`packages/pixelkit`). It says what exists, how it came to be, what was decided and not decided,
what is known to be weak, and how to work here without breaking things.

Written 2026-11-14 by Claude (the planning and reviewing session), for whoever comes next. Keep it
current: when something here stops being true, change it in the same commit.

## Where to look for what

| You want | Read |
|---|---|
| What the code is and the rules of the game as built | [`apps/viking/docs/DESIGN.md`](../../apps/viking/docs/DESIGN.md), [`apps/viking/README.md`](../../apps/viking/README.md) |
| Why things are the way they are | the decision records in [`docs/adr/`](../adr/README.md) |
| The look: tiles, person, palette, voice | [`PLAN.md`](PLAN.md) §3 (style bible) and §4 (one person) |
| How to check anything on this Pi | [`PLAN.md`](PLAN.md) §9, and "Checking" below |
| What each implementer was told to build | [`orders/`](orders/), one file per order |
| The first plan for the ten levels, with drawings | [`LEVELS.html`](LEVELS.html) (see the warning below) |
| Hosting and deploy | [`../../infra/README.md`](../../infra/README.md), [`../../CLAUDE.md`](../../CLAUDE.md) |

**Warning about `LEVELS.html`.** It is the plan from before Lars asked for enemies, lives and
Mario-length levels. Its drawings, level order, places, mechanic ladder and Oslo notes still hold.
Its column counts, its "nothing here can hurt" tone and its "no lives" decision do not: order 10
(`orders/10-levels-4-to-10.md`, rules 4 and 6 and the "Feel" section) replaced them. Where the two
disagree, order 10 and the code win. A copy of the page is also published as a private artifact
on Lars's claude.ai account; it has not been updated either.

## What exists

- **The front page** (`apps/landing`): a walk through Gamle Oslo with doors to the other apps. It
  is the reference for the look. The door at the top of the Opera is a secret and leads to the
  viking game; it is deliberately not in the header.
- **Vikingfjorden** (`apps/viking`, served at `/viking/`): a T-bane line map with ten levels, one
  per rune of LARS HANSEN: Langkaia, Akershus festning, Rådhuset, Slottet, Holmenkollen,
  Akerselva, Nordmarka, Stortinget, Ekeberg, Nabolaget. Each is 220 to 280 columns with enemies,
  three hearts, lives, pits, benches, skilling, secrets and a gold bracteate. Two bosses: the
  troll in Nordmarka and the snow plough in Nabolaget. Clearing Holmenkollen gives the ski pole
  (a dash). With all ten runes the helmet turns gold.
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
  jump (levels 6 to 10 with the pole), raises every flag, loses no heart, and takes at least 60 s
  (Nabolaget 90 s).
- **Reach search** (`game/reach.ts`): proves each bracteate cannot be reached without the
  feather. It is approximate: 4 px buckets, a fixed set of moves, enemies as trampolines along
  their whole patrol. It does not try a dash straight after a stomp.
- **The harness**: `?debug&steps=N&keys=…` steps the game synchronously and draws one frame;
  `?debug&auto&steps=N` plays the scripted route in the page; `bun tools/shots.ts <dir> <url>…`
  takes the pictures with headless Firefox.
- **The front page gate**: 28 reference screenshots of the front page, taken before any of this
  work. After every kit change they must be byte-identical (`cmp`). The references live in
  `/tmp/shots-before` with addresses in `/tmp/shots-urls.txt` (the `:5180` lines); `/tmp` does
  not survive a reboot, so re-create them from a commit you trust if they are gone: build
  `apps/landing`, serve it with `bunx vite preview --port 5180 --strictPort`, and shoot those
  addresses.
- **The deploy's own smoke test** (`.github/workflows/deploy.yml`) greps the live viking script
  for `Langkaia` and the maze host for `Jernhaugen`.

What none of this can tell you: whether a jump feels fair, whether timing windows are humane,
whether sound, touch, gamepad or reduced motion work, whether the maze inside the viking page
behaves (it loads by dynamic import after the screenshot is taken).

## Known weak spots, as of the last merge

Most important first. Lars had not yet played when this was written; expect his comments to
reorder this list.

1. **Unplayed.** See above.
2. **Rådhuset is hard for a third level.** A fall from the upper bells costs 20 to 30 s of
   climbing; the swinging bell must be met in step.
3. **The bosses.** The troll is hit by facing it with the headlamp while its club is stuck in the
   dawn light; only a sign says so. The plough fight has about 11 s of waiting. Neither enforces
   its intended three moves.
4. **Waiting.** Akershus reaches a minute only with a hoist wait; Stortinget has about 6 s of
   train waits; Holmenkollen leans on slow lifts.
5. **Throwers aim at where he stands,** so waiting near one gets him hit (Holmenkollen's kids,
   the gull by Rådhuset's lift).
6. **Art.** Large plain stone, brick and earth areas; repeated window grids on Karl Johan; the
   Scream bands on Ekeberg are loud; trams leave by sinking into slots; the yellow house reads
   brown under the night tint; the moose and troll are small.
7. **Untested paths.** Returning from the maze into Nordmarka; the ending from a real stored
   save; the feather moment after the maze; the touch dash button.
8. **Margins.** The first script is at 57.4 kB gzipped of a 60 kB budget. The viking test suite
   takes about 70 s of a two-minute budget.
9. **The viking header is solid cream,** not the front page's frosted bar
   ([ADR 0015](../adr/0015-solid-header-in-viking.md)).

## Things considered and not done

- **Real difficulty tuning.** No level has been tuned by play. Numbers (grip 0.12, inrun cap 3.8,
  gust lengths, the troll's 60-step wind-up) are first guesses that passed a script.
- **A pogo or attack move.** Considered with the Hollow Knight borrowings; left out. The stomp is
  the only attack.
- **A map you buy, charms, currency sinks.** Skilling only make lives.
- **Wall jump or wall cling.** Not added; the body has run, jump, optional double jump, dash.
- **More than two bosses.** Kept to levels 7 and 10.
- **Enemies in the maze, or hearts there.** The maze keeps its own rules.
- **Updating `LEVELS.html` and the published plan page** to the built game. Not done.
- **Cheaper implementers.** Lars suggested lower-tier subagents for grunt work if it saved
  tokens. Every implementer was Opus, because every order was design-heavy; small edits were done
  by the planner inline. Sonnet for whole batches was offered to Lars as a saving and not taken up.
- **Parallel implementers in worktrees.** Used once (the maze, order 9). Levels were built one
  batch at a time in one checkout, because every batch touched `play.ts`, `types.ts` and the kit.
- **A person's playtest before deploy.** Not possible in the process Lars chose; he is the playtest.
- **The 3D printer in Verkstedet, sign lines of his own, the fate of the old longhouse, sheep and
  stave tower.** Asked on the plan page, not yet answered. The sheep and longship were reused.
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
- A decision made or reversed: add or supersede a record in `docs/adr/` and update this file.
