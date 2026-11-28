# Order 47: what Lars said, the second time

Built on branch `lars-28-nov` on 28 November 2026 (`docs/games/orders/47-what-lars-said-second.md`). Lars's answers of 28 November are in
`docs/games/handbook/conversations.md`, word for word, with the planner's reading. He has not played: no difficulty was retuned, and he said of
every level whose difficulty was in question "leave it as it is". Pictures are in `~/.cache/claude-scratch-larshansen/o47/` (not committed).

## 1. The words he gave

| What | As live | Now |
|---|---|---|
| The plough beaten (`levels/nabolaget.ts`, `bossWords.beaten`) | "The plough parks. / The street is clear, for once." / "Brøytebilen parkerer. / Gata er fri, for en gangs skyld." | **"The plough parks. / Gamle Oslo is clear."** / **"Brøytebilen parkerer. / Gamle Oslo er fri."**, as he wrote it, kept on two lines as the line was; seen at 360 x 640 in both languages (`shots/plough/`): each line in its bubble, inside the screen |
| The banner's second line, where in Oslo, the plough wakes, the card with the tenth rune | as live | as live ("as live") |
| The doors labelled Hjem / Home | Hjem / Home | **asked about and kept** ("keep the label"); recorded in `conversations.md` and ADR 0055's amendment |
| The level's first sign (`signs[0]`, "Vålerenga") | as live | **as live**: he chose "change it" without saying to what. Three ways below, for him to pick |

### Three ways to word Gamle Oslo's first sign (the "Vålerenga" sign by the first roofs)

What stands now: "The roofs are slippery. The washing lines are not for hanging on." / "The warm air from the chimneys goes straight up."
("Takene er glatte. Klessnorene er ikke til å henge på." / "Varmen fra pipene går rett opp."). Each way below still says what the sign teaches
(the ice on the roofs, the warm air that lifts him, the washing line that throws him), in the game's dry voice (ADR 0016), as an ode to Oslo
(ADR 0055), calm (ADR 0058); none is longer than the line that stands now (65 letters). Its label stays "Vålerenga".

1. **The houses' age** (dry, a fact that lets itself be funny):
   - "The wooden houses are from the 1800s. The ice is from last night." / "Warm air rises from every chimney. Let it carry you."
   - "Trehusene er fra 1800-tallet. Isen er fra i natt." / "Varmen stiger fra hver pipe. La den bære deg."
2. **An evening on the old east side** (the calm of the place):
   - "Evening on the old east side. Smoke rising, ice on the roofs." / "Ride the warm air up. The washing lines throw you higher."
   - "Kveld på den gamle østkanten. Røyk som stiger, is på takene." / "La varmen bære deg opp. Klessnorene kaster deg høyere."
3. **The locals' way** (practical, a straight face):
   - "In winter people cross these roofs slowly. Do as they do." / "The chimneys lift you. The washing lines throw you higher."
   - "Om vinteren går folk sakte over disse takene. Gjør som dem." / "Pipene løfter deg. Klessnorene kaster deg høyere."

The planner's pick, if asked: the first (the age of the houses and last night's ice says the place and the danger in one line, and is the
driest). Swapping one in is two lines in `levels/nabolaget.ts`; `game/words.test.ts` holds both languages.

## 2. What belongs to the place

**How** (DESIGN, "The levels"): an enemy may be drawn as another figure than its look (`EnemyDef.drawAs`). Its `look` is what the rules, the
review's tools and the sloppy player's run files name it by (a hurt's cause is written `kind:look@column`, so a renamed look would have changed
the run files), so its box, frames' count, timing, speed and behaviour are the look's; the figures' table, the natural selves (`drawnLook`) and
the palette test name it as drawn. Each figure is per-pixel frames in the enemy palette with the light from the top left (GRAIN.md's way 3),
glam marks in its level's two neons (its tell, where it has one, is its look's: none of these four has a tell of its own), a natural self in
its real colours in the calm outline (`alive/natural.ts`), registered in its level's own file (`foeLooks`), named in both languages
(`FIGURE_NAMES`), and on the figures tool's sheets. Pictures: `shots/inplace/` (each in place at 390 x 844 by day and under its level's
sky, glammed and natural, cropped round it at 3x), `shots/inplace-close/` (5x), the figures tool's sheets in `figures/` (4x).

