# Order 31: loose ends and a second look, each item and the measures

Measured on 21 November 2026 on branch `loose-ends` (from `origin/main` at `1fde133`, after order 30). Pictures (outside the
repository) in `~/.cache/claude-scratch-larshansen/o31/shots/`, a folder an item: `1-cards/`, `2-pigeon/`, `3-dark/`, `5-shafts/`,
`6-words/`, `7-look/`; and `map/` (the map with a rune missing, both builds), `levels-html/` (LEVELS.html's pictures that changed).
"Before" is `origin/main`'s build; "after" the branch's.

## 1. A card under the header in a narrow window with a mouse: done

Only the touch pad gave CSS the header's height (`--bar`), so with a mouse in a window 360 x 640, where the header wraps its runes
to two rows, every card's top was under it (the opening's title, the encore's and line 2's ending's titles hidden). The page's camera
now sets `--bar` whenever the header's bottom moves, every frame and on any screen (`main.ts`, 0.04 kB of the first script), and the
game's own cards (`#finish`: a level's end, Game over, the train that did not come; the story's opening card; the loading board) keep
below it and scroll if the window is too short (`styles.css`). The pad still sets it too, within the frame in which the bar folds or
unfolds. The maze's own cards keep their own place (they are placed by the maze, at 16 and 18 % of the screen).

Every card (the opening, a level's end, line 1's ending, line 2's ending, the encore's) at 360 x 640 and 390 x 844, with and without
`&touch`, in English and Norwegian, from both builds (`1-cards/before`, `after`, 40 each; `sheet-*.png`): the ten at 360 x 640 with a
mouse changed, every card's top now ten pixels under the header; the thirty others (a touch screen at both sizes, a mouse at
390 x 844, where 22 % of the screen is already under the header) are byte-identical; so are the five at 1280 x 800 (`desk-*`).

## 2. Slottet's first pigeon among the parade's flags: done, by drawing only

The first enemy he meets is the pigeon at column 13 (its box walks columns 10.5 to 16.5). The parade's children walked the whole
street from column 8, and the crowd in front waved a flag every third person, so the pigeon walked among children, their hand flags
and the crowd's flags. The pigeon was not moved or delayed: the parade now joins past its stretch (column 18; each pair rising out of
the crowd over its first steps, as the banners do, where before they appeared at column 8 at once), and nobody in the crowd waves a
flag over columns 9 to 18 (`levels/slottet.ts`, `FIRST_FOE`). The children past column 20 walk exactly where they walked before
(the same lattice). The rules are untouched: Slottet's sloppy runs are byte-identical (below), and so is every other level's.

