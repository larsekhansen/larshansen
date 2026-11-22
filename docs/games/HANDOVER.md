# The games: handover

Read this first if you are about to work on the front page game (`apps/landing`), Vikingfjorden
(`apps/viking`), the maze Jernhaugen (`packages/maze`, `apps/iron-maze`) or the shared kit
(`packages/pixelkit`). It says what exists, how it came to be, what was decided and not decided,
what is known to be weak, and how to work here without breaking things.

Written 2026-11-14 by Claude (the planning and reviewing session), for whoever comes next; brought up to
date by order 15's implementer on 15 November, by order 16's the same night, by order 17's the next day, by order 18's after that, by order 19's, by order 20's, by order 21's, by order 22's, by order 23's, by order 24's, by order 25's, by order 26's, by order 27's, by order 28's, by order 29's, by order 30's, by order 31's, by order 32's, by order 33's, by order 34's, by order 35's, and by order 36's. Keep it current: when something here stops being true,
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
| What the planner knew: what Lars said and chose, what is next, how to run a round, lessons, resources | [`handbook/`](handbook/README.md) |
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
  Slottet, Holmenkollen, Akerselva, Nordmarka, Stortinget, Ekeberg, Gamle Oslo (shown as Vålerenga from order 18
  to 33, as Gamle Oslo since order 34; its id is still `nabolaget`, ADR 0038, 0055). Each is 220 to 280
  columns with enemies, three hearts, lives, pits, benches, skilling, secrets and a gold bracteate.
  Two bosses: the troll in Nordmarka and the snow plough in Gamle Oslo. Clearing Holmenkollen gives
  the ski pole (a dash). With all ten runes the helmet turns gold. Line 2 (orange, VIKING, ADR 0025)
  leaves at Stortinget and opens when Gamle Oslo is cleared: Bygdøy (order 14) gives the shield (ADR
  0024); Vigelandsparken, Korketrekkeren (the sledge he cannot stop, ADR 0026) and Østensjøvannet came
  with order 15, Bjørvika (crane hooks) and Gamlebyen (the ruins that rise as he passes, ADR 0028; the sea
  serpent, ADR 0027) with order 16. All sixteen are built; with all six of line 2 the header's VIKING is gold,
  and with all sixteen the map gets a longship at anchor at the end of the line and lanterns (ADR 0030, 0031), and since order
  29 one more stop past it: the encore at Middelalderparken, where Loki is met once (ADR 0052). It is extra: no rune, no total.
  Since order 34 it has a tune of its own (ADR 0055).
