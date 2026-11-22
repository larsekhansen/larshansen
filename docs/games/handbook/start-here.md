# Start here

State as of 22 November 2026, after order 32 was built (not yet reviewed or live). Check `git log` and [`roadmap.md`](roadmap.md)
before trusting any of it.

## What this is

Lars's personal monorepo, self-hosted on a Raspberry Pi 5 (8 GB) at his home, public on GitHub
(`larsekhansen/larshansen`). Three games share one pixel kit:

- **The front page** (`apps/landing`, larshansen.dev): a small platform scene whose doors lead
  to his other apps. It is finished and guarded: 28 reference pictures must stay byte-identical.
- **Vikingfjorden** (`apps/viking`, larshansen.dev/viking/): the game nearly all work goes
  into. A viking takes the T-bane through Oslo: sixteen levels on two lines, ten runes then six
  (VIKING), three bosses, and with every rune an encore where Loki is met. Reached by the secret door at the top of the Opera on
  the front page.
- **Jernhaugen** (`packages/maze`, `apps/iron-maze`, maze.larshansen.dev): a maze, also playable
  inside the viking game.

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
| 32 lights after dark | (branch `lights-after-dark`) | Every light asked after dusk (ADR 0054): lit things are their own colour over the dark, pools on the lane, nothing else glows, held by a census; Korketrekkeren's trail, Gamlebyen's pools, the encore's stage, neon signs, the T sign, the map's windows; Vålerenga's night back (missing since order 15); logs and chairs redrawn; a dark pixel between outline and glow in the dark; reduced motion watches moving things and feel's drawing |
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
  over it. New drawing goes in lazy chunks.
- **ADR 0044**: colour means something. Yellow paint on a top edge is "stand here" and nothing
  else is that yellow; red outline hurts; pale blue outline is harmless; cyan corners are "use";
  violet is "hit now". `render/palette.test.ts` enforces it.
- **The front page**: 28 pictures byte-identical after any change to `packages/pixelkit`.
- **Nothing borrowed**: no commercial music, art or code. The reference games are GPL and were
  read for technique only.
