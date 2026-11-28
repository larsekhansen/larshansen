# Order 48: the dichotomy, seen

Built on branch `the-dichotomy` on 28 November 2026 (`docs/games/orders/48-the-dichotomy.md`). Lars has not played: no route, box, speed,
timing, heart or enemy placement changed, and no word (no line of `game/story.ts` or of the maze's `i18n.ts` changed; the opening card is as
live; nobody real is drawn or quoted). The plans of 28 November were not touched. Pictures in `~/.cache/claude-scratch-larshansen/o48/shots/`
(not committed); the look-first table is `before.md`.

## 1. What order 47 left

### Slottet's balloon cart

Redrawn in the same box and frames (the pigeon's kept 10 x 8, drawn for it 13 x 9 with `fit`, two waiting frames and four rolling, its
balloons' top a pixel over the box): **two big round balloons at two heights**, a coral one high over the cart's front and a lime one lower
behind it, each with its glint at its top left and its knot, tied to **a plain little cart** on two small wheels that turn, its handle behind;
glammed a spark of the level's neons on each balloon; natural a red and a blue balloon (the flag's) over a green cart. Tries on the way, at
eight times and at phone size (`work/cart-drafts.png`): three balloons side by side (the old), two side by side (two balls over a bar read as a
face), one balloon (a pull toy), a bunch at the front; and colours: in the laser orange and the acid green the sheen lit each balloon's top
in the level's neons (a "neon hat"), in hot pink the level's lean made it magenta, 33 % of the figure (the palette test's limit is a quarter):
in the pink and the lime, which the sheen leaves alone, each keeps its own glint. Its tell is its look's (the red outline: it hurts). It has
no eyes now (its balloon wore the shades): the palette test's list of things with none names it.

**The flags**: the parade's children walk behind it (they are in the street's backdrop, drawn before the enemies); what crossed it was the
crowd's flags held up at the near kerb, in front of it. The crowd holds up no flag where a cart walks, a few pixels either side of each
cart's patrol (`FLAGLESS` in `levels/slottet.ts`, as over the first pigeon since order 31): the flags' places, not the carts'.

Pictures, old and new side by side at 390 x 844 (cropped round the cart at four times and twice): `shots/cart/`.

### The panel on a short phone on its side with the dash shown

Taken at 667 x 375 on a touch screen (a pixel ratio of 3, `tools/glance/hand.ts`) with the dash and the shield shown (`&pole&shield`), at
his greeting, the three pieces, his leaving line and a shout, and with a notch on the right: `shots/dash/`. **It holds**: between the move pad
and the Dash button both portraits at 48 and the words between them in four lines (with a notch, six of about twelve letters: the narrowest,
still clear of every control); on a speaker (the jacket's line) under the bar, over the play. Nothing to mend; the layout test already held it.

### The maze's raven

Its portrait and the panel of ADR 0057 in the mound (ADR 0057 amended): `packages/maze/src/talk.ts`. 56 x 56, three expressions (dry, sharp,
pleased; at four times: `shots/raven/portraits.png`), the raven alone (the hero's portraits are the viking app's), at the top left under the
header by the maze's rule for words, or at the foot where he is under it, else the bubble; loaded lazily (its own file, fetched as the scene
loads; the harness waits for it). In the maze's own page and inside the viking page, upright and on its side: `shots/raven/`. Which face goes
with which line: dry for the start lines but the fourth, fifth and sixth, for "Really? The wall?", the key, the stone and "You became wall";
sharp for "Don't stand still", "They blink before they bite", the snakes', the iron walls' and the teleport stone's; pleased for "Hah. The
iron curse got you", the hole, "It was me", "So close" and every feather line.

**The maze's runs and ghosts**: identical (below).

## 2. The dichotomy, level by level