- **Jernhaugen** (`packages/maze`; alone at maze.larshansen.dev through `apps/iron-maze`, and
  inside the viking game at `#jernhaugen`): seven maze levels. It is a bonus stop on the line and
  is never required. Clearing its level 3 gives the raven's feather (a double jump); all seven
  make it gold. The feather is what reaches the bracteates. Since order 36 (ADR 0056) it is drawn in the viking game's grain:
  him from the fjord's own sheet, the mound its own iron-bound place, the maze in the hand on a phone.
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
| 2026-11-16 | Lars: "i like what i see. keep going"; he plays on a phone. Order 21: the game in the hand. The phone's screen is the game's (the bar the run alone during a level, the pad over the picture), buttons that fit thumbs and answer them finger by finger, the camera keeping him clear of the buttons, the help line on a touch screen only a note of what changed, the banner off what matters (ADR 0043); Stortinget and Slottet drawn at a sixth to a half of the rectangles, the pictures byte-identical | `orders/21-in-the-hand.md`, branch `in-the-hand` |
| 2026-11-16 | Lars, after orders 18 to 20 live: "red for enemies that can hurt you, in terms of the outline", "the light blu you had for rats can be for moving npcs that don't hurt", "yellow paint ... for 'you can go here'", and "i just fear i made a blunder with the pixel design ... the pixels are too big. they need more detail". Order 22: part A (built) the red outline, the calm pale, the yellow paint, every other yellow reconsidered, the haze behind the lane (ADR 0044); part B (a study, not live) three ways to a finer look, for Lars to choose (`GRAIN.md`) | `orders/22-paint-and-grain.md`, branch `paint-and-grain` |
| 2026-11-16 | Lars, in a conversation he saved: the game is "not that engaging"; the research record (`research/2026-11-16-reference-games.md`) on three open-source games. He chooses the grain: way 3, "do way 3 like you suggested. for the pixels" (ADR 0045). Order 23: frames for him and every enemy (him, the first three levels' enemies, the skilling and the cheese drawn pixel by pixel; order 24 the rest of line 1), a shadow under everything that moves, a receding plane on the water and snow, more speeds, something in front of him now and then, the edge's forgiveness from 6 to 10 steps, the alert mark (ADR 0046 to 0048) | `orders/23-alive.md`, branch `alive` |
| 2026-11-16 | Order 24: line 1 redrawn (way 3, ADR 0045): every enemy of line 1, both its bosses, the sheep, the moose, the parade, what is thrown and the small things every level has drawn as per-pixel frames; water lapping at quays, flames that flicker, the serpent's breath and daze, things in front a person knows at a glance, far birds and smoke; three things moved a tile where the edge's longer forgiveness made a late jump fire in the air (ADR 0048 kept, its cost put to Lars) | `orders/24-line-one-redrawn.md`, branch `line-one-redrawn` |
| 2026-11-16 | Order 25: line 2 redrawn (way 3): line 2's own kinds, the sea serpent in every state, the heron, line 2's shots, and what a walk through all sixteen levels and the map still found in rectangles (him lying back on the sledge, the sledge, the crowds at Slottet and Holmenkollen, Bjørvika's welder); one more pass on the wasp, the flying pigeon, the track rat and the kid's hat; the troll's lit side after dusk | `orders/25-line-two-redrawn.md`, branch `line-two-redrawn` |
| 2026-11-16 | Order 26: the ground under him (way 3 for what he stands on and walks past). Every surface of the lane drawn from one textured set: three to five tones of one hue a material, four variants by a hash of the place, a lit top, dark ends, a shadowed foot, moss, salt, tufts, rivets, sparkles; drawn once and copied, the paint on top as before; sign boards, the T-bane's entrance, plank doors, bollards, gravestones, Vålerenga's slate roofs (ADR 0049) | `orders/26-the-ground.md`, branch `the-ground` |
| 2026-11-16 | Lars, on the page of every figure: "all the pink... im just not sold on pink being a bad guy color. but maybe if we make it a theme somehow? like, oh no, the 80s glam invaders are here!" Order 27: the glamour (ADR 0050). The neon family and a level's lean, a sheen and a glow after dark, glam marks on every figure and a natural self it turns to when a stomp breaks the spell, the rune's ring of daylight, the bosses as headliners, the story of who paid Loki, the map's mirror balls, the invaders' scenery and stings; the Angry Boy, the kid, the sledger and the hot-dog cart redrawn as Lars asked | `orders/27-the-neon-invaders.md`, branch `the-neon-invaders` |
| 2026-11-17 | Lars away, with a standing instruction: "keep looking for more assets that should have increased details. and consider them with the rest of the game. interaction, fit, thematics, etc. ... remember to write docs too btw." Order 28: the last flat things, each asked what he does with it, whether it fits its place and whether the glamour should touch it (ADR 0051). The props kit (lamp posts of their place, railings, plank walls, panel doors, posts, a ladder, concrete legs, the rowing boat, the sauna rafts), the ferry and the gondola at Rådhuset, Bjørvika's fence and hut; the line map drawn as a level (a skyline a station, piers in the water, decks, station marks, the mirror balls' brackets); a neon trail behind what the invaders throw; the ground's own band, the fortress and Gamlebyen's planks quietened for it | `orders/28-the-last-flat-things.md`, branch `the-last-flat-things` |
| 2026-11-17 | Order 29: the encore (ADR 0052). With every rune of both lines held, a stop past the longship: a small festival stage on the water in Middelalderparken, where Loki, the Invaders' front man, plays one more song. He borrows the three bosses' moves (the troll's club, the plough's charge, the serpent's bite) with their own tells and answers, poses between them (the opening), loses his hair, shades and jacket to three stomps and walks off a thin man in a wool sweater with a thermos. Extra: no rune, no total, a best time only; the map with any rune missing is as it was | `orders/29-the-encore.md`, branch `the-encore` |
| 2026-11-21 | Order 30: small debts, the things orders 27 to 29 found and left. Langkaia's props drawn plainly if `feel`'s file never comes (ADR 0053), and the bare map's line 2; the encore's stop glowing after dark until seen; Loki's club at the troll's size; the encore's file fetched ahead from the map with every rune; reduced motion photographed and held by a test (the oars' and Slottet's banners' warnings and five other things were still running); a debug card at a level's end, and the card as wide as its lines on a phone; every kind met in several levels looked at in each; `tsc` from the root | `orders/30-small-debts.md`, branch `small-debts` |
| 2026-11-21 | Order 32: lights after dark (ADR 0054). Every light in every level, the encore and the map asked whether it is lit after dusk and whether anything glows that should not (a census of every light each scene registers, and what is drawn over it); one rule held by a test. Korketrekkeren's lit trail over the dusk with pools on the run, Gamlebyen's pools on the cobbles, the encore's stage, the invaders' neon signs, the T sign, Bygdøy's ferry, the map's windows; the braziers' and grills' warm light gone; Vålerenga's Pi and its light and the paper cranes drawn again, missing since order 15 with the lane's dark (which is left for a decision: about 1,580 rectangles a frame). Then order 31's leftovers: the logs and the chairlift's chairs redrawn, a dark pixel between the red outline and the glow over a level's dark, the reduced-motion test watching what moves by the clock and what feel draws, the last Norwegian words seen at 360 wide | `orders/32-lights-after-dark.md`, branch `lights-after-dark` |
| 2026-11-22 | Order 33: the lane behind the church, and room to breathe. Vålerenga's lane behind the church dark again (missing since order 15), kept: the same pixels as `drawNight` draws, at a few path fills a frame where drawing it so cost about 1,580 rectangles; harmless things held off the warning red (the chairlift's chairs, the ferries' bands, the trains' stripe, a balloon, a shirt, a cage's rail recoloured); the first script from 59.60 to 57.94 kB gzipped (the synth, the page's drawing after dusk and of the rune's flight, the maze's feather into lazy files); that drawing held with reduced motion; debug ways to the pole's note and the encore's bite hint | `orders/33-the-lane-behind-the-church.md`, branch `the-lane` |
| 2026-11-22 | Lars answers the questions that waited for him (relayed by his other session; `handbook/conversations.md`). Order 34: what Lars said. The tenth station is Gamle Oslo and its words lose "home" (an ode to Oslo); scenery and ground off the warning red (Stortinget's walls and kiosk, Holmenkollen's padding, Vålerenga's stained glass, Bygdøy's kiosk, a red hire sledge); the encore gets an original glam-rock tune in the game's own synth that follows the fight, Loki at the far end of late-1980s glam in general, and four shouted lines of the game's own; the rule that a level's difficulty and enemies follow its place, with proposals only (ADR 0055) | `orders/34-what-lars-said.md`, branch `what-lars-said` |
| 2026-11-22 | Order 35: housekeeping, and every figure on one page. The viking suite from about 363 s to under 300 on a quiet Pi with nothing it held lost (the tests' recorders without a proxy a call, the reach searches on four workers the costliest first, one walk for the warning tests; every changed test shown to fail on a planted fault); `tools/figures.ts`, a sheet of every figure the game draws and `figures.json` naming each in both languages; the encore's shouts under the harness; blank harness pictures found (taken before the page drew) and named by `tools/shots.ts`; perf at every place in one browser; Bjørvika's crane lights held by name; Holmenkollen's hedgehog a mountain hare in its winter coat (drawing only) | `orders/35-housekeeping-and-the-figures.md`, branch `housekeeping` |
| 2026-11-22 | Order 36: the maze catches up (roadmap idea 8; ADR 0056). Looked at first (`o36/before.md`); one stepped harness for the maze in both pages; him in the mound from the viking game's own sheet (his frames and the feather moved into the kit) with a torch; the mound redrawn by the game's methods as its own iron-bound place (lining, faces, earth, hill, pad, doorways, stones, raven, dweller), adders in the warning red, the key in the take-gold, the door's corners in the use cyan; the help line says what a finger does on a phone, goes at his first move, wraps; the raven's words wrap; thumb-sized targets; nothing blinks with reduced motion; the joins held (a test and stepped pictures in and out of the mound); the figures' bosses outlined as the page outlines them and the maze on the page of every figure; the reduced-motion test's dead watch of the kit's carriers removed. The maze's rules unchanged, step for step | `orders/36-the-maze-catches-up.md`, branch `the-maze-catches-up` |
| 2026-11-21 | Order 31: loose ends and a second look. The cards keep under the header with a mouse too; Slottet's first pigeon on plain street; Nordmarka's invaders keep their red outline over the dark; reduced motion held by drawing every path, not by reading the source; Stortinget's escalator shafts kept and copied; every word in both languages, held by a test; a second walk for flat things, and the tram, Vigelandsparken's gate and Korketrekkeren's lit trail redrawn | `orders/31-loose-ends-and-a-second-look.md`, branch `loose-ends` |
| 2026-11-15 | Order 20: the places at their best. Nordmarka, Bygdøy and Korketrekkeren drawn at a quarter or less of the rectangles, the pictures byte-identical (ADR 0041); every level walked at both sizes and the flat places given what they have (ADR 0042); what order 19 left (a closing wall's tremble, the sledgers' lean, one sound for two statues, the hooks' sounds, the dawn picture's address, a crop) | `orders/20-places-at-their-best.md`, branch `places-at-their-best` |

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
- **The harness**: `?debug&steps=N&keys=…` steps the game synchronously and draws one frame (if he is hit in the last
  four of those steps the page holds its picture; since order 35 a frame over canvases a resize has just emptied is drawn
  whatever holds, and `?debug&perf` measures a whole frame there, where it measured nothing); the level's music hears every
  stepped step (order 35), so the encore's shouted lines show in a still picture;
  `?debug&auto&steps=N` plays the scripted route in the page; `bun tools/shots.ts <dir> <url>…`
  takes the pictures with headless Firefox (`--size=390x844` for an upright phone; `--wait=30000`
  for a built page under `?debug&auto`, which fetches after the load event the picture is taken at: since order 35 the page
  says when its picture is drawn and it is taken then, the wait the most it waits; `--lang=nb-NO` in Norwegian). A picture
  with nothing drawn in its middle (the page's own background) is named BLANK and the run ends with 3: the blank pictures of
  orders 32 and 34 were taken before the page had drawn, five seconds being too short for the encore's files on this Pi.
  `?debug&card` puts the level's card at its end over it, as its rune would (order 30), as `&told` and `&seen` set the story's
  card read and the encore seen.
- **The maze's harness** (order 36): `packages/maze/src/debug.ts`, the same in both pages (the viking page fetches it only under
  `?debug`): `?debug&level=N&steps=S` with `bot=keys|pointer|finger` (`portals`), `walk=dx,dy`, `at=c,r`, `records=demo|all`, `ghost`,
  `levels`, `touch`, `reduced`, `perf[&post=<port>]`; inside the viking page `/viking/?debug&told&…#jernhaugen` (`told`, or the story's
  card covers it), and `walkin=N` (through a door once the page has loaded), `out` (out by the maze's own way, Esc) and `after=N` (steps
  of what he comes back to). A picture at step 0 is black (the level fades in for 24 steps): take it at 30. Addresses in
  `apps/iron-maze/README.md`; the maze's rules against another checkout: `bun packages/maze/tools/runs.ts`.
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
draws and who draws it; `?debug&perf&post=<port>` sends the line to `tools/glance/perf.ts`, which makes a table
of many places at once. Stonework and Stortinget's rock are drawn once and copied (ADR 0036); since order 20
what is off the screen is not drawn, Nordmarka's dark is drawn in rectangles not rows, and large or repeated
pieces are kept or stamped (ADR 0041): Nordmarka from 16,600 to 29,100 rectangles a frame at 390 x 844 to
4,200 to 5,700, Bygdøy from about 22,000 to 5,800 to 7,300, Korketrekkeren from about 15,700 to 3,400 to 3,700.
A change like that must leave the pictures byte-identical: take the same addresses from a build before and a
build after (check which build each preview serves) and compare bytes. Every level's numbers are in
`apps/viking/tools/review/o20/perf.md`. Order 21 did Stortinget (27,900 to 29,900 a frame at 390 x 844 to 3,600 to
9,950: what is off the screen is not drawn, its far rock stamped in blocks) and Slottet (13,300 to 17,800 to 9,000 to
9,800: the ground under the street kept, its slopes only on the screen); every level is now under 15,000 at every place
of its walk, the heaviest Bjørvika (14,600) and Vålerenga (14,300) (`tools/review/o21/perf.md`). Order 23 drew fewer at every
place (copied coins, the fjords as planes of copied strips, Bjørvika's most 14,391 to 9,497; the heaviest now Holmenkollen,
11,618: `tools/review/o23/perf.md`). Order 26 drew fewer again at every place (a solid tile is one copy of a textured piece where it
was two to eighteen rectangles; Rådhuset's most 11,105 to 3,758; the heaviest now Holmenkollen, 10,141, copies up to 1,361 a frame at
Stortinget: `tools/review/o26/perf.md`). Next in line: the far
layers' one rectangle per column, colours set on every rectangle, the five stacked canvases. Order 31 kept Stortinget's escalator shafts
(their back walls whole, and the escalators' truss, glass, handrail and steps) as strips copied: at the shafts 1,363 to 2,947 rectangles a
frame at 390 x 844 where it was 4,259 to 6,630 (`tools/review/o31/perf.md`), the pictures byte-identical. No one has measured on a real
phone: the numbers are the Pi's software renderer. Since order 35 `tools/glance/perf.ts` measures every place in one browser (about two
seconds a place, where a browser a place took five; `--each` is the old way), so all of a round's places are measured, not a sample.

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
- **First script**: 58.32 kB gzipped after order 36 (58,292 bytes by GNU gzip, 169 more than order 35's): the maze's way in under `?debug`
  (its harness fetched then), the maze told the page is a touch screen, the maze's help line for the device, and the feather's line at the
  mound wrapped at a narrow screen (the kit's `wrapLines`). The maze's own file grew (its scene chunk 14.7 to 18.4 kB gzipped); his frames
  and the feather, moved into the kit, are still in `feel`'s file. 58.14 kB gzipped after order 35 (the stepped page's music asked every step, a frame over emptied canvases:
  0.06 kB). 58.08 kB gzipped after order 34 (the page asks a level's own music once a frame and shows its shouted line: 0.14 kB; the
  tune itself is in the encore's chunk, 8.6 to 11.2 kB gzipped). 57.94 kB gzipped after order 33 (57,903 bytes by GNU gzip, 1,691 fewer than order 32's build): the kit's synth, the page's
  drawing after dusk and of the rune's flight (`render/dusk.ts`) went into `feel`'s file, which the first scene waits for, and the maze's
  feather drawing with the maze (ADR 0053, amended: without `feel`'s file the page is silent and nothing keeps its light after dusk).
  59.60 kB gzipped after order 32, as after order 31 (59,594 bytes by GNU gzip, 2 fewer: only the chunks' names it
  carries changed). 59.59 kB gzipped after order 31 (the camera giving `--bar` to CSS; the rest is the chunks' names it carries).
  59.55 kB gzipped after order 30 (the plain drawings without `feel`'s file, the bare map's line 2, the encore's
  file fetched ahead, `?debug&card`'s hook). 59.34 kB gzipped after order 29 (the encore's stop on the map with every rune, its route in the page, its card
  and best time, `Boss.ends`; the encore itself is a chunk of its own, 8.6 kB gzipped, and its words are in `feel`'s file). 59.07 kB gzipped after order 28 (Langkaia's sauna rafts, club hut, diving tower, boat and posts moved to the props kit in
  `feel`'s file behind one hook, `TEXTURED.prop`, and the shed walls behind `TEXTURED.walls`; the kit's flat lamp post and panel door, which no
  level calls now, left the script). 59.51 kB gzipped after order 27 (the lean as a shape is recorded and the glow's bookkeeping in `render/sprite.ts`,
  the story's hooks in `main.ts`, the map's story sign in `kart.ts`, the new blurb; everything else of it, the neons' ramps, the natural
  ramps, the marks' drawing, the story's words, in `feel`'s file and the levels'). 59.06 kB gzipped after order 26 (the hooks for the textured set in `render/tiles.ts`, `main.ts` and
  `render/furniture.ts`; the set itself is in `feel`'s file, which grew from 20.6 to 28.0 kB gzipped). 58.86 kB gzipped after order 25 (unchanged by it: line 2's drawings are in their levels' files, the crowd's
  and the sledge's in `feel`'s). 58.86 kB gzipped after order 24 (the small things' drawings to `feel`'s file). 59.44 kB gzipped after order 23 (see "Order 23"). 59.85 kB gzipped after order 22 (the outline's dark line and its rings after dark, the paint's marks and
  worn ends, the lips, the haze's air; to make room the careful walk to a clicked spot, `game/careful.ts`, is a chunk fetched
  with the first click. The grain study is a chunk of its own, and anything another chunk imports from the first script makes
  it export more: the study's sheet of subjects is made outside the page for that). Before: 59.47 kB gzipped after order 21 (the banner kept off what matters, the pad's loading; the pad and
  the camera's room for it, `render/pad.ts` and `game/frame.ts`, 3.1 kB, are a chunk fetched on a touch screen only). Before: 59.00 kB gzipped after order 20 (`kept.ts` and the kit's `dark.ts` are chunks of their own now;
  the far layers' `climbed` and `lift` came in). Before: 59.43 kB gzipped after order 19 (its answers to events are `render/feel.ts`, a chunk fetched
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
  before and after (`tools/review/o19/after.md`).
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

## Order 20: the places at their best

Order 20 (`orders/20-places-at-their-best.md`, ADR 0041, 0042). What to know:
- **Speed.** See "Speed" above. `kept.ts` has `kept` (a piece in its place), `keptStrips` (a large piece in 128 px
  strips), `stamp` (a shape alike wherever it stands, on any layer) and `seen` (is this piece of the street on the
  screen at all); a level that draws across its whole length should use them. The sloppy player's run files on
  Nordmarka, Bygdøy, Korketrekkeren and Bjørvika (seeds 201 to 260, ±2 and ±4) are byte-identical before and after.
- **Flat places.** `tools/glance/walk.ts` walks every level along its route, a place every twenty columns, and
  `tools/glance/flat.py` marks the pictures with a plain area over about a third of the view or an empty far
  backdrop. What each marked place was given is in ADR 0042 and `tools/review/o20/flat.md`. Akershus's far layers
  rise when the view climbs the walls (`climbed` in `render/backdrop.ts`); Slottet's city and hills rise with
  Karl Johan. Left: Nordmarka's dark (by design) and one picture high on Holmenkollen.
- **LEVELS.html's pictures** have their addresses in `apps/viking/tools/pictures.tsv`; `bun tools/pictures.ts
  <base> [name ...]` takes them again from a served build (the dawn at Gamlebyen's prow needs its `wait`).
- **Left from order 19, done**: the walls that close behind him in Gamlebyen tremble and throw dust where they will
  rise, from the moment he is past until they rise; a sledger leans in before it sets off; turning between two
  statues makes one sound; Bjørvika's hooks clunk coming in to a landing and ding-dong as they turn (named by
  `LevelDef.landings`, so the moose and the chairlift stay quiet); Langkaia's one-way ledge crop in the platform
  sheet is away from the sign.
- **Unplayed**: none of it has been seen at speed or heard by a person.

## Order 21: in the hand

Order 21 (`orders/21-in-the-hand.md`, ADR 0043, DESIGN's "In the hand"). Lars plays on a phone; nobody can touch one from
this Pi. What to know:
- **Looking at a phone here.** `tools/glance/hand.ts` opens a screen state in headless Firefox told it has a coarse
  pointer and a pixel ratio of 3 (a phone's), at any size, and measures from the page (it serves the game through
  itself, so its page can read the game's): the bar, the pad and every target, the help line, the cards, and from
  `?debug`'s `window.__game` where he, the enemies and the pickups are and where the banner is drawn (`drawn`).
  `--turn` turns the phone after the first measuring; a headless Firefox delivers no resize observations, so the tool
  calls `__game.layout()`, as the page's observer would. `hand.tsv` lists the states; `hand-table.ts` makes the tables
  (`tools/review/o21/before.md`, `after.md`). `?debug&touch` shows the pad without a touch screen.
- **The pad** is `render/pad.ts`, a chunk fetched on a touch screen only (with `game/frame.ts`): `padLayout` places
  the controls (the same slots whatever is shown; the way in and the shield share one), `createThumbs`/`wireThumbs`
  follow each finger, `frame` folds the bar during a level, dims what has nothing to do and places the help line's
  note; `roomy` (`game/frame.ts`) stands him two thirds down the screen above the pad's bottom row and lifts him over a
  button he would otherwise be under. On a notched phone on its side a turn on landing beside the dash can still jump
  the camera (17 frames over 24 px in all sixteen routes).
  The pad's markup is the viking page's own (`index.html`); the kit's `wirePad` is the front page's alone now.
- **The bar on a phone** is CSS (`styles.css`, "The bar on a phone") on the body's `touch` and `playing` classes; the
  cards read `--bar` to keep below it.
- **Not on a phone during a level**: the restart (the Game over card starts a level again), the gold count, the links.
- **On its side the game is drawn larger** than before order 21: the stage is the window's whole height now, so the
  kit's sizing gives 2 CSS pixels to an art pixel at a pixel ratio of 3 (1.33 before): 26 tiles across 844 px, not 40.
- **He stands higher** on a touch screen: two thirds of the way down the screen above the pad's bottom row.
- **Speed**: see "Speed" above; Stortinget's and Slottet's pictures are byte-identical before and after (both sizes,
  day and night).
- **Unplayed**: none of it has been touched. The list for a person with a phone is in the order's hand-back.
## Order 22: paint and grain

Order 22 (`orders/22-paint-and-grain.md`, ADR 0044, `GRAIN.md`). What to know:
- **The paint (part A, live).** What hurts on touch and moves is outlined in the warning red with a near-black line
  inside it; no body is that red (bodies plum, orange, poison, pink, a cool white). What moves and cannot hurt is
  outlined in `ROLES.calm` (a pale blue-white); a statue, a guard or a swan that turns on him turns red and a "!"
  springs up over it. Outlines keep their light after dark (`rings` in `render/sprite.ts`; the old pale rim is gone).
  What he stands on has yellow paint on its top edge (marks where it moves, dashes where it gives way, worn at the
  ends), and so do the lips of ground before a fatal drop, a hook's block and a statue's head while it is a step.
  The gold of what he takes is a deep amber (`COIN.gold`); the third rail's cover is red. `tools/glance/yellows.ts`
  lists every yellow a level paints; the palette test holds that only the paint, Rådhuset's bells and lamps' light are
  near the paint's yellow.
- **The haze (A6).** The far layers fade toward the level's air (0.5, 0.4, 0.3), the street's backdrop 0.08, on the
  fill each pass already made (the street's backdrop gains one fill a frame); `tools/glance/haze.ts` prints each level's band, and the palette test holds it.
  Every level has three far canvases at 0.12, 0.2 and 0.4 of the camera (Gamlebyen and the map two): the canvases are
  the kit's, shared by all levels, so a level's speeds are not data to change in one line.
- **The grain study (part B, not live).** `?debug&grain=0|1|2|3|depth` on Langkaia's quay and Stortinget's platform
  (addresses in `GRAIN.md`): the subjects drawn as per-pixel maps (`src/grain/maps.ts`) at today's grain and twice as
  fine. Lars chooses; no ADR yet. Its pictures are in `docs/games/shots/grain/`. An upright phone at a device pixel
  ratio of 3 is photographed as a window of 1170 x 2532 at a ratio of 1 (the same art pixels on the same device
  pixels; headless Firefox here ignores `layout.css.devPixelsPerPx`).
- **The shots.** `tools/glance/paintshots.ts` (the movers' and pickups' sheets), `skies.ts` (day and each level's own
  sky for every sheet), `grainmaps.ts` (the study's maps as JSON).
- **Unplayed**: none of it has been seen on a phone or at speed.

## Order 23: alive

Order 23 (`orders/23-alive.md`, ADR 0045 to 0048, DESIGN's "Frames, shadows and depth"). What to know:
- **The grain is decided** (ADR 0045): the same grid, better drawn. New drawings are per-pixel frames with a ramp of tones
  and a lit side (`apps/viking/src/alive/frames.ts`). Drawn so far: him (every frame), Langkaia's pigeon, gull and rat,
  Akershus's crow, guard and brazier, Rådhuset's standing gull and the scooter, the skilling and the cheese. Orders 24 and 25
  drew the rest (see "Order 24" and "Order 25"); what is left is scenery, listed in `apps/viking/tools/review/o25/old-style.md`.
- **Frames come from what the rules keep** (ADR 0046): him in `alive/him.ts` (picked by `render/feel.ts`, which now draws
  him: the page gives the kit's overlay an alpha of nought once feel's file is here); the looks drawn as frames in
  `alive/foes.ts`; every other look's cycle, breath and bob from `parts` (`alive/parts.ts`, out of the first script); a
  beaten enemy's three-frame death (`alive/death.ts`). `alive/census.ts` draws every look in every state;
  `alive/frames.test.ts` holds that each has its frames. Sheets: `bun tools/glance/frames.ts > f.json; python3
  tools/glance/framesheet.py f.json <dir>`.
- **Shadows** (`alive/shadows.ts`), never on water; held by the palette test against every role but his blue.
- **Depth** (ADR 0047, `alive/depth.ts`): the receding plane (`plane`), pieces of a far layer at their own speed (`spedX`),
  a boat on the fjord, things in front of him (`alive/fore.ts`, where `fore.test.ts` allows: nine levels; `bun
  tools/glance/fore.ts` lists where there is room).
- **The edge** (ADR 0048): `JUMP.coyoteSteps` is 10. The reach search can try a late jump off an edge (`search`'s `edge`,
  only `tools/review/edge.ts` asks for it). The sloppy player's runs before and after are in `apps/viking/tools/review/o23/`.
- **The alert mark** swells and shrinks twice, on more moments; an arrow at the screen's edge for a thrower or flyer about
  to come in (`EDGE_ARROWS` in `render/feel.ts`).
- **First script**: 59.44 kB gzipped (59.85 after order 22): the shared enemies' and the small things' old drawings and
  `parts` moved to feel's file.
- **Unplayed**: none of it has been seen at speed. What only a person can judge is in the order's hand-back.

## Order 24: line 1 redrawn

Order 24 (`orders/24-line-one-redrawn.md`; DESIGN's "Frames, shadows and depth"; numbers in `apps/viking/tools/review/o24/`). What to know:
- **Line 1 is drawn as frames** (ADR 0045): the shared looks (`render/looks.ts`), line 1's own kinds in their levels' files, the
  troll and the plough (shaded pixel by pixel in five tones a material, every tell where it was; the troll's eyes in the dark
  follow its head), the sheep, the moose, Slottet's parade and Guard, the chip, the cone and the snowball, and the small things
  (`alive/things.ts`: the bench, the bracteate, the rune stone, the flag the game flies, the ski pole, the feather; the shield
  in `game/shield.ts`). What is left is line 2's own (`tools/review/o24/old-style.md`). The enemy palette has no tone to add:
  `tools/glance/tones.ts` finds no brown or dark orange that passes the palette test.
- **The first script** lost the bench's, the bracteate's, the rune stone's and the sheep's drawings to `feel`'s file (hooks in
  `LOOKS`, plain shapes if that file never comes): 59.44 to 58.86 kB gzipped.
- **Places live** (section 2): water laps at quay walls (`lap`, a hook in `drawWater`); the keep's fire baskets and Jernhaugen's
  torch flicker, Ullevålseter's lamp gutters; the serpent breathes reared and rocks in its daze (its pixels are order 25's); far
  birds over Slottet and Akerselva, smoke from two of Vålerenga's chimneys.
- **Things in front** are a mast, a lamp post, a trunk a person knows, a half again larger than the street, in a dark tone of
  the level's air, measured from under the page's bar (the canvases run on up behind it: order 23's mast had its head hidden
  there, which is why it read as a line), never over the banner, and faded out while a bubble is up or he sits.
- **The edge** (section 3, `tools/review/edgeplace.ts` replays a seed with 6 and 10 side by side): every place where 10 did
  worse is a short drop (one or two tiles, 11 to 16 steps of fall) followed by a jump: there the 10 steps after leaving an edge
  overlap the 6 steps a press is kept before landing, and a press meant for the landing fires in the air. Langkaia's deck
  pigeon, Akershus's brazier and Vålerenga's fox were moved a tile; Akershus then does no worse anywhere, Langkaia and Vålerenga
  still do at ±4 (see `o24/sloppy-edge.md`). Ekeberg's and Stortinget's runs that left the route are the sloppy player's (the
  sheep crossing; the last stairs), not a person's. Going back to 6 or to 8, or a rule that keeps such a press for the landing,
  is for Lars to choose.
- **Unplayed**: none of it has been seen at speed or on a phone.

## Order 25: line 2 redrawn

Order 25 (`orders/25-line-two-redrawn.md`; DESIGN's "Frames, shadows and depth"; numbers in `apps/viking/tools/review/o25/`). What to know:
- **Everything that moves or is picked up is drawn as frames** (ADR 0045, carried through): line 2's own kinds in their levels'
  files, the sea serpent (its head a map, its body, coils and tail in five tones of scale, every tell where it was), the heron,
  line 2's shots; and what a walk through all sixteen levels and the map found still in rectangles: him lying back on the sledge
  and the sledge (`levels/korketrekkeren.ts`), the crowds at Slottet and Holmenkollen (`person`, `crowdFlag` in
  `alive/things.ts`, each copied), Bjørvika's welder. What is not drawn so is scenery, listed with its reason in
  `tools/review/o25/old-style.md`. The mallard is shared by the river and the lake (`render/looks.ts`).
- **A kept box**: a look drawn for the box its level keeps passes `fit` to `drawFoe` and is not squashed to it (Bjørvika's,
  Gamlebyen's, the lake's coot, Stortinget's flying pigeon and track rat). `frames.test.ts` now also holds that every look
  of every level is drawn pixel by pixel (its body in runs one pixel high).
- **Vigelandsparken's statues** are one figure in four poses: watched, granite with lichen or bronze with verdigris in the
  park's own tones; walking, the enemy's colours, eyes open, a stiff stride whose legs never meet. The moment one turns is
  as before: colour, outline, the "!".
- **The troll after dusk**: its two lightest tones are noted as it is drawn and drawn again, faint, over the forest's dark
  (`overDark`), where the night's lights would not show (drawing only).
- **Looking at things**: `tools/glance/serpent.ts` (the serpent in every state), `states.ts` (a look in chosen states: a
  watched statue, a calm swan, a guard as stone), `line2shots.ts` (the addresses for the pictures in place, the serpent's
  states along the route among them), `frames.ts` (line 2's shots and the heron too); `?debug&fall=<steps>[&gold]` shows the
  maze's feather falling onto him.
- **First script** unchanged, 58.86 kB gzipped. **Speed**: against order 23's table no place rose more than 10 rectangles a
  frame (Nordmarka's dark) and none draws over 11,466; the crowds draw 150 to 270 fewer (each person copied); the troll's fight
  after dusk +78, the serpent's +11 to +19 (`tools/review/o25/perf.md`).
- **Unplayed**: none of it has been seen at speed or on a phone.

## Order 26: the ground under him

Order 26 (`orders/26-the-ground.md`, ADR 0049, DESIGN's "The ground under him"; numbers in `apps/viking/tools/review/o26/`). What to know:
- **The textured set** is `apps/viking/src/alive/ground.ts` (in `feel`'s file). A level names its materials (`Grain`) in its
  own file and draws its tiles with `tile`; the shared letters, the bed under water, the one-way ledges' bodies under the
  paint and the ground under the map on a tall screen (the level's own ground, buried) come through `TEXTURED` in
  `render/tiles.ts`. Until `feel`'s file has come the shared letters are drawn as before; the levels fetched later import
  the set with it.
- **Props at arm's length** drawn as pieces: the sign boards on their posts (every level), the T-bane's entrance (every level),
  the plank doors (Langkaia's shed, Nordmarka's mound), the bollards on the quays, Vålerenga's gravestones and its slate roofs,
  the crates, Stortinget's ticket gates and signal cabinet. Not done: lamp posts, railings, ladders, the panel doors (the kiosk,
  the home), the sauna, the sheds' plank walls, the rowing boat, Holmenkollen's padded rail (`o26/before.md` lists them).
- **Held by tests**: every solid tile is the set's but the named that are not ground (`alive/ground.test.ts`, with reasons);
  every material keeps the band; no new tone nearer a role than before (`render/palette.test.ts`, against
  `alive/ground-before.json`). Korketrekkeren's snow body and Østensjøvannet's bed are still order 20's own pixel drawings (with
  their stones, roots, shells), named in the test.
- **Looking at it**: `tools/glance/groundsheet.ts` and `groundsheet.py` (every surface, outside the page, before and after);
  `tools/glance/ground.ts` (each level's ground against the roles and the figures).
- **Added the same evening (sections 3b to 3d, Lars's words in the order):** every small Norwegian flag is Norway's at a glance
  (the hand flags of the parade's children and of the crowds at Slottet and Holmenkollen 7 x 5 in two or three waves, `handFlag`
  and `HAND_WAVES` in `alive/things.ts`; the far blocks' roof flags and the map's palace flag 7 x 5; the wall flags, Stortinget's,
  the palace's, Holmenkollen's tower's and Akershus's the game's own rippling cloth, `flagFlying`); every spruce ends in a spire
  (Holmenkollen's path, near row and old spruce had a flat top tier five wide, the tip never drawn; Nordmarka's street and middle
  rows, Korketrekkeren's, the far shore's over the fjord; the map's already had tips); the rat's tail is as long as its body,
  trailing and swinging (the track rat's streams behind rising and flies out to the side falling, so its head stays where he lands);
  the wasp is amber and black (`ENEMY.amber`, a body colour added to the enemy palette, passing the palette test as every body does:
  no exception named), its wings the palette's white (a grey-white came within 2 of the snow).
- **The risk the order named** (textured ground hides figures): the surfaces' local contrast rose from 2.4 to 3.6 (mean L*
  difference between neighbouring pixels), the figures' dark line against the ground is 30 to 85; where it rose most is in
  `o26/after.md`. Unplayed: none of it has been seen at speed or on a phone.

## Order 27: the neon invaders

Order 27 (`orders/27-the-neon-invaders.md`, ADR 0050, DESIGN's "The glamour"; numbers in `apps/viking/tools/review/o27/`). What to know:
- **The glamour is the enemies' colour, given a reason.** Natural is Oslo, neon is the glamour. The neon family is `ROLES.glamour`; each
  level leans its two neons (`LEANS` in `alive/glamour.ts`, applied by `lean` in `render/sprite.ts` as a shape is recorded, so the
  palette test sees what the page draws); every glammed frame gets a two-neon sheen on its lit top (`sheened`); after dark each invader
  glows in its own neon under its outline (`glows`, `invaders` in `sprite.ts`, made once a shape).
- **Every figure is one map twice**: glammed with its marks (pieces marked `glam`, `mark` in `alive/foes.ts`; a frame keeps `bare` and
  `marks`) and its natural self (`NATURAL` in `alive/natural.ts`). `glam.mode` says how a look draws now; anything drawn outside `drawFoe`
  honours it itself (the statues, the ringers, the salmon). The census draws both and the ending; `alive/natural.test.ts` holds them.
- **Nobody dies any more**: a stomp breaks the glamour (`drawBreak` in `alive/death.ts`, through `feel`'s `beaten`), and a rune's ring of
  daylight lifts it from what is in view (`feel`'s `lifted`, through `main`'s `foe`). Drawing only: the rules are untouched (the sloppy
  player's runs on Langkaia, Slottet, Nordmarka and Gamlebyen, seeds 201 to 260, are byte-identical before and after).
- **The story** is `game/story.ts` (in `feel`'s file: `vite.config.ts` puts it there): every line, both languages, alternatives beside
  them. The opening card is shown once (`localStorage["viking.told"]`) and told again by the map's sign by Langkaia's station
  (`STORY_SIGN` in `kart.ts`, its words filled by `kartArt.ts`).
- **The invaders' scenery** is `alive/invasion.ts` (`PLACES`, held by `invasion.test.ts`; `tools/glance/invasion.ts` finds places); the
  map's mirror balls are drawn over every station not yet cleared.
- **Looking at it**: `tools/glance/frames.ts` (every figure glammed, natural and its ending), `tools/glance/stomp.ts` (a stomp's strip),
  and `?debug&steps=0&on=<event>&skip=N` alone now takes a picture of a moment (it did only with `perf` or `strip`).
- **Unplayed and unheard**: none of it has been seen at speed or on a phone, and nobody has heard the four stings.

## Order 28: the last flat things

Order 28 (`orders/28-the-last-flat-things.md`, ADR 0051, DESIGN's "Props at arm's length"; numbers and pictures' places in
`apps/viking/tools/review/o28/`). What to know:
- **The table first.** Every thing still flat in or beside the lane, and the map, with what he does with it, whether it fits its
  level, whether the glamour should touch it and the decision: `o28/before.md`; what became of each: `o28/after.md`.
- **The props kit** is `apps/viking/src/alive/props.ts` (in `feel`'s file): `lamp` of four kinds by place, `railing` of three, `plankWall`,
  `panelDoor`, `post`, `ladder`, `leg`, `rowboat`, the sauna rafts' pontoons and cabins, and `prop` for a level's own piece. Every prop is a
  per-pixel piece in a material (`Stuff`), kept and copied. Langkaia (first script) reaches it through `TEXTURED.prop` and `TEXTURED.walls`.
  The kit's own `lampPost`, `panelDoor`, `walls` drawing are the front page's and untouched.
- **Drawn**: the lamp posts at Rådhuset (the square's), Gamlebyen, Vålerenga and Ekeberg's viewpoint (the old town's cast-iron lantern),
  Vigelandsparken's bridge (a park lantern in its iron); railings at Ekeberg's viewpoint, Rådhuset's balcony, Slottet's pond, Vålerenga's
  terrace, the diving tower; plank walls of Langkaia's sheds and club hut and Vålerenga's yellow and red houses; the kiosk's and the home's
  doors; the sauna rafts, the rowing boat, the diving tower's legs and ladder, the posts under the club's deck; Rådhuset's ferry and
  gondola; Slottet's balusters and crowd barriers; Holmenkollen station's posts; Akershus's fire baskets; Bjørvika's mesh fence and
  container; every sign board's post; the rope at Vigelandsparken's broken span. **Left alone, with reasons** (`o28/before.md`): the
  trains and trams (drawn a column at a time, clipped by tunnels and track), the bells, the logs and buckets, the chairlift, the hoist,
  windows, lanterns and torches that already flicker, the Opera's door.
- **The line map** (`levels/kartArt.ts`): every station's skyline is a piece of its own, the piers stand in the water, the decks have joints
  and bolts (line 1's `L` tile is drawn by the map's `tile` now), the station marks are enamelled, the water darkens in bands (a rectangle
  a band where it was one a screen column), the door Hjem is the stage tower's cladding, and the mirror balls hang from a bracket on
  the rune stone.
- **What the invaders throw** trails three pixels of its level's first neon (`trails` in `render/feel.ts`): drawing only, never once the
  shield has spent it, never inside the rune's ring, never with reduced motion. The shots themselves are as they were.
- **The ground's own band** (`render/palette.test.ts`, "the lane's ground keeps a band of its own"): saturation and the spread of value by
  area, and every material's neighbouring pixels at most a sixth of the figures' contrast apart; the fortress at Akershus and
  Gamlebyen's quay planks were quietened to pass it.
- **The first script in a worktree** (order 27's open question): not reproduced; what was ruled out and what was found (vite under Bun
  measures 0.84 kB more and fails the budget) is in `o28/after.md` and `handbook/lessons.md`.
- **Looking at a prop**: serve two builds side by side, take the same addresses at `--size=1280x850` (four screen pixels an art pixel),
  and `python3 tools/glance/diffcrop.py <out> <before> <after>` crops both to what changed.
- **Unplayed**: none of it has been seen at speed or on a phone.

## Order 29: the encore

Order 29 (`orders/29-the-encore.md`, ADR 0052, DESIGN's "Loki at the encore"; numbers and pictures' places in
`apps/viking/tools/review/o29/`). What to know:
- **Gated by every rune, gating nothing.** `kartDef` adds the stop (`ENCORE_STOP` in `levels/index.ts`, the door `E` at column 109 of a
  map 115 wide) only when `allRunes(progress, ORDER)`; otherwise the map is `kartMap(open)` exactly as before (tested for every set
  with one rune missing; the pictures compared byte for byte, `o29/map.md`). The page lets `#encore` open only then (or under
  `?debug`). It is not in `LINE`, `ORDER` or `BUILT`, so no test or count that walks the stations sees it.
- **A level with no rune.** `rune: -1`; its card's title is its landmark ("The encore · Middelalderparken") and its last line its
  `cardLine`; the level ends when the boss slot's `ends()` says so (`play.ts` stops the clock); the page saves `best.encore` and shows
  the card on the boss's `gone` event (`main.ts`).
- **Loki** is `game/loki.ts` (rules), `render/loki.ts` (drawing), `levels/encore.ts` (the stage): one chunk (`vite.config.ts`, `OWN`).
  His frames are built from a rig of parts (head, wig, shades, jacket, sweater, limbs drawn as two- and three-pixel strokes between
  joints), so a pose is a list of joints; `tools/glance/loki.ts` writes his sheet for `framesheet.py`. His glammed colours are the enemy
  palette's; his plain ones are held off every neon and role by `levels/encore.test.ts`.
- **His tells** are the bosses' own lengths (club 60, rev 60, ring 90 steps), tested against the shortest of the three bosses' (60).
- **The route and the sloppy player**: `levels/routes/encore.ts` (one closed-loop fight move); the encore is in `tools/review/common.ts`
  (with the pole and the shield), so `bun fresh.ts levels=encore` measures it.
- **The words** are a block of their own at the end of `game/story.ts` (`ENCORE`, `ENCORE_ALTERNATIVES`); a test holds every line
  above it to its hash on `origin/main`.
- **Unplayed and unheard**: nobody has seen it at speed or on a phone, or heard the four new stings.

## Order 30: small debts

Order 30 (`orders/30-small-debts.md`, ADR 0053; numbers and pictures' places in `apps/viking/tools/review/o30/after.md`). It added
nothing new. What to know:
- **Without `feel`'s file** (ADR 0053): every hook the first script calls into `feel`'s file (`TEXTURED` in `render/tiles.ts`) has a
  plain drawing where its thing stands; Langkaia's props had none (`TEXTURED.prop?.(…) || R(…)` now). Levels fetched later import
  `feel`'s file with them, so they never draw without it. The map without its look (`BARE`, now in `levels/kart.ts`) draws line 2's
  deck and gate. `levels/lazy.test.ts` holds all of it.
- **The encore, finished off**: its stop on the map keeps its neon's light after dark, with a glow of its first neon round the tubes
  (`light()` in `kartArt.ts`'s `encoreStop`), until the encore is seen; Loki's club is drawn at the troll's size (raised, all of it
  the tell's violet); with every rune the map fetches the encore's file when the page is idle (`ahead` in `levels/kart.ts`), never
  with a rune missing.
- **Reduced motion** is held by `render/reduced.test.ts`: every place the drawing reads the clock to turn something on and off (in
  the app and the kit) is held with reduced motion or named as an idle or a cycle; every boss held at each move, every ledge's
  warning and the map drawn with the clock running. It found the kit's oars blinking their warning and Slottet's banners
  theirs, Stortinget's platform board scrolling, the dawn's rays, the fountain's streaks, the serpent's daze and the parked
  plough's wisp running; all held now.
- **`?debug&card`** shows a level's card at its end as its rune would (line 1's ending on Vålerenga with every rune of line 1,
  line 2's on Gamlebyen with all sixteen, the encore's). The card was held to half the screen's width (placed at `left: 50%`
  with no width); on a phone line 2's ending wrapped two or three words a line. It is as wide as its lines now, up to the
  screen less 32 pixels. `tools/shots.ts --lang=nb-NO` photographs in Norwegian.
- **`tsc` from the root** fetches TypeScript 7 (the root has no TypeScript of its own; `bunx` takes the newest), whose DOM types
  say `hidden` may be `"until-found"`: `handbook/lessons.md`. Both are clean.
- **Unplayed**: none of it has been seen on a phone or at speed; reduced motion has been seen only in still pictures.

## Order 31: loose ends and a second look

Order 31 (`orders/31-loose-ends-and-a-second-look.md`; each item done or not, with its measures, in
`apps/viking/tools/review/o31/after.md`). It touched nothing that waits on Lars: no story words, no fight, no difficulty. What to know:
- **The cards with a mouse.** The page's camera gives the header's height to CSS (`--bar`) every frame on any screen, so the game's
  own cards keep below the header in a narrow window too (ADR 0043 amended). Touch screens and wide windows are byte-identical.
- **Slottet's first pigeon** is seen on plain street: the parade joins past its stretch (each pair rising out of the crowd as the
  banners do) and the crowd waves no flag over it. Drawing only; the pigeon where it was, every run file identical.
- **Nordmarka's dark**: the invaders keep their red outline over it (the ring alone, copied again on its own pixels), measured
  against the forest's fields under every depth of the dark (ADR 0044 amended; `render/palette.test.ts`).
- **Reduced motion is held by drawing** (`render/reduced.test.ts`): every level's scenery across the whole level and every thing
  in it as the scripted route finds it, recorded call by call at several steps of the clock with the world held, as in a browser
  (a stand-in `document`, so kept pieces and outlined shapes are made once and copied). What a level draws across itself that moves
  with the clock is the world's own motion, named in `MOVES` with why; a thing never comes back to a recording within 24 steps. It
  found Ekeberg's fjord glints drifting with reduced motion (held now). `hazardEdge` moved from `main.ts` to `render/stand.ts` for it.
  Its limits are in `o31/after.md` (what reads the world from the clock is watched only where it stands still; `main.ts`'s own
  drawing, the banner and the flying rune, is not drawn by it).
- **Stortinget's escalator shafts** are kept strips (roadmap idea 5): 1,363 to 2,947 rectangles a frame at the shafts at 390 x 844
  where they were 4,259 to 6,630, the pictures byte-identical.
- **Both languages** (roadmap idea 11): `game/words.test.ts` looks through every module and every level for words kept by language
  (387 places) and holds both there; nothing was missing. Every line orders 21 to 30 added was seen at 360 wide in both
  (`o31/words.md`); nothing ran out of its box.
- **The second look** (`o31/before.md`): the blue tram at Ekeberg and Vålerenga (`tramSide` in the props kit: one piece held by a
  clip, glass by day and lit after dark), Vigelandsparken's main gate (granite pillars, wrought-iron lanterns) and Korketrekkeren's
  lit trail (tarred poles) redrawn by ADR 0051's rules; the rest looked at and left, with reasons (the logs and the chairlift's
  chairs are the next candidates).
- **Unplayed**: none of it has been seen on a phone or at speed.

## Order 32: lights after dark

Order 32 (`orders/32-lights-after-dark.md`, ADR 0054, DESIGN's "Lights after dark"; the table of every light and its decision in
`apps/viking/tools/review/o32/before.md`, each item done or not with its measures in `o32/after.md`). What to know:
- **One rule**: a thing that gives light registers its lit part as a light, so after dusk it is its own colour over the dark; nothing
  drawn after it dims it; a lamp at the lane lays a small warm pool on the ground under it, registered in the level's `front` (the
  props kit's `pool`, the kit's `lampPool` while it is on the screen, or `poolAlong` on a slope); nothing else glows (an invader's light is its neon glow); light
  colours warm, off the neon and off what he takes, stands on and uses but by name. `render/lights.test.ts` holds it on a census of
  every scene (`render/lightcensus.ts`; `tools/glance/lights.ts` prints it): each scene's lights are named in a table there, so a new
  light is a decision.
- **Vålerenga's night**: from order 15 (`39f30f5`, the night moved out of `main.ts` behind `Art.night`, given to Nordmarka alone),
  Vålerenga's lane behind the church has had no dark, and what its `overDark` draws (the Pi on the yellow house's sill and its red and
  green light, the paper cranes in Kruttverket's window, the eyes over the dark) was not drawn at all. Order 32 draws the Pi and the
  cranes again (its `Art.night`). The lane's dark was still not drawn (about 1,580 rectangles a frame drawn as before); order 33 drew it
  again, kept (below).
- **Over a level's own dark** (`overTheDark` in `alive/glamour.ts`, Nordmarka's): each invader's glow a pixel further out, the night's
  own colour in the pixel next to the red outline (the red against its own orange glow was 22.7, measured 16.8 at the worst; now 44.3
  against 29.2 by day), then the outline.
- **The logs and the chairlift's chairs** are props-kit pieces (ADR 0051 amended).
- **Reduced motion** (`render/reduced.test.ts`): jumpers in their leap and the kit's carriers are recorded where they are (a named leap
  cycle allowed its frames); what `render/feel.ts` draws (him, the answers, the marks of things to use, the shadows) is drawn with the
  world held. Still not drawn: `main.ts`'s own drawing (a test cannot import it).
