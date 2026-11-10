# Work order 2: the viking game rebuilt in the house style

Read first: `docs/games/PLAN.md` (all of it, sections 3, 4 and 5 closely), all of
`packages/pixelkit/src`, all of `apps/landing/src` (it is the model for everything here), and
`apps/viking/docs/DESIGN.md` plus `apps/viking/src/game/level.ts`, `game.ts`, `audio.ts` and
`VikingGame.tsx` for the content that must survive.

## Goal

`apps/viking` becomes a second scene built exactly the way the front page is built: plain
TypeScript, Canvas 2D, code-drawn pixel art, the shared kit. React and PixiJS are removed. The
result must look like the next street over from the front page, not like a different game.

When in doubt about how to draw, lay out, name or structure something: do what `apps/landing`
does. Copy its patterns (a `main.ts` that wires things, `game/` for rules, `render/` for drawing,
small functions, comments that say why).

## Rules for this repository

- Bun only. Never npm, npx, pnpm or yarn.
- Work in the working tree of the current branch. Do not commit, push or switch branch.
- Do not change how the front page looks or behaves. You may move code from `apps/landing` into
  the kit when both scenes need it (see "Kit additions"); when you do, landing must still build,
  pass its tests and look identical.
- Do not touch `apps/iron-maze`, `apps/qr`, `apps/portfolio`, `infra`. In `.github/workflows/deploy.yml`
  change only the viking smoke-test line if its string no longer exists (see Acceptance 8).
- TypeScript strict; no `any`, no `@ts-ignore`. No image files, no fonts, no audio files.
- Style bible (PLAN section 3) is binding: rectangles only, 16 px tiles, shared tint and lights for
  dusk and night, system font on the sharp text canvas, both languages for every string.

## What gets deleted

`src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/game/VikingGame.tsx`, `game.ts`, `props.ts`,
`scenery.ts`, `viking.ts`, `particles.ts`, `physics.ts`, `physics.test.ts`, `input.ts`. From
`package.json`: `react`, `react-dom`, `pixi.js`, `@vitejs/plugin-react`, the React types. Run
`bun install` so `bun.lock` drops them. `vite.config.ts` keeps `base: "/viking/"`.

## Kit additions (in `packages/pixelkit/src`)

1. **`palette.ts`**: named swatches. Start with the ones already used by the person and the
   front page's stone, then add what this scene needs: `wood`, `woodDark`, `turf`, `grass`,
   `grassDark`, `earth`, `rock`, `rockDark`, `water`, `waterDeep`, `foam`, `iron`, `sail`,
   `sailStripe`, `wool`, `runeGlow`. Pick them to sit beside the front page's colours: look at
   `apps/landing/src/render/ground.ts` and `buildings.ts` for the greens, browns and greys it
   already uses and reuse those values where the material is the same.
2. **`person.ts`**: `playerPixels` gains an optional last argument `look?: { outfit?: "plain" |
   "viking"; gold?: boolean }`. With `"viking"`: the two hat rows become an iron helmet
   (`iron` colour, a one-pixel lighter band, nose guard one pixel down the face) with the white
   pompom still on top, and a short brown cape: one extra column of `woodDark` behind the back
   (the side away from `facing`), rows 6 to 9. Same 10 x 14 box. `gold: true` draws the helmet in
   `#e8b923`. Default (no argument) output must be byte-for-byte what it is now.
3. **`physics.ts`**: `stepBody` gains an optional `abilities?: { doubleJump?: boolean }`. With
   `doubleJump`, one extra jump is allowed in the air (same `JUMP.speed`), reset on landing. Add
   `airJumps: number` to `Body`. Also add an exported `bounce(b: Body, speed: number)` that sets
   `vy = -speed`, clears `onGround`, and refills the air jump. Without the option, behaviour is
   unchanged; landing's physics tests must pass untouched. Add tests for the double jump.
4. **`sfx.ts`**: the WebAudio synth, adapted from `apps/viking/src/game/audio.ts`. Same idea,
   quieter and shorter per the style bible. Sounds: `step`, `jump`, `land`, `door`, `pickup(n)`
   (n picks the note from a pentatonic set), `splash`, `bleat`, `fanfare`, `curse`, `stone`,
   `gate`. Mute is stored under `larshansen.muted` (read the old `viking.muted` once as a
   fallback). Nothing plays before the first key or pointer event.
