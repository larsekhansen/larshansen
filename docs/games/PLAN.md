# Three games, one cloth

Plan for making the front page (`apps/landing`), the viking game (`apps/viking`) and the maze
(`apps/iron-maze`) look and feel like one game, and for folding the maze into the viking game as a
mini game.

Written 2026-11-10. Work happens on the branch `games-same-cloth`, one commit per phase, one pull
request at the end. Nothing deploys until that is merged.

## How the work is run

1. **Plan** (Claude Fable, as game designer and lead developer): this file, plus one self-contained
   work order per phase in `docs/games/orders/`.
2. **Implement** (a smaller model): one work order at a time. The implementer reads the order and
   the files it names, nothing else is assumed.
3. **Review** (Claude Fable): build, tests, a read of the diff, and screenshots from the headless
   harness. Findings go back to the implementer until the order's acceptance list is met.
4. Tick the phase off in "Status" below, write what was learned, go to the next phase.

## Status

| Phase | Order | State |
|---|---|---|
| 1. Shared pixel kit, front page unchanged | `orders/01-pixelkit.md` | done: 28 tests, screenshots identical in four skies |
| 2. Viking game rebuilt in the house style | `orders/02-viking-pixel.md` | done after one round of corrections: 22 tests, 59 kB script (was 505 kB), front page still identical |
| 3. The maze as a scene: Jernhaugen | `orders/03-maze-core.md` | not started |
| 4. Maze features and levels | `orders/04-maze-features.md` | not started |
| 5. One person, one journey: the joins between the games | `orders/05-joins.md` | not started |
| 6. Cleanup, docs, deploy checks | `orders/06-cleanup.md` | not started |

## 1. Where things stand

| | Front page | Viking game | Maze |
|---|---|---|---|
| Drawn with | Canvas 2D, code-drawn pixel art, about 320 x 200 art pixels scaled by a whole number | PixiJS (WebGL), smooth vector shapes at 600 px height, glow and particles | DOM divs, PNG tiles, a film poster as background |
| Framework | none | React 19 | React 18 class + jQuery |
| Person | 10 x 14 pixel sprite, red hat with a white pompom, blue sweater | a tall smooth viking with a cape | your mouse pointer |
| Physics | 60 steps/s, one jump about 46 px high, coyote time and jump buffer | 120 steps/s, double jump, different constants | none: touching a wall with the pointer loses |
| Sky | real Oslo time, season, snow, 17 May | its own hour and season system | none |
| Text | system font drawn sharp on a second canvas, cream header bar | React HUD, dark glass | two display fonts, coloured taunts |
| Sound | none | synthesised in WebAudio | MP3 and WAV files |
| Language | Norwegian or English by browser | English with Norwegian names | English |
| Download | about 20 kB | about 505 kB | about 5 MB, mostly audio |

Two things in the maze must go whatever else happens: `cant-touch-this.mp3` (a commercial
recording) and `landscape_movies-the-maze-runner-poster.jpg` (a film poster). Both are in a public
repository and served from maze.larshansen.dev. Phase 3 removes them.

## 2. The decision

**The front page is the cloth.** It is the first thing a visitor sees, it is the most finished, and
its look is the most distinctive: chunky code-drawn pixels, a real Oslo sky, sharp small text, a
calm palette. The viking game and the maze are rebuilt in that style, on the same code.

What that means in practice:

- One shared package, `packages/pixelkit`, holds the drawing helpers, the stage (canvases and whole
  number scaling), the fixed-step loop, input, the platformer physics, the Oslo clock and sky, the
  person, and the sound synth. All three apps import it.
- The viking game leaves React and PixiJS. Its world, its ten runes, its doors, its timer and its
  jokes stay; its engine and its look change. Side effects: the download drops from about 505 kB to
  a few tens of kB, and it can be checked headlessly on the Pi, which WebGL could not.
- The maze becomes a top-down scene in the same pixels, entered through a burial mound in the
  viking world. maze.larshansen.dev keeps working and shows the same scene on its own.
- The same person walks through all three. See section 4.

Rejected: restyling the front page toward the viking game's smooth look (throws away the best
part, and keeps WebGL); keeping three engines and only matching colours (they would still feel
different, which is the actual complaint).

## 3. Style bible

Every scene follows these. A reviewer rejects work that breaks them.

**Pixels**
- Art is drawn in code with filled rectangles, at art-pixel resolution, never with image files,
  gradients, anti-aliased shapes, rotation or blur. The only soft things allowed are the ones the
  front page already has: the faint glow behind the person, lamp pools, and the scene fade.