- **Unplayed**: none of it has been seen on a phone or at speed.

## Order 33: the lane behind the church, and room to breathe

Order 33 (`orders/33-the-lane-behind-the-church.md`; each item done or not, with its measures and pictures' places, in
`apps/viking/tools/review/o33/after.md`). It touched nothing that waits on Lars. What to know:
- **The lane's dark, kept.** Vålerenga's lane behind the church is dark again after dusk (by day, the T key's sky, it is not, as on the
  live site since order 15), with its lanterns' and the church's first window's light through it, his headlamp, and the invaders' glow,
  red outline and eyes over it. `drawNightKept` (`render/night.ts`) draws exactly what `drawNight` would: the still part of the dark is
  worked out once, in world pixels, as one `Path2D` a darkness; his headlamp's rings once a facing; a frame fills each path once in
  its own colour under clips, so every pixel gets the same fills in the same order. Found on the way, in headless Firefox: a path of
  whole-pixel rectangles is filled byte for byte as `fillRect` fills it, also under even-odd clips and with destination-over; a copy
  (`drawImage`) of a see-through piece is not (one or two levels off on opaque ground, more where the ground is see-through), so a
  see-through drawing cannot be kept as copies and stay byte-identical. `render/night.test.ts` holds the kept dark to `drawNight`
  pixel by pixel (a stand-in canvas that fills rectangles, paths and clips); the pictures of 33 places at both sizes are byte-identical
  to a build that draws the lane with `drawNight`. `render/night` now comes with the kit's dark, in a file both levels fetch.