5. **`text.ts`** (new, shared text-canvas helpers). Move from `apps/landing/src/render/text.ts`
   the parts that are not about doors or districts: the text target, `FONT`, `unit`, `fontPx`,
   `sx`, `sy`, `snap`, the speech `bubble`, the banner drawing, the snow drawing, the marker
   arrow, and `drawPlayer` (rename nothing; give `drawPlayer` the `World` it needs for the shadow
   instead of importing landing's level, and pass `look` through to `playerPixels`). Landing's
   `text.ts` keeps `layoutBoards`, `LIFT`, and `drawText`, now calling the kit's helpers. Landing
   must look identical afterwards.
6. **`input.ts`**: add the action `down` (ArrowDown, KeyS, gamepad d-pad down). While you are
   there, fix the Space guard so it cannot throw when the event target is not an element
   (`e.target instanceof Element ? e.target.closest(...) : null`).

## The scene

### Map (`src/game/level.ts`)

Text map like landing's, 144 columns x 20 rows of 16 px. Use this map as given. Change it only if
the reach test (below) proves something unreachable, and say so in your report.

```
//  #  ground     ~  water (not solid; falling in puts him back on the last ground he stood on)
//  P  jetty planks (solid)   K  rock (solid)   B  crate (solid)   _  one-way ledge
//  S  start   i  sign post   e  sheep   0-9  the ten runes, in the order L A R S H A N S E N
//  h  door Hjem   q  door Runesmia   j  door Jernhaugen   v  door Verkstedet
export const MAP = [
  "................................................................................................................................................",
  "................................................................................................................................................",
  "................................................................................................................................................",
  "..............................................................................................................................7.................",
  "................................................................................................................................................",
  "............................................................................................................................_____...............",
  "................................................................................................................................................",
  "......................................3.........................................................................................................",
  "...........................................................................................................................................8....",
  "..................................._______...............................................................................v...................i..",
  "..................1................................................5..................................................KKKKKKKKKKKKK.....KKKKKKKK",
  "........................................................................................6.............................KKKKKKKKKKKKK.....KKKKKKKK",
  "...........................................2.......................................................................KKKKKKKKKKKKKKKK.....KKKKKKKK",
  ".............0..................................4.............................................................9....KKKKKKKKKKKKKKKK.....KKKKKKKK",
  "....................................B................................................B..........................KKKKKKKKKKKKKKKKKKK.....KKKKKKKK",
  "....S.i...h.......e.......i....._____________............e..................i..q....BB........j.................KKKKKKKKKKKKKKKKKKK.....KKKKKKKK",
  "#######################PPPPPP~~~~~~~~~~~~~~~~~~~KK~~~##############################################################################~~~~~########",
  "#######################~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##############################################################################~~~~~########",
  "################################################################################################################################################",
  "################################################################################################################################################"
];
```

Ramps (walkable slopes, as the Opera roof on the front page), in tile units `[col, row]` of the
surface: the longhouse turf roof `[61,16] [66,12] [68,12] [73,16]`, and the burial mound
`[96,16] [102,13] [104,13] [110,16]`.

What the columns are:

| Columns | Place | What is drawn there |
|---|---|---|
| 0 to 14 | Landingsplassen | A flat landing stone under `S`. The boathouse "Naustet" (dark timber, turf roof) with the door **Hjem**. The title "LARS HANSEN" carved as runes on a tall standing stone left of the start. |
| 15 to 22 | The beach | Grass giving way to sand. One sheep. |
| 23 to 28 | The jetty | Planks on posts standing in the water. |
| 29 to 52 | The fjord | Water with slow glints. The longship lies moored: hull, dragon head at the prow (right), striped sail on the mast, the yard across it. Deck = the ledge on row 15, yard = the ledge on row 9, one crate on deck. A skerry with a rune. The ship bobs one pixel up and down on a slow sine in the drawing only; its collision does not move. |
| 53 to 75 | The farm | Fence, a second sheep, the longhouse with a turf roof you walk over (the ramp), smoke from the roof vent. |
| 76 to 92 | The smithy | "Runesmia": open-fronted smithy with a glowing forge (a light at night), anvil, the door. Crates stacked as steps. |
| 93 to 110 | Jernhaugen | The burial mound: a grassy hill (the ramp) with a stone-framed doorway at its foot and three standing stones on top. |
| 111 to 143 | The cliff | Rock steps up to a plateau. On it the door **Verkstedet** in a small log cabin, and a stave-church-like tower whose top ledge (row 5) holds a rune. Then a gap with water at the bottom, and the beacon rock with an iron fire basket that burns (a light at night). |

Doors (`DOORS` table drives both the in-world doors and the header links, as on the front page):

| id | Sign | Leads to |
|---|---|---|
| `home` | Hjem | `/` |
| `qr` | Runesmia | `/qr/` |
| `maze` | Jernhaugen | `https://maze.larshansen.dev/` for now (order 3 turns it into a scene) |
| `github` | Verkstedet | `https://github.com/larsekhansen` |

### Backdrop (`src/render/backdrop.ts`)

Layer factors as on the front page: mountains (0.12) with snow caps, bluer and paler with
distance; the far shore of the fjord and its water (0.2) with moving glints, borrowed in spirit
from landing's `drawFjord`; near headlands with spruce and two islets (0.4); play layer (1). Sky
from the kit's `drawSky` with the real Oslo clock, exactly as the front page: same hour, same
season, same snow, same `?sky=` override and the same T key to cycle. No sky code of its own.

### Rules (`src/game/`), all pure and unit tested where marked

- **Movement**: kit physics with landing's constants. `doubleJump` is on when
  `localStorage["viking.feather"] === "1"` or the URL has `?feather` (for checking). Order 4 makes
  the maze award it. Until then the three high runes are simply out of reach, and a sign near the
  mound says so (see strings).
- **Water**: when his feet are in a `~` tile: splash, and he is put back on the last ground tile he
  stood on, facing the water. No penalty.
- **Runes** (tested): touching a rune's 16 x 16 tile collects it. Ten slots in the header fill in
  order. Runes are drawn as pixel versions of the Elder Futhark strokes in
  `RUNE_STROKES` (keep that table; rasterise the strokes into a 9 x 11 pixel grid with
  one-pixel lines), on a small floating stone that bobs one pixel. Collected runes leave a faint
  outline.
- **Run timer** (tested): starts on the first step he takes, stops on the tenth rune, best time in
  `viking.best`. R or the header's restart button: runes back, clock zero, him at `S`.
- **All ten**: `fanfare`, pixel sparks (as the front page's fireworks: 1 x 1 `R` rectangles), his
  helmet turns gold and stays gold (`viking.crowned`), and the finish card shows.
- **Sheep**: walk back and forth four tiles either side of their `e`, stop to graze, turn. Landing
  on one from above: `bounce(body, 7)`, `bleat`, the sheep squashes one pixel for six steps.
  Touching one from the side does nothing.
- **Doors**: as on the front page (same highlight, same "↑ Gå inn" hint, same fade, same walk-in).
  Click or tap a door or anywhere on the ground to walk there, as on the front page; copy that
  logic from landing's `main.ts` (`goal`, `stuck`, the marker arrow).
- **Signs**: sign posts drawn like landing's boards. Walking up to one shows its lines in a
  speech bubble.

### Strings (`src/game/i18n.ts`), both languages

| key | nb | en |
|---|---|---|
| help | Piltaster for å gå, mellomrom for å hoppe, pil opp for å gå inn en dør. Eller klikk dit du vil. | Arrow keys to walk, Space to jump, up arrow to go through a door. Or click where you want to go. |
| sign at start | Vikingfjorden. Du fant den hemmelige døra. | Vikingfjorden. You found the secret door. |
| sign at start, line 2 | Ti runer ligger strødd. De staver noe. | Ten runes lie scattered. They spell something. |
| sign at jetty | Skipet går ingen steder. Det gjør ikke du heller, uten å hoppe. | The ship is going nowhere. Neither are you, unless you jump. |
| sign at smithy | Runesmia. Runer smidd mens du venter. | Runesmia. Runes forged while you wait. |
| sign at beacon | Varden. Tennes ved fare, eller når noen endelig kommer seg hit. | The beacon. Lit in danger, or when someone finally makes it up here. |
| bubble at mound door, no feather | Noen runer henger for høyt. Det sies at haugbonden har en ravnefjær. | Some runes hang too high. They say the mound-dweller keeps a raven's feather. |
| finish title | Alle ti runene! | All ten runes! |
| finish best | Ny bestetid. / Bestetida di er {t}. | A new best time. / Your best is {t}. |
| finish again | Løp igjen | Run again |
| finish back | Tilbake til Gamle Oslo | Back to Gamle Oslo |
| restart, mute labels | Start på nytt · Lyd av · Lyd på | Start again · Sound off · Sound on |
| page blurb (sr-only, noscript) | Du fant den hemmelige døra. Finn de ti runene, eller ta en dør ut igjen. | You found the secret door. Find the ten runes, or take a door back out. |

The place names in the banner (Landingsplassen, Fjorden, Garden, Runesmia, Jernhaugen, Varden)
show as landing's district banner does when he enters each stretch.

### Page (`index.html`, `src/styles.css`)

Same skeleton as `apps/landing/index.html`: the header bar from `chrome.css` with "Lars Hansen"
and the four door links as plain `<a data-door>` (they must work without JavaScript), then inside
the bar the ten rune slots (small inline SVG or text placeholders the script fills), the timer
(`0:00.0`, with the best time small beside it), a restart button and a mute button. The stage with
`#px` and `#ui` canvases, the help line, the `aria-live` announcer, the touch pad, `noscript`.
`<title>` stays "Vikingfjorden · larshansen.dev". The finish card is a small centred panel in the
cream of the header bar, not dark glass. Scene-only CSS goes in `src/styles.css`; shared furniture
comes from `@larshansen/pixelkit/chrome.css`. The page background before the script loads: sky
blue over fjord blue.

### Debug handle

With `?debug`: `window.__game = { body, shown, state, view, input, step, frame, doors, runes }`,
where `frame(now)` runs one frame as landing's does. `?x=<art px>` places him. `?feather` gives the
double jump. These exist so the reviewer can step the game in a headless browser that fires no
animation frames; they are part of the acceptance.

## Tests (`bun test` in `apps/viking`)

- `level.test.ts`: the map is rectangular; exactly one `S`; each of `0` to `9` once; each door
  letter once; every door and sign stands on something solid.
- `reach.test.ts`: a static reach check over the tile map. Build the set of standable spots (a
  non-solid tile above a solid or one-way tile, plus ramp surfaces sampled per column). From `S`,
  flood-fill: from a spot you can step to a neighbour, drop any distance, or jump. A **single
  jump** reaches a spot at most 2 tiles higher and at most 3 empty columns away. A **double
  jump** reaches at most 5 tiles higher and at most 6 empty columns away. A sheep adds a bounce
  reaching 5 tiles up directly above its range. A rune counts as reachable if its tile is within
  3 rows above and 2 columns of a reachable spot (4 rows with double jump), or on a jump arc you
  have already accepted. Assert: with single jump, exactly runes 0, 1, 2, 4, 5, 6, 9 and all four
  doors are reachable; with double jump, all ten. Keep the checker simple and commented; it is a
  guard against map edits, not a physics proof.
- `run.test.ts`: timer and rune-collection rules.
- Kit: double-jump tests in `packages/pixelkit`.

## Acceptance

1. `bun install` at the root: `react`, `react-dom` and `pixi.js` are gone from `apps/viking`
   (the lockfile may keep React for other apps).
2. `apps/viking`: `bun run build` and `bun test` pass. Built JavaScript is under 60 kB.
3. `apps/landing`: `bun run build` passes, same tests pass, and it looks identical (the reviewer
   compares screenshots pixel for pixel).
4. `packages/pixelkit`: `bun test` and `bunx tsc --noEmit` pass.
5. `grep -ri "pixi\|react" apps/viking/src apps/viking/package.json` finds nothing.
6. Every string a visitor can read exists in nb and en.
7. With `?debug&sky=day`, calling `__game.frame` repeatedly draws the scene; with
   `?debug&feather&x=...` each rune can be collected; collecting all ten shows the finish card.
8. `.github/workflows/deploy.yml`: the smoke test for `/viking/` looks for a string that exists in
   the built entry script (the nb finish title `Alle ti runene!` is a good one). Verify with
   `grep -l` on `apps/viking/dist/assets/*.js`.
9. `apps/viking/docs/DESIGN.md` is rewritten to describe the game as it now is (short: world,
   rules, files, how to check), pointing to `docs/games/PLAN.md` for the why. `apps/viking/README.md`
   likewise.

## Report back

Files created and deleted; where you departed from this order and why; map changes if any; the
output of the test and build runs; the built bundle size; and a list of things you think look or
feel weak, so the reviewer knows where to look first.