| Where | Was | Now | Box, kept | Frames |
|---|---|---|---|---|
| Holmenkollen, the spiky one at column J + 30 | a hedgehog (hedgehogs sleep through the winter) | **a mountain hare** in its white winter coat: two long ears up and a little back with their black tips (dark against the snow), the near one pink inside, a round head with a dark eye, a pink nose, the scut, a long hind foot; its white lit along its top and cool in its shade; glammed, a crest of three neon spikes along its back (the level's blue and hot pink: it hurts from above, as the spines said) and shades | the hedgehog's 15 x 10, the drawing 15 x 12 (its ears two rows over the box; a spiky one is never landed on, so the palette test's stomp rule does not apply) | sitting, its ears turning; a hop of four by distance |
| Slottet, pigeons at columns 80, 112, 172 (three of seven; the first, met on plain street, stays a pigeon) | pigeons | **a balloon seller's cart**, pushing itself: three balloons on strings to a pole in a little cart on two small wheels, its handle behind; glammed the balloons laser orange, magenta and acid green, a lime tube along the cart, the middle balloon in shades; natural a red, a white and a blue balloon (the flag's) over a green cart | the pigeon's kept 10 x 8, drawn for it (`fit`) 13 x 9, the balloons' tops a pixel over the box (the stomp rule: within two) | waiting, its balloons swaying; rolling, three of four distinct (wheels turning, the balloons swaying) |
| Bjørvika, pigeons at columns 14 (the gate) and 59 (the first floor) of six | pigeons | **a small forklift** driving itself: the mast in front with its forks low, the cab's frame round a seat behind glass, a beacon on the roof, the body and its counterweight, a big front wheel and a small back one that turn; glammed a neon strip along its side, the beacon in neon; natural a site's orange with a grey mast | the pigeon's kept 10 x 8, drawn for it 13 x 9 | waiting, idling; driving, four |
| Stortinget, the walker at column 139 | an e-scooter (ridden above, not below) | **a commuter's bicycle** riding itself: a step-through frame lit along its tubes, a saddle, a rear rack with a pannier, a bell, a wicker basket with a lamp, spoked wheels that turn; glammed a neon strip along its top tube, streamers off the bar; natural a bottle green frame, a brown saddle, a wicker basket | the scooter's kept 14 x 12, drawn for it (`fit`) 18 x 13 | waiting; rolling, four |

Not drawn, with why: **a russ in red overalls** and **a surveyor with a theodolite** are people, taller than a pigeon's kept box (8 pixels: a
man is 14), so neither could honestly do what the pigeon does in its box; the cart and the forklift could. **Bygdøy's penguins** stay: not of
Oslo, but `o34/thematic.md` marks them as the museum's joke on Fram's voyage south, which the level makes. Nothing else in `thematic.md` is
marked as not belonging. `thematic.md` now marks each proposal carried out ("Done in order 47").

**Order 35's hare against this one**: order 35's ears lay back along its back, so its outline was one lump (the planner: "a pale blob"); and
its spikes were two rows of single pixels. This one's ears stand up apart from each other over the box with a gap between them and their black
tips, its body rounds down to the scut, its crest is three spikes three rows tall. In place at 390 x 844 (`shots/inplace/hare-holmenkollen-222.png`)
its natural self reads as a hare at once; glammed, the crest and the red outline say it hurts. Whether it reads on a phone is for Lars.

**The two spires** (Akerselva's far view, `levels/akerselva.ts`): Sagene kirke's spire was the brick's darker tone; it is old copper now
(METAL.copper, hazed 0.3 toward the far hills, lit down its left edge, its right in shade). Paulus kirke's was already slate (the church slate
hazed); it keeps the slate, hazed a little more, lit down its left edge, its right in shade, so it reads as a slate spire and not a dark shape.
Every far colour of both is held off the warning red, the paint and every role under every sky by `render/warning.test.ts` (passed).
Pictures: `shots/spire-sagene-day.png`, `spire-paulus-day.png` (before left, after right, 5x) and under the evening sky.

## 3. Faces when they talk

### Every place where someone speaks