Pictures: `2-pigeon/before`, `after-final` (the start at nine steps of the clock, walking in, at night and with reduced motion, at both
sizes, and two places further up the street, byte-identical to before), `zoom-final.png`; `after/`, `pairs-*.png` and `zoom-390-160.png`
are the first version, whose children further up walked a lattice off where they walked (it changed LEVELS.html's Slottet picture; fixed). The pigeon now walks on plain street. Where its stretch ends and the
first banner rises at column 17, the banner's left bearer can stand a pixel or two from the pigeon's outline when the pigeon is at
the far end of its stretch; no flag comes nearer than eight pixels.

## 3. Nordmarka's invaders in the dark show as glow only: done

Nordmarka's own dark comes after the night's tint and covered every outline outside the lamp's circle; the glow was drawn over the
dark, the outline under it. The red outline alone (the sprite's ring) is now copied again over the dark at 0.9 of its strength, as it
is over the night's tint (`overDark` in `levels/nordmarka.ts`, `RING_OVER_DARK`), on its own pixels only: in every picture before
and after, every pixel that differs is the ring's red, so the dark round it is as dark as it was. The calm outline is not copied
over it (the moose, the troll asleep stay the dark's). The troll's outline while it walks or raises its club is red, so it shows too.

Measured as the palette test measures fields (`render/palette.test.ts`, "under Nordmarka's dark the red outline reads as clearly as
by day"): the outline against each of Nordmarka's fields as it is seen, by day the red over the field; under the trees the field
under the level's twilight tint, the outline over it at `afterDark`'s strength, the dark at every depth the level has (0.05 to 0.9)
over both, and the ring once more over that. The least distance (CIEDE2000):

| | by day | under the dark, before | under the dark, after |
|---|---|---|---|
| the red outline against the forest's fields | 29.2 | 6.7 | 33.8 (against `#ffffff` at a dark of 0.35) |

Against the invader's own glow just outside the ring (measured from the pictures, not by the test): 22.7 for the orange glow of the
fox, the owl and the squirrel, 34.4 for the hedgehog's magenta. The glow is order 27's and was left as it is.

Pictures: `3-dark/before`, `after` (the camera on each kind in the dark with his lamp away, by day and under the level's twilight, him
near each, the troll's arena; both sizes), `pairs-1280.png`, `pairs-390.png`. Not photographed: the troll walking at him in the dark
(the arena's pictures showed no change: it was not awake there).

## 4. The reduced-motion audit that knew two idioms: done, with its limits written down

`render/reduced.test.ts`'s first part read the source for `Math.floor(…) % n` and `(… >> n) % n`; it is gone. In its place:

- **Every level's scenery, drawn.** The sixteen levels, the encore, and the map with no runes and with every rune, across the whole
  of each in views of 640 x 400: the sky, the three far layers, the street's backdrop and every prop in it, the invaders' scenery, the
  water, the tiles, what is in front, the night. Each path is drawn into a recording canvas that keeps a fingerprint of every call (its
  colour, alpha, composite and place; a copy by which piece it copies; the lights it registers), first once unrecorded, then at six
  steps of the clock (0, 1, 3, 7, 13, 21 on from a start that differs from view to view), with reduced motion and the world held. It
  draws as a browser would: a stand-in `document` whose canvases draw nothing, so `kept`, `stamp` and `outlined` take their browser
  path and a kept piece is a copy. Every path must record the same at every step, but what is named in `MOVES`, with why; and what is
  named is drawn at 25 steps in a row and must never come back to a recording it left (a blink does).
- **Every thing, held.** Along each level's scripted route, every five seconds, each thing alone as the play has it: every carrier
  (the level's own drawing given where it is), every ledge on a beat and its paint, cannons, drums and flags (what happened to them
  held at its age), benches, sheep, skilling, the cheese, every enemy of every kind in whatever state the route finds it (walking,
  winding up, calm, watched), what is thrown, what hurts and is not an enemy (`hazardEdge`, moved from `main.ts` to `render/stand.ts`
  so the test can draw it), the bracteate, the rune. Each is drawn at 25 steps in a row and must never come back to a recording it
  left within them: anything that turns on and off two and a half times a second or faster does; an idle of a second or slower turns
  at most once.
- **The cards**: every `animation` and `transition` in the page's styles and the kit's is on a class the page sets only without reduced
  motion (one: the line filling under "To the map", `.card.auto`, set with `!view.reduced`).
- Parts 2 to 4 of order 30's test stand (every boss at each move, every ledge's warning, the map).

It found one thing order 30's test let through: **Ekeberg's fjord glints drifted with reduced motion** (`(i * 53 + Math.floor(v.t /
30)) % w`, a clock inside a sum, which the idiom did not match), right beside the ferry that held still. Held now (`levels/ekeberg.ts`).
Named as the world's own motion (`MOVES`), none of which comes back within 24 steps: Akerselva's water wheel turning with its buckets,
Ekeberg's gusts' leaves, Stortinget's platform board counting down, Bygdøy's rocking decks and sinking bundles, Vigelandsparken's loose
slab and its shadow, Korketrekkeren's crossing barrier, Bjørvika's welder's sparks and its gusts' dust.

Checked that it cannot be written around the old way: a blink written as `Math.sin(v.t * 0.7) > 0` in Langkaia's backdrop and as
`(t & 4) === 0` in every shared enemy's drawing were added for a run and both were caught (then taken out).

Limits, honestly: (1) what reads the world from the clock is watched only where it stands still: a carrier the kit draws from the clock
(only while it waits at a stop), a carrier on a timetable (only while it is shown), a ledge (only within one phase), a jumper (only while
its leap stands still: the salmon's and the track rat's flick in a leap, named as cycles by order 30, are never watched); a blink drawn
only while such a thing moves would not be seen. (2) `main.ts`'s own drawing (the composition of a frame, the banner's fade, the flying
rune, `afterDark`) cannot be imported by a test and is not drawn by it; nor is `render/feel.ts`'s (events' answers, his frames). (3) The
maze is not covered. The file takes about 50 s (the scenery 30, the things 10); it took 7.

## 5. Stortinget's escalator shafts: done

The shafts' back walls (a band of tiles going down with the escalators, the rock above, every column of 34 to 60) and, of the two
escalators, what never changes (the truss, the glass balustrade, the handrail, the steps) are drawn once into kept strips (128 px,
`keptStrips`) and copied; the steps' ridges, which move with the belt, the lamps along the ceiling (which register their light) and the
comb plates are drawn every frame after them, as before (`levels/stortinget.ts`). A ridge is on a row nothing kept of its column covers,
so the order of drawing changes no pixel.

Pixel-identical: 72 of 72 pictures (twelve places from the hall to the first platform, by day, at night and with reduced motion, at
1280 x 800 and 390 x 844) byte-identical to `origin/main`'s (`5-shafts/`; one pair first differed in every pixel because the old
build's picture was taken before the level's file came; taken again, identical). Rectangles a frame at 390 x 844 (`?debug&perf`,
`perf.md`):

| Stortinget, at column | before | after |
|---|---|---|
| 24 | 2,691 | 1,718 |
| 36 | 5,163 | 1,466 |
| 42 | 6,630 | 1,363 |
| 54 | 6,325 | 2,344 |
| 60 | 5,582 | 2,743 |
| 66 | 4,259 | 2,947 |
| 0, 120, 180, 240 (the walk's) | 1,707 to 3,465 | the same |

The 9,950 of the roadmap was order 21's worst; after orders 23 to 30 the walk's worst at Stortinget was 6,630 at the shafts and is
now 3,465, on the platforms. (Two of the shafts' places, columns 30 and 48, measured nothing: he is hit on the first step there and
the page holds its picture, as `HANDOVER.md` describes.)

## 6. Norwegian: done

`game/words.test.ts` (new): every module of the page (all it exports, as deep as it goes), every level as it is loaded, the encore and
the map with no runes and with all, and the page's own words (`game/i18n.ts`, by language): wherever words are kept by language (387
places), both languages are there, with the same keys, the same number of lines and the same arguments, and no line empty in one only.
A second test holds that it sees a made-up missing word. Nothing was missing; nothing was changed.

`words.md` lists every line orders 21 to 30 added (the touch notes and buttons, the shield's touch words, the story, the encore) in both
languages and where each was seen at 360 wide in both (`6-words/`, 72 pictures at 360 x 640: every banner, the map's story sign and
line 2's gate in both states, the help line with the pole and the shield, the three bosses' and Loki's lines as he wakes and as each
piece comes off and as he leaves; the cards are item 1's). Nothing ran out of its box. Not photographed (no state of a picture reaches
them): the touch notes (held by `pad.test.ts` to two lines at 360, the longest 52 characters of 64), the shield's touch words, the
encore's hints after a miss (the route never misses; the longest, 39 characters, is shorter than the troll's wake line, which fits).
`story.ts` is as it was.

## 7. A second look for flat things: done, three things redrawn

`before.md` has the table (thing, where, what he does with it, fits its level, should the glamour touch it, decision) from a walk of
every level, the encore and the map at 390 x 844 and 1280 x 800, by day and under each one's own sky, and close-ups at four screen
pixels an art pixel of everything order 28 left alone. Redrawn, by ADR 0051's rules (of their place, natural, quieter than the figures,
never a coin, a rune, a door or a platform):

- **The blue tram** at Ekeberg and Vålerenga: a blue box with lamp-yellow windows by day, drawn a column at a time. Now one piece from
  the props kit (`tramSide` in `alive/props.ts`): two cars and their bellows, a door with its glass in each, windows framed with pillars
  between, glass by day with the sky's glint in a corner and lit after dark (each pane registered as a window's light, as far as it
  shows), the roof's edge lit, a lit end and a shaded end, the belt line, panel joints, the dark skirt. Where it goes in under the
  ground at Ekeberg's stop and below the street at Vålerenga's slots it is held by a clip to what shows, as the column drawing was
  (`7-look/redraw/stop.png`: identical edges). Its roof is still painted yellow by the page; its bogies are drawn as before.
