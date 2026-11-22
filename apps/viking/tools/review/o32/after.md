# Order 32: lights after dark, each item and the measures

Measured on 22 November 2026 on branch `lights-after-dark` (from `origin/main` at `0e17455`, after order 31). Pictures (outside the
repository) in `~/.cache/claude-scratch-larshansen/o32/shots/`, a folder an item: `1-lights/` (`before/` and `after/`: every level's
walk, the census's lights' places, the encore and the map, at night at 390 x 844 and 1280 x 800, under each scene's own sky, and the
camera on each lit thing at 1280 x 800; `side/`: every level before and after, side by side, a sheet a level and a size; `key-crops/`,
`encore-crops/`: the changed things cropped by `../../glance/diffcrop.py`), `3-day/` (every level's walk, the encore and the map by day,
and the map with a rune missing, both builds), `4-logs-chairs/`, `5-gap/`, `7-words/`. "Before" is `origin/main`'s build; "after" the
branch's (part one's pictures from the build after part one, the rest from the last build).

## 1. The table: done

`before.md`: every thing that gives light in its place and every thing that glows after dark, level by level, the encore and the map,
with whether it is lit now, whether it should be, whether it lights what is near it, and the decision. Made from three looks: the
census (`src/render/lightcensus.ts`, printed by `../../glance/lights.ts`: every scene drawn across its whole length as a browser draws
it, every `light()` with the function that registered it and what a later pass draws over it), the pictures above, and the code.

The census before: 24,260 lights registered across the scenes at night (most of them far windows), 7 of them dimmed by something drawn
after them (all seven Korketrekkeren's lit trail's lamps, by the dusk under the trees, 100 % of their pixels), and 16 pools of lamplight
lying under the tiles drawn after them (all of Gamlebyen's: the three street lamps', twelve torches', the hall door's). Nothing else was
dimmed. What the code showed that the census could not: the encore's stage, the invaders' neon signs, the T sign, Bygdøy's ferry's
wheelhouse and the map's skylines' windows were not lights at all; the braziers and the grills were lit as lamps over their neon fire;
and Vålerenga's night was not drawn at all (below).

**Found: Vålerenga's night has not been drawn since order 15.** Order 15 moved the night out of `main.ts` (where it was drawn for any level
with a `dark`) behind `Art.night` and gave the hook to Nordmarka only (`39f30f5`, 15 November). Since then Vålerenga's lane behind the
church had no dark, its church windows and lanterns threw no light through it, and what its `overDark` draws (the Pi on the yellow
house's sill with its red and green light, the paper cranes in Kruttverket's upstairs window, the eyes over the dark) was not drawn at
all, by night or by day. `before.md` has the account; the before picture `1-lights/before/night-390/nabolaget-c212.png` shows the sill
empty. Order 32 draws the Pi and its light and the paper cranes again (Vålerenga's `Art.night` draws them over the night's tint). It
first drew the lane's dark again too (`1-lights/key-crops/nab-lane.png`, `nab-home.png`, `nab-krutt.png` are that build), but the lane's
dark measured about 1,580 rectangles a frame more in the lane at 390 x 844 (6,711 against 5,131), over the order's limit of 150 (the
182 it added everywhere else in the level were the paper cranes, drawn a pixel at a time wherever he stood; they are now kept, one
piece for each way their threads hang, and the Pi drawn only while its window is on the screen: 2 more anywhere, 14 at the home); so
the lane is left as it has been on the live site since 15 November, and bringing its dark back is a decision for the planner and Lars (`before.md` says what it takes).

## 2. One rule, held by a test: done

