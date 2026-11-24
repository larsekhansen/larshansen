# Order 41: the screens between, and the last weak tells: looked at first

Looked at on branch `screens-between`, from `origin/main` at `2ba749d` (after order 40), its build served from a copy of `dist`. Pictures and
working files outside the repository, in `~/.cache/claude-scratch-larshansen/o41/`: `shots/before/` (every picture below), `work/` (the states,
the measures `m-before.tsv` and their summary), `bin/` (the scripts, described here).

## How

**The states** (`work/states.tsv`, 35, and `work/extra.tsv`, 4): the line map at the start (Langkaia open, everything after it shut, the
doors Hjem and Jernhaugen), with three stations cleared (done, open and shut side by side), by night, line 1 nearly done (line 2's gate),
line 1 done (its added-up time), line 2 begun, both lines done (the longship, the encore's stop, both added-up times), by night, and the
story's opening card; a level's card (`?debug&card`), line 1's ending, line 2's ending, the encore's, Game over, the loading board and the
failed load; a level by day (Langkaia's white marble and sky), in snow (Holmenkollen), in the dark (Nordmarka's twilight under the trees)
and in the winter night (Gamle Oslo), each at its start (its name on the plate), with a heart lost and the touch pad's jump and left
pressed, and with one heart left; the shield and the dash on the pad (Vigelandsparken); a thrower's "!" swelling and standing
(Rådhuset); the arrow at the screen's edge for a gull coming, ahead (Langkaia's route) and behind (Langkaia, Bygdøy); at a door, by a
sign, a boss's hint (the troll's), the pad's note on the help line (the ski pole); the maze inside the page: its header, its level list
with records, its card after a level.

**The conditions**: each state at 390 x 844 upright and 844 x 390 on its side, in English and in Norwegian (`nb-NO`), with touch (`&touch`)
and a pretended notch (`&safe=upright`: the notch 47 and the home bar 34; `&safe=left` on its side: the notch 47 on the left, the home
bar 21) and with a mouse and no notch: 280 pictures and 16 more, at a pixel ratio of 3 as a phone's, photographed at the page's CSS size.

**The tool** (`bin/screens.ts`): a copy of `tools/glance/hand.ts` that also asks for a language (`--lang`), runs a line of script in the
page before measuring (a control held: `dataset.pressed`, as `wireThumbs` sets it), and writes where each element is: every heart, the
lives, the skilling and gold counts, the clock, every rune slot, the sound and restart buttons, the links, the help line, every card and
each of its lines and buttons, each pad control, the maze's header, and the plate with the place's name where the page drew it.
**The measure** (`bin/measure.py`): for each element its **edge** against the ground just outside it (CIEDE2000, each inner border pixel
against the pixel two beyond, the median: for what stands on the picture: a button, a card, the plate, the help line) and its **ink**
(its words or icon against its own field: the median of a ring inside its edge, or for an icon on the bar the cream round it; the
pixels more than 8 off that field, their median); whether it lies under the pretended notch or home bar; and which others it meets (a
touch target 56 tall measured by its look, not its reach). A picture measure of a word is noisy (letters are smoothed into their
field), so where a colour can be worked out exactly it was, over every colour any level paints as a field by day and under each tint,
and every sky (`bin/overcontrast.ts`, the same 1,288 grounds the palette test walks); both are given.

**Pause**: there is no pause screen in the game. A page that is hidden stops (the kit's loop catches up a few steps at most when it comes
back); nothing is drawn for it. Nothing to look at. **The language switch**: there is none; the page speaks the browser's language.

## The table

Contrast is CIEDE2000 against the worst ground it stands on. "Grain": drawn in the game's own pixels, or a plain shape / bare text.
"Clear": of the notch and the home bar, and of every other element, in both languages. "Shape": its state shows by shape as well as
colour. Marks: 1 good, 2 could be better, 3 to mend.