- **What it costs.** In the lane at 390 x 844 no more rectangles than on the live site (the dark makes none; `?debug&perf` does not count
  path fills): 25 to 77 path fills holding 2,500 to 3,800 rectangles and 18 or 19 clips a frame, where `drawNight` made 830 to 1,450
  rectangles and spent about 37 ms of JavaScript a frame working out its rows (0.7 ms kept, in Bun). In Firefox on the Pi (fifty frames,
  median of three, quiet) the lane costs 5 to 8 ms a frame over the live site's 43 to 45 where it is on the screen and nothing elsewhere;
  `drawNight` cost 16 to 45 ms there and 5 off the lane (`o33/after.md`).
- **Harmless things keep off the warning red** (ADR 0044, amended): `render/warning.test.ts` draws every view of every level as the page
  does, what carries him, ledges, cannons, drums, flags and what stands in front with the paint on top, and `alive/props.test.ts` every
  prop piece: no more than 12 pixels within 10 of the warning red but by name. Recoloured for it: the chairlift's chairs' backs (the
  frame's steel), the ferries' bands at Rådhuset and Bygdøy, Stortinget's trains' stripe, Holmenkollen's lift cage rail, Slottet's red
  balloon (the flag's own red), Vålerenga's washing. Not held, and listed in `o33/after.md`: scenery and ground in the kit's red (his
  hat's), among them Stortinget's walls and Holmenkollen's rails.
- **The first script**: 57.94 kB gzipped (see "First script" above).
- **`main.ts`'s own drawing is tested**: after dusk, the rune's flight and the banner's fade are in modules the reduced-motion test
  imports (part 7). The rune still flies with reduced motion: a question for Lars.
- **Debug ways**: `?debug&touch&note=pole|shield|sledge` shows the pad's note of what just changed as the page shows it;
  `?debug&say=<key>` has a level's boss say a line of its words in its bubble (`missBite` at the encore).
- **Unplayed**: none of it has been seen on a phone or at speed.

## Order 34: what Lars said

Order 34 (`orders/34-what-lars-said.md`, ADR 0055; each item done or not, with its measures and pictures' places, in
`apps/viking/tools/review/o34/after.md`). Lars answered the waiting questions on 22 November (`handbook/conversations.md`). What to know:
- **The tenth station is Gamle Oslo** (ADR 0055, superseding 0038's name): the station, banner, cards, gate sign, header and the page's
  description say so; the id is still `nabolaget`. Its own words lose "home" and the claim that a house is his: an ode to Oslo (the banner's
  "A winter night on the east side", the plough's "a quiet evening", "The street is clear, for once", the tenth rune's "Oslo, end to end"),
  with two other ways beside each in `conversations.md`. The doors labelled Hjem lead to the site's front page and keep the label. Code
  calls the house the yellow house (`YELLOW`, `yellowHouse`). Vålerenga is still a place in it (the first sign, the church, the lane).
- **Scenery and ground off the warning red** (ADR 0044 amended): `render/warning.test.ts` now also draws each view's far layers (washed by
  their haze), the street's backdrop, the water and the tiles; at most 24 pixels of a view within 10 of the warning red, but by name (the
  third rail's cover, which hurts). Recoloured in the levels' own files (the kit's palette is the front page's and unchanged): Stortinget's
  brick red-orange tiles' stripe, posters and kiosk sign, its kiosk and ticket machines red-brown, its far signs the trains' red;
  Holmenkollen's padded rails and the jump's lip markers blue; Vålerenga's stained glass ruby; Bygdøy's kiosk sign the ferry's red; the red
  hire sledge at Frognerseteren wine (the order thought Frognerseteren's walls were red: they are tarred logs; the red was the sledge).
- **The encore's tune** (`game/tune.ts`, in the encore's chunk): an original glam-rock tune written down as data and played through the kit's
  `voice` (no change to the kit): a bar of intro as he wakes, a sixteen-bar loop (chorus, verse, solo) by drums, bass, a power-chord riff and a
  lead; the wig takes the lead with it, the shades the riff, the jacket the drums and the bass; six plain notes once the stage goes plain. The
  page asks it once a frame (`LevelDef.music`) with its sound, or none on a card, hidden or gone; muted it schedules nothing; time lost is
  skipped. `game/tune.test.ts` holds it (deterministic, whole bars, ranges and volumes, the layers, the plain notes, silence when muted, the
  shouts). **Nobody has heard it**: headless Firefox plays no sound. `?debug&told&cleared=all#encore` plays the encore with it;
  `?debug&told&level=encore&music=band|drums|bass|riff|lead|intro|plain#encore` plays a part at once.
- **Loki's outfit** (`render/loki.ts`): late-1980s glam metal at its far end, in general (teased hair to under his pose's stars, a headband,
  shades over his eyes with purple shadow, leopard print, split neon spandex, a studded belt, scarves, a pointed guitar slung behind him).
  The shades were two rows at his hairline (hidden by the wig while glammed); they are one row over his eyes now. Every box, tell and timing
  as it was; the sloppy player's run file for the encore byte-identical.
- **He shouts** in time with the tune: four lines of the game's own (`shout1` to `shout4` in the encore's block of `game/story.ts`, an
  alternative each), in a bubble beside him while he struts or poses, never during a tell and never over his lines or hints. Under the
  harness (`?debug&steps=…`) the page draws one frame and the music never saw him wake, so no shout shows there: `&say=shout1` shows one.
