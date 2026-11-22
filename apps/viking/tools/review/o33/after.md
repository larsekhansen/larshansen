# Order 33: the lane behind the church, and room to breathe, each item and the measures

Measured on 22 November 2026 on branch `the-lane` (from `origin/main` at `7cc0b6b`, after order 32). Pictures (outside the repository)
in `~/.cache/claude-scratch-larshansen/o33/shots/`, a folder an item: `1-lane/` (every stretch of the lane, 33 places, at 390 x 844
and 1280 x 800, from `origin/main`'s build (`before-*`), the branch's first (`after-*`, item 1 alone), a build of that which draws the
lane with `drawNight` (`ref-*`), the branch's last (`final-*`: it differs from `after-*` only by the church window's foot, one row of
eight pixels) and the commit before order 15, `fb2a898` (`o14-*`); `side-*/` origin/main, the last build and `fb2a898` side by side;
`crops/` the lane at three times), `2-warning/` (the recoloured things, before and after), `3-same/` (every level's walk every 60
columns, the encore and the map, by day and at night, at 390 x 844, both builds), `4-words/` (the pole's note and the bite's hint at
360 x 640, English and Norwegian).

## 1. Vålerenga's lane is dark again: done

**What it is.** After dusk (Vålerenga's own sky is a winter night; by day, the T key's sky, there is no dark, as on `origin/main`) the
lane behind the church, columns 80 to 116, has its dark again: the night's depth across the lane (0.7 at its deepest, fading in over
columns 80 to 84 and out over 110 to 116), the two old-town lanterns' rings through it (their glass lit, as order 32 left it), the
church's first window (the one in the fade) clear to its pane's foot with a ring round it, the flag's ring, the sign boards' light, his
headlamp (a ring round him and a beam the way he faces, lighting what stands in front of the backdrop and the ground's top edge), and
over it the invaders' glow and red outline (`overTheDark`, order 32's dark gap) and the eyes. This is what `nabolaget.ts` meant and what
order 15's move left undrawn (`39f30f5`).

