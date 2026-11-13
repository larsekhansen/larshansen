# Work order 8: the line map and the first three levels

Read first: `CLAUDE.md`, `docs/games/PLAN.md` sections 3 (style bible), 4 and 5,
`docs/games/LEVELS.html` (the plan: read the `LEVELS` data for levels 1 to 3 and the three scene
functions `langkaia`, `akershus`, `radhuset` in its script, which are the art direction, drawn at
the game's own resolution with the game's own colours), your own order 7 report, then
`apps/viking/src` and `packages/pixelkit/src`.

## Goal

The viking game (`apps/viking`, "Vikingfjorden") is one strip of fjord, 144 columns, ten runes.
It becomes a game of levels set in Oslo: ten are planned, one per rune of LARS HANSEN, **three are
built now**: Langkaia (rune L), Akershus festning (rune A), Rådhuset (rune R). Between levels he
stands on a line map. The maze (Jernhaugen) is a bonus stop on that map.

The owner will look at the result on the live site and comment, so what matters most is that the
three levels are fun, fair, good to look at, and feel like the front page: same person, same jump,
same pixels, same sky.

## Rules for this repository

- Bun only; never npm, npx, pnpm or yarn.
- Work on `games-same-cloth` in this checkout; commit when a step is green (messages in the style
  of `git log`, ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). No push, no
  branch switch.
- Do not edit `packages/maze` or `apps/iron-maze` (the maze worker's branch is merged in before you
  start; if something there blocks you, say so in the report).
- TypeScript strict. No asset files; all art is filled rectangles in code. No new dependencies.
  Every colour is a swatch in `palette.ts`. Every string in nb and en; place names stay Norwegian
  in both. Voice: dry and short.
- `MOVE` and `JUMP` in `pixelkit/config.ts` do not change. A full jump is 46 px high and 54 px
  far (3.4 tiles); with the feather 91 px high and 101 px far. Every gap is measured against that.
- The front page must stay byte-identical in the order 7 reference screenshots.
- Dev servers on ports 5180 to 5189 only; stop them when done. Use the `?debug&steps=&keys=`
  harness and `tools/shots.ts` to **look at every screen you build** and fix what looks wrong.

## The structure

- **Levels as data.** `apps/viking/src/levels/<id>.ts`, one per level, each exporting a
  definition: id, rune index (0 to 9), name, banner landmark (nb/en), pinned sky or none, the text
  map and its legend, ramps, things (carriers, flags, launchers, timed ledges, by map letter or by
  coordinates), signs, doors, the backdrop to draw and the props to draw. A level list in order.
  The seven unbuilt levels exist in the list as name, rune and place only (from `LEVELS.html`),
  marked not built.
- **One runner** plays any level definition, built on the kit from order 7. The old single map is
  retired; reuse its art (the longship, the boathouse door, signs, sheep if you find them a place)
  rather than redrawing.
- **Two modes**: the line map, and a level. Address: `/viking/#kart`, `/viking/#langkaia`,
  `/viking/#akershus`, `/viking/#radhuset`, and the existing `/viking/#jernhaugen`; Back works.
- **Progress** in localStorage under `viking.progress` (JSON): levels cleared, best time per
  level, bracteates found. Pure functions with tests (`progress.ts`), tolerant of missing or
  broken stored data. The old `viking.best` key may be dropped.
- **Abilities**: the second jump is on when `localStorage["viking.feather"] === "1"` (the maze
  writes it; re-read it on returning from the maze) or with `?feather`. With
  `viking.featherGold === "1"` the feather pixels and the helmet's pompom trim are gold (small
  touch; do not overbuild).

## The line map (`#kart`)