- **Vigelandsparken's main gate**: grey slabs with a light band on top and dark boxes with a pale square. Now granite in courses with
  staggered joints and specks, lit left and shaded right, a moulded cap that overhangs with its shadow under it (no lit band along its
  top), a darker foot; on each pillar a wrought-iron lantern (the gates' iron), four panes under a roof with a finial, its glass where
  the old glass was and lit after dark.
- **Korketrekkeren's lanterns**: a grey post with a box on top. Now the lit trail's tarred wooden pole (the restaurant's log colours),
  an arm with a brace and a small iron hood over the lamp, as Oslo lights its ski trails and sledge runs; the lamp registered as a
  lamp's light; the pool of light on the snow as before.

`alive/props.test.ts` holds them (each level's list of what it must draw from the kit; their colours no nearer any role than what
they replaced, or than 10: the tram's old colours, `TRAM.body` and `TRAM.skirt`, were already 8.0 and 3.4 from his tunic, and the
new shade is 6.0 from it, not nearer; a lighter glint of glass was 7.3 from the calm outline and was darkened to 11.0). Pictures:
`7-look/redraw-final/` (before from the build before item 7, after from the branch's last build: 1280 x 850 close-ups by day, at night
and at twilight, and the four places at 390 x 844), `7-look/redraw/` (the first pairs, `trams.png`, `stop.png`).

Left, with reasons in `before.md`: the logs and the chairlift's chairs are the next candidates; the rest stands up at four pixels an art
pixel or is scenery behind the haze, quiet by rule.

## The measures

From `docs/games/handbook/scripts/review.sh` on the branch's last code, and the rest by hand:

- **Tests**: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 459 pass (454 after order 30; new: `game/words.test.ts`'s two,
  `render/reduced.test.ts`'s three new parts in place of its idiom search, the Nordmarka case in `render/palette.test.ts`), none failing.
  The viking suite took 253 s alone (212 s after order 30): the reduced-motion file is about 50 s of it where it was 7.
- **tsc** clean in all four inside each package (TypeScript 5.9.3) and from the root (`bunx tsc --noEmit -p <package>`, 7.0.2).
  `bun run build` at the root clean.
- **The first script**: 59.60 kB gzipped as vite reports it (GNU `gzip -c` 59,596 bytes; 59.55 after order 30). What it gained: the
  camera giving `--bar` to CSS (item 1, about 0.04 kB); the rest moves by a few bytes with the chunks' names it carries.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`. Nothing in `packages/` or `apps/landing` changed.
- **Run files**: the sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, on `origin/main` and on the branch: every run's record
  byte-identical (`cmp`), Slottet's included (item 2 is drawing only; no pigeon was moved, so no run file changed):

  | Level | md5 of the runs, before and after | ±2 | ±4 |
  |---|---|---|---|
  | Langkaia | `dd2406a1c3c0` | clear 59/60, 0.15 hearts a run | clear 55/60, 0.77 |
  | Nordmarka | `58bfcf501657` | clear 59/60, 0.65 | clear 56/60, 2.00 |
  | Bjørvika | `1fdbdf511c68` | clear 60/60, 0.52 | clear 60/60, 1.60 |
  | Gamlebyen | `54db73ff6304` | clear 60/60, 0.47 | clear 59/60, 1.07 |
  | The encore | `112b3fb514ab` | clear 60/60, 0.08 | clear 60/60, 0.65 |
  | Slottet | `0a1e506dd82b` | clear 60/60, 0.05 | clear 60/60, 0.32 |

- **The map with any rune missing**: 40 of 40 pictures byte-identical to `origin/main`'s (order 29's 20 addresses, `../o29/mapurls.sh`,
  at 1280 x 800 and 390 x 844).
- **Perf** at 390 x 844 (`perf.md`, 95 places): no place draws more rectangles than on `origin/main` (the most any place gains is 0);
  the most any place draws is 10,130 (Holmenkollen, as before); Stortinget lower (its most 6,630 to 3,465; at its shafts 1,363 to
  2,947 where it was 4,259 to 6,630); Ekeberg 729 fewer and Vålerenga 244 fewer where the tram is (one copy where it was drawn a column at
  a time), Korketrekkeren 21 and Vigelandsparken 12 fewer. Copies rose by at most 10 a frame (Nordmarka's outlines over the dark).
- **LEVELS.html's pictures** taken again from the branch (`../../pictures.ts`): 20 of 22 byte-identical; `07-nordmarka` (the owl's red
  outline over the dark) and `09-ekeberg` (the tram, at Ekeberg's evening sky with its windows lit) changed and are replaced in
  `docs/games/shots/`. Slottet's picture, at Spikersuppa, is identical (the parade past column 20 walks where it walked).

## What only a person can judge

- The tram on a phone: glass by day where its windows were lamp-yellow, lit after dark; does it still read at a glance as the thing he
  rides, and is the new blue too busy beside the plank walls and the brick?
- Nordmarka's invaders with their red outline in the dark: does the dark still feel dark, and does the red read against the orange
  glow round the fox, the owl and the squirrel (22.7 apart, closer than against the forest)?
- Slottet's start: the pigeon on plain street, the parade's children rising out of the crowd where the first banner rises; natural,
  or an odd gap in the 17 May crowd?
- Vigelandsparken's gate: the granite's courses at phone size, quiet enough or busy?
- Korketrekkeren's lit trail at dusk: the lamp is a few pixels under a hood; does the run still read as lit?
- The cards in a narrow desktop window, and whether anyone plays that way.
- Ekeberg's fjord glints now still with reduced motion, on a device with the setting on.

## Found and not fixed

- Korketrekkeren's lanterns did not come on bright after dark before this order, and the lit trail's lamps do not either: in the
  night and twilight pictures both are their own warm colour under the tint, where Vigelandsparken's gate lanterns (drawn in the
  backdrop) are lit. Not looked into further; it may be the dusk under the trees drawn over them in front (`front` in
  `levels/korketrekkeren.ts`).
- The reduced-motion test's limits (item 4): what reads the world from the clock is watched only where it stands still, and
  `main.ts`'s and `render/feel.ts`'s own drawing is not drawn by it.
- The maze's own cards with a mouse in a narrow window were not looked at (item 1 is the game's cards).
- The logs at Akerselva and the chairlift's chairs at Holmenkollen are the flattest things left in the lane (`before.md`).