| Who | Where | His own voice? | Now |
|---|---|---|---|
| Loki | the encore: as he wakes ("Good evening, Oslo! ..."), as each piece comes off (the wig, the shades, the jacket), leaving, plain ("Lovely crowd ...") | yes | **the talk panel**: his portrait and the hero's beside the words |
| Loki | the encore: the four shouted lines in time with the tune | yes | **the talk panel**, his shout face, a flash behind him as it starts |
| (the narrator, beside Loki) | the encore's hints after a round with no hit (`miss`, `missClub`, `missCharge`, `missBite`) | no: they tell the player what to do | the bubble beside him, as before |
| (the narrator, beside the troll) | Nordmarka: "The boulder stands up. It is a troll. ...", "A third of the troll is stone.", its hints, "The troll is stone." | no: a narrator's lines about it | the bubble, as before |
| (the narrator, beside the plough) | Gamle Oslo: "The snow plough wakes. ...", "Right on the roof.", "The plough parks. ...", its hints | no | the bubble, as before |
| (the narrator, beside the serpent) | Gamlebyen: "The water by the quay stirs. ...", "Right on the head.", "The serpent sinks. ...", its hints | no | the bubble, as before |
| (the game, over him) | the shield given ("The shield is yours. ..."), the feather at the mound ("The mound-dweller yields. ...") | no: the game telling him | his bubble, as before |
| the hero | nowhere: he never speaks | | his portrait listens beside Loki's words |
| the maze's raven | Jernhaugen, in the maze's own page and package (`packages/maze/src/i18n.ts`: "Hah. The iron curse got you. Again?" ...) | yes | **left**: the maze's own page; a panel there is a later order's |
| the mound-dweller | spoken of, never speaks | | |
| the signs, the opening card, the map's sign, the cards | | not people | as before |

**Bosses**: none of the troll, the plough and the serpent speaks in its own voice (their lines are a narrator's, in the third person), so none has
a portrait; a face beside a narrator's line would put words in its mouth. Left: their portraits, if their lines are ever written in their
own voices; the maze's raven.

### The portraits (`render/faces.ts`)

56 art pixels square, built from parts laid one over another as Loki's figure is (a backdrop, shoulders, neck and head shaded from the top
left, then by expression the brows, the eyes and the mouth, then the hair, the shades, the expression's marks, and a line of the game's dark
round the figure). Every portrait and expression on one sheet at 4x: `shots/faces.png`; also the figures tool's `portrait-loki.png` and
`portrait-hero.png`.

- **Loki**, six expressions, each at the four stages of the fight (24): **smug** (one brow up, a smirk, a glint), **delighted** (brows high,
  eyes shut in arcs, a wide open grin, sparkles, a blush), **outraged** (brows down in a V, eyes wide with tiny pupils, clenched teeth, shock
  lines, a vein), **wounded** (brows up at their inner ends, wet eyes, a tear, a wobbling mouth, a sweat drop, gloom lines, his head drawn
  back), **scheming** (one brow low, eyes narrowed, a thin curling smile showing teeth, a glint), **a shout** (his head forward, eyes
  squeezed, the mouth wide open with teeth and tongue, speed lines fanning out behind him). Glammed: the teased wig in hot pink and magenta
  with its lime streak and headband and the mullet, wraparound shades with the lights in them and a lime arm, purple lids and a liner's
  wing, a lime star under his eye, the leopard jacket with its white pads, the magenta shirt; the stage behind him in the rig's dark and its
  lights' purple and magenta, rays and stars. The wig gone: his own thin hair. The shades gone: his eyes and the make-up. Plain: a thin man in
  a grey sweater, no make-up, the stage's lights off.
- **The hero**, four, quiet: **calm**, **surprised** (brows up, round eyes, a small o), **set** (brows down and drawn together, eyes
  narrowed, a firm mouth, his jaw set), **pleased** (eyes in soft arcs, a small smile, colour in his cheeks). His iron helmet with its rivets
  and its white wool pompom, a little fair hair, his knit sweater with its band of white rosettes, his cape; a winter evening behind him over a
  fjord's far ridge. No beard: his figure has none, and "his face, and a beard" waits for Lars.