A scene in the same pixels and under the same Oslo sky, about one screen and a half wide. One
T-bane line drawn as a thick hat-red line across it, with ten stations as squares on the line and
the station's rune carved above each: lit (rune glow) when that level is cleared, dark when not.
Under each station its name on a sign board. Behind the line, a low pixel skyline of the place
(keep it cheap: a few rectangles per station taken from the level's own props).

- He walks along the line, left and right, like anywhere else. Up/enter at a station goes in.
- A station is open when the level before it is cleared (the first is always open). Stations 4 to
  10 are closed off with a construction fence and a board: nb "Under bygging" / en "Being built".
- A branch drops from the line between stations 1 and 2 to a side stop, **Jernhaugen**, drawn as
  the burial mound with its door (reuse the mound art). It is open from the start. Up/enter loads
  the maze exactly as the mound door does today (`enterMaze`), and leaving the maze returns him to
  this stop. If the maze reported a newly won feather, play the existing feather moment here.
- At the far left of the line stands the door **Hjem** (to `/?from=viking`, the front page's
  Opera top, as today).
- The header keeps: ten rune slots (lit for cleared levels), a clock (in a level: this run; on the
  map: hidden), bracteate count once one is found, mute, restart (in a level: restart the level;
  on the map: hidden).
- On the map, a cleared station shows its best time on its board.

Arrivals: `?from=oslo` with nothing cleared starts level 1 at its start with the helmet moment
(order 5, keep it working); with progress it starts on the map at the furthest open station, with
the same helmet moment. `?from=maze` starts on the map at the Jernhaugen stop. No `from`: the map
if there is progress, level 1 if not.

## What a level is

- It starts at `S` and ends at its **rune**: touching it stops the clock, the rune flies to its
  slot in the header, a card in the kit's `.card` style shows the time, the best, and whether the
  bracteate was found, with actions nb "Videre" / en "Onward" (to the map, standing at the next
  station) and "En gang til" / "Once more".
- After level 3, the card adds one line: nb "Tre av ti runer. Resten av byen er under bygging." /
  en "Three of ten runes. The rest of the city is being built."
- **Falling into water, or off the map**: back to the last flag touched, or to the last ground he
  stood on where the level has no flag yet (level 1 behaves as today's game does). Nothing else
  hurts. No lives, no health.
- **One gold bracteate** per level: a small gold disc with a stamped pattern, hidden where it
  takes the second jump to reach (two jumps up, or across a gap wider than 3.4 tiles and narrower
  than 6). Optional. A short gold blip and a line in the announcer.
- **Signs**: two or three per level, dry one-liners, nb and en. Drafts are in `LEVELS.html`
  ("oslo" and "you" fields); write the rest in the same voice.
- The district banner shows the level's name and landmark on entry.
- A door back to the map at each level's start (sign: "T-banen").

## The three levels

Sizes are targets. Tune by playing with the harness. Each must be clearable on a first try by
someone who has only played the front page, inside the target time; each should have one moment
that makes you smile.

### 1. Langkaia (rune L). About 120 columns by 20 rows. Target 1 minute. Sky: real Oslo time.

The harbour below the Opera. Teaches: walk, jump, ledges you jump up through, water puts you
back, and the first moving ground.

1. He steps out of a door in the Opera's stage tower onto the white marble slope (a ramp, as on
   the front page) and walks down to the stone quay. The door Hjem is this door. Two harbour sheds
   on the quay hold the doors Runesmia (`/qr/`) and Verkstedet (GitHub), so every header link
   still has a door.
2. A wooden jetty, then three floating sauna rafts (a plank deck, a small wooden cabin with a lit
   window and a chimney that smokes; the cabin roof is a one-way ledge too). The rafts bob three
   pixels on a slow beat, out of phase. Gaps of two tiles, then three, then two and a half with a
   raft that also drifts sideways four tiles and back.
3. The moored longship: deck, mast with two ledges, the yard. Rune L hangs over the yard.
4. The bracteate: above the Opera's stage tower, or over open water between the last raft and the
   ship, your choice, reachable only with the second jump.
5. Backdrop: MUNCH and the Barcode on the far shore, the fjord, far hills. Gulls.

### 2. Akershus festning (rune A). About 130 columns by 30 rows. Target 1½ minutes. Sky: day.

The fortress above the harbour. Teaches: the flag, and cannons.

1. Along the quay under the wall, water to the left and below. Up the outer wall on stone ledges
   and ivy (one-way), with crenellations along every wall top.
2. The first cannon stands on the first rampart, pointing at the next, higher wall. Stepping into
   it loads him (he disappears into the barrel for a third of a second), then it fires: a puff of
   square smoke, the `cannon` sound, and an arc that cannot miss. Draw the arc's first second as a
   dotted line while he is in the barrel.
3. The first flagpole on the wall he lands on. Touching it raises a Norwegian flag (the front
   page's flag drawing) with a rising three-note blip.
4. A stretch of wall-walk with gaps in it over a courtyard; falling into the courtyard is not
   death, there are steps back up.
5. The second cannon fires across a wider gap with the moat's water below; he must walk into it
   himself at a moment of his choosing, because a lift of ledges on a beat (or a carrier) crosses
   its line of fire. Miss and the water returns him to the flag.
6. Second flag, then the tower: a climb inside it on alternating ledges, out at the top beside a
   copper-green spire. Rune A there.
7. The bracteate: on top of the spire, or on a ledge of the outer wall over the water.
8. A sign at the gate: nb "Påbegynt i 1299. Aldri tatt ved beleiring. Du må gjerne prøve." / en
   "Begun in 1299. Never taken by siege. You are welcome to try."

### 3. Rådhuset (rune R). About 110 columns by 40 rows. Target 2 minutes. Sky: day.

The City Hall: two brown brick towers. Teaches: ledges on a beat, and lifts. This level is tall;
the camera follows him up.

1. Rådhusbrygga: the quay, and an island ferry (white, a red stripe, lit windows) that crosses a
   stretch of water and back. Its roof is the way over: the first carrier that travels.
2. Rådhusplassen, paved, with lamp posts, then the building's base. A window-cleaner's lift (a
   carrier going straight up and down) takes him up the west tower's face; ledges on the brick let
   him step off at three heights, the top one the way on.
3. Between the towers hang the carillon's bells, gold, in a rising row. Each is a ledge on a beat:
   on for two seconds, the warning shimmer for one, gone for two; neighbours are out of phase so a
   patient player can always go bell to bell. Each bell rings a note of the pentatonic set when he
   lands on it. Below the bells is the roof of the middle building, so a fall costs the climb,
   not the level; a flag stands there.
4. The east tower: its clock face (large, cream, hands showing real Oslo time), a last short climb
   on ledges, and rune R on top.
5. The bracteate: on the west tower's top, two jumps up from the lift's highest point.
6. A sign on the square: nb "49 klokker i østtårnet. De spiller hver hele time, og nå også når du
   lander på dem." / en "49 bells in the east tower. They play on the hour, and now also when you
   land on them."

## Sound

New blips in the kit's `sfx`, same instrument family: `flag` (three rising notes), `cannon` (a
noise thump), `bell(n)` (a soft triangle note from the pentatonic set), `clear` (the level-end
phrase), `gold` (the bracteate). Nothing loops. Everything behind the shared mute.

## Checking

- `?debug&level=<id>&x=&y=&feather&steps=&keys=` places him anywhere in any level. `window.__game`
  exposes the body, the level, the things and `frame`.
- **Reach tests**, in the manner of the existing `reach.test.ts`: for each level a scripted player
  (or a search over the map with the real `stepBody`) proves the rune can be reached from the start
  with the single jump; that the bracteate cannot be reached without the feather and can be with
  it; and that every flag is on the path. Carriers and timed ledges are pure functions of the step
  count, so this is deterministic.
- Map tests: every level has exactly one `S`, one rune, one bracteate, its doors, and no letter the
  legend does not know.
- `.github/workflows/deploy.yml` checks that the built viking script contains `Alle ti runene!`.
  Change that check to a string that is certainly in the new build (for example `Langkaia`), and
  keep the old finish string out if nothing shows it.
- Update `apps/viking/index.html` (noscript text, description, blurb) and `apps/viking/README.md`
  to describe what the game is now.

## Acceptance

1. `bun test` and `bun run build` pass in `apps/landing`, `apps/viking`, `apps/iron-maze`;
   `bun test` passes in both packages.
2. Front page reference screenshots byte-identical.
3. Reach and map tests exist and pass for all three levels.
4. From a fresh browser profile: level 1 starts, each level can be cleared, the map opens the next
   station, the fence closes stations 4 to 10, Jernhaugen opens the maze and returns to its stop,
   Hjem goes home. Shown by harness screenshots of: the map (fresh, and with all three cleared),
   each level at four or more places including its start, its new thing in action and its rune,
   the level-clear card, each in `day` and one in `night`.
5. Viking bundle (script, gzip) stays under 60 kB excluding the lazily loaded maze chunk.

## Report back

What you built, the screenshots you took and what you changed after looking at them, each
departure from this order and why, test and build output, bundle sizes, commit hashes, and an
honest list of what is weak or unfinished, most important first.