The rule (ADR 0054, DESIGN's "Lights after dark"): a thing that gives light registers its lit part as a light, so after dusk it is its own
colour over the dark, where nothing drawn after it dims it; a lamp at the lane lays a small warm pool on the ground under it, registered in
the level's `front`; nothing else glows; a light's colour is warm and natural, never the glamour's neon but where it is the glamour's own,
and 10 or more from what he takes, stands on and uses but by name.

What changed (`1-lights/key-crops/`, `encore-crops/`, `side/`):

| Thing | Before | After |
|---|---|---|
| Korketrekkeren's lit trail | the lamps registered behind the lane, then the dusk under the trees drawn over them: their own warm colour under the tint | registered in `front`, after the dusk: lit; a warm pool on the run under each, following its steps (`poolAlong`, the props kit) |
| Gamlebyen's lamps, torches, the hall door | pools registered behind the lane: under the cobbles and planks | registered in `front`: on the cobbles and the quay's planks; a torch gone out at dawn has none |
| The torches' flame, the hall's firelight | `#ffb347`, 7.8 from the glamour's laser orange; `rgb(255,170,90)`, 4.8 | `#ffbd55`, 10.8 (`swatches/ruins.ts`, the kit: the front page does not use it); `rgb(255,190,120)`, 10.2 |
| The braziers (Akershus), the grills (Holmenkollen, Akerselva) | a lamp's warm light over their magenta and lime fire, mixing it toward a muddy yellow | none: their light after dark is their neon glow, as every invader's |
| The encore's stage | its neon, its lenses and its beams tinted like its curtain | the neon tubes and the lightning bolts lit while the glamour is on (dark glass once he is plain); the lenses lit in the show (warm white once plain); the cold spot on him before the show (not over the speaker stacks in front of it). The beams were lit too at first, a rectangle a slice: over a hundred rectangles a frame for a haze, so they are as they were |
| The invaders' neon signs (fourteen levels) | tinted with the scenery | their tubes lit in their neon; under Nordmarka's dark their board shows through with a little light round it |
| The T sign (every level) | tinted | its white T lit (not its blue: lit, it comes within 6 of his tunic) |
| Bygdøy's ferry | its wheelhouse dark | its three windows lit, as Rådhuset's ferry's saloon is |
| The map's skylines | dark glass | about half of each skyline's windows lit, the same ones every night |
| Lamps at the lane | Rådhuset's had pools | pools also under Ekeberg's viewpoint lamp, Bygdøy's pier lamp, Vigelandsparken's bridge lanterns, the encore's park lamp; each pool registered only while it is on the screen (the props kit's `pool`): a light is drawn whether it is on the screen or not, and a pool is a rectangle a column |
| Vålerenga's Pi and paper cranes | not drawn (above) | drawn again, over the night's tint (its `Art.night`); the lane's dark is still not drawn (above) |

`src/render/lights.test.ts` holds it, on the census of every scene at night and under its own sky (13 s):
1. each scene lights exactly what its row names (a table of 139 rows: the function that registers it and what it is), so a new light or
   one gone out is a decision;
2. nothing drawn after a light on the street dims it (see-through fills of a later pass; light added, `lighter`, is not dimming; what
   stands in front may hide it);