- **The thematic rule** (DESIGN, "The levels"; ADR 0055): difficulty and enemies follow the place; `tools/review/o34/thematic.md` holds every
  level against it with proposals, none carried out (he has not played).
- **Unplayed and unheard**: none of it has been seen at speed or on a phone, and nobody has heard the tune.

## Order 35: housekeeping, and every figure on one page

Order 35 (`orders/35-housekeeping-and-the-figures.md`; each item done or not, with its measures, in `apps/viking/tools/review/o35/after.md`).
It retunes nothing. What to know:
- **The suite's time** is under 300 s on a quiet Pi (it was about 363 s): the tests' stand-in contexts keep their methods as their own (a
  proxy round them was asked on every call; `ANY_METHOD`, `NO_METHOD` in `render/fields.ts`) and work a colour out once; the reduced-motion
  recorder mixes numbers into its fingerprint; the warning tests share one walk; the reach searches run on a pool of workers, the
  costliest first (`game/reachlevel.ts`). Every changed test was shown to fail on a planted fault (the table in `after.md`). A new test that
  draws every level should use those recorders, or the walk another test has made.
- **Every figure on one page**: `bun tools/figures.ts <dir>` in `apps/viking` writes a sheet of every figure the game draws and
  `figures.json` naming each in both languages, from the game's tables (`src/alive/figures.ts`; `alive/figures.test.ts`). Nothing it writes is
  committed; the page of every figure (handbook, resources) can be rebuilt from it.
