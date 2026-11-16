# Order 22: paint and grain

Written 16 November 2026. Lars, after seeing orders 18 to 20 live ("i like what i see"), in his
own words:

> i think maybe red for enemies that can hurt you, in terms of the outline, is a smarter choice.
> the light blu you had for rats can be for moving npcs that don't hurt. yellow paint is maybe
> the industry standard for "you can go here" when that isnt clear so mayne theat for platforms
> instead. then that also means other uses of yellow had to be reconsideren or simply changed.
> so these color changes would mean changes in other parts of the game too, so that these fit
> in seamlessly. i also have to ask you to rethink a lot of the design... i just fear i made a
> blunder with the pixel design. or rather that the pixels are too big. they need more detail.
> espeiclally small items.

Two parts. Part A is decided and is built in full. Part B is a study that ends in pictures and
numbers for Lars to choose from: nothing in part B changes what the live game looks like.

Order 21 (the phone: header, touch pad, Stortinget's speed) is being built at the same time on
branch `in-the-hand` by someone else. Stay out of the header's layout, the touch pad and
Stortinget's drawing code; it will be merged first and you will be asked to rebase.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014,
  0023, 0035 to 0042, orders 18 and 19, `packages/pixelkit/src/swatches/` (roles, enemy, stand,
  coin, metal), `apps/viking/src/render/sprite.ts`, `stand.ts`, `palette.test.ts`.
- Branch `paint-and-grain` from `origin/main`. First commit: this order, copied to
  `docs/games/orders/22-paint-and-grain.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 and ADR 0014 stand. No route, box, speed or timing changes: sloppy run files for
  Akershus, Nordmarka, Bygdøy and Gamlebyen on seeds 201 to 260 byte-identical.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`.
- First script under 60 kB (the build fails over it).

## Part A: the paint

### A1. Red outline: it can hurt you

Everything that hurts on touch and moves is outlined in one warning red, by day and after dark
(after dark the outline keeps its light, as tops do now). The dark outline of order 18 goes for
these. Thrown things too. Bosses: red outline while they can hurt, as now.

A red outline on a red body is no outline. Rework the enemy palette so the body always stands
off its own outline and off every backdrop: the user's complaint that started order 18 was grey
enemies on grey backdrops, so bodies stay out of the backdrops' greys, but they no longer have
to carry the warning alone and may go back toward what the animal or person really looks like
(a rat brown, a gull white, a guard in his coat), as long as the tests hold. A dark inner line
between body and red outline is allowed if it reads better at phone size; try both and choose
by looking.

### A2. Pale blue outline: it moves and does not hurt

The pale blue-white that rimmed enemies at night becomes the outline, day and night, of every
moving thing that cannot hurt him: Slottet's crowd where it moves, sheep, a watched statue and a
guard still stone, a pulled-off sledger, the heron, a calm swan outside its warning, the troll
asleep or stone, the plough parked, a dazed serpent's head (which also keeps the "now" violet as
the place to hit), birds that are scenery if they come near his lane. A thing that changes from
harmless to harmful changes outline at that moment, and that change is now the tell: check each
against order 19's wind-ups so the two agree.

### A3. Yellow paint: you can go here

The standing top of every platform becomes yellow paint, the convention players know: a flat,
saturated yellow, a little worn at the ends, two pixels thick, the same yellow in every level,
keeping its light after dark. Moving and give-way marks (order 18's violet stripe and lavender
dashes) are reconsidered so they sit well under yellow: propose and choose by looking (for
instance black chevrons in the yellow for moving, a broken yellow line for what gives way).
Teal platform bodies: keep, change or drop, by looking. Also use the yellow where the way is
unclear and not a platform: the lip of a ledge he must grab a jump from, rungs, a hook's block,
a statue's head while it is a step.

### A4. Every other yellow in the game is reconsidered