3. a pool never lies under the tiles (at most a tenth of it);
4. a light's colour is 8 or more off every neon of the glamour but the glamour's own (the encore's stage, its stop, the neon signs, the
   welder's sparks), and 10 or more off what he takes, where he stands and what he uses, but by name: the kit's lamp colour `#ffd36b`
   (7.7 from the paint: ADR 0044's exception, small panes and glass, never a top edge), its soft light (9.0), the sun's disc at
   Østensjøvannet (`#fff0c0` is the coin's glint itself; `#ffa860`, `#ff9452` 5.6 and 6.6 from the laser orange), a torch's hot core
   `#fff0b0` (3.6 from the glint), the white of the T sign and the map's ticks, the faint pale of the map's empty slots and the cold spot.

Measured as the palette test measures (CIEDE2000; the nearest of what he takes, stands on and uses; the nearest neon): every light colour
the scenes use after order 32 is printed by the test; the warm lights' nearest role is the coin's copper or gold at 11.8 to 16.6, his
skin (not held: a lamp is not mistaken for him by shape) at 2.8 to 7.4.

**The limits**: the reduced-motion test records every light a path registers, so a flickering light is held with reduced motion (the torches
were, and are); the trail's lamps and pools are still. A light may not dim a red outline: lights are drawn at the end of the pass they are
registered in, and `afterDark` copies every outline again over them after; the pools are `lighter` or a soft warm fill, under that copy.
Nordmarka's dark is as dark as order 31 left it but at its neon sign. Perf: under "The measures".

## 3. By day nothing changes: done, with the departures named

Every level's walk every 60 columns, the encore at three places and the map in three states, by day (`&sky=day`), at 390 x 844 and
1280 x 800, from `origin/main`'s build and the branch's last (`3-day/`): 74 of 80 at 390 x 844 and 73 of 80 at 1280 x 800 byte-identical.
The others:
- Akerselva c060 and c240, Holmenkollen c120 (both sizes): the logs and the chairs, part two's redraw (item 4).
- Nordmarka c060, c120, c180 (both sizes): Nordmarka's dark is drawn under every sky (it is the level's own, a summer night in the
  forest), so what changed over it changed by day too: the dark pixel between the outline and the glow (item 5) and the neon sign's board
  let through it (part one).
- Langkaia c000 at 1280 x 800: the "before" picture was a bad take (taken again from both builds: identical).
By day lights are not drawn at all (the kit draws them only under a tint), so nothing of part one shows by day elsewhere. Not in these
places but changed by day: at Vålerenga, under a day sky (the T key's; its own sky is night) the Pi on the sill and the paper cranes are
drawn again, as they were before order 15.

The map with any rune missing (order 29's addresses by day, `../o29/mapurls.sh`): 20 of 20 byte-identical at the two sizes. At night the
map changes (its skylines' windows).

## 4. The logs and the chairlift's chairs: done

Drawn by ADR 0051's rules as props-kit pieces (`prop`), of their place, natural, quieter than the figures (`4-logs-chairs/`: close-ups at
1280 x 850 by day, a moment later and at night, before and after, and at 390 x 844):
- **Akerselva's logs**: one piece a variant (three, by the carrier), round: lit along its top row, its face, shaded to its wet underside;
  bark in fissures along it with a knot or two; each end sawn, two pixels as before, its face lighter than the bark with a ring in it and
  the bark's rim over and under. Only what is above the water shows as it comes up and goes under (a piece for each height), the foam
  round it as before. Its top row is where it was (the page paints it yellow: he stands on them), and so is its box.
- **Holmenkollen's chairs**: the grip clamped on the cable, the hanger a tube lit on its left, the back two red slats on its uprights
  (`chair red`, the ski arena's red), the seat of slats lit on top (painted yellow by the page), the frame under it, a footrest on two
  rods; one piece, hung from the cable's height; the seat's box as before.
- `alive/props.test.ts`: both in their levels' lists of what is drawn from the kit, their old drawings' colours in `OLD`; no colour nearer a
  role than the old drawing's or 10 (Holmenkollen: him 16.9 → 11.0, the enemy red 6.1 → 6.1, the seat's red as it was; Akerselva
  unchanged), no neon, every material in the band (log bark 4 tones, 21.3; log end 3, 14.3; chair frame 4, 16.4; chair red 4, 20.2).

## 5. The red outline against its own glow in the dark: done

Over a level's own dark (`overTheDark` in `alive/glamour.ts`, Nordmarka's) the glow now starts a pixel further out
(the shape grown by four, five and six, a fifth each, where it was three, four and five) and the pixel next to the outline (the shape
grown as the outline is, by three, less two) is the night's own colour, `DARK_GAP` (Nordmarka's `NIGHT`); then the outline. Nothing is
lighter. `render/palette.test.ts`, "against an invader's own glow under the dark": for every neon a glow can be, over every one of
Nordmarka's fields, at every depth of its dark, the outline as order 31 measured it against the pixel next to it: before 16.8 at the worst
(the laser orange `#ff7a1a` over `#493424` at a dark of 0.05; order 31 measured 22.7 from a picture), now 44.3, against 29.2 by day.
The forest case stays 33.8. Pictures: `5-gap/` (the fox, the owl, the squirrel, both sizes, by its own sky and at night). After dusk
elsewhere the glow is as it was.

## 6. The reduced-motion test's blind spots: done, with what still cannot be covered

`render/reduced.test.ts` (84.7 s alone with pictures being taken beside it; under 90):
- **What takes its place from the clock.** Every carrier the kit draws and every jumper in its leap, along every route every five
  seconds, drawn at 25 steps of the clock and recorded relative to where it is: at a place it is drawn one way (a leap's own cycle, named in
  `LEAP_CYCLES`, as many ways as its frames: the salmon's tail, two; the track rat's kick, two), and a drawing it left never comes back
  elsewhere. No level draws its carriers with the kit's drawing (every level with carriers has its own), and a level's own carriers take
  their place from the page, so part 1 already draws them held where they are, the clock running, wherever they are: o31's limit there was
  narrower than it read. What it found: the salmon's and the track rat's leap cycles (named, as order 30 named them).
- **What `render/feel.ts` draws**: him (his frame, his rim, the blink after a hit), the answers to what just happened, the marks of things to
  use, the shadows, along every route every five seconds, just after anything happens (a stomp, a hit, a flag, a skilling, a bench, the
  rune, a boss's move) and where his idle blinks its eyes, the world held and the clock running: never comes back within 24 steps. Nothing
  found with reduced motion; without it, the bosses' answers are found (so the watch sees them).
- **Still not covered**, and why: `main.ts`'s own drawing (a test cannot import it: it starts the page): `afterDark` (it draws again, at
  fixed strengths, what parts 1 and 6 draw), the rune's flight to the header and the banner's fade (each one movement, not a blink; the rune
  still flies with reduced motion, a question for Lars); a blink planted on a named leap cycle (the salmon's) is not found, only one on a
  thing drawn one way at a place; the maze.

## 7. Norwegian, the three unphotographed: done, nothing overflowed

At 360 x 640, English and Norwegian (`7-words/before`, `before-nb-NO`; the sheets `sheet-en.png`, `sheet-nb-1.png`, `sheet-nb-2.png`):
- **The touch notes**: the shield's ("Skjoldet: hold Skjold for å løfte det.", Bygdøy's prow, `?debug&touch&auto&steps=3440`), the
  sledge's on and off ("På kjelken: Hopp for å hoppe, Dukk for å dukke." on two lines; "Av kjelken: Skjold løfter skjoldet igjen.",
  Korketrekkeren at steps 392 and 2800): each inside the screen under the bar. The pole's note was not reached: the pole comes with
  Holmenkollen's rune, under its card (47 and 52 characters; `pad.test.ts` holds it to two lines at 360).
- **The shield's touch words**: the gift's bubble ("Skjoldet er ditt. / Hold Skjold-knappen for å løfte det.") and the pad's Skjold and
  Dukk buttons: inside.
- **The encore's hints after a miss**: "Mellom numrene står han i positur. / Hopp på ham da." (the opening let go by: `x=384&keys=n188,j14`,
  the club's wave jumped), the club's ("Trollets klubbe, i neon. / Hopp når den kommer ned.": standing on the stage, `x=384&steps=240`) and
  the charge's, the longest line of the three ("Opp på en høyttaler mens han turer opp.": a stomp from the speaker stack in the first pose,
  then standing, `x=472&keys=n158,j4,r16,n31,l40&steps=450`), with and without the pad: inside the screen. The bite's was not reached (it
  needs two hits; the harness's keys hold one action a step, and no second stomp was found): its lines are 29 characters, shorter than the
  charge's 39.
