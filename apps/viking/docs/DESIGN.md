# Vikingfjorden — design doc

A small platform game served at larshansen.dev/viking/: a viking walks a
Norwegian fjord, collects ten runes against the clock, and can leave through
doors that lead to the other apps.

**History.** This was planned and built as a replacement for the front page,
from a stale checkout where the front page was still a prototype (a red box on
green bars). The front page had meanwhile been rebuilt as the walk through
Gamle Oslo (`apps/landing`). So the work was split:

- The parts that suit a front page were grafted into `apps/landing`: click or
  tap a house to walk there, the header link lighting up at its door, gamepad
  support, and T to step through the skies.
- Everything else became this app, the "actual game", reached through the
  secret door at the top of the Opera. It gained a timed run (§3).

Sections 1, 2 and 8 below describe the original front-page brief and are kept
as the record of why things are the way they are.

Status legend: `[x]` done · `[ ]` not done yet · `[~]` partly done.
Everything in §9 is built. What is still open is listed in §9 under
"Not verified yet" and in §11.

## 1. Goals

1. **It is still a landing page.** Every destination is reachable in one click
   without playing: real `<a>` links, readable by screen readers, working
   without WebGL or JavaScript.
2. **It feels good in the first three seconds.** Tight controls, a character
   with personality, a scene worth looking at.
3. **It rewards poking around.** Collectibles, a secret, things that react.
4. **No asset pipeline.** Everything — art, animation, sound — is generated in
   code. No images, no audio files, no web fonts. The Pi serves a few hundred
   kB of static JS and nothing else.
5. **Works on phones**, on slow machines, and with reduced-motion preferences.

Non-goals: enemies that can kill you, lives, levels, a score to grind. Nothing
may stand between a visitor and a link.

## 2. Where it started

| Area | Prototype |
| --- | --- |
| Player | 40×60 red rectangle |
| World | 800×600 fixed canvas, 3 green bars, flat ground |
| Physics | Per-frame (frame-rate dependent), no acceleration, borrowed "bump" collision that only detected landing |
| Doors | None — the game led nowhere |
| Input | Keyboard only; space scrolled the page |
| Page | Title "Platformer Game", empty CSS, no meta, no fallback |
| Lifecycle | Never cleaned up listeners or the Pixi app |

## 3. The world

One wide scene (3600 logical units; the view is 600 units tall and as wide as
the window allows), scrolling horizontally. Left to right:

| x | What | Leads to |
| --- | --- | --- |
| 200 | Spawn, big carved "LARS HANSEN" title, welcome sign with the controls | — |
| 760 | Door: **Hjem** — back to the front page | `/` |
| 1000–1420 | The fjord: a longship ferries back and forth as a moving platform; stepping stones above for the impatient | — |
| 1700 | Door: **Runesmia** — QR-verkstedet, on a raised ledge | `/qr/` |
| 1950–2500 | A climb of floating islands with the hardest runes | — |
| 2680 | Door: **Labyrinten** — Iron Maze | `https://maze.larshansen.dev` |
| 3250 | Door: **Verkstedet** — GitHub | `https://github.com/larsekhansen` |

Destinations live in one table (`level.ts → DOORS`) that drives both the
in-world doors and the HTML nav, so they cannot drift apart.

### Collectibles — the name in runes
Ten rune stones are scattered through the level. They are the Elder Futhark
spelling of **L A R S H A N S E N** (ᛚᚨᚱᛊ ᚺᚨᚾᛊᛖᚾ), drawn as line strokes so we
never depend on a runic font. The HUD shows ten slots that fill in as you
collect.

**The run.** Collecting all ten is timed. The clock starts on the first move
and stops on the tenth rune; the best time is kept in `localStorage`
(`viking.best`) and shown in the HUD. **R** restarts: runes back, clock at
zero, viking at the start. Every visit starts a fresh run.

**Reward for all ten:** fanfare, fireworks, the aurora switches on permanently,
and the viking gets a golden helmet (persisted as `viking.crowned`).

### Things that react
- **Sheep** graze the meadows. Landing on one is a trampoline (and a "bæ").
- **Water**: falling in makes a splash and puts you back on the last solid
  ground you stood on. No death, no penalty.
- **Longship** bobs, carries you, and its deck is a one-way platform.
- **Doors** light up when you are near, show a prompt, and swing open.

## 4. Game feel