List every yellow and gold the game paints, with where and how much (the palette tool's
fields), and for each decide: stays because shape and place make it unmistakable (say why),
changes hue, or is toned down. At least: bracteates and their gold; the runes' gold tiles in the
header and on the map; skilling's glint; hazard stripes (Stortinget's third rail, the plough's
beacons); lit windows, lamps, torches, the sun and moon; Bjørvika's crane; flags; the cheese;
Slottet's and Akershus's stone where it is cream or ochre; hay, straw, sand, autumn trees; the
"use" cyan and the "now" violet beside the new yellow. The rule to end with: **flat saturated
yellow on a top edge means stand here, and nothing else in the game is that yellow in that
shape.** Things to take move to a family that cannot be confused with it (copper and a warmer
or paler gold with a glint and a turn, or another answer you can defend).

### A5. So that it fits seamlessly

- `roles.ts`, the palette test (every role apart from every other and from every field, under
  every tint, and the colour-blind table with a named shape where colour fails: red outline
  against yellow top is a classic red-green pair, so the outline's and the paint's shapes carry
  it), the legend, DESIGN's rule for level authors, ADR 0039 superseded or amended by a new ADR
  that quotes Lars.
- Every level looked at, both sizes, day and its own sky: contact sheets as in order 18
  (enemies, harmless movers, platforms, pickups), before and after.
- Order 19's effects take their colours from the roles: check a stomp's puff, a hit's flash,
  the tick, the rings.
- LEVELS.html pictures retaken with `tools/pictures.ts`.
- Perf: no place more than 200 rectangles a frame over order 20's table.

## Part B: the grain (a study, for Lars to choose)

His fear is that the pixels are too big: not enough detail, small things most of all. Find out
what is true and show him the choices.

### B1. The facts

What an art pixel is today in screen pixels, at 1280 x 800, at 390 x 844 and on its side, on a
device pixel ratio of 1, 2 and 3. How big he, a rat, a skilling, the cheese, the shield, the
feather, a bracteate, a flag, a bench and a rune stone are in art pixels and in millimetres on
a typical phone (assume 390 CSS px = 65 mm wide). What the kit assumes about whole art pixels
(`R`, `S`, the sprite and kept caches, the tints, hit boxes in art pixels, the camera's
snapping), and what the front page shares.

### B2. Three ways, each shown, none switched on

Build each far enough to take real pictures from the real game behind a debug switch
(`?debug&grain=…`), on two scenes: Langkaia's quay with a rat, a pigeon, skilling, a flag and a
bench; and Stortinget's platform with pickups. Draw the subjects again by hand for each way:
him, the rat, the pigeon, a skilling, the cheese, the shield, a bracteate, the flag, the bench.

1. **Finer small things.** The world stays as it is; he, enemies, pickups and things to use are
   drawn on a grid twice as fine (half-size pixels), with the detail that buys: faces, hands,
   fur, a coin's stamp, a readable shield. Mixed grain: say honestly how it looks where a fine
   sprite stands on coarse ground.
2. **Everything twice as fine.** The whole picture on a grid twice as fine, sprites redrawn,
   and tiles and backdrops for these two scenes redrawn or at least given a second pass of
   detail (stone courses, wood grain, window bars), so he can see what the whole game would be.
3. **Same grain, better drawn.** No change of grid: the small things redrawn larger within
   their boxes or with better shapes, sub-pixel-free: outlines, highlights, a clearer
   silhouette. The cheapest way; show how far it gets.