- One art pixel is a whole number of device pixels. Layers move by whole art pixels and are nudged
  by the remainder (the front page's depth canvases).
- Tiles are 16 art pixels. The person is 10 x 14.
- Outlines are a darker shade of the fill, one pixel, and only where the front page uses them
  (crates, hedges, ruin walls). No black outlines.

**Colour**
- Daylight colours are chosen first; dusk and night come from the shared tint, and windows and lamps
  come on through the shared light list. No scene keeps its own night palette.
- Shared swatches live in `pixelkit/palette.ts`: skin `#f1c27d`, hat red `#c8302b`, sweater blue
  `#2b4c8c`, ink `#1f1a17`, lamp `#ffd36b`, stone (`STONE` from the front page), plus wood, grass,
  water and iron added in phase 2. New colours are added to the palette, not written inline.

**Words**
- System font, drawn on the sharp text canvas. Weights 600 for signs, 700 for banners.
- Sign boards on posts, speech bubbles, the district banner, and the cream header bar are the only
  text furniture. The viking game's dark glass HUD and the maze's display fonts go.
- Every string exists in Norwegian (nb) and English, chosen by browser language as on the front
  page. Place names stay Norwegian in both.
- Voice: dry and short. The maze's taunts are kept, toned to match ("Jernforbannelsen tok deg.").

**Motion and feel**
- 60 physics steps per second, drawing blended between steps.
- The person moves with the front page's constants everywhere he walks sideways: run 1.6, jump 5,
  the same gravity, coyote and buffer. Abilities are added on top (section 5), never by retuning.
- Camera: looks ahead 22 art pixels in the facing direction, eases with a 130 ms time constant.
- `prefers-reduced-motion` flattens parallax and stops shake, flashes and particles.

**Sound**
- All synthesised, short, quiet, off until the first key or tap, with a mute button that is
  remembered across all three games (`larshansen.muted`).
- One instrument family: soft square and triangle blips for the person (step, jump, land, door),
  noise bursts for wind and water, a five-note pentatonic set for pickups. No music loops in
  phases 1 to 5.
- The front page gets the same sounds for jump, land and door in phase 5, default muted there.

**Input**
- Same actions everywhere: left, right, up, down, jump, enter. Keyboard (arrows, WASD, Space),
  on-screen pad on touch, gamepad, and click or tap to walk.
- The maze adds the pointer as a way to steer (section 6), because that is what the maze is.

**Page furniture**
- The same header bar on all three: the name on the left, plain links on the right that work
  without JavaScript. The same help line, the same touch pad, the same `noscript` text.

## 4. One person

The person is the front page's: red knitted hat with a white pompom, blue sweater. He is never
replaced by another character.

- **Front page**: as today.
- **Through the Opera door**: he arrives in the viking world wearing an iron helmet pulled over the
  hat, with the pompom sticking out of the top, and a short brown cape. Same 10 x 14 box, same legs
  and walk frames. Drawn by the same `personPixels` function with `outfit: "viking"`.
- **In the maze**: seen from above, 8 x 8: the helmet as a grey disc, the white pompom as its
  centre, shoulders in sweater blue, and a torch in one hand that lights the floor around him.
  `outfit: "viking", view: "top"`.
- **Going back through "Hjem"**: he arrives at the top of the Opera on the front page, not at the
  start (`/?from=viking`), hat back on.

The pompom is the thread: it is visible in every view.

## 5. The viking game in the house style

Scene name: Vikingfjorden. Same content as today, re-laid as a text tile map like the front page's.

**World** (about 150 columns x 20 rows of 16 px, so it scrolls sideways and a little upward):
left to right: the landing stone where he arrives, a boathouse, the jetty and the longship (deck is
a platform, mast and yard are climbable ledges), the beach with sheep, the farm with a longhouse
(turf roof you can walk on, like the Opera roof ramp), the smithy "Runesmia", the burial mound
"Jernhaugen", a cliff with a stave-church-like tower and the beacon at the top.

**Backdrop** in the front page's layer system: sky from the shared Oslo sky (same hour, same
season, same snow), far mountains (0.12), the fjord with moving glints (0.2), near headlands and
islets (0.4), then the play layer. At night the shared sky gains an aurora band in this scene only.

**Things kept from today's game**: ten runes spelling LARS HANSEN, the rune slots in the header,
the timer that starts on the first move and the best time, the crown on the title after a full
run, sheep that bleat and hop when touched, signs with dry one-liners, the finish card, restart,
mute, the doors Hjem / Runesmia / Jernhaugen / Verkstedet.