- **The harness**: the stepped page's music hears every step, so the encore's shouts show in a still picture; the blank pictures were taken
  before the page had drawn, and `tools/shots.ts --wait` now waits for the page to say it has drawn and names blank pictures; `?debug&perf`
  measures a whole frame while a hit holds the picture; `tools/glance/perf.ts` measures every place in one browser.
- **Lights near the warning red** are named in the warning test (Bjørvika's crane lights, ADR 0044 amended).
- **Holmenkollen's hare**: order 35 drew a mountain hare where the hedgehog was; the planner took it out again in review (it read as
  a pale blob and its spikes warned less clearly). The hedgehog stands there; the proposal waits with the rest of `o34/thematic.md`.
- **Unplayed**: none of it has been seen on a phone or at speed.

## Order 36: the maze catches up

Order 36 (`orders/36-the-maze-catches-up.md`, ADR 0056, DESIGN's "Jernhaugen, the maze"; each item done or not, with its measures, in
`apps/viking/tools/review/o36/after.md`, and the maze as it was in `o36/before.md`). It changed none of the maze's rules. What to know:
- **The same man**: `packages/pixelkit/src/frames.ts`, `him.ts` and `feather.ts` are the viking game's frames, his sheet and the raven's
  feather, moved into the kit (the viking game's `alive/frames.ts` and `him.ts` re-export them; its `vite.config.ts` keeps them in
  `feel`'s file). The maze draws him from them standing on its floor (a three-quarter view: the walls show their faces), with a torch.
- **The mound** is `packages/maze/src/look.ts` (the still layer as a grid of colours, made once a level: floor, lining, faces with their
  iron band, the hill, the pad, the doorways) and `figures.ts` (the stones, the key, the raven, the mound-dweller, the adders); the gate
  and the crumbling floor are as they were (already drawn with ramps).
- **Held by tests** in `packages/maze`: `reduced.test.ts` (nothing blinks), `warning.test.ts` (nothing harmless in the warning red or
  the curse's reds), `joins.test.ts` (the joins with its two pages); the help line for the device in `i18n.ts` (`helpFor`).
- **The joins** in stepped pictures: in from the map and out to it, in from Nordmarka's mound and back into Nordmarka, the feather's
  moment after the maze. Gone through a door while the page is loading, the address's change replaces the page's history entry (the
  HTML standard's rule for a navigation before load), so the maze's way out, Back, has nowhere to go: no player is at a door then, but
  a stepped picture that walks him in at load shows the maze still (hence `walkin`, after load).
- **The figures' page**: the bosses and Loki now have the outline the page gives them (`noPage.outline` in `render/sprite.ts` hands the
  figures tool each shape and its rim where there is no page), and the maze's figures are on it, named in both languages.
- **Unplayed**: none of it has been touched on a phone or seen at speed; the finger is synthetic pointer events in a headless browser.

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
7. **Untested paths.** The ending from a real stored save; the touch dash button and the Sit button; the loading
   board on a slow line (seen only with `?debug&fetch=hang`); upright phones on a real phone. Since order 36 the way into the maze from
   the map and back, from Nordmarka and back into it, and the feather moment after the maze are stepped pictures (`?debug&walkin`, `&out`,
   `&after`), and what each page remembers of the maze is a test (`packages/maze/src/joins.test.ts`): none of it by a person.
8. **Margins.** The first script is 57.94 kB gzipped of a 60 kB budget after order 33 (59.60 after orders 31 and 32), and the build fails over it
   (ADR 0011 says what can still move out, ADR 0035 how it is enforced). The viking test suite takes about
   250 s alone since order 31 (212 s after order 30; after order 32, 323 s, the new lights test 13 s and the reduced-motion file's
   two new parts about 12 s of it; after order 33, 340 s, at the limit its order set: 323 s for `origin/main` the same hour; after order 34, 370.5 s against 335.0 s for
   `origin/main` the same hour, over the 360 its order set: its scenery walk in `render/warning.test.ts` about 18 s, `o34/after.md` says what could be trimmed;
   after order 35 under 300 s, its three runs in `o35/after.md`): about 100 s of it the reach and dead-end searches on four workers (CPU-bound:
   Akershus's alone takes 52 s), and about 70 s the reduced-motion test, which draws every level.
9. **The viking header is solid cream,** not the front page's frosted bar
   ([ADR 0015](../adr/0015-solid-header-in-viking.md)). Since order 21 on a touch phone it is the run alone during a
   level (two rows upright, one on its side, ADR 0043); with a mouse on a narrow window it still wraps as before, and since
   order 31 the game's cards keep below it however many rows it wraps to (the maze's own cards keep their own place).
10. **The maze's words** keep the original game's taunting voice, one exclamation mark included;
   order 13 read the viking game's lines, not the maze's. Order 36 kept them; only the help line changed (on a touch screen it
   says what a finger does).
11. **Line 2 is unplayed too.** Bygdøy, Vigelandsparken, Korketrekkeren, Østensjøvannet, Bjørvika,
   Gamlebyen, the serpent, the shield and the two-line map have been seen only in still pictures and
   played only by scripts. Untested by a person: whether a hook's hop reads as a choice and not a chore;
   whether a rising stone is seen in time; the serpent's rhythm and its hints on a phone. Untested by a
   person: whether a statue's creeping reads when it is at the edge of the screen; the sledge at speed,
   the duck on a touch screen (the Shield button), the camera's lead on a real phone; whether a person
   lingers on the lake's pads long enough for its swans to matter. The pad (since order 21 over the picture, every control
   56 x 56 or more) was not seen on a touch screen. The rocking decks' feel (carried a pixel up or down a
   step as he walks) is untested by a person. On an upright phone with a mouse (in headless Firefox at a device
   pixel ratio of 1) a level's run row is cut at the right, past the lives; on a touch phone the bar is the run alone
   since order 21.

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
  ([ADR 0003](../adr/0003-fixed-body-constants.md)). Add to the world or add an ability. The one change since: the edge's
  forgiveness, 6 to 10 steps ([ADR 0048](../adr/0048-the-edge.md)).