For each: the pictures at 1280 x 800 and 390 x 844, side by side with today, plus one sheet of
the subjects alone at four times size; what it costs (how many drawings to redo across sixteen
levels, the map and the front page, a fair count from the code; what in the kit must change;
rectangles a frame and first-script size, measured on the two scenes); what it risks (the front
page's look, the 28 identical pictures, hit boxes and ADR 0003, mixed grain); and how it could
be rolled out a level at a time.

### B3. A recommendation

One page, `docs/games/GRAIN.md`: the facts, the three ways with their pictures (paths in
`docs/games/shots/grain/`, small), your recommendation and why, and what you would do first.
Write it for Lars, who is not reading the code. No ADR yet: it is his choice.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three and a half minutes;
  `tsc --noEmit` and `bun run build` clean; first script under 60 kB (the grain study's code
  must be lazy and behind the debug switch).
- Front page 28 of 28 byte-identical.
- Sloppy run files byte-identical on the four levels named.
- Without `?debug&grain`, the game is part A's game and nothing of part B shows.

## Hand back

1. Part A per item: done, partly, not done and why; the list of yellows and what became of each.
2. Pictures in `/tmp/shots-paint/`: contact sheets before and after, the legend, the map, the
   header; and `/tmp/shots-paint/grain/` for part B.
3. Part B: the facts table, the three ways' costs, your recommendation in five lines.
4. Identical-run proof, perf, tests, first-script size, front page comparison.
5. Departures, doubts, found and not fixed. Branch and commits.

## Part C: what two reference games teach

Added by the planner the same day. Lars asked the planner to look at two open-source games: Open Surge
(parallax and layering) and Shattered Pixel Dungeon (enemy readability). Both are GPL: read them for
technique only, copy no code and no art.

1. **Shattered Pixel Dungeon's pixels are as big as ours or bigger** (16 x 16 art-pixel tiles and 12 to 16 px
   characters, on a view as small as 135 x 225 art pixels upright). It does not feel coarse because every
   pixel is placed by hand: each sprite has 3 to 5 tones per material (a ramp: shadow, mid, light, one
   highlight), a face with eyes, an asymmetric silhouette, and tiles with per-pixel texture (stone courses with
   a lit top edge and a shadowed bottom edge, moss, cracks). Our game draws with rectangles in code, so shapes
   come out as flat blocks of one tone: that, more than the size of a pixel, is very likely what Lars is
   seeing. So part B's third way ("same grain, better drawn") must be taken seriously and done well: draw the
   subjects as per-pixel maps (rows of palette indices, painted once into the sprite cache already there, so
   the cost per frame is unchanged), with tone ramps, a lit side and a shaded side, eyes, and tile texture on
   the two study scenes. Show it at its best before concluding a finer grid is needed. For ways 1 and 2 use
   the same per-pixel method, so the comparison is grain against grain and not rectangles against
   hand-placed pixels. Say in GRAIN.md how sprite maps would be authored and kept in the repository (text grids
   in .ts, lazily loaded per level), and what that does to the first script.
2. **Shattered Pixel Dungeon has no outlines on enemies.** Readability comes from value: the dungeon's tiles
   sit in a narrow dark-to-mid, low-saturation band, and characters are lighter and more saturated than
   anything behind them, with a dark internal line only where a limb crosses the body. Enemies' eyes are often
   the one saturated accent (the rat's red eyes). State is shown with a small icon over the head that grows
   and shrinks (asleep "zzz", alert "!", investigating "?", lost), plus a flash on hit. For part A this means:
   (a) the red outline Lars asked for is right for this game, because its backdrops are bright and varied
   where that game's are dark and even, but hold the backdrops' value and saturation band behind the play lane
   down where possible (ADR 0039's scenery rule) so bodies in natural colours read; (b) consider the alert mark
   for the harmless-to-harmful change in A2 (a small "!" over a swan, a statue, a guard at the moment the
   outline turns red), in the hurt red, as a still mark under reduced motion.
3. **Open Surge runs at 426 x 240 art pixels with a player about 40 px tall** in a 64 x 64 frame: a much finer
   grain relative to the character than ours, which is where its smooth look comes from, and it is bitmap art.
   Its parallax is data: a theme file lists 15 to 20 layers, each with an initial position, a scroll speed as a
   fraction of the camera (0 for sky, -0.02 for far clouds, up to -0.4 near), an optional drift of its own
   (clouds and water move by themselves), and repeat flags. The trick worth taking: the sea or ground plane is
   cut into a dozen strips each 4 px tall, each a little faster than the one above (-0.125, -0.15, -0.175 ...
   -0.4), which gives a plane that seems to recede in depth for almost no cost. This game has five canvases at
   fixed depths. In GRAIN.md add a short section "depth": what it would take to give a level's water, snow or
   ground plane that strip effect and one or two more far layers with their own drift, within ADR 0036/0041's
   drawn-once rule, and mock it on Langkaia's fjord if it is cheap to do behind the same debug switch. Do not
   build it into the live game in this order.

None of this changes part A's scope except the alert mark in 2(b), which is the implementer's to judge by
looking.