**Things that change**
- The engine and look, per the style bible.
- 120 Hz physics and its constants are dropped for the shared physics.
- **Double jump becomes a reward.** He starts with the front page's single jump. The maze's prize
  is a raven feather (ravnefjær) that gives a second jump in the air. Seven runes can be reached
  without it, three (the yard of the ship, the church tower, the beacon) need it. That makes the
  maze a real part of the game and not a side door.
- The door "Labyrinten" becomes the mound "Jernhaugen" and switches scene inside the same page
  (address `/viking/#jernhaugen`, so Back works).
- The timer pauses while he is in the mound; the maze has its own times.

**Kept URL helpers** for checking: `?debug` exposes `window.__game` (with `frame(now)` so a
headless browser can step it), `?sky=` as on the front page, `?x=` to place him.

## 6. The maze: Jernhaugen

**What it was**: move the mouse pointer from a green button to the finish without touching a wall.
Three hand-made maps of 32 x 20 cells, four still snakes on level 2, taunts in coloured text, MC
Hammer while you play. That core (precision, one touch and you are out, a cheeky voice) is good
and is kept.

**What it becomes**: a top-down scene inside the burial mound. The walls carry the iron curse.
Touch one and you wake up back at the last standing stone you lit.

**Steering**
- Mouse: he walks toward the pointer, at most 1.6 art pixels per step, and stops when he reaches
  it. Faster pointer movement does not make him faster, so the old trick of jumping the pointer
  across a wall is gone. Holding the button is not needed.
- Touch: drag anywhere; he moves by the same amount the finger moves (relative), so the finger
  never covers him.
- Keyboard and gamepad: eight directions at 1.2 art pixels per step, 0.6 while Shift or the jump
  key is held, for the narrow parts.
- His body for collisions is 6 x 6. Corridors are one tile (16) or two tiles wide.

**Rules** (pure functions in `packages/maze/rules.ts`, unit tested)
- Wall touch: curse. A short red flash, he returns to the last lit stone, the level's death count
  goes up, moving things reset to their start.
- Standing stones (checkpoints): walk onto one to light it. Level start is always lit.
- Finish: the far doorway. Stepping in ends the level, shows time and deaths, moves on.
- Snakes: patrol back and forth along a fixed line, drawn in the old game's green and purple.
  Touch is a curse.
- Rune keys and iron gates: pick up the key, the gate of the same rune slides open.
- Crumbling floor: tiles that fall two seconds after first being stepped on; the pit is a curse.
- Sliding walls: blocks that move on a timer, with a one-second warning shimmer.
- Dark levels: only the torch radius is visible; lit stones stay visible once lit.

**Levels**: seven, in the text-map format of the front page (`#` wall, `.` floor, `S` start, `F`
finish, `o` stone, `s` snake line ends, `k`/`g` key and gate, `c` crumble, `m` sliding wall).
1. "Inngangen": the old map one, as it was. Teaches steering.
2. "Ormegropa": the old map two, snakes now moving.
3. "Jernporten": the old map three, plus a key and a gate.
4. "Råttent gulv": new, crumbling floor.
5. "Skyveveggene": new, sliding walls.
6. "Mørket": new, dark.
7. "Haugbonden": new, everything at once, and the feather at the end.

Each level fits a target of 30 to 90 seconds for a first clear.

**Rewards and records**: per level best time and fewest deaths in `localStorage`
(`maze.records`), a level select on standing stones in the entrance chamber once a level has been
cleared, and the raven feather after level 7 (`viking.feather`), which the viking scene reads.

**Voice**: the old taunts, shortened, in both languages, shown in a speech bubble from a raven
that sits on the entrance stone.

**On its own address**: `apps/iron-maze` becomes a small page that mounts the same scene from
`packages/maze`, with the shared header bar and a link "Til Vikingfjorden". React, jQuery, the
PNGs, fonts and audio files are deleted. The feather is still awarded; it is the same browser
storage only on larshansen.dev, so on maze.larshansen.dev the finish card links to
`/viking/#jernhaugen` on the main site with a line saying the feather waits there.

## 7. Code layout after the work