- A change to the kit: re-run the front page gate.
- A new rule: pure, in `game/play.ts` or a small module beside it, with a test on a made-up
  level in `rules.test.ts`.
- Words: Norwegian and English, both, in the dry voice ([ADR 0016](../adr/0016-two-languages-dry-voice.md)).
- Drawing a prop (a lamp post, a railing, a wall of planks, a door, a boat): from the props kit, of its place, after the three questions
  (DESIGN's "Props at arm's length", ADR 0051); `alive/props.test.ts` says what it may not come near.
- Drawing ground or a wall: from the textured set (DESIGN's "The ground under him", ADR 0049): a material in the level's file,
  its tiles drawn with `tile`; the test names any solid tile that is not.
- Drawing anything new: draw it as per-pixel frames with a ramp of tones and a lit side, with the frames DESIGN's "Frames,
  shadows and depth" asks of it (ADR 0045, 0046); for a level that keeps its boxes, draw it for the kept box and pass `fit`. Its colours come from its role (an enemy from `ENEMY`, never in its red, outlined by the page;
  what moves and does not hurt outlined in `ROLES.calm`; what he stands on with the yellow paint, and nothing else in
  that yellow; DESIGN's "Colour says what a thing is", [ADR 0039](../adr/0039-colour-says-what-a-thing-is.md),
  [ADR 0044](../adr/0044-paint-says-where-to-go.md)).
  `render/palette.test.ts` says which colour is too near which, and by how much.
- Drawing a new enemy: give it one or two glam marks (`mark` pieces) and a natural self (`NATURAL`), and a new level a lean (`LEANS`) and
  two to four pieces of the invaders' scenery (`PLACES`): DESIGN's "The glamour", ADR 0050. Harmless things stay natural: no neon.
- A decision made or reversed: add or supersede a record in `docs/adr/` and update this file.