Nothing outside `story.ts` needed changing; `story.ts` is as it was.

## The measures

From `docs/games/handbook/scripts/review.sh` on the branch's last code, and the rest by hand:

- **Tests**: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 466 pass (459 after order 31; new: `render/lights.test.ts`'s four,
  the outline against its own glow in `render/palette.test.ts`, `render/reduced.test.ts`'s moving things and feel's drawing), none
  failing; the viking suite 323 s on the last run (396 to 430 s on runs with pictures being taken beside it). The reduced-motion file alone 87.4 s with one picture tool
  beside it (its two new parts about 12 s of it); the lights file 13 s.
- **tsc** clean in all four inside each package (TypeScript 5.9.3) and from the root (`bunx tsc --noEmit -p <package>`, 7.0.2).
  `bun run build` at the root clean.
- **The first script**: 59.60 kB gzipped as vite reports it, as after order 31; 59,594 bytes by GNU `gzip -c` (59,596 on `origin/main`'s
  build: 2 fewer), 59,596 by Node's zlib (59,599).
  Nothing was moved for it: the new drawing is in `feel`'s file and the levels', and the bytes won are only the chunks' names the script
  carries. No byte-for-byte win was looked for beyond that.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` (twice). The kit changed in one swatch
  (`swatches/ruins.ts`, the torches' flame, which the front page does not draw).
- **Run files**: the sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, on `origin/main` (a worktree) and on the branch: every
  run's record byte-identical (`cmp`), and the same md5 as order 31 recorded:

  | Level | md5 of the runs, before and after |
  |---|---|
  | Langkaia | `dd2406a1c3c0` |
  | Nordmarka | `58bfcf501657` |
  | Bjørvika | `1fdbdf511c68` |
  | Gamlebyen | `54db73ff6304` |
  | Slottet | `0a1e506dd82b` |
  | The encore | `112b3fb514ab` |

- **The map with any rune missing**: 20 of 20 pictures by day byte-identical to `origin/main`'s (above).
- **LEVELS.html's pictures** taken again from the branch's last build (`../../pictures.ts`): replaced in `docs/games/shots/`:
  `07-nordmarka` (the owl's outline with the dark pixel outside it), `14-ostensjovannet` (the T sign's white T, lit at the level's
  twilight), `17-encore` (the stage's neon and lenses lit at its evening); the rest byte-identical. Its words were not changed; they
  still say Vålerenga's lane is "dark but for the church windows and his headlamp", which has not been true since order 15 (above).
- **Perf** at 390 x 844 (`?debug&perf` through `../../glance/perf.ts`), on `origin/main`'s build and the branch's last, at the same 209
  places: order 31's places (every level's walk, the encore, the map, Stortinget's shafts) by their own sky and each again at night,
  and the places of what this order changed (Korketrekkeren's trail, Gamlebyen's lamps and quay, Vålerenga's lane, home and Kruttverket,
  Vigelandsparken's bridge, Akerselva's logs, Holmenkollen's chairs, the map at night), both ways (`places.tsv`, `perf-390-before.tsv`,
  `perf-390-after.tsv`). The most any place gains: +96 (the encore at night: its neon and lenses); none over 15,000 (the most, 11,151,
  Akerselva at night, 11,267 before). By level, the most rectangles a frame before and after and the most gained:

  | Level | places | most before | most after | most gained by its own sky | most gained at night | least change |
  |---|---|---|---|---|---|---|
  | Langkaia | 8 | 7,162 | 7,164 | +0 | +15 | +0 |
  | Akershus | 10 | 6,888 | 6,899 | +0 | +11 | -2 |
  | Rådhuset | 8 | 4,952 | 4,954 | +0 | +2 | +0 |
  | Slottet | 8 | 9,701 | 9,703 | +0 | +15 | +0 |
  | Holmenkollen | 10 | 10,819 | 10,821 | -12 | +2 | -12 |
  | Akerselva | 12 | 11,267 | 11,151 | -117 | -116 | -119 |
  | Nordmarka | 8 | 4,580 | 4,597 | +58 | +58 | +2 |
  | Stortinget | 24 | 4,289 | 4,289 | +0 | +2 | +0 |
  | Ekeberg | 10 | 8,586 | 8,601 | +28 | +28 | +2 |
  | Vålerenga | 14 | 9,550 | 9,552 | +14 | +14 | +2 |
  | Bygdøy | 10 | 5,437 | 5,442 | +0 | +5 | +0 |
  | Vigelandsparken | 10 | 6,810 | 6,825 | +0 | +80 | +0 |
  | Korketrekkeren | 12 | 3,330 | 3,318 | +3 | +3 | -12 |
  | Østensjøvannet | 10 | 10,052 | 10,054 | +2 | +2 | +2 |
  | Bjørvika | 10 | 8,763 | 8,765 | +2 | +2 | +2 |
  | Gamlebyen | 14 | 5,033 | 4,639 | -394 | -394 | -496 |
  | The encore | 22 | 2,950 | 3,029 | +96 | +96 | +34 |
  | The map | 5 | 5,083 | 5,110 | +27 | +27 | +0 |

  Akerselva and Gamlebyen draw fewer: the logs are one copy each where they were seven rectangles, and Gamlebyen's sixteen pools were
  drawn every frame wherever he stood (registered behind the lane), and now only those on the screen. The first measure of the branch was
  over the limit and changed it (the commit "within the perf limit"): the pools were all registered wherever he stood (six bridge
  lanterns' at Vigelandsparken, 156 a frame), the encore's beams as lights cost about a hundred, and Vålerenga's lane's dark, drawn again,
  cost about 1,580 in the lane, and the paper cranes, drawn a pixel at a time wherever he stood, 182 everywhere else. Lights are rectangles after dusk,
  not copies: the order's "kept pieces, copied" holds for what is drawn (the lamps, the logs, the chairs, the cranes), and the lights over
  them are a rectangle each, a pool one a column (two on a slope).
- **The contrast numbers**: the red outline against its own glow over the dark, 16.8 → 44.3 (29.2 by day; item 5); against the forest's
  fields under the dark, 33.8 as order 31 left it; the lights' colours as `lights.test.ts` prints them (item 2).

## What only a person can judge

- Korketrekkeren's lit trail at dusk on a phone: do the lamps and their pools read as a lit trail; are the pools too faint, or too warm?
- Gamlebyen at night: the warm pools on the cobbles and the quay's planks under the lamps and torches.
- The encore's stage at night: its neon and lenses lit (its beams are as they were, tinted: as lights they cost over a hundred rectangles
  a frame); does it read as a stage at night?
- The invaders' neon heart signs lit after dark in fourteen levels: a nice touch of the glamour, or a pull of the eye from the invaders?
- The T sign's lit white T at every level's start; the map's skylines with about half their windows lit (the same every night).
- The Pi's light on the yellow house's sill and the paper cranes, back after a week; and whether Vålerenga's lane behind the church
  should be dark again (about 1,580 rectangles a frame there).
- The dark pixel between the red outline and the glow in Nordmarka's dark: does the red read better, or does the black read as a second
  outline?
- The logs and the chairlift's chairs at phone size.
- The braziers and the grills after dark without a lamp's warm light: do they still read as fire (their neon glow)?
- With reduced motion the rune still flies to the header (one movement): should it?

## Departures, doubts, found and not fixed

- **Departures.** Vålerenga's Pi and paper cranes are drawn again (a bug from order 15, not in the order); they change Vålerenga at two
  windows, by night and by day (the T key's sky). Its lane's dark, missing since order 15 too, is not drawn: over the perf limit. Nordmarka's dark is drawn under every sky, so its pictures by day changed with items 2 and 5.
  The torches' flame colour changed in the kit's swatch file (`swatches/ruins.ts`), which only Gamlebyen uses.
- **The census's limits.** It draws every scene at its start (the encore before the show, Gamlebyen before its dawn, the bosses asleep),
  so the encore's lenses in the show and the torches going out at dawn are not held by `lights.test.ts`'s table; they were
  looked at in pictures. A copy counts as covering its whole rectangle, so "covered" is the most it can be.
- **The colour exceptions** are by name (`NAMED` in `lights.test.ts`): the kit's lamp colour 7.7 from the paint (ADR 0044's), the sun's disc
  at Østensjøvannet (one of its tones is the coin's glint itself, in the sky), a torch's hot core 3.6 from the glint.
- **The reduced-motion watch's limits**: a blink on a named leap cycle (the salmon's, the track rat's) is not found, only one on a thing
  drawn one way at a place; `main.ts`'s own drawing is not drawn; the maze is not covered. No level uses the kit's carrier drawing, so
  that part of the watch holds nothing today.
- **Not photographed**: the pole's touch note (under Holmenkollen's card), the bite's hint at the encore (two hits needed; the harness's
  keys hold one action a step).
- **Found and not fixed**: Bjørvika's cranes' red warning lights are 10.3 from the warning red (a dot at a jib's tip; kept); the chairlift's
  seats' red is 6.1 from the warning red, as before order 32; the kit's lamp colour is 7.7 from the paint and cannot change without the
  front page; Vigelandsparken's gate lanterns and the map's viaduct lanterns have no pool (behind him at the start; on the map, nothing to
  find); the rune flies with reduced motion.