```
packages/
  pixelkit/            shared by all three
    src/paint.ts       view, R, S, disc, gable, layers, lights, tint, mix, seeded   (from landing)
    src/stage.ts       canvases, whole-number scaling, depth layers, pass(), nudge()  (from landing main.ts)
    src/loop.ts        fixed-step stepper                                            (from landing)
    src/input.ts       actions from keyboard, pad buttons, gamepad, pointer          (from landing, extended)
    src/physics.ts     side-view body over a World interface                         (from landing, generalised)
    src/oslo.ts        Oslo clock, sun times, Sky                                    (from landing)
    src/sky.ts         drawSky, snowfall, horizonColor                               (from landing)
    src/person.ts      personPixels(body, walk, phase, {outfit, view})               (from landing sprite.ts)
    src/text.ts        text canvas helpers: font, sx/sy, board, bubble, banner, drawPerson (from landing text.ts)
    src/palette.ts     shared swatches
    src/sfx.ts         WebAudio synth and the shared mute                             (from viking audio.ts)
    src/i18n.ts        pickLang
    src/chrome.css     header bar, help line, touch pad, sr-only
  maze/                the Jernhaugen scene
    src/levels.ts  rules.ts  rules.test.ts  render.ts  scene.ts (mountMaze)
apps/
  landing/             the Gamle Oslo walk; world, buildings and backdrop stay here
  viking/              Vikingfjorden; plain TypeScript, no React, no PixiJS
  iron-maze/           thin page around packages/maze
```

Packages are TypeScript source consumed directly by Vite (no build step of their own), named
`@larshansen/pixelkit` and `@larshansen/maze`, added to apps as `"workspace:*"` dependencies.

## 8. Phases

Each phase is one work order. Orders are written in full just before the phase starts, so they
can use what the previous phase taught. The outlines:

**Phase 1: shared pixel kit, front page unchanged.** Move the generic parts of `apps/landing`
into `packages/pixelkit` and make the front page import them. No visual or behavioural change:
screenshots of the front page at fixed skies must be identical before and after, and its 28 tests
pass untouched. This is the riskiest phase for the live front page and the dullest to do, so it
goes first and alone.

**Phase 2: viking game rebuilt.** Per section 5, on the kit. React and PixiJS removed from the app
and the lockfile. Old `physics.test.ts` replaced by tests of the map (every rune reachable: seven
with one jump, three only with two), doors and the timer rules.

**Phase 3: maze core.** `packages/maze` with rules, tests, levels 1 to 3, steering by pointer,
touch, keys and gamepad, curse and checkpoints, the raven's voice, sound. Mound door in the viking
scene. `apps/iron-maze` becomes the thin page; old assets deleted.

**Phase 4: maze features.** Snake patrols, keys and gates, crumbling floor, sliding walls, dark
levels, levels 4 to 7, records, level select, the feather and the double jump it unlocks.

**Phase 5: the joins.** Arriving in the right place when going between games, the outfit change
shown as a two-second moment at each door, the shared mute, sounds on the front page, the same
header and help on all three, the front page's maze house leading to the same scene, the finish
cards in the house style, favicons and titles.

**Phase 6: cleanup.** READMEs, `CLAUDE.md`, `infra/README.md`, the deploy workflow's smoke tests
(new strings, maze host), removal of dead files, a last full review against the style bible.

## 9. Checking

- `bun install`, then in each app `bun run build` and `bun test`.
- Headless: Firefox on the Pi can draw Canvas 2D but fires no animation frames, so each app keeps
  `?debug` with `window.__game.frame(now)` and the reviewer steps the game by hand and takes
  screenshots. Chromium cannot render headless here. After phase 2 nothing needs WebGL.
- Phase 1 has a stricter check: pixel-identical front page screenshots before and after.
- Still needs a person in a real browser at the end: feel at real speed, sound, touch, gamepad.

## 10. Risks

- **Breaking the front page while extracting the kit.** Kept mechanical, checked by identical
  screenshots and unchanged tests, done before anything else builds on it.
- **Losing what is charming about the viking game** when the glow and smooth shapes go. Countered
  by carrying over every joke, rune, sheep and sign, and by the Oslo sky doing in pixels what the
  aurora did before.
- **Pointer steering feeling worse than the raw pointer.** The capped speed is the price of making
  it fair and playable on touch. If it feels sluggish, raise the cap before changing the idea.
- **Storage is per host.** maze.larshansen.dev cannot hand the feather to larshansen.dev; handled
  by playing the maze inside `/viking/` and linking there from the standalone page.
- **Scope.** Phases 1 to 3 already deliver "same cloth" and "maze as a mini game". Phase 4 is the
  feature work and can be cut short level by level without leaving anything broken.
