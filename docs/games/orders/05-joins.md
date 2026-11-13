# Work order 5: one person, one journey

Read first: `docs/games/PLAN.md` sections 3 and 4, `apps/landing/src/main.ts`,
`apps/viking/src/main.ts`, `apps/iron-maze/src/main.ts`, `packages/pixelkit/src`.

## Goal

The three games already share a look. This order makes the walk between them feel like one
continuous walk by the same person, and evens out the page furniture.

## Rules for this repository

Bun only; no commit, push or branch switch; no dev servers on 5196 to 5199; TypeScript strict; no
asset files; the style bible binds; every string in nb and en.

**This order changes the front page on purpose**, but only in the ways listed under "Front page".
With `?sky=...` and no `?from`, a fresh front page that nobody has interacted with must still
draw exactly as before (the reviewer compares screenshots), because sound is off until asked for
and nothing else below shows without an arrival or an action.

## Arrivals

| Leaving | Through | Arrive |
|---|---|---|
| Front page | the Opera's secret door | `/viking/?from=oslo`: he steps out of the boathouse door "Hjem" (not at `S`), the door closing behind him. |
| Viking | door Hjem | `/?from=viking`: on the front page he stands at the Opera's top door, facing left, camera there. No district banner flash for the start district first. |
| Viking | door Runesmia | `/qr/` as today. |
| Front page | the maze house (Iron Maze) | unchanged: `https://maze.larshansen.dev/`. |
| Standalone maze | leaving or the header link | `https://larshansen.dev/viking/?from=maze`: he stands at the mound door. |

After reading `from`, remove it from the address with `history.replaceState` so a reload starts
normally.

## The outfit moment

- Arriving in the viking world with `from=oslo`: for the first 70 steps he stands in his red hat
  (plain outfit); at step 30 a helmet drops from above the view onto his head (the helmet rows of
  the sprite drawn separately, falling 3 px per step, landing with the `land` sound and two dust
  pixels), at step 45 the cape unrolls (one row per 4 steps). Input is ignored until step 70.
  With reduced motion: he simply has the outfit from the start.
- Arriving on the front page with `from=viking`: he arrives in the helmet; over 40 steps the
  helmet lifts off and falls behind the Opera (same drawing reversed, then dropping out of view),
  leaving the red hat. Input is not blocked here.
- The kit's `playerPixels` gets what it needs for this (for example `look.helmetOffset` in art
  pixels and `look.capeRows`); the default output stays byte-identical.

## Front page

- **Sound**: the kit's `sfx` with `jump`, `land`, `door`, and `step` every 14 walking steps. The
  shared mute (`larshansen.muted`) defaults to **muted on the front page** when the key has never
  been set, and a mute button in the header bar (the same icon button as the viking page) turns it
  on. On the viking and maze pages the default stays sound on. Once the visitor has chosen, the
  choice holds on all three.
- **The M key** toggles mute, as in the other two.
- Nothing else changes on the front page.

## Same furniture everywhere

Compare the three pages side by side in the code and make these the same, moving shared rules
into `chrome.css` where landing's rendering is not affected:

- the mute and restart icon buttons (one definition, in the kit),
- the finish and level-select panel (`.card` in the kit: cream, the header bar's border and
  radius, one heading, one line, up to two actions),
- the help line's wording pattern and the moment it hides (on the first move),
- `<meta name="theme-color">`, favicon (all three use landing's `favicon.svg`; copy it into each
  app's `public/`), `og:` tags with a line each in the same voice,
- `noscript` text,
- focus styles on links and buttons (visible, the same ring).

## Titles

`Lars Hansen` (front page), `Vikingfjorden · Lars Hansen`, `Jernhaugen · Lars Hansen`. The deploy
smoke test strings must still match (`Vikingfjorden`, `Jernhaugen`).

## Acceptance

1. All apps build; all tests pass; `bunx tsc --noEmit` clean in both packages.
2. Fresh front page without `from`: pixel-identical canvases to before. (The header gains a
   mute button, so the reviewer compares the game area below the bar.)
3. `/?from=viking&debug` starts at the Opera door with the helmet coming off when stepped.
   `/viking/?from=oslo&debug` starts at Hjem with the helmet arriving. `?from=maze` starts at the
   mound.
4. Mute chosen on one page is the state on the others (same origin), and the front page is silent
   by default.
5. The three `index.html` files have the same structure for the shared parts.

## Report back

Files, departures and why, test and build output, sizes, and what you think is weak.