| # | Element | Where seen | Read at arm's length (worst ground) | Grain | Clear | State by shape | Mark |
|---|---|---|---|---|---|---|---|
| 1 | A station's mark, open | the map | white face in the line's red or orange frame on the deck; 19.3 face and 14.0 frame from a shut one | pixels, enamelled frame (order 28) | yes | open from shut by colour only (#2) | 1 |
| 2 | A station's mark, shut | the map | a greyer face and a darker frame: 19.3 and 14.0 off an open one, the same shape | pixels | yes | **no: colour only** | **3** |
| 3 | A station's rune stone, cleared and not | the map | gold tile 33.7 off the sky, its tick; an empty slot's dashes | pixels | yes | yes: solid with a tick, or dashed and empty | 1 |
| 4 | The boards under the stations (names, best times) | the map | wood with pale words, 40 or more | pixels (wood) and the text layer | **no**: three tiles apart they ran into each other. Upright: Stortinget, Ekeberg and Gamle Oslo with or without times; with times Akershus and Rådhuset too. On its side and at 1280 with times: Stortinget and Ekeberg, Akershus and Rådhuset touching. Both languages (the names are Norwegian in both) | n/a | **3** |
| 5 | A line's added-up time (the records) | the map, under the last station | as #4 | as #4 | under its station's board; would meet a lowered neighbour | n/a | 1 |
| 6 | Line 2 before it opens | the map | faint (0.4) with a gate of boards and its sign | pixels | yes | yes: the gate | 1 |
| 7 | The doors (Hjem, Jernhaugen's mound, the encore's stop) | the map | their own drawings, cyan corners | pixels | yes | the encore's glows until seen | 1 |
| 8 | The place's name on its plate | every level, the map | the words 44 to 90 off the plate (49.6 at the least by colour); the plate's edge 5 at night (the words carry it) | the text layer on a plate | yes; on a card's first picture the card lies over it (the opening card on the map, both up at once at the first visit) | n/a | 1 |
| 9 | The opening card (the story) | the map, the first visit | ink on cream, 60 and more | **plain card, bare text** (the kit's `.card`, shared with the front page and the maze) | on its side with a notch its button reaches 11 px into the home bar's strip (it is 56 tall and the card is as tall as the screen allows) | n/a | 2 |
| 10 | A level's card: time, best, the bracteate, the skilling, without a heart lost | every level's end | ink on cream | **plain card, bare text**: what he took is counted in words only | yes | n/a | 2 |
| 11 | Line 1's and line 2's endings, the encore's card | their ends | as #10 | as #10 | yes | n/a | 2 |
| 12 | Game over | any level | as #10 | plain | yes | n/a | 1 |
| 13 | The loading board, the failed load | any level | dark words on cream | plain | yes | n/a | 1 |
| 14 | A heart, full | the bar | crust 34.2 and dough 25.5 off the cream | pixels (the waffle) | yes | n/a | 1 |
| 15 | **A heart lost** | the bar | the whole heart at 0.22: **8.9** (crust) and 7.6 (dough) off the cream | pixels | yes | **no: faintness only** | **3** |
| 16 | The last heart | the bar | as #14; a slow pulse (with reduced motion a still red ring) | pixels | yes | by motion, and by the two lost beside it (which showed by faintness only) | 2 |
| 17 | The lives (helmet and number) | the bar | 44.7 | pixels | yes | n/a | 1 |
| 18 | The skilling count | the bar | 40.7 to 49.0 | **a CSS disc** beside the number, where the hearts and the helmet are pixels | yes | n/a | 2 |
| 19 | The gold count | the bar (not during a level on a phone) | 33.7 to 47.0 | **a CSS disc** | yes | n/a | 2 |
| 20 | The clock | the bar | 80 | text, tabular | yes | n/a | 1 |
| 21 | The rune slots in the bar | the bar | gold 33.7; an empty slot's dashes 15.5, its rune 6.7 (barely there, by design) | strokes | yes | yes: gold with a tick, or dashed and empty; the level he is in ringed | 1 |
| 22 | The sound switch, the restart | the bar | 44 | strokes in a disc | yes | yes: waves or a cross | 1 |
| 23 | The links (Gamle Oslo, QR, Jernhaugen, GitHub) | the bar on the map and cards | 50 | pills | yes (their 56-tall targets reach over the rune row by design, ADR 0043; their look does not) | the page he is on ringed | 1 |
| 24 | A pad control at rest (move, jump, dash, shield, go in) | every level on a phone | its word **19.5** off its fill over white snow by colour (8.3 to 16.8 measured in the pictures, the letters smoothed); the button seen by its fill or its white edge everywhere | furniture, by design (ADR 0043) | yes, inside the safe areas | n/a | 2 |
| 25 | **A pad control pressed** | every level on a phone | it went white (0.45): over snow, white marble or a white cloud its word **0.0** off its fill and the button the ground's colour (Langkaia's marble and Holmenkollen's snow in the pictures: gone) | furniture | yes | **no: colour only, and none on white** | **3** |
| 26 | **A pad control dimmed** (nothing to do now) | every level on a phone | 0.4 of itself: its word **7.0** off its fill over white, its edge 1.4 to 3.6 off Langkaia's marble and Holmenkollen's snow ("Go in" all but gone) | furniture | yes | **no: faintness only** | **3** |
| 27 | The help line (keys, or the pad's note) | every level | words on a dark pill: 49.6 by colour, 50 or so measured | text | yes | n/a | 1 |
| 28 | A bubble (a sign, a boss, a door's key) | levels | ink 84.6 off the bubble; the bubble 0 off white snow or a cloud (the words still read) | the kit's bubble (shared with the front page) | yes (off the notch since order 37) | n/a | 2 |
| 29 | **The "!" over what turns on him** | levels | the red or its near-black edge 24.8 off every ground; 2 x 7 art pixels standing, 4 x 10 at its swell | pixels | **no: its foot stood on the thrower's head**: at Rådhuset the gull's crest and red outline met the "!"'s dark foot, so the two read as one shape (a red post on its head) | n/a | **3** |
| 30 | **The arrow at the screen's edge** (a thrower or flyer about to come in) | levels | as #29; a triangle 4 x 7 | pixels | **no: in the notch**: on its side with a notch on the left the arrow for a gull coming from behind stood at x 3 to 10, under the 47-pixel notch (Langkaia, Bygdøy) | n/a | **3** |
| 31 | The key over him at a door or a bench (no touch) | levels | cyan-framed bubble | the kit's bubble | yes | n/a | 1 |
| 32 | The maze's header (the way out, the level, n of 7, the clock, the curses) | the mound | 18.7 to 80 | text and pills | yes | the level a button with a dotted underline | 1 |
| 33 | The maze's level list (the records) | the mound | ink on cream; a row not reached greyed, its stone grey, "Not reached yet" | its stones in pixels, the rest text | on its side with a notch its last rows run into the home bar's strip (the list scrolls) and over the maze's help line (which is under it) | yes: words and a greyed stone | 2 |
| 34 | The maze's card after a level | the mound | ink on cream, the stone with its marks | pixels and text | yes | n/a | 1 |

**The ranking of the 3s** (what a player meets most first, then how badly it fails):

1. **A pad control pressed** (#25): under a thumb at every moment of play on a phone; over white ground it vanished, word and all, and
   it showed by colour only.
2. **A heart lost** (#15): every hit; told from a full one by faintness alone, 8.9 off the cream.
3. **A pad control dimmed** (#26): the way in, the dash resting, the shield in the air, most of the time; faintness only, and over white
   ground nearly gone.
4. **The boards under the stations** (#4): every visit to the map once times are on them; words ran into words.
5. **The "!"** (#29): every thrower taking aim; its foot on the figure's head.
6. **A station shut** (#2): the map; shut told from open by colour only.
7. **The arrow at the screen's edge** (#30): only on a phone on its side with a notch, only for what comes from that side.

**The 2s**, and what each is: the skilling and gold counts (#18, #19: CSS discs beside pixel hearts and a pixel helmet); a level's card
counting in words only (#10, #11); the opening card's button and the maze's list reaching into the home bar's strip on its side (#9, #33:
mending them moves a touch target, which this order does not allow); the cards being plain (#9 to #11: the site's chrome, shared with the
front page and the maze); a pad control's word at rest over white (#24); a bubble on white (#28); the last heart (#16).

## The tells left by order 40 (item 1), measured first

Measured as `render/tells.test.ts` measures (`bin/tells41.ts`: each staged, the drawing recorded pixel by pixel in a box round it at the step
before it and at seven steps inside it; the pixels that change), on `origin/main`'s drawings:

| Tell | Staged | With motion | With reduced motion |
|---|---|---|---|
| The welder's sparks about to fall (Bjørvika, in its evening) | the beat's warning, its first step | 19 at every step | 19 |
| A gust coming over the shafts (Bjørvika) | the beat's warning, its first step | 60 | 60 |
| The stone that sinks, about to go (Gamlebyen) | the route onto it, then standing | 206 on the tremble's steps, **0** between them (its pillar goes and comes back) | **0** (the paint's dashes join, the page's, not here) |
| The heron about to fly (Østensjøvannet) | he lands on it and stands | 23 to 28 (its feet shift a pixel) | **0** |

The rune's stone at night and twilight: 6.7 to 19.3 off what is round it at Langkaia, 13.5 at Østensjøvannet (`../o40/takes.tsv`), a dark
edge on the night's dark ground.