The table looked at first, with its ranking, is `before.md`. Mended from the top, by drawing, five levels (Slottet's under item 1):

| Level | Before (mark) | What was done | After (mark) |
|---|---|---|---|
| Stortinget | 3: the station's signs busier than a station needs; the LOKI posters read as more adverts | **Quietened, not made old**: the T roundel and the station's name once a screen and a half (three and two to a screen before), half the posters, the T-bane's band and the posters' blocks an old enamel's colours. The departure boards, the no-entry signs and the hall's sign stay (they tell). The LOKI posters and the neon heart are now the loud things on the wall | 1 |
| Korketrekkeren | 2: Frognerseteren without its dragon style | **Frognerseteren in its dragon style**: a carved dragon head at each end of the ridge (16 x 20, its neck rising off the ridge, its jaws open, a crest, an eye), a carved barge board along the eaves (a band, round holes, scallops), skis against the wall by the door. Weathered carving (the logs' warm brown came within 4 of a coin's copper as a prop) | 1 |
| The encore | 2: Loki's stage at rest a dark box | **The glamour louder, and gone with it**: sequins over the backdrop (dim purple and pink, a few bright, one in thirty-one pixels; kept and copied) and a marquee of bulbs along the stage's mouth, white, lit after dark; plain, the cloth is black and the bulbs dark glass. Loki still reads in front of it (his red outline and glow) | 1 |
| Holmenkollen | 2: the name board read as a screen; the fox's glam tame | **The station's name board an old enamel sign**, its blue a step toward the snow's grey, HOLMENKOLLEN in white capitals; **skis against the shelter's post**. The fox: see below | 2 (the fox) |
| Slottet | 2: the carts a muddle, the flags across them | item 1 | 2 (the crowd is its idea; the pigeons and gulls among it small) |

The national romantic pieces are the props kit's (`dragonHead`, `bargeBoard`, `skis`, with `carvedWood` and `skiWood` in `alive/props.ts`),
reusable if the levels are rebuilt; on the page of every figure (`prop-dragon head`, `prop-barge board`, `prop-skis`).

**Not mended**, with why: **Langkaia** (2: its glamour reads small against the quay; it is the first script's level, and what it draws is
in every visitor's first fetch); **Vigelandsparken** and **Ekeberg** (2: the statues are the park's own while watched, and the Scream's
sky is its homage; both by the level's idea); the levels marked 1 (Akershus, Rådhuset, Akerselva, Nordmarka, Gamle Oslo, Bygdøy,
Østensjøvannet, Bjørvika, Gamlebyen). **The fox and the cat**: measured (below) their glamour is the tamest of any figure, 25 % and 15 % of
their pixels differ from their natural selves, because a fox and a cat are orange of their own and the glamour's orange is near it. A neon of
their own (a tail tip, leg warmers) would change Holmenkollen, Nordmarka, Gamle Oslo and Korketrekkeren's pictures: left for a decision,
named in the test.

**Before and after**, every place of the look-first table at 844 x 390 (by day, under the level's sky, natural) and 390 x 844 (by day and
under its sky; natural in `<level>-up-natural.png`), before over after: `shots/levels/<level>-land.png`, `<level>-up.png`, for the five; the others' pairs show him changed
(item 3) and nothing else.

**Nothing he must see weakened**: the tells, ledges, pits and pickups are as they were (the warning, tells, takes, thrown, reduced-motion and
palette tests pass; nothing new stands in front of the play: the dragon heads are on the roof, the skis behind the lane, the sequins and bulbs
on the backdrop behind the stage's floor and Loki, the board on the station's wall). Nothing new moves, with reduced motion or without (the
sequins and bulbs are still; `render/reduced.test.ts`).

## 3. More detail on the characters

Each before and after on the figures tool's sheets (four times): `shots/characters/`. Every box, frame count and timing kept.

| Who | The theme | What it lacked | Added |
|---|---|---|---|
| Him | the calm Nordic one, wool and iron | the wool: two white dots on his tunic; the iron: a plain rim | **the knit's band of white across his yoke**, a zigzag of two rows, as a Norwegian sweater has (and from the front in the maze); **rivets on his helmet's rim** (side, front and back) |
| The troll | stone and moss, older than the town | it read as a green and magenta blob | **a stone grown into the hump of its back** with lichen on it, and **a young spruce rooted in its shoulders**, as the old trolls of the stories carry the forest on them (stone at the end with the rest; the spruce stays a spruce) |
| The plough | the municipality's own, glammed by Loki | an orange truck with a tour bus's lights | **its fleet number stencilled white on the cab's door**, and **the marker rod on the blade's outer corner** with its lit tip, up with the blade while it revs |
| The sea serpent | the fjord's | a green neck with a neon crest | **barnacles crusted on its back's scales** (two pale shells with their dark mouths, every nine rows), **two strands of kelp off its chin** |

The page of every figure (`bun tools/figures.ts`, into `~/.cache/claude-scratch-larshansen/o48/figures/`; origin/main's in `figures-before/`):
129 sheets (origin/main's 125). **Changed**: `him`,
`maze-him` and `maze-ghost` (his knit and rivets), `boss-troll`, `boss-plough`, `boss-serpent`, `enemy-balloons`. **New**:
`portrait-raven`, `prop-dragon head`, `prop-barge board`, `prop-skis`. Every other sheet byte-identical.

## 4. Kept honest

### The table again

| Level | Before | After | Why a 2 or 3 remains |
|---|---|---|---|
| Langkaia | 2 | 2 | its glamour small against the quay; the first script's level |
| Akershus festning | 1 | 1 | |
| Rådhuset | 1 | 1 | |
| Slottet | 2 | 2 | the crowd is 17 May's and the level's idea; among it the pigeons and gulls are small |
| Holmenkollen | 2 | 2 | the fox's glamour is its own orange: left for a decision |
| Akerselva | 1 | 1 | |
| Nordmarka | 1 | 1 | |
| Stortinget | 3 | 1 | |
| Ekeberg | 2 | 2 | the Scream's sky is its homage |
| Gamle Oslo | 1 | 1 | (its cat's glamour is tame too: left with the fox's) |
| Bygdøy | 1 | 1 | |
| Vigelandsparken | 2 | 2 | its statues are the park's own while watched: the level's idea |
| Korketrekkeren | 2 | 1 | |
| Østensjøvannet | 1 | 1 | |
| Bjørvika | 1 | 1 | |
| Gamlebyen | 1 | 1 | |
| The encore | 2 | 1 | |

No 3 remains.

### The test

`alive/natural.test.ts`, on the census of every look the file already walks (no new walk; it adds well under a second): **every look's
glammed self differs from its natural self in at least half of its pixels**, a pixel differing where it is gone or 15 or more off (CIEDE2000),
**but by name**, each with why: the wasp (amber and black by Lars's word, 33 %), the ring-throwers (granite by the park's idea, 14 %), the fox
(25 %) and the cat (15 %), left for a decision. A look named that grows loud enough must come off the list. Shown to fail on a planted fault
(the fox taken off the list: "fox: 24.7 %"). Measured: most looks 70 to 97 %; the lowest that pass the squirrel, the nesting gull and the
salmon (55 %); the balloon cart 80 %.

## Measures

As run on the Pi on 28 November (scratch scripts in `~/.cache/claude-scratch-larshansen/o48/bin/`; origin/main as an archive of `05266c0`
in `o48/main`, built and served on 5184, the branch on 5186; the maze's own page from both on 5188 and 5187).

- **Run files**: the sloppy player on seeds 201 to 260 at ±2 and ±4, all sixteen levels and the encore, on origin/main and on the branch
  (`runs-main.sh`, `runs-branch.sh`): **17 of 17 byte-identical** (`sloppy/*/md5.txt`).
- **The maze**: `packages/maze/tools/runs.ts` on both: every run's fingerprint identical (the files differ only in the ghost file's path),
  the ghosts written byte-identical, origin/main's ghosts replayed on the branch each ending in the finish.
- **Tests**: `bun test` green in all four: `apps/viking` 554 pass, 0 fail (origin/main 553: the new one is `alive/natural.test.ts`'s
  glammed against natural, shown to fail on a planted fault); `packages/maze` 264 pass (origin/main 254: `talk.test.ts`'s eight and two in
  `reduced.test.ts`, shown to fail on planted faults: the layout let over him, the slide kept with reduced motion); `packages/pixelkit` 157;
  `apps/landing` 18. Changed tests: `render/palette.test.ts` names the balloon cart among the things with no eyes;
  `render/lights.test.ts` names the encore's marquee (the glamour's own); `alive/natural.test.ts` gained the test above.
- **tsc**: clean inside `apps/viking`, `apps/landing`, `apps/iron-maze`, `packages/maze` and `packages/pixelkit`, and from the repository's
  root with the workspace's TypeScript 5.9.3 on each (`-p`). TypeScript 7.0.2 (`bunx tsc` from the root, as order 47 ran it) was not run:
  `bunx` may ask the registry, which the order forbids, and the cached copy does not run without its platform package.
- **Build**: `bun run build` at the root clean (every app).
- **Sizes** (GNU gzip of the built files, origin/main to the branch): the first script **55,980 to 55,981 bytes** (+1: only the chunks'
  names it carries; nothing order 48 draws is in it; by zlib as vite measures it 56,040 to 56,045, "56.05 kB" before and after). Grown: `feel`'s file 50,677 to 51,211 (the props kit's dragon head, barge
  board and skis, the cart's natural self); the encore's 18,534 to 18,831 (the sequins and the marquee); Gamlebyen's 16,690 to 16,848 (the
  serpent's barnacles and kelp); Holmenkollen's 6,981 to 7,190 (the name board, its capitals, the skis); Nabolaget's 15,302 to 15,428 (the
  plough's number and rod); Nordmarka's 11,458 to 11,556 (the troll's stone and spruce); Korketrekkeren's 7,835 to 7,902; Slottet's 9,737
  to 9,770; Stortinget's 10,596 to 10,618; the maze's scene inside the viking page 19,432 to 19,714 and its harness 3,479 to 3,538, its
  panel a new file of 3,219. The maze's own page: its first script 31,876 to 32,095 bytes (31.86 to 32.08 kB as vite measures it), the
  panel's file 3.15 kB.
- **Front page**: the 28 pictures **28 of 28 byte-identical** (`docs/games/handbook/scripts/frontgate.sh` against
  `/tmp/shots-before-jernhaugen`, the front page built from the branch: the kit's `him.ts` and `himviews.ts` changed, and the front page
  draws its own person).
- **Pictures of every level** (`after.sh`, `diffsum.py`): every place of the look-first table from both builds, 324 pictures. In the twelve
  levels not otherwise changed (Langkaia, Akershus, Rådhuset, Akerselva, Nordmarka, Ekeberg, Gamle Oslo, Bygdøy, Vigelandsparken,
  Østensjøvannet, Bjørvika, Gamlebyen) every difference lies inside one box of 14 x 16 pixels, his (at most 28 pixels a picture: his knit
  band and rivets); 3 of Akershus's are byte-identical (he is not in them). Slottet (the carts and the crowd's flags, up to 1,296 pixels),
  Holmenkollen (the board and the skis, 2,804), Stortinget (its signs, 13,694), Korketrekkeren (Frognerseteren, 3,666) and the encore (the
  stage, 3,871) differ where this order drew. The bosses (Nordmarka, Gamle Oslo, Gamlebyen) are not at those places: their changes are on
  the figures' sheets (`shots/characters/`).
- **LEVELS.html's pictures** (`tools/pictures.ts`): all 23 retaken from the branch's build and committed (origin/main's build reproduces
  all 23 committed ones byte for byte): each shows his knit band (112 pixels); Stortinget's, Korketrekkeren's, the encore's and the maze's
  also this order's drawing. Its FACTS block, rerun, is unchanged; its words and three alt texts say what changed.
- **Cost a frame** (`tools/glance/perf.ts`, `?debug&perf`, 390 x 844, both builds; the order's limit +60 rectangles a place):

| Place | Rectangles origin/main | Branch | Copies origin/main / branch |
|---|---|---|---|
| Stortinget, column 60 / 240 | 2,743 / 3,265 | 2,458 / 2,980 | the same |
| Korketrekkeren, the start, by day and evening | 1,875 | 1,874 | 771 / 775 |
| Holmenkollen, the station | 9,939 | 9,935 (10,059 before its board was kept) | 665 / 667 |
| The encore, the stage at rest, by day and evening | 2,205 | 2,226 | 193 / 197 |
| The encore mid-show, by day and at night | 2,360 / 3,007 | 2,383 / 3,030 | 150 / 154 |
| Slottet, the cart at 112 | 6,739 | 6,744 | 640 / 635 |
| Nordmarka, the troll's fight | 3,818 | 3,825 | the same |
| Gamle Oslo, the plough's fight | 4,850 | 4,853 | the same |
| Gamlebyen, the serpent's fight | 4,701 | 4,706 | the same |

  The largest rise is the encore's, +23 (its bulbs as lights after dark, those on the screen); every place under the order's 60.
- **The suite's time** (`suite.sh`: the branch and origin/main in turn, twice, alone, the preview servers stopped): the branch 273.0 and 289.4 s, origin/main
  278.5 and 288.1 s the same hour (a mean of 281.2 against 283.3: no slower; the new test runs on the census its file already walks).
- **Props held off every role** (the props test): the carving's nearest role is a coin's copper at 13.5 (the logs' own brown was 3.8), the
  birch skis' his skin at 11.9 and a coin at 13.2; the cart's balloons pass the quarter rule for the glamour's accents.

## For Lars to judge

- **Slottet's balloon cart**: can you name it at a glance on a phone now (two balloons over a little cart), glammed and plain?
- **Stortinget**: does the quieter station read as calm and still as a T-bane station, and does the LOKI poster now read as the odd thing
  on the wall?
- **Frognerseteren's dragon heads** and the skis: do they read as carved dragons and skis at the size of a phone, and are they the place?
- **The encore's stage**: the sequins and the bulbs while Loki plays, and their going out when he is plain: loud enough, too busy behind him?
- **Holmenkollen's name board**: an enamel sign with the name, where a panel of squares was.
- **His knit band and rivets**: does he read as wool and iron, or busier than before?
- **The troll's spruce and stone, the plough's number and rod, the serpent's barnacles and kelp**: seen at speed, do they say what each is?
- **The raven's face in the mound**: its three expressions, where the panel stands, whether it covers what you need, and its slide in.
- **The fox and the cat**: their glamour reads tame (their own orange is near the glamour's); a neon mark of their own, or as they are?

## Departures, doubts, found and not fixed

- **Him changed everywhere** (item 3): his knit band and rivets are in the kit's drawing of him (`packages/pixelkit/src/him.ts`,
  `himviews.ts`), so every picture of every level, the maps and the maze differs where he stands. "Pictures of every level you did not change
  byte-identical" cannot hold so; instead every place of the look-first table was taken from both builds and compared: in the twelve levels
  not otherwise changed every difference lies inside one box of 14 x 16 pixels, his (`o48/bin/diffsum.py`). The front page keeps its own
  person and is 28 of 28.
- **The raven alone in its panel**: the hero's portraits are the viking app's (`apps/viking/src/render/faces.ts`); the maze's package cannot
  import them, and moving them into the kit would have touched what the front page shares. ADR 0057 already allows the speaker alone.
- **Where the raven's panel stands**: the maze's rule puts words over the raven's head while it is in view; a panel there would cover the
  corridors round it and the raven, so it takes the rule's other place (the top left under the header), or the foot where he is under it.
- **The maze page's first script grew** 31,876 to 32,095 bytes by GNU gzip (31.86 to 32.08 kB as vite measures it): the scene's lazy import
  of the panel, its readiness for the harness and the raven's lines by key. The portraits, the tags and the placing moved into the panel's
  own file first (from +0.46 kB to +0.22). That page has no budget of its own; the viking page's first script is unchanged by it.
- **The panel in the maze was photographed** at 390 x 844 and 844 x 390 (a pixel ratio of 1) in the maze's own page and inside the viking
  page; 360 x 640, 667 x 375 and the notches are held by `talk.test.ts`, not photographed.
- **The cart's parade**: the parade's children walk behind the carts (they are the street's backdrop); only the crowd's flags in front were
  kept off. With a child walking past behind it the cart still has company; whether it reads is for Lars.
- **The encore's sequins** are a texture behind Loki and him on the stage; Loki keeps his red outline and glow in front of it
  (`shots/levels/encore-*.png`, `work/z-encshow.png`), but it is busier than the black cloth was. A doubt for Lars.
- **Holmenkollen's board** first cost 120 rectangles a frame (its letters); kept as one piece it costs fewer than before (a commit of its own).
- **Carving and skis are cooler than real**: Frognerseteren's carving in the logs' warm brown came 3.8 from a coin's copper as a prop, hickory
  skis 5.4; the carving is a weathered grey-brown and the skis birch, held 10 or more off every role by the props test.
- **TypeScript 7 from the root was not run**: `bunx tsc` from the root resolves TypeScript 7.0.2 and may ask the registry (the order: nothing
  reaches outside); the cached copy does not run without its platform package. From the root the workspace's 5.9.3 was run on each project
  (`-p`), and inside each package as before.
- **Two files named talk** in the viking build: the encore's talk panel (`render/talk.ts`, inside the encore's file) and the maze's
  (`packages/maze/src/talk.ts`, a file of its own, `talk-*.js`).
- **Found and not fixed**: the fox's and the cat's glamour (above); Langkaia's small glamour; the raven has no listener; the hero's portrait
  has no knit band change (it already had its rosettes).
- **Not checked**: anything at speed, on a phone, or heard. The marquee's light after dark and the raven's slide are seen only stepped.