- **The tags** (`ENCORE_FACES` in `game/story.ts`, below the encore's hashed block; no word changed): wake Loki delighted, the hero set;
  piece1 ("That was a wig.") smug, surprised; piece2 ("Shades, in November.") wounded, calm; piece3 ("Careful. That jacket was rented.")
  outraged, set; leaving scheming, pleased; the shouts a shout, calm.

### The panel (`render/talk.ts`; ADR 0057)

Loki's portrait on the left facing right, the hero's on the right facing him (mirrored), the words between in a box as a bubble's. Where: under
the stage's floor across the screen over the pad's controls (upright), or between the controls at the left and the right (on a phone on its
side), or, where the floor is low on the screen (he is on a speaker), under the bar over the play; never over a control, a notch, the home bar
or the play; the room a line found kept while it is up; none, the bubble. In from the sides over eight steps, out over the last six; a shout
flashes once (white over hot pink, a fifth of a second); with reduced motion it appears and goes. Pictures in `shots/panel/` (see "Measures").

**More detail on Loki in the level** (`render/loki.ts`): from his portrait, what his size can hold: the lime streak swept back through the
wig from his brow to a spike's tip, and the lime star of his make-up under his eye (his skin when plain). The colours' order (hot pink hair,
the lime band, pale face, dark shades with a lime arm, leopard, magenta, white pads) was already the portrait's. Every box, frame, tell and
timing as it was. Before and after at 6x: `shots/loki-figure.png`.

## 4. The theme written down

DESIGN's "Calm Oslo, loud glamour" and ADR 0058, with his words quoted: calm, quaint, Nordic-romantic Oslo and its people against the loud
neon glam Loki lays over it; Loki's reason (mischief, and a grudge against the gods of the north who wronged him) may be said in the game only
in lines the planner or Lars writes later; no word in the game changed for it. The roadmap says the planner is writing plans for the real-Oslo
rebuild, the front page as a home and the runes, and that nothing of them is decided.

## Measures

Every measure the order asks for, as run on the Pi on 28 November (scratch scripts in `~/.cache/claude-scratch-larshansen/o47/bin/`;
origin/main as an archive of `95a423a` in `o47/main`, built and served on 5184, the branch on 5186).

- **Run files**: the sloppy player on seeds 201 to 260 at ±2 and ±4 for all sixteen levels and the encore, on origin/main and on the
  branch (`runs-main.sh`, `runs-branch.sh`): **17 of 17 byte-identical** (`sloppy/*/md5.txt`). The figures of their place's own keep their
  look's name (`drawAs`), which is what made that possible: a hurt's cause is written with the look.
- **The maze**: `packages/maze/tools/runs.ts` on both: every run's fingerprint identical, the ghosts written identical, origin/main's
  ghosts replayed on the branch each ending in the finish.
- **Tests**: `bun test` green in all four: `apps/viking` 553 pass, 0 fail (origin/main 542: the eleven new are `render/talk.test.ts`'s ten and `game/tune.test.ts`'s `shoutFrom`; `talk.test.ts` shown to fail on planted faults: the panel let over the pad's controls, and a slide left with reduced motion, which failed three of its tests; the `shoutFrom` test was not planted); `packages/pixelkit` 157, `packages/maze` 254, `apps/landing` 18, 0 fail. Changed tests: `render/palette.test.ts` names an enemy as drawn and lists the bicycle and the forklift among the things with no eyes.
- **tsc**: clean inside `apps/viking`, `apps/landing`, `apps/iron-maze`, `packages/maze`, `packages/pixelkit`, and from the repository's
  root (`bunx tsc -p apps/viking`, TypeScript 7.0.2 from Bun's cache, as `lessons.md` explains).
- **Build**: `bun run build` at the root clean.
- **Sizes** (each file that grew; GNU gzip of the built files): the first script **55,977 bytes** (origin/main 55,878: **+99**; by zlib as
  vite measures it 56,045 against 55,943, +102; under 60 kB and within the order's 400): the page's one call to a level's talk panel,
  and a shout in it said to a screen reader. The encore's file 12,020 to 18,401 (the portraits and the panel); `feel`'s 50,350 to 50,675
  (the tags, `drawnLook`); Slottet's 9,462 to 9,737, Holmenkollen's 6,643 to 6,981, Bjørvika's 7,310 to 7,554, Stortinget's 10,280 to
  10,597 (their figures); Akerselva's 10,954 to 11,027 (the spires).
- **Front page**: the 28 pictures **28 of 28 byte-identical** (`docs/games/handbook/scripts/frontgate.sh` against `/tmp/shots-before-jernhaugen`; the kit was not touched).
- **Pictures of every level** (`same.sh`): 212 places at 390 x 844 from both builds (order 39's 176: every level every sixty columns by
  day and at night, the maps, Holmenkollen's spiky one, the encore; and the spires, the encore with a line and a hint, every figure of its
  place's own glammed and natural under both skies): **163 byte-identical; 49 differ, each where a figure, a spire or the panel
  stands**: Akerselva at columns 120 and 180 and the two spires' places (a region 130 x 50 round the spire, 112 to 210 pixels);
  Bjørvika at columns 0 and 60 (the forklift, 17 x 13); Holmenkollen's hare's place (19 x 16); Slottet at columns 120 and 180 (the
  balloon cart, 18 x 13); the encore asleep and with a hint (8 pixels: the lime streak and star on Loki's figure) and with his line (the
  talk panel in place of the bubble); and the 28 pictures of the figures themselves. Nothing differs anywhere else.
- **LEVELS.html's pictures** (`tools/pictures.ts`): all 23 retaken from the branch's build; two changed and are committed: `15-bjorvika` (the first forklift's edge, two pixels at the picture's left) and `17-encore` (the talk panel over the stage with his shout, where its bubble was; its alt text and caption say so). origin/main's build reproduces its committed pictures (checked for these two and for Slottet's and Akerselva's). The page's words name the new figures (Slottet, Holmenkollen, Stortinget, Bjørvika) and the panel (the encore); its FACTS block, rerun, is unchanged.
- **The figures tool** (`bun tools/figures.ts`) into `o47/figures/` (125 sheets; origin/main's 119 in `o47/figures-before/`): new
  `enemy-hare`, `enemy-balloons`, `enemy-forklift`, `enemy-bicycle`, `portrait-loki`, `portrait-hero`; changed `boss-loki` (the
  streak and star), `enemy-hedgehog` (no longer met at Holmenkollen: three levels' rows, not four), `enemy-scooter` (no longer met at
  Stortinget), `enemy-pigeon` (its Bjørvika rows drawn from the pigeon at column 112.5, the first two being forklifts now: the same
  frames at a half tile's offset). Every other sheet byte-identical.
- **Cost a frame** (`tools/glance/perf.ts`, `?debug&perf`, 390 x 844, both builds; the Pi busy, so the milliseconds are noise):

| Place | Rectangles origin/main | Branch | Copies |
|---|---|---|---|
| Slottet, each balloon cart, by day and 17 May | 7,240 / 6,718 / 6,968 | the same | the same |
| Holmenkollen, the hare, by day and its sky | 10,029 / 10,139 | the same | the same |
| Stortinget, the bicycle | 3,212 / 4,048 | the same | the same |
| Bjørvika, the forklifts, by day and evening | 7,192 / 7,537; 7,533 / 8,069 | the same / 7,535; the same / 8,067 | the same |
| Akerselva, the two spires | 9,613 / 9,765 | the same | the same |
| The encore with a line up (wake, a shout, piece2, leaving) | 2,387 / 2,358 / 2,373 / 2,202 | **+2 each** | **+2 each** |

  The talk panel costs two rectangles (the portraits' frames) and two copies (the portraits, each painted once and kept) a frame, against
  the order's limit of 80; and its words, a rounded box and a line of text a line, which no count of the picture includes. The figures
  cost nothing more: each is an outlined shape made once and copied, as the look it replaces was.
- **The suite's time** (`suite.sh`: the branch and origin/main in turn, twice, alone, the preview servers stopped): the branch 289.2 and 290.8 s, origin/main 277.1 and 290.0 s the same hour (a mean of 290.0 against 283.5: +6.5 s, under the order's 10; the second pair 0.8 s apart).
- **The words at 360 wide**: the plough's beaten line in both languages (`shots/plough/`); every line of the panel in both languages at the
  four sizes (`shots/panel/`).

### The panel's pictures

`shots/panel/`: at 390 x 844, 844 x 390, 360 x 640 and 667 x 375, a pixel ratio of 3 with the touch pad (`tools/glance/hand.ts`), in
English and in Norwegian: his greeting (glammed), piece1 (the wig gone), piece2 (the shades gone), piece3 and leaving (plain), a shout in
its first steps (`shout-flash`, the flash and the slide), a step later (`shout-sliding`), with reduced motion (`shout-reduced`,
`wake-reduced`: all in at their third step, no flash), a hint (its bubble, no panel), and with a pretended notch (`&safe=left`, `right`,
`upright`). Composites: `shots/panel-up.png`, `panel-land.png`, `panel-360.png`, `panel-667.png`. Under the stage's floor in every one
but where he stands on a speaker and the floor is low on the screen (`piece3` on its side, a shout at 360 x 640): there under the bar.

## For Lars to judge

- **The mountain hare** at Holmenkollen: does it read as a hare on a phone, white on the snow (its outline, its black ear tips, its
  shadow), and does its crest of neon spikes say "it hurts from above" as the hedgehog's spines did?
- **The balloon cart** (Slottet), **the forklift** (Bjørvika), **the commuter's bicycle** (Stortinget): can you name each at a glance on a
  phone? The cart is the smallest (13 x 9 in a pigeon's box); glammed, its balloons are neon and read less as balloons than its natural
  red, white and blue ones; and the carts at columns 112 and 172 walk where the parade's flags stand in front of them (as the pigeons there
  did), so they are seen through a hand flag now and then.
- **The spires**: is Sagene's old copper and Paulus's slate grey what you see from the river?
- **Loki's faces**: glam enough, over the top enough, and nobody you could name? Six expressions at each stage: does each say its line?
  Is the shout a shout (and not a beard)?
- **The hero's faces**: calm and quiet beside Loki's, and him? He has no beard (your answer on "his face, and a beard" is still open).
- **The panel in play**: where it stands (under the stage, or at the top when he is up on a speaker), whether it gets in the way, the words'
  size, the slide and the shout's flash at speed, and with reduced motion. Nobody has seen it move: the pictures are stepped.
- **Loki in the level**: the lime streak in his wig and the star under his eye, at his size.
- **Gamle Oslo's first sign**: which of the three wordings above, or another.
- In the planner's session, not here: the quote on the opening card, and deleting `landing-game-polish`.

## Departures, doubts, found and not fixed

- **Figures drawn as another look** (`EnemyDef.drawAs`), not a new look: the order wanted the rules and the run files unchanged, and the
  sloppy player writes a hurt's cause with the look's name, so renaming a look (as order 35 did with `look: "hare"`) would change a run file
  wherever that enemy ever hurts. The palette test now names an enemy as it is drawn (`drawnLook`), and its list of things with no eyes
  gained the bicycle and the forklift (machines, as the scooter and the trolley).
- **The hare is drawn new**, not order 35's: its ears stood up apart, two rows over its box (a spiky one is never landed on), its crest three
  spikes three rows tall.
- **A russ and a surveyor were not drawn**: people, taller than a pigeon's kept box; the order allowed "what else ... fits a pigeon's box
  and way of moving". Three of Slottet's seven pigeons are carts (the order: two or three), two of Bjørvika's six forklifts (one or two).
- **The hero speaks nowhere**, so his portraits listen: beside Loki's words, facing him, quiet ("make it visible side by side"). The lines
  over him when he is given the shield or the feather are the game's, said to him, and keep their bubble.
- **No boss portraits**: the troll's, the plough's and the serpent's bubbles are a narrator's lines about them (none speaks in its own
  voice); a face beside them would put words in their mouths (ADR 0057, "Not chosen"). Left, as the order allows. The maze's raven speaks,
  in the maze's own page: left.
- **The tags** are a table beside the lines (`ENCORE_FACES`, keyed by the line), below the encore's block in `game/story.ts`: everything
  above that block is held to its hash, and a field inside `ENCORE` would be a word to every test that walks its words.
- **The panel's words are in a box between the faces**, not in the bubble beside Loki: "a large detailed portrait ... stands beside the
  words". Hints stay in the bubble beside him.
- **Where the panel goes** was not named by the order beyond "clear of the play": under the stage's floor (the water mirror), or under
  the bar. Upright the room over the pad's controls, on its side the room between them. On a short phone on its side with the dash shown
  the words' room may leave only the speaker's portrait, or both at 48 (the middle of each, never shrunk); the test holds both portraits
  upright and at 844 x 390.
- **`?debug&say`** now sets the line as if it came up a second before (`&sayage`), so a stepped picture shows the panel all in.
- **Found on the way and mended**: a stepped picture on a touch screen frames once before the pad is up, and the panel kept the room it had
  found then (under the bar); it now finds its room again when the bar or the pad's controls change. A shout in the panel was no longer
  said to a screen reader (its bubble had been); it is again.
- **`bunx tsc` at the root** is TypeScript 7.0.2 from Bun's cache; its first run printed three lines I did not keep before running it again
  (clean, nothing printed): if they were Bun resolving the newest version, that was a lookup to the package registry, nothing installed.
- **Found and not fixed**: the dash's slot narrows the room between the controls on a short phone on its side (667 x 375), where the panel
  then has the speaker's portrait alone or both at 48 (held by the layout test, not photographed with the dash shown: the debug states have
  no pole); the maze's raven has no panel.

Commits on `lars-28-nov`, oldest first: `9a5362f` the order; `4fab879` items 1 and 2 (the words, the figures, the spires); `8280ac4` the talk panel and the portraits; `8dbd2bb` Loki in the level; `a887594` the portraits on the page of every figure; `1dbe5b8` the panel finds its room again when the screen's room changes; `2007036` a shout in the panel said to a screen reader; `c956419` a shout's panel comes in when the music brought it in; then the docs.
