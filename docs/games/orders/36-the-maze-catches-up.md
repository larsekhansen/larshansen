# Order 36: the maze catches up

Written 22 November 2026, after order 35. Lars has not played yet ("carry on as planned"), so
nothing in the viking levels is retuned. The roadmap's idea 8 is the largest thing that does
not wait for him: Jernhaugen, the maze (`packages/maze`; alone through `apps/iron-maze` at
maze.larshansen.dev, and inside the viking game at `#jernhaugen`), has had none of orders 18 to
35. Its figures are in the old flat style, its help line names keys on a phone, and it stands
beside a game that has moved on. This order brings its looks and its touch up to the rest,
and changes none of its rules.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md` (all of what it says of the maze, "Untested
  paths", "Do not"), `docs/games/handbook/` (start-here, playbook, lessons, roadmap,
  conversations, resources), `apps/viking/docs/DESIGN.md` and `GRAIN.md`, ADRs 0003, 0014,
  0016, 0019, 0035, 0036, 0039 to 0055 and every ADR that names the maze, orders 9, 21, 23 to
  28, and `apps/viking/tools/review/o35/after.md`.
- `git fetch origin`; `git checkout --no-track -b the-maze-catches-up origin/main`. First
  commit: this order, as `docs/games/orders/36-the-maze-catches-up.md`. Commit as you go. Do
  not push, do not delete any branch (`iron-maze-original` least of all).
- Bun only. Stop preview servers by port (`fuser -k <port>/tcp`) and kill your own headless
  browsers by PID when done. Never `pkill -f` with a pattern that matches your own command line.
  Pictures go under `~/.cache/claude-scratch-larshansen/o36/` (not `/tmp`, which is RAM).
- Do not add, commit or touch `post/`. ADR 0014 and ADR 0003 stand. `game/story.ts` and the
  limits in ADRs 0050 and 0052 are not yours to change.
- **The maze's rules do not change**: no level layout, speed, timer, record rule, ghost format
  or stored key. Records and ghosts a player has already stored must still load and replay
  exactly. Prove it: the bot's runs (`bot.ts`) on every level, step for step, identical with
  `origin/main`, and a ghost recorded on `origin/main` replays to the same end on your branch.
- **The maze's words keep their voice** (HANDOVER, weak spot 10): do not rewrite its taunts.
  Only item 2's help and hints change, in both languages.
- The viking levels: sloppy run files on seeds 201 to 260 byte-identical with `origin/main`;
  every level's pictures by day and night at 390 x 844 byte-identical. Front page 28 of 28.
  First script under 60 kB (58.14 now); the maze stays in its own lazy file inside the viking
  page, and say what that file and the stand-alone maze's first script weigh before and after.
- The deploy greps the maze host for `Jernhaugen` and names the maze's scene chunk
  (`.github/workflows/deploy.yml`): read it first and keep what it looks for true.

## 1. First, look and write down what is there

Before drawing anything: take the maze as it is, all seven levels, alone and inside the viking
page, at 390 x 844, 360 x 640, 844 x 390 and 1280 x 720, in both languages, with `&touch` and
without, and reduced motion. Put the pictures in `o36/shots/before/` and write
`apps/viking/tools/review/o36/before.md`: every figure and tile the maze draws, at four times
size, beside the same kind of thing as the viking game draws it now (him, walls, ground,
pickups, the feather, the door, the panel, cards); what is flat, what clashes in palette or
outline, what is unreadable at phone size, what the help says on a phone. Rank it. Items 2 to 4
follow your own list where it disagrees with mine, and say so.

## 2. Touch and help

- The help line and every hint say what the player's device does: on touch no key names, the
  same way order 21 did it for the viking game (read how `&touch` and the touch notes work
  there; share the code where it can be shared, do not copy it).
- The controls on a phone: check that the maze can be played start to end on touch in both
  hosts, upright and on its side, that nothing sits under a notch or the home bar (safe-area
  insets), that a long press, a pull down and a pinch do nothing, and that the way out (back to
  the line map inside the viking page; to larshansen.dev alone) can be reached by thumb. Fix
  what fails; say what you could only reason about.
- Reduced motion: nothing blinks or shakes; hold it in a test as the viking game does.
- Both languages for every word, held by a test like `game/words.test.ts`, and seen at 360 wide.

## 3. The figures and the ground, in the game's grain

Redraw the maze's figures and tiles by the methods of orders 23 to 28 (per-pixel maps, the
ramps of GRAIN.md, the outline rule, light from one side): him in the maze must be plainly the
same man as in the viking game (if the maze can draw the viking game's own sheet at its size,
use it rather than a second drawing), walls and ground with material and depth where they are
flat fields now, pickups and the door with the kit's read, the feather kept (order 33 moved it;
do not undo that). The maze's own character is iron and a dark hill: keep it its own place,
not a tenth viking level.

- Nothing harmless in the warning red (ADR 0044; `render/warning.test.ts` shows the way), and
  give the maze its own such test.
- Show every changed thing before and after at four times size and in place at phone size.
- Cost: measure rectangles (or draw calls) a frame on every level before and after at
  390 x 844; nothing more than +100 a frame, and keep what can be kept in a cached canvas.
- The stand-alone page's frame (`apps/iron-maze/src/styles.css`, its header and panel) gets
  the same care: it should look like a room of the same house as larshansen.dev/viking/.

## 4. The joins, tested

HANDOVER's "Untested paths" names these; hold each in a test or a stepped harness picture:
going into the maze from the line map and coming back to Nordmarka; a record made in one host
seen in the other where the design says it should be (and not where it says it should not);
the feather moment after the maze; the maze with sound muted staying silent in both hosts
(`nomusic.test.ts` knows part).

## 5. Two debts from order 35

- No level draws carriers through the kit's `drawCarrier` any more, so the reduced-motion
  test's watch of it watches nothing: make the test watch what the levels do draw (a planted
  blink in a level's own carrier must fail it), or remove the dead watch and say so.
- The figures tool draws the bosses and Loki without the game's outline: give their sheets the
  outline the game gives them, and add the maze's figures to the tool and to `figures.json`.
  Run it into `~/.cache/claude-scratch-larshansen/o36/figures/` and hand the directory back.

## Docs, in the same change

HANDOVER (the maze's section, the weak spots and untested paths you closed); the handbook
(start-here's table; roadmap's status table, "In flight", "Next", idea 8 struck or narrowed;
lessons; resources); DESIGN or the maze's own doc where a rule changed; an ADR (0056) if a
decision was made or reversed (the maze's look is one); `apps/viking/tools/review/o36/`
(`before.md`, `after.md`, one section per item). LEVELS.html where it shows the maze: pictures
retaken, and say which.

## Measures that must hold

- `bun test` green in all four packages; tsc clean inside each app and from the repo root;
  `bun run build` clean; first script under 60 kB; the viking suite's time said (it was about
  263 s alone; do not add more than 15 s to it, share walks and recorders already made).
- Front page 28 of 28; viking run files and pictures as said above; the maze's bot runs and
  ghost replay identical.

## If you cannot do all of it

Order: item 1; item 2; item 3 (him, then walls and ground, then the rest, then the stand-alone
frame); item 4; item 5. Finish each properly before the next. Docs for what was done are never
skipped.

## Hand back

1. Per item: done, partly, not, and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o36/shots/`: before and after per item, and
   one contact sheet of all seven levels before and after at 390 x 844.
3. Every changed word, both languages.
4. Tests, tsc, sizes, front page, run files, bot runs, ghost replay, cost a frame.
5. What only a person can judge, as a list for Lars.
6. Departures, doubts, found and not fixed. Branch and commits. Confirm nothing of yours is
   left running.