Physics runs on a **fixed 120 Hz step** (accumulator, dt clamped) so it behaves
the same at 30, 60 or 144 fps. It is a pure module (`physics.ts`) with no Pixi
dependency, covered by `bun test`.

| Parameter | Value | Why |
| --- | --- | --- |
| Run speed | 270 u/s, accel 2400, friction 2800 | Snappy but with a little weight |
| Air control | accel 1700 | Steerable jumps |
| Gravity | 2000 (×1.3 when falling) | Fast fall = less floaty |
| Jump | −700 u/s → ~120 u high | Clears one island step |
| Variable jump | Releasing early cuts upward speed to 45 % | Tap = hop, hold = leap |
| Double jump | −600 u/s, once per airtime | "More extra"; forgiving |
| Coyote time | 0.10 s | Jump just after leaving a ledge |
| Jump buffer | 0.12 s | Jump pressed just before landing still counts |
| Max fall | 900 u/s | Prevents tunnelling |

Collision is axis-separated AABB: solid blocks stop you from every side;
"one-way" platforms only catch you when falling onto their top. Moving
platforms carry whoever stands on them.

**Juice:** squash on landing and stretch on take-off, dust puffs when running,
turning and landing, a ring puff on double jump, small screen shake on hard
landings, camera look-ahead in the direction of travel, sparkles on pickup.

## 5. Look

All art is drawn with Pixi `Graphics` at start-up.

- **Sky follows the visitor's clock.** Four palettes (night, dawn, day, dusk)
  are blended by local hour; the sun and moon ride an arc; stars and aurora
  come out at night. The whole world is tinted with the ambient light. Press
  **T** to scrub time forward for fun.
- **Seasons.** November–March: snow-capped ground and falling snow. Otherwise
  green grass, and fireflies after dark.
- **Parallax**, back to front: sky gradient → stars → sun/moon → aurora →
  far mountains → clouds (drifting) → near snow-capped mountains → pine hills
  → two fjord wave bands → the longship → the nearest wave band (so the hull
  sits *in* the water) → terrain, doors, sheep, runes, the viking → weather.
- **The viking**: tunic, belt, beard, horned helmet, round shield on his back,
  a cape that trails. Legs and arms swing with a run cycle, he blinks, leans
  into jumps.
- **Doors**: stone arch, plank door with iron bands, a glowing rune keystone,
  a hanging wooden sign with the destination's name, torches either side.
- **Ground**: earth with stone flecks and a grass (or snow) cap; floating
  islands with hanging roots.

Palette is warm earth + cold fjord blue + one accent (rune gold `#ffd166`).

## 6. Sound

Synthesised with WebAudio — no files. Jump, double jump, land, rune pickup (a
pentatonic scale that climbs with each rune), door, splash, sheep, fanfare.
Sound starts only after the first key press or tap (browser policy), is quiet,
and has a mute toggle (**M** or the HUD button) remembered in `localStorage`.
No background music: a landing page that plays music unasked is rude.

## 7. Input

| Action | Keyboard | Touch | Gamepad |
| --- | --- | --- | --- |
| Move | ← → / A D | on-screen ◀ ▶ | stick / d-pad |
| Jump | Space / W / ↑ (when not at a door) | on-screen ⤒ | A |
| Enter door | ↑ / W / Enter / E at a door | tap the door or the "Enter" button | X / d-pad up |
| Mute | M | HUD button | — |
| Restart the run | R | — | — |
| Scrub time | T | — | — |

Clicking or tapping a door with the mouse enters it from anywhere. Game keys
call `preventDefault` so the page does not scroll; keys are released on window
blur so the viking never runs off on his own.

## 8. The page around the game

- **HTML overlay** above the canvas: `<h1>Lars Hansen</h1>`, a one-line
  tagline, and a `<nav>` with the same four destinations as real links, plus
  the mute button. This is the accessible, no-game path.
- **Fallback**: without WebGL, Pixi drops to its canvas renderer and the game
  still runs (glows switch from additive to plain alpha blending there,
  because the canvas renderer leaks additive blending into later draws). If
  Pixi cannot start at all, the overlay becomes a centred card with the links
  on a static gradient. `<noscript>` carries the same links.
- **Head**: real title, description, Open Graph tags, theme colour, and a
  viking-helmet SVG favicon replacing the template one.
- **Responsive**: the canvas fills the viewport; the logical view is 600 units
  tall, and on narrow portrait screens it zooms out to keep at least 420 units
  of width (showing more sky). Device pixel ratio capped at 2.