**How it is cheap.** `drawNightKept` (`src/render/night.ts`) draws exactly what `drawNight` draws, kept:
- What never moves (the night's depth of each world column, the lanterns', window's, flag's and boards' light through it) is worked
  out once, in world pixels, row by row with the kit's own `darkRow` and joined with `merged`, and kept as one `Path2D` a darkness (the
  rows above and below the lights are the night's alone: tall rectangles). It is kept by its lights (`stillLights`), so a different
  arrangement (no boards, in the census) is a field of its own.
- His headlamp's rings are worked out once a facing, as paths a darkness round (0, 0).
- A frame fills each still depth once under a clip outside the headlamp's lighter rings (even-odd), and each of the headlamp's rings
  once under a clip to where the still dark is darker than it: each pixel once, at the least of the two, as `drawDark` gives it. Then
  where the headlamp lit the dark, the night is put back behind the street (destination-over) and over the soil (a clip of the soil's
  columns), each still depth under each ring at what the ring took off it (`lampOnlyLightsTheStreet`'s fills).
- Why paths and not kept pieces: in headless Firefox (its 2D canvas is Skia) a rectangle filled with a see-through colour and the same
  colour drawn into a canvas and copied (`drawImage`) are not the same bytes (one or two levels off on opaque ground; more where the
  ground is see-through, as the street canvas is over the sky). A `Path2D` of whole-pixel rectangles filled once is byte for byte the
  rectangles, also translated, under even-odd clips and destination-over (a test page photographed by `tools/shots.ts`; the results
  in `../../../../../.cache/claude-scratch-larshansen/o33/exp/`, outside the repository).

**Pixel-true.** `src/render/night.test.ts` draws both into a stand-in canvas that fills rectangles, paths and clips as a canvas does
and keeps every pixel's fills in order (colour, alpha, how laid): at 48 places of the lane in the suite (an upright phone's screen every
97 pixels of the lane, on the street, on the ledges and on the church's roof, facing both ways, with boards; a desktop's every 263
without), every pixel identical (44 of them with the headlamp's pass over the dark); while it was built, at 696 places (every 23 pixels)
and then 124, all identical, made fewer for the suite's time (the suite must stay under 340 s). In Firefox: the 33 places at 390 x 844 and at 1280 x 800
from the branch and from a build of it that draws the lane with `drawNight`: 66 of 66 byte-identical. Without paths (the tests'
stand-in canvases) or during the flourish (the lane is far off then) it is `drawNight`.

**The cost** at 390 x 844 (`?debug&perf`, the same places on `origin/main`'s build and the branch's): in the lane at night 5,100 to 5,194
rectangles a frame where `origin/main` draws 5,100 to 5,193 (+0 to +4: the eyes of the lane's invaders over the dark, when they are on
the screen), 262 to 705 copies where it makes 262 to 696 (+9 at most: their glow, a dark pixel and their outline over the dark); away
from the lane +0. Drawing the lane with `drawNight` measured 6,527 to 6,790 (+1,410 to +1,630).
The kept dark makes no rectangles: `?debug&perf` counts `fillRect` and copies, not path fills or clips, so they were counted apart (a
stand-in canvas, every 30 columns along the lane): 25 to 77 path fills a frame holding 2,500 to 3,800 rectangles, and 18 or 19 clips
holding about 2,800, where `drawNight` made 830 to 1,450 rectangles (the dark and the lamp's pass). Working out `drawNight`'s rows took
about 37 ms of JavaScript a frame in Bun; the kept dark's frame takes 0.7 ms there. The time a frame in Firefox on the Pi (`?debug&perf`, fifty frames,
the median of three rounds, one browser at a time on a quiet machine, `timing-places.tsv`):

| Place (night) | `origin/main` (no dark) | the kept dark | `drawNight` |
|---|---|---|---|
| the lane, column 84 (the first lantern, the bench) | 44.1 ms | 51.3 ms (+7.2) | 81.9 ms (+37.8) |
| the lane, column 96 | 44.6 | 49.8 (+5.2) | 60.5 (+15.9) |
| the lane, column 100 (the second lantern) | 44.5 | 51.1 (+6.6) | 75.6 (+31.1) |
| the lane, column 108 (the church) | 42.9 | 50.5 (+7.6) | 87.9 (+45.0) |
| the roofs, column 60 (no lane on the screen) | 39.8 | 39.8 (+0.0) | 45.2 (+5.4) |

So the lane's dark costs the Pi five to eight milliseconds a frame where it is on the screen, and nothing elsewhere; drawn as before
order 15 it cost sixteen to forty-five, and five even off the lane. A phone's numbers are its own; the ratio is the point.

**As a place to play in** (`1-lane/side-*`, `crops/`; every stretch, both sizes, looked at):
- *The invaders' red outline*: over the lane's dark each invader (the fox, the owl, the cat) is its glow, a dark pixel and its red
  outline, as under Nordmarka's trees. `render/palette.test.ts` now measures both darks: against the lane's fields (all of
  Vålerenga's) under every depth of its dark the outline stands 34.5 off them (the forest: 33.8; by day Vålerenga's least is 11.9);
  against the pixel next to it, 45.1 (the forest: 44.3). A test holds the lane at least as well as the forest.
- *What he stands on*: the bench's ledge by the first lantern (column 83) and the two stone ledges up the church's west end (columns 109
  to 111) keep their yellow paint over the dark (the paint keeps its light after dusk under the dark as it is drawn: a little dim where
  the dark is deepest, clear as soon as the lantern's ring or his headlamp is on it). The gravestones (two, columns 87 and 93) are solid
  tiles he walks over: in the dark they are dark blocks with a lit top where the headlamp reaches, exactly as before order 15 (the lamp's
  pass puts the night back over the soil below the ground's top). The street itself has no paint (not a ledge over a drop).
- *Coins*: the skilling in the lane are faint copper dots in the dark until the headlamp's beam reaches them (about three tiles ahead),
  as before order 15 and as in Nordmarka. They can be seen, dimly.
- *Doors and the plough's tell*: none in the lane (the plough's fight is past column 166, in no dark).
- No ledge or hazard that the old design had lit is unseen, so no lantern was added and the dark was not lightened.
- *The lights* (ADR 0054, amended): the lanterns' glass is lit and their rings are their pools; the church's first window was clear
  through the dark one row short of its pane's foot (as before order 15), so `render/lights.test.ts` found its last row dimmed: the
  hole reaches the foot now (`lights` in `nabolaget.ts`, a row taller). The census draws the lane's night as it is drawn (its canvases
  have no paths, so it draws as `drawNight`, the same pixels); the test holds it. With reduced motion the lane's night is still
  (`night.test.ts`: the clock running, every call the kept dark and what is drawn over it make recorded with its arguments; the same
  record without reduced motion at the yellow house finds the Pi's light blinking).
- *By day* (the T key's sky): no dark; Vålerenga by day is as on `origin/main` but for item 2's washing (item 3's pictures, below).

**Beside the commit before order 15** (`fb2a898`, built in a worktree and served as it was; `1-lane/side-*`, third column): the lane
is the same dark, the same lanterns' rings and the church window's, the same headlamp. What is new since is everything orders 16 to 32
drew in it: the invaders' glow and red outline over the dark (then a cat and a fox were dark shapes in it), the old-town lanterns'
glass (then a post with a dark head), the yellow paint on the bench's ledge and the church's ledges, the textured wall and gravestones.

**Departures.** The church window's hole a row taller (above). `render/night` now comes with the kit's dark (`vite.config.ts`), a file
Nordmarka and Vålerenga both fetch (it was Nordmarka's).

## 2. The chairlift chairs' red, and harmless things off the warning red: done

**The chairs** (`levels/holmenkollen.ts`): the back's two slats are the frame's painted steel (its lit top and shade, 33.9 and more from
the warning red; they were the arena's red, 6.1 and 7.4). The shape is as order 32 drew it. The seat is as it was: its top two rows lie
under the yellow paint the page puts on what he stands on, and its foot is the red's shade, 12.3 off (the seat's red before order 32 is
the middle tone, under the paint).

**The test** ("harmless things keep off the warning red", ADR 0044 amended): `src/render/warning.test.ts` draws every level and the
encore view by view (320 x 200) as the page draws them at the start: what carries him, the ledges on a beat, cannons, drums, flags and
what stands in front, then the paint over what he stands on; what is left within 10 (CIEDE2000) of the warning red may fill no more than
12 pixels of a view, or it is named with why. `alive/props.test.ts` counts every prop piece's own pixels the same way (12 at most), but
what carries him, which the first test measures with the paint on top. What it found, the most pixels of a view:

| Where | Colour, from the warning red | Pixels | What | Done |
|---|---|---|---|---|
| Holmenkollen | `#d25551` 7.4, `#c8302b` 6.1 | 78, 48 | the chairs' back; the lift cage's top rail | fixed: the frame's steel; the rail the red's shade `#aa2c27` (12.3) |
| Rådhuset | `#c8302b` 6.1, `#d04f4b` 6.4 | 121, 96 | the ferry's red band and funnel | fixed: the band the red's shade (12.3), its lit top `#d96e6b` (13.1) |
| Bygdøy | `#c8302b` 6.1 | 152 | the ferry's red band and funnel | fixed: the red's shade (12.3) |
| Stortinget | `#c8302b` 6.1 | 243 | the trains' red stripe | fixed: the red's shade (12.3) |
| Slottet | `#d6403a` 3.4 | 36 | the red balloon on the crate | fixed: the flag's own red (11.9): "in the flag's colours" |
| Vålerenga | `#d9573a` 7.7 | 88 | the shirt on the washing lines | fixed: the shirt's red lighter, `#e17961` (14.5; and 19.8 off the red house's planks behind it: a darker red, tried first, vanished against them) |
| Holmenkollen | `#d9573a` 7.7, `#c8302b` 6.1 | 105, 30 | the spectators' jackets at the outrun | named: a few pixels a person |
| Slottet | `#c8302b` 6.1, `#d35955` 8.2 | 16, 4 | the russ's red overalls; the crowd barriers' red | named (the russ); the barriers are 4 to 6 pixels |
| Korketrekkeren | `#c8332b` 6.0 | 42 | the crossing's barrier | named: it hurts when it is down (a hazard) |

Each new colour stands 10 or more off every role (the props test's rule; the nearest are the coin's copper, 16.2, and the shirt's to his shaded skin, 13.7). Bjørvika's
cranes' warning lights (10.3) are outside 10, lights, and dots.

**What it found and is not held** (scenery and ground, outside the test; the most pixels of a 320 x 200 view by day): the kit's red
`#c8302b` (his hat's, 6.1 from the warning red) is also Stortinget's platform walls' stripes, the kiosk and the hall's signs (2,344
pixels, and `#e2553a` 7.3, 178), Holmenkollen's red rails on the ice (266, ground he stands by) and its jump (36), Bygdøy's Rådhusbrygga
kiosk (44); near it are Vålerenga's stained glass in the church's windows (`#c8402b` 6.3, 192) and Frognerseteren's walls at
Korketrekkeren (`#c8402f` 5.9, 72); the third rail's cover at Stortinget is the warning red itself (it hurts). Whether the rule should
reach the scenery is a decision for the planner and Lars (the T-bane's red and the rails are Oslo's own).

Pictures: `2-warning/` (each thing before and after, at 1280 x 850 and 390 x 844).

## 3. Room in the first script: done

From 59.60 kB gzipped (vite) to 57.94: 1.66 kB moved or gone. What moved:

| What | Where it went | GNU gzip, the first script |
|---|---|---|
| `origin/main` | | 59,594 bytes (vite: 59.60 kB) |
| the lane's dark (item 1) | `render/night` with the kit's dark | 59,601 (+7: the chunks' names the script carries) |
| the kit's synth (`sfx.ts`): the page keeps a stand-in that forwards to it; the sound switch is a kit module of its own (`mute.ts`), read and kept at once, so the header's button is as it was | `feel`'s file | 58,294 (-1,307) |
| the page's drawing after dusk (`afterDark`) and of the rune's flight | `render/dusk.ts`, in `feel`'s file | 58,097 (-197) |
| the maze's plain feather drawing (the fallback for `feel`'s own) | gone (its drawing is `feel`'s) | 58,051 (-46) |
| the paint on what he stands on, the banner's fade (into `render/stand.ts`, `render/banner.ts`, for item 4's test), the debug ways (item 4) | the first script, the debug chunk | 58,079 (+28) |
| the maze's feather module, which the maze's chunk imported from the first script while the page took two numbers from it | the maze's chunk | 57,909 (-170) |
| the lane's glow and eyes only on the screen (item 1) | | 57,903 |

So: 57.94 kB gzipped as vite reports it (59.60 on `origin/main`): 1.66 kB fewer; 57,903 bytes by GNU `gzip -c` (1,691 fewer), 57,937
by Node's zlib. Measured with `bun run build` in `apps/viking` (vite under Node), as the handbook says.

**Nothing changed in a picture or a run**: the page waits for `feel`'s file before its first scene, so what moved there is drawn as
before. Checked: every level's walk every 60 columns, the encore at two places and the map in twelve states (no runes, three, line 1,
line 1 and five of line 2, every rune but Langkaia's, every rune; at its start and its end), by day and at night, at 390 x 844, from
`origin/main`'s build and the branch's last (`3-same/`): 159 of 174 byte-identical; the 15 others differ only where items 1 and 2 changed
them, colour for colour: Bygdøy c000 (the ferry's band, `#c8302b` to `#aa2c27`, 150 pixels), Holmenkollen c120 (a chair's back, 104),
Stortinget c060 to c240 (the trains' stripe, 48 to 240), Vålerenga c060 (the shirt, 88), each by day and at night; and Vålerenga c120 at
night (the lane's dark on the screen's left). The map: 24 of 24 identical, by day and at night. The front page 28 of 28. Run files: 7 of 7 levels byte-identical (below).

**ADR 0053** (amended) holds: without `feel`'s file every level starts and every solid thing is drawn plainly (`levels/lazy.test.ts`,
unchanged, passes); what goes with `feel`'s file is now also the sound (the page is silent without it), what keeps its light after dusk,
and the rune's flight (it lands in the header without flying).

Not taken, and why: the debug harness's parser (read before the first scene under every `?debug` picture: a risk to the pictures for
a quarter of a kilobyte); vite's module-preload polyfill (0.5 kB; it is for browsers without `modulepreload`, Safari before 17, which
would then load a level's pieces one after another: a change of behaviour, not dead code).

## 4. Small things: done, but the rune's flight (a question for Lars)

- **LEVELS.html's words for Vålerenga** ("down into the lane behind Vålerenga kirke, dark but for the church windows and his headlamp"):
  true again. Left as they are (the lanterns also light it, and the order said they would be true).
- **The pole's note and the bite's hint at 360 wide, both languages** (`4-words/`): neither can be reached by the harness (the pole is
  given under Holmenkollen's card; the encore's bite needs two hits, and the harness's keys hold one action a step). Two debug ways
  (`src/debug.ts`, its own chunk): `?debug&touch&note=pole|shield|sledge` puts the pad's note of what just changed on the help line as
  the page does when it changes (the pad then places it); `?debug&say=<key>` has the level's boss say that line of its words in its
  bubble. Photographed at 360 x 640 in English and Norwegian from the last build (`4-words/`): the pole's note ("The ski pole: Dash for a
  short dash, in the air too." / "Skistaven: Rykk gir et kort rykk, også i lufta.") two lines under the banner with the Dash button there;
  the bite's hint ("The serpent's ring of foam. / Be out of it before it bites." / "Sjøormens ring av skum. / Vær ute av den før den
  biter.") beside Loki, with and without the pad: all inside the screen (the Norwegian bubble's right edge about 4 pixels from it).
- **`main.ts`'s own drawing, moved where it can be tested and covered** (this also served item 3): after dusk (`afterDark`) and the rune's
  flight are `render/dusk.ts`, the banner's fade `render/banner.ts`, the paint `standing` in `render/stand.ts`. `render/reduced.test.ts`,
  part 7: what keeps its light after dusk, along every route at night (every twenty seconds), the world held and the clock running 25
  steps, never comes back. Found on the way: drawn together with the skilling (which turn on their own clock, a cycle part 2 holds alone)
  every recording was new and the watch was blind; a blink planted with reduced motion was then found at 2 of 106 places (sampled every ten seconds). With the
  skilling and the cheese left to part 2 and a jumper in its leap to part 5, and the world held, the planted blink is found at all 106 (and at all 55 now that it samples every twenty seconds, for the suite's time),
  and nothing real is. The rune's flight is one movement, never coming back; the banner with reduced motion is there and then gone at
  two and a half seconds (it fades otherwise).
- **The rune still flies to the header with reduced motion**: left, a question for Lars (listed below).

## The measures

- **Tests**: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 474 pass (466 on `origin/main`; new: `render/night.test.ts`'s
  three, `render/warning.test.ts`'s one, the palette test's third test of the darks, the props test's prop pieces, the reduced-motion
  test's two of part 7), none failing.
- **The viking suite's time**: 339.6 s on a quiet Pi, 340.6 s on a second run that began with the load at 3.9; `origin/main`'s, measured
  in a worktree the same hour, 322.8 s. So it is at the order's 340, not under it with room. The new tests alone: `night.test.ts` 3.0 s
  (18 s as first written: its stillness check rasterised 400 frames; it records the calls now, and the pixel-for-pixel check runs at 48
  places, not 124), the warning test 1.0 s, part 7 of the reduced-motion test about 1.5 s (sampling every twenty seconds), the props
  test's count 0.7 s; the rest of the difference between the two trees moved from run to run by several seconds.
- **tsc** clean in all four packages, inside each (TypeScript 5.9.3) and from the root (`bunx tsc --noEmit -p <package>`, 7.0.2).
  `bun run build` at the root clean.

- **First script**: 57.94 kB gzipped (vite), 57,903 bytes by GNU gzip, 57,937 by Node's zlib; `origin/main` 59.60 kB, 59,594.
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` (the kit changed: `mute.ts` split from `sfx.ts`).
- **Run files**: the sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, on `origin/main`'s code and the branch's: every run's
  record byte-identical (`cmp`), the six order 32 recorded with the same md5 as then:

  | Level | md5 of the runs, before and after |
  |---|---|
  | Langkaia | `dd2406a1c3c0` |
  | Nordmarka | `58bfcf501657` |
  | Bjørvika | `1fdbdf511c68` |
  | Gamlebyen | `54db73ff6304` |
  | Slottet | `0a1e506dd82b` |
  | Vålerenga | `ec4e38c6dea5` |
  | The encore | `112b3fb514ab` |
- **The map with any rune missing**: byte-identical by day and at night (item 3's check: 24 of 24 map pictures).
- **Perf** at 390 x 844 (`?debug&perf` through `../../glance/perf.ts`), `origin/main`'s build and the branch's at the same 275 places:
  order 32's (every level's walk by its own sky and at night, the encore, the map, Stortinget's shafts and order 32's places) and every
  stretch of Vålerenga's lane by night and by day (`places.tsv`; `perf-390-before.tsv` on `origin/main`, `perf-390-after-lane.tsv` with item 1 alone at every place,
  `perf-390-after.tsv` on the last build at 157 of them: Vålerenga, the levels item 2 recoloured, Langkaia and the map; items 2 and 3
  change no counts, which these confirm). No place gains more than +4 rectangles; none draws over 15,000 (the most, 11,151, Akerselva at
  night, as on `origin/main`). By level, the most rectangles a frame before and after:

  | Level | places | most before | most after | most gained | least change |
  |---|---|---|---|---|---|
  | Langkaia | 10 | 7,251 | 7,251 | +0 | +0 |
  | Akershus | 10 | 6,899 | 6,899 | +0 | +0 |
  | Rådhuset | 8 | 4,954 | 4,954 | +0 | +0 |
  | Slottet | 10 | 9,703 | 9,703 | +0 | +0 |
  | Holmenkollen | 10 | 10,821 | 10,821 | +0 | +0 |
  | Akerselva | 12 | 11,151 | 11,151 | +0 | +0 |
  | Nordmarka | 8 | 4,597 | 4,597 | +0 | +0 |
  | Stortinget | 24 | 4,289 | 4,289 | +0 | +0 |
  | Ekeberg | 10 | 8,601 | 8,601 | +0 | +0 |
  | Vålerenga | 80 | 9,552 | 9,552 | +4 | +0 |
  | Bygdøy | 10 | 5,442 | 5,442 | +0 | +0 |
  | Vigelandsparken | 10 | 6,825 | 6,825 | +0 | +0 |
  | Korketrekkeren | 12 | 3,318 | 3,318 | +0 | +0 |
  | Østensjøvannet | 10 | 10,054 | 10,054 | +0 | +0 |
  | Bjørvika | 10 | 8,765 | 8,765 | +0 | +0 |
  | Gamlebyen | 14 | 4,639 | 4,639 | +0 | +0 |
  | The encore | 22 | 3,029 | 3,029 | +0 | +0 |
  | The map | 5 | 5,110 | 5,110 | +0 | +0 |
- **The contrast numbers**: the red outline under the lane's dark against Vålerenga's fields 34.5 (Nordmarka 33.8), against the pixel
  next to it 45.1 (44.3); the warning test's table above.

## What only a person can judge

- The lane behind the church at night on a phone: does it read as a dark lane with two lanterns and a lit church window, and is his
  headlamp's circle enough to walk it? Are the coins too faint until the headlamp reaches them?
- The fox, the owl and the cat in the lane as black shapes in their red outline and orange glow (as under Nordmarka's trees).
- The gravestones as dark blocks with a lit top in the headlamp (as before order 15).
- The chairlift's chairs with a steel back and a red seat; the ferries' and the trains' darker red; the balloon in the flag's red; the
  lighter shirt on the washing lines.
- With reduced motion the rune still flies to the header (one movement): should it?
- Whether the rule of item 2 should reach the scenery in the kit's red (Stortinget's walls, Holmenkollen's rails).
- How the lane's frame time feels on a phone (the Pi's software renderer is the only measure).

## Departures, doubts, found and not fixed

- **Departures.** The church window's hole through the dark a row taller (ADR 0054). Item 2 recoloured seven things in six levels where the
  order named the chair: the order said "fix what is a field". The sound, the light after dusk and the rune's flight are not there without
  `feel`'s file (ADR 0053, amended). `render/night` moved to the kit's dark's chunk. A kit module (`mute.ts`) split from `sfx.ts`.
- **The cost counter.** `?debug&perf` does not count path fills or clips; the lane's kept dark is "+0 rectangles" by it. The work it does is
  counted above, and its time in Firefox measured.
- **Two lane places measure 0** in both builds (columns 92 and 102: he is hit in the first step, so the page holds its picture).
- **Found and not fixed**: the scenery and ground near the warning red (item 2's second table); Bjørvika's crane lights at 10.3; the
  rune's flight with reduced motion; the coins in the lane are faint until the headlamp reaches them.
