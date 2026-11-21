# Order 30: small debts, each paid or not, and the measures

Measured on 21 November 2026 on branch `small-debts` (from `origin/main` at `055bd26`, after order 29). Pictures (outside the
repository) in `~/.cache/claude-scratch-larshansen/o30/shots/`, a folder a debt: `1-langkaia/` (before and after without `feel`'s
file, and with it), `2-stop-glow/`, `3-club/`, `4-prefetch/` (the files each page fetched, logged), `5-reduced/`, `6-cards/`,
`7-kinds/`; and `map/` (the map with runes missing, both builds).

## 1. Langkaia without the lazy file: paid

If `feel`'s file never came, Langkaia's sauna rafts' cabins and pontoons, the club's hut, the diving tower, the rowing boat and the
posts under the club's deck were not drawn (the boat he stands on was its yellow paint over nothing). Each `TEXTURED.prop?.(…)` call
now falls back to flat rectangles in the file's own colours (`levels/langkaia.ts`): 0.07 kB of the first script. The other hooks
(`tile`, `ledge`, `deep`, `boards`, `tbane`, `door`, `walls`) had plain drawings already.

Why no other level needs one: every level fetched later imports `src/alive/` itself, so its file brings `feel`'s with it; if
`feel`'s cannot be fetched, neither can the level's, and the card says the train did not come. The map's look (`kartArt.ts`) imports
it too, so without it the map is its bare self (`BARE`) when the page starts on it: that bare map drew line 1's deck but not line 2's
deck or its gate, so he walked on nothing past Vålerenga; line 2's deck is now the shared letter's red band (`render/tiles.ts`; the
map's look draws its own) and the gate plain boards (`BARE`, moved to `levels/kart.ts` for the test). ADR 0053 records the policy.

`levels/lazy.test.ts`: only Langkaia of the levels and the encore can be drawn without `feel`'s file (its imports followed), the page
does not reach it, the map's look does; Langkaia drawn whole with the hooks as `feel`'s file fills them, with hooks that draw nothing
and with no hooks: every hook call's drawing at least half covered by the plain drawing where it stood (without the fallbacks: the
hut 1,764 pixels uncovered, the tower 2,153, the cabins 506, the boat 437, the pontoons 152, the posts); every solid tile and carrier
drawn in Langkaia and on the bare map (with line 2 shut and with every rune; without the fix, every column of line 2's deck).

Pictures: `1-langkaia/sheet.png` (four places: before without `feel`'s file, after without it, after with it); the build without
`feel`'s file is the same build with `assets/feel-*.js` deleted, so its fetch fails as a broken line would.

## 2. The encore's stop glows after dark: paid

Until the encore is seen, the stop's two neon tubes are registered as lights (`kartArt.ts`, `encoreStop`), so after dark they keep
their light over the night's tint, with a glow of the stage's first neon (hot pink) round them as an invader's (`glows`: one neon,
the shape grown by three, four and five pixels, a fifth of it each). The first try glowed each tube in its own neon; pink over lime
mixed to a muddy yellow band near the paint's yellow, so the glow is the first neon alone. By day and once seen the pictures are
byte-identical to before (`2-stop-glow/`: 4 of 8 addresses differ, the night and evening ones, as meant). Held by
`levels/encore.test.ts` ("its neon keeps its light after dark …").

## 3. Loki's club: paid

The club is redrawn at the troll's size (`render/loki.ts`): a knobbed head seven pixels across, a haft three thick, sixteen rows;
raised, all of it in the tell's violet as the troll's raised club is (it was a 5 x 4 knob on a one-pixel haft); carried and slammed
down in his neon at the same size. Drawing only: the tell's 60 steps and the blow's box (`LOKI_CLUB`) are as they were, and the
sloppy player's runs at the encore are byte-identical (below). `3-club/club-390-before-after.png`, `club-1280-before-after.png`,
`before-390-crop.png` (his and the troll's tells side by side at phone size, before).

## 4. The encore's file fetched ahead: paid

`ahead(progress)` (`levels/kart.ts`) says what the map fetches: the open levels' files at once, as before, and with every rune the
encore's when the page is idle (`requestIdleCallback`, or 300 ms where a browser has none). Nothing with a rune missing
(`levels/encore.test.ts`, for every set with one rune missing). In the page (`4-prefetch/`, a server logging what each page asked
for): with every rune the branch fetched `assets/encore-*.js` from the map; with Gamlebyen missing it did not; origin/main did not in
either case. 0.07 kB of the first script.

## 5. Reduced motion, in pictures: paid

`5-reduced/`: every boss at its tell and its hit (the troll, the plough, the serpent; Loki's club, rev, ring and a hit), a stomp at
Langkaia, the rune's ring, Rådhuset's gull's chip, the map's mirror balls, Bygdøy's oars' warning and Slottet's banners' warning,
each with and without `&reduced`, at two steps four apart, at 390 x 844, from origin/main (`before-full/`) and the branch
(`after-full/`); and frame strips of each from origin/main (`before/`, `pair-*.png`).

What still flashed or ran with reduced motion, found by the pictures and the new test, all held still now:

| What | Where | Was | Now |
|---|---|---|---|
| The oars' warning | the kit's `oars.ts` (Bygdøy) | the shimmer blinking 3.75 times a second | lit and still, as a ledge's |
| The banners' warning | `levels/slottet.ts` | white lines blinking 3.75 times a second | lit and still |
| The platform board's scroll | `levels/stortinget.ts` | a lit dot running along the second row | still |
| The dawn's rays | `levels/nordmarka.ts` | a slant drifting across the shaft | still |
| The fountain's jets | `levels/vigelandsparken.ts` | streaks running up the water | still (the wobble was held already) |
| The serpent's daze | `levels/gamlebyen.ts` | its head rocking a pixel to and fro | still (its stars were already) |
| The parked plough's wisp | `levels/nabolaget.ts` | a puff on and off every second | none |

In the pictures (`warn-before/`, `warn-after/`, the oar's and the banners' warnings eight steps apart with reduced motion), Bygdøy's
picture changed by 337 pixels before and 238 after (the oar's shimmer; what is left is a rat walking and the skilling turning),
Slottet's by 1,813 and 1,761 (the parade walks on). Two steps four apart (`before-full/`, `after-full/`) fell in the same half of the
blink and showed nothing; the test saw it.

`render/reduced.test.ts` (four tests, 7 s): (1) every line in the app and the kit that reads a clock to turn something on and off
(`Math.floor(t / n) % k`, `(t >> n) % k`) holds it with `view.reduced` on the line, reads a held clock (`tt`), or is named with why
(15 named: idles and cycles, and drawings never reached with reduced motion); (2) every boss, twenty steps into each of its moves
along its scripted route, drawn alone with its state and its age in the move held while the clock runs 24 steps: no colour's area
comes and goes back (without reduced motion it finds the plough's beacons); (3) every ledge on a beat through its warning: each
colour the same area at every step; (4) the map with no runes and with all: the same. A first version drew whole levels with the
clock running and could not tell a flash from a tram crossing the view's edge: `handbook/lessons.md`.

## 6. Line 2's ending card: paid

`?debug&card` (`debug.ts`, through `__game.card`) shows the level's card at its end as its rune would, with the progress pretended:
line 1's ending is Vålerenga's with every rune of line 1 (the tenth rune's lines in both languages, line 2 opened, the story's end of
line 1), line 2's is Gamlebyen's with all sixteen (the story's end of line 2), and the encore's its own. `tools/shots.ts` takes
`--lang=nb-NO`. Taken at 1280 x 800, 390 x 844 and 360 x 640, in English and Norwegian, with a mouse and with `&touch` (`6-cards/`).

No line ran out of its card, but on an upright phone every card was held to half the screen's width (the kit's `.card` is placed at
`left: 50%` with no width, so its width can never pass the half): line 2's ending wrapped two or three words a line and its title
broke after the rune ("G ·" / "Gamlebyen"). `#finish` is now as wide as its lines want, up to the screen less 32 pixels (`styles.css`;
on a wide screen half the screen at most, as before). With a mouse in a window 360 x 640 the header (two rows of runes) covers the
card's top; on a touch screen the card keeps under the bar (`--bar`) and fits at both phone sizes. Not fixed: a narrow desktop window.

## 7. Kinds met in several levels: looked at, nothing changed

Fourteen kinds are met in more than one level (pigeon, gull, rat, guard, crow, scooter, kid, fox, grill, hedgehog, duck, wasp, owl,
squirrel): 52 pairs of a kind and a level. Each was taken in place (its first in that level, `look=`), by day and under the level's
own sky (79 pictures, `7-kinds/before/`; a sheet a kind, `7-kinds/sheets-before/`, cropped round the red outline nearest where the
camera was put). `leans.tsv` (from `../../glance/leanplaces.ts`) has each level's two neons and how far each is from the nearest of
that level's fields: by day 14.5 at the least (Langkaia's electric blue against its harbour water, `#355868`), under the level's own
sky 13.3 (Nordmarka's purple against its forest, twilight); the palette test's floor is 10, and every neon passes it everywhere.

By eye nothing read badly because of its lean: the two neons are a figure's marks and sheen, inside its near-black line and red
outline, so they never touch the ground or the sky; only the glow after dark does, in the figure's commonest neon. So nothing was
changed. Two things seen, not about the lean, left for Lars:
- At Slottet the first pigeon walks among the parade at the start, and the children's hand flags cross it for a moment.
- Under Nordmarka's dark the fox, the owl, the squirrel and the hedgehog are their glow (orange, or magenta for the hedgehog) round
  a dark shape, not their red outline, until his headlamp reaches them: it says something is there; it does not say what.

## 8. `tsc` from the root: paid

From the root `bunx tsc --noEmit -p apps/viking` fetches TypeScript 7.0.2 (the root has no TypeScript; `bunx` takes the newest),
inside `apps/viking` it is the workspace's 5.9.3. TypeScript 7's DOM types allow `HTMLElement.hidden` to be `"until-found"`, so
saving it into `{ hidden: false }` failed (`main.ts`, the help line kept while he is in the mound). The saved value is typed as the
DOM types it (`HTMLElement["hidden"]`); both are clean, and so are the other three packages from the root. Written down in
`docs/games/handbook/lessons.md`.

## The measures

From `docs/games/handbook/scripts/review.sh` on the branch's last code, and the rest by hand:

- **Tests**: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 454 pass (445 after order 29, and 9 new: `levels/lazy.test.ts`'s
  three, `render/reduced.test.ts`'s four, two in `levels/encore.test.ts`), none failing; the viking suite 212 s.
- **tsc** clean in all four, inside each package (TypeScript 5.9.3) and from the root (`bunx tsc --noEmit -p <package>`, which
  fetches 7.0.2). `bun run build` at the root clean.
- **The first script**: 59.55 kB gzipped as vite reports it (GNU `gzip -c` 59,544 bytes; 59.34 after order 29). What it gained:
  Langkaia's plain props (0.07), the map's encore file fetched ahead and the idle hook (0.07), the bare map's line 2 deck and gate and
  `BARE` moved to `kart.ts` (0.05), `__game.card` for `?debug&card` (0.01), the rest of the line's few bytes; nothing moved out.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`. The kit changed in one line (`oars.ts`, the
  oars' warning held with reduced motion), which the front page does not use.
- **Run files**: the sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, on `origin/main` (`055bd26`, a worktree) and on the
  branch: every run's record byte-identical (`cmp`), the encore's included (the club is drawing only):

  | Level | md5 of the runs, before and after | ±2 | ±4 |
  |---|---|---|---|
  | Langkaia | `dd2406a1c3c0` | clear 59/60, 0.15 hearts a run | clear 55/60, 0.77 |
  | Nordmarka | `58bfcf501657` | clear 59/60, 0.65 | clear 56/60, 2.00 |
  | Bjørvika | `1fdbdf511c68` | clear 60/60, 0.52 | clear 60/60, 1.60 |
  | Gamlebyen | `54db73ff6304` | clear 60/60, 0.47 | clear 59/60, 1.07 |
  | The encore | `112b3fb514ab` | clear 60/60, 0.08 | clear 60/60, 0.65 |

- **The map with any rune missing**: 40 of 40 pictures byte-identical to `origin/main`'s (order 29's 20 addresses, `o29/mapurls.sh`,
  at 1280 x 800 and 390 x 844).
- **Perf** at 390 x 844 (`perf-390.tsv`, `perf-390-before.tsv`; order 29's places and four more): every place the same number of
  rectangles a frame as `origin/main`, but the map with every rune at night, 5,055 to 5,060 (the stop's glow); the most in the arena
  2,303, as order 29 measured. Loki's bigger club is copied from its outlined sprite, so it adds no rectangles.
- **LEVELS.html's pictures** taken again from the branch (`tools/pictures.ts`): all 22 byte-identical to the ones in
  `docs/games/shots/`, so none was replaced (its encore pictures are by day and of Loki posing, with no club).

## What only a person can judge

- The stop's glow on the map at night: a pink haze round the tubes that reads as neon, or a pink box.
- Loki's raised club at the troll's size on a phone: a tell he sees in time, or too much club for the man.
- The ending cards on a phone, now wider; and whether a desktop window that narrow matters at all.
- Reduced motion on a real device with the setting on: the oars' and banners' warnings lit and still read as "about to go".
- Without `feel`'s file Langkaia is plain boxes: whether that is ever seen (it needs `feel`'s file to fail and Langkaia's not).
- Nordmarka's invaders in the dark as their glow alone.

## Found and not fixed

- With a mouse in a window as narrow as a phone (360 x 640), the header's two rows of runes cover the top of a card; on a touch screen
  the card keeps under the bar. A fix needs the header's height in CSS without the pad (`--bar` is set by the pad only).
- Slottet's first pigeon among the parade's flags at the start (above).
- Under Nordmarka's dark the invaders show as their glow, in the body's commonest neon, not their red outline or the level's lean.
- `render/reduced.test.ts`'s first part reads the source for the idioms it knows (`Math.floor(…) % n`, `(… >> n) % n`); a blink
  written another way (`Math.sin(t) > 0`, a lookup by `t % n` without a floor) would pass it unseen. Its second part covers the
  bosses, the ledges and the map only.