- **Reduced motion** (`prefers-reduced-motion`): no screen shake, no ambient
  particles, static aurora and clouds.
- **Lifecycle**: `initGame` returns `destroy()`; the React component calls it
  on unmount. Returning via the back button (bfcache) clears the door fade.
- **Deploy contract** unchanged: the smoke test still finds `<div id="root">`
  at `/`, and `public/quintle/privacy` is untouched.

## 9. Work plan

Ordered so that every step leaves a working, shippable page.

1. [x] **Foundation** — `level.ts` (constants, level data, doors), `physics.ts`
   (pure, fixed-step), `input.ts` (keyboard/touch/gamepad), physics tests.
   Remove `collision.ts`, `jumpController.ts`, `eventController.ts`, Pixi type
   hacks.
2. [x] **Stage** — full-viewport responsive canvas, scrolling camera with
   look-ahead, new `game.ts` loop with `destroy()`.
3. [x] **Scenery** — `scenery.ts`: time-of-day sky, sun/moon, stars, aurora,
   mountains, clouds, water, seasons.
4. [x] **Characters & props** — `viking.ts` (animated), `props.ts` (ground,
   islands, doors, runes, longship, sheep, signs), `particles.ts`.
5. [x] **Doors work** — proximity prompt, open animation, fade, navigation,
   click/tap to enter.
6. [x] **Runes & reward** — collection, HUD slots, persistence, fanfare,
   golden helmet, aurora unlock.
7. [x] **Sound** — `audio.ts` synth + mute.
8. [x] **Page shell** — HTML overlay + nav, touch controls, CSS, fallback,
   `index.html` meta, favicon, README.
9. [~] **Verify** — see below.

### Verified
- `tsc --noEmit` clean, `bun test` green (physics: landing, variable jump,
  coyote time, jump buffer, double jump, walls, one-way platforms, moving
  platform carry; level: every rune reachable, ship reaches both shores),
  production build succeeds.
- Looked at in headless Firefox at 900×500 and 400×780, by stepping the game
  loop by hand: spawn, running and jumping, each door, door-entry fade, rune
  pickup and HUD state, the all-runes reward (gold helmet, star, aurora,
  fireworks), falling in the fjord and respawning, day / dusk / night, summer
  / winter.

### Not verified yet
The Pi's headless browsers have no WebGL and do not fire animation frames
(and Chromium cannot render headless at all on the 16k-page kernel), so the
checks above ran on Pixi's **canvas fallback** with a hand-cranked clock.
Still to be checked by a human in a normal browser:
- [ ] The WebGL path: additive glows, door masks, aurora, firework colours.
- [ ] Real-time feel of the controls, and frame rate on a phone.
- [ ] Sound — nothing has been listened to.
- [ ] Touch controls on an actual touch device, and a gamepad.
- [ ] The timed run end to end (it was added after the screenshots above),
  and a way to restart on touch devices — R is keyboard only.

### Dev helpers
In `bun run dev:viking` only: `?x=1700` drops the viking at that x, and
`window.__game` exposes the Pixi app and player. In every build: `?hour=23`
pins the time of day and `?season=winter|summer` pins the season.

## 10. File map (target)

```
apps/viking/
├── docs/DESIGN.md        this file
├── index.html            meta, noscript links
└── src/
    ├── index.css         page + overlay + touch controls
    └── game/
        ├── VikingGame.tsx  mounts the game, renders the HTML overlay
        ├── game.ts         wiring: loop, camera, doors, runes, reward
        ├── level.ts        constants and level data (single source of truth)
        ├── physics.ts      pure player physics   (+ physics.test.ts)
        ├── input.ts        keyboard / touch / gamepad
        ├── scenery.ts      sky, parallax, water, weather
        ├── viking.ts       the player character
        ├── props.ts        ground, islands, doors, runes, ship, sheep, signs
        ├── particles.ts    pooled particles, shared textures, small helpers
        └── audio.ts        WebAudio synth
```

## 11. Ideas parked for later

- **Bifrost**: after all runes, a rainbow bridge to a cloud island with a
  secret door (needs something worth linking to).
- A restart button for touch devices.
- A door for **Quintle** once it has a public store page.
- Ravens (Hugin & Munin) that follow the player and perch on door signs.
- Weather from a real Oslo forecast instead of only the calendar.
- Ghost of the fastest "all runes" run.
- A fishing spot on the pier. Because why not.
- Norwegian/English toggle for the sign texts.
