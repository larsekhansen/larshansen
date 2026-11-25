# Start here

State as of 25 November 2026, after order 45 was built (branch `upright-phone`, waiting for review); order 44 was reviewed and merged (PR #92). Check `git log` and [`roadmap.md`](roadmap.md)
before trusting any of it.

## What this is

Lars's personal monorepo, self-hosted on a Raspberry Pi 5 (8 GB) at his home, public on GitHub
(`larsekhansen/larshansen`). Three games share one pixel kit:

- **The front page** (`apps/landing`, larshansen.dev): a small platform scene whose doors lead
  to his other apps. It is finished and guarded: 28 reference pictures must stay byte-identical.
- **Vikingfjorden** (`apps/viking`, larshansen.dev/viking/): the game nearly all work goes
  into. A viking takes the T-bane through Oslo: sixteen levels on two lines, ten runes then six
  (VIKING), three bosses, and with every rune an encore where Loki is met (with a tune of its own since order 34). Reached by the secret door at the top of the Opera on
  the front page.
- **Jernhaugen** (`packages/maze`, `apps/iron-maze`, maze.larshansen.dev): a maze, also playable
  inside the viking game; drawn in the viking game's grain since order 36 (ADR 0056).

Lars plays on his phone. He comments on the live site in short, fast, misspelt messages, and
means them. He does not read code.

## How it is run

Lars set the process (ADR 0013) and has repeated it many times: "keep going, merge and deploy
when done". One planning session (you) plans, writes a work order, hands it to an Opus
subagent, reviews what comes back, merges and deploys, and tells Lars what changed in plain
words. He looks at the live result and comments. He has given standing leave to push, merge
and deploy; "this project has no real risk if breaking, so dont be afraid. but do be thorough
in your testing." [`playbook.md`](playbook.md) has the steps.

## The state of the game

| Round | PR | What it did |
|---|---|---|
| Orders 1 to 17 | up to #63 | Kit, sixteen levels, three bosses, the maze, fairness, line 2 (see HANDOVER) |
| 18 seen at a glance | #64 | Enemy and platform palettes, roles of colour (ADR 0039), card goes to the map, Vålerenga |
| 19 felt at a glance | #65 | Effects, hit-stop, sounds for every event (ADR 0040) |
| 20 places at their best | #66 | Speed (ADR 0041), flat places filled (ADR 0042) |
| 21 in the hand | #67 | Phone layout, translucent touch pad, camera above the pad (ADR 0043) |
| 22 paint and grain | #68 | Red outline hurts, pale blue harmless, yellow paint to stand on, haze (ADR 0044); the pixel study |
| 23 alive | #69 | Frames, shadows, depth, alert mark, edge forgiveness 6 to 10 (ADRs 0045 to 0048) |
| 24 line 1 redrawn | #70 | Way 3 for all of line 1, its bosses, the small things; laps, flicker, things in front |
| 25 line 2 redrawn | #71 | Way 3 for line 2 and the sea serpent |
| 26 the ground | #73 | Textured ground and props (ADR 0049); small flags; spruce spires; rat tails; amber wasps |
| 27 the neon invaders | #74 | The glamour (ADR 0050): neon is a spell on Oslo, a stomp breaks it; marks and a natural self on every figure; the story; the boy, kid, sledger and cart redrawn |
| 28 the last flat things | #76 | Props of their place (ADR 0051): lamp posts, railings, plank walls, doors, rafts, the boat, the ferry; the line map drawn as a level; a neon trail behind what the invaders throw; the ground's own band |
| 29 the encore | #77 | Loki met once (ADR 0052): with every rune, a stage on the water in Middelalderparken past the longship; he borrows the three bosses' moves and tells, poses between them, loses his hair, shades and jacket to three stomps and walks off plain with a thermos; no rune, no total, gates nothing |
| 30 small debts | #78 | What 27 to 29 left: plain drawings without `feel`'s file (ADR 0053); the encore's stop glows after dark, Loki's club at the troll's size, the encore fetched ahead; reduced motion photographed and held by a test (seven things still ran); a debug card at a level's end and the card as wide as its lines on a phone; shared kinds looked at in every level; `tsc` from the root |
| 32 lights after dark | #80 | Every light asked after dusk (ADR 0054): lit things are their own colour over the dark, pools on the lane, nothing else glows, held by a census; Korketrekkeren's trail, Gamlebyen's pools, the encore's stage, neon signs, the T sign, the map's windows; Vålerenga's Pi and paper cranes back (missing since order 15; its lane's dark left for a decision); logs and chairs redrawn; a dark pixel between outline and glow in the dark; reduced motion watches moving things and feel's drawing |
| 33 the lane behind the church | #81 | Vålerenga's lane dark again (missing since order 15), kept as paths at the same pixels; harmless things off the warning red (ADR 0044 amended: chairs, ferries, trains, a balloon, a shirt recoloured); the first script 59.60 to 57.94 kB (the synth and the page's drawing after dusk into `feel`'s file, ADR 0053 amended); that drawing held with reduced motion |
| 34 what Lars said | #82 | Lars's answers of 22 November: the tenth station is Gamle Oslo, its words an ode to Oslo with no "home" (ADR 0055); scenery and ground off the warning red (ADR 0044 amended); the encore's original glam-rock tune in the game's own synth, following the fight, Loki at the far end of late-80s glam in general, four shouted lines; the rule that difficulty and enemies follow the place, with proposals only |
| 35 housekeeping and the figures | #83 | The viking suite under 300 s on the Pi with nothing it held lost; a sheet of every figure the game draws with `figures.json` naming each in both languages (`apps/viking/tools/figures.ts`); the encore's shouts under the harness; blank harness pictures found and named; perf at every place in one browser; Bjørvika's crane lights held by name; Holmenkollen's hedgehog a mountain hare |
| 36 the maze catches up | #84 | The maze in the game's grain (ADR 0056): him from the fjord's own sheet with a torch, the mound redrawn as its own iron-bound place, adders in the warning red, the key and the door with the kit's read; the help line says what a finger does on a phone; nothing blinks with reduced motion; one stepped harness for both pages; the joins held; the figures' bosses outlined and the maze on the page of every figure. The maze's rules unchanged |
| 37 up and down in the mound | #85 | In the maze his back going up a corridor and his face coming down one, a little sticky so a diagonal never flickers, his ghost's run by distance; the maze's reduced-motion test draws the scene itself; the maze page's first script 34.4 to 31.9 kB; a pretended notch and live frames in the harness, and the camera's jump on a notched phone gone (it eases for the ground ahead either way); bubbles off a notch; the maze's way out falls back where Back has nowhere to go; the figures' states in both languages |
| 38 a third look | #86 | Every figure on one table: all 119 looked at on their sheets and every enemy in place, glammed and natural, marked and ranked; the e-scooter redrawn as a hire scooter, the gull, the crow and the pigeon on the wing beating through shapes, the salmon's water breaking, the maze's raven and mound-dweller with faces; a flyer's beat and every level's silhouettes held by a test (ADR 0046 amended). Drawing only |
| 39 the rest of the table | #87 | The bishop's guard, the coot, the squirrel and the mound-dweller redrawn; a still tell for the jumpers with reduced motion, every other tell checked (ADR 0040 amended); every boss state, carrier, thrown thing and pickup photographed in place and measured, and what is thrown kept clear of its own glow after dusk; order 38's marks kept honest. Drawing only |
| 40 what he takes, and what warns | #88 | After dusk a dark line round what he takes, the maze's rule (ADR 0044 amended); every tell ranked in place and the weakest made to read (the track rat's snout, a closing wall's stones, the water round a pad or bundle about to sink, a gust's streaks), held to a size by a test; five of the figures left at mark 2 redrawn (stove pipe, pontoons, post, balusters, fire basket). Drawing only |
| 41 the screens between | #89 | Every screen that is not a level on one table (the map, the cards, the bar, the pad, the maze's own) and the worst mended: a pressed button darker with a white ring (it vanished over white ground), a heart lost hollow, a dimmed button with a dashed edge, the map's station boards in rows, a padlock on a shut station, the "!" clear of the head, the edge arrow off a notch, the bar's coin and gold drawn as the game draws them; the last four weak tells (the welder's sparks, Bjørvika's gust, the sinking stone, the heron); the rune's stone a pale rim after dusk (ADR 0044 amended). Drawing only |
| 42 room, and the edges of the screen | #90 | The first script from 58.65 to 55.80 kB with nothing a player sees changed (ADR 0035 amended: what only later files use moved into files that already existed, dead plain drawings out); a card's foot off the home bar, the maze's list kept on the screen on its own page, the opening card holds the plate back and hides the pad, the map's boards kept off the pad and a notch (ADR 0043 amended); a thin dark line round the page's speech bubbles; the "!" three pixels wide with a two-pixel dot |
| 43 the far view | #91 | Every level's far view on one table (an ode to Oslo); the thinnest given what a person who knows Oslo looks for from there, once each, as silhouettes (`alive/far.ts`, ADR 0047 amended): Rådhuset, Akershus, Bygdøy, Vigelandsparken, Holmenkollen; every far colour held off the warning red, the paint and every role under every sky (ADR 0044 amended). Drawing only |
| 44 the rest of the far view | #92 | The places order 43 could not look up, given by the planner (not looked up; they wait for Lars) and the table finished: the jump seen from the town with the TV tower above and behind it (Vigelandsparken, Bygdøy, Slottet); Akerselva's Grefsenkollen without a tower and its two churches; Gamle Oslo's Kampen kirke once, the Barcode and Ekeberg; Østensjøvannet's reeds, ridge blocks and Østmarka; Korketrekkeren's TV tower and the town far below; Langkaia's islands; Ekeberg behind the encore's towers; the far-colour test walks the map (ADR 0044, 0047 amended). Drawing only |
| 45 the upright phone | (branch `upright-phone`) | Every level looked at upright as a phone shows it (a pixel ratio of 3) and its canvases read row by row: 40 % plain sky, 45 % ground of one material; where he stands kept, the far layers rise with him upright as on a wide screen (ADR 0043 amended); each level's tall sky and the ground under him going down in layers into its own dark, upright only (`alive/upright.ts`), ten levels; a test that no flat band takes more than a fifth of the screen upright. Drawing only |
| 31 loose ends and a second look | #79 | The cards under the header with a mouse; Slottet's first pigeon on plain street; Nordmarka's invaders keep their red outline in the dark; reduced motion held by drawing every path; Stortinget's shafts kept and copied; every word in both languages, held by a test; the tram, Vigelandsparken's gate and Korketrekkeren's lit trail redrawn |

**The single most important fact:** nothing has been judged by a person at speed or on a real
phone before going live. The Pi cannot run the game in a headless browser (HANDOVER,
"Checking"). Every claim about feel, motion, sound and touch is unverified until Lars says so.

## What to do first

1. `git fetch origin && git status -sb && git log --oneline HEAD..origin/main` (CLAUDE.md).
2. Read [`roadmap.md`](roadmap.md): is a round in flight? Is a hand-back waiting?
3. Check the Pi is tidy: [`playbook.md`](playbook.md), "Housekeeping".
4. Read [`conversations.md`](conversations.md) for what Lars has asked that is not yet live,
   and the open questions he has not answered.
5. If the front page references in `/tmp` are gone (a reboot clears `/tmp`), re-create them
   before any kit change: HANDOVER says how.

## The rules that are easy to break

- **Pushing to `main` deploys.** Work on a branch. Bun only.
- **ADR 0003**: the body's `MOVE` and `JUMP` are fixed (one exception, ADR 0048).
- **ADR 0014**: Lars's personal places are used discreetly; no addresses, nothing about a
  wedding, in any committed file. The private notes are in the session memory directory, not
  here.
- **ADR 0035**: the viking game's first script must stay under 60 kB gzipped; the build fails
  over it. New drawing goes in lazy chunks, and a new module is named in `vite.config.ts` (one it is not told about lands in the
  first script). Order 42 made room: 55.80 kB (55.82 after order 43, 55.83 after order 44, 55.94 after order 45).
- **ADR 0044**: colour means something. Yellow paint on a top edge is "stand here" and nothing
  else is that yellow; red outline hurts; pale blue outline is harmless; cyan corners are "use";
  violet is "hit now". `render/palette.test.ts` enforces it.
- **The front page**: 28 pictures byte-identical after any change to `packages/pixelkit`.
- **Nothing borrowed**: no commercial music, art or code. The reference games are GPL and were
  read for technique only.
