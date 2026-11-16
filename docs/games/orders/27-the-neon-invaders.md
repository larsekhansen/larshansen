# Order 27: the neon invaders

Written 16 November 2026. Lars, looking at the page of every redrawn figure:

> hm. all the pink... im just not sold on pink being a bad guy color. but maybe if we make it a
> theme somehow? like, oh no, the 80s glam invaders are here!

Offered natural colours, a "bewitched" story or his own joke, he chose: **"The neon invaders"**,
and then: "no sorry, you bewitched idea is kinda cool. But idk, can you mix them?"

They mix in one word: **a glamour**, which in the old sense is a spell cast over something so
that it appears other than it is. The Neon Invaders have put a glamour on Oslo. Every animal and
person under it is glammed up in neon and out to hurt him; it is a spell, not a costume, so
when he stomps one the glamour breaks and the creature is itself again and goes home. His
runes are the older magic that breaks it for a whole station. So the pink stops being an
accident of the palette test and becomes what the game is about: natural is Oslo, neon is the
glamour, and a viking in a blue tunic is lifting it rune by rune. It is a joke and should be
played as one: affectionate, a little absurd, never mean. The Invaders themselves are not met
in this order, only what they left (their signs, their posters, their spell); section 3 says
who is behind them.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, `docs/games/GRAIN.md`,
  ADRs 0003, 0014, 0035, 0036, 0039 to 0048 and order 26's ADR, orders 22 to 26,
  `packages/pixelkit/src/swatches/` (roles, enemy), `apps/viking/src/alive/`, `render/looks.ts`,
  `render/sprite.ts`, `render/feel.ts`, `render/palette.test.ts`, the sound code.
- `git fetch origin`; branch `the-neon-invaders` from `origin/main`. First commit: this order, as
  `docs/games/orders/27-the-neon-invaders.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port and any headless browser you started when done.
- ADR 0003 and ADR 0014 stand. No route, box, speed or timing changes: sloppy run files for
  Langkaia, Slottet, Nordmarka and Gamlebyen on seeds 201 to 260 byte-identical.
- Front page 28 pictures byte-identical. First script under 60 kB.
- **Nothing borrowed.** No real band, song, person, logo, album cover or lyric, and no melody a
  person could name. The 80s here is a look and a sound made from scratch: neon, hair, shades,
  synth. (`docs/games/PLAN.md` already records that a commercial recording had to leave the old
  maze; do not bring one back in spirit.)

## 1. The look: one glam, every invader

Design the invaders' look as a small system and write it down in DESIGN before drawing:

- **A neon family for bodies, and not only magenta.** Lars, on hearing the plan: "wow yes the
  glamour idea is so good. the word play is lovely. I guess general neon / cyber punk / 80s
  glam is a theme that can be recurring then, doesnt only have to be magenta. i saw the swan
  had something like a green sheen. or blue maybe, but you can play on more, strong colors i
  suppose". So the glamour has a whole neon spectrum: hot pink and magenta, electric purple,
  acid green, electric blue, laser orange, a sheen that shifts between two of them on a
  figure's lit side (the swan's green-blue sheen is the model: build on it). What makes them
  one gang is not one hue but one treatment: saturated, glowing after dark, a two-neon
  gradient or sheen, the same glam marks. Use it to give places and kinds their own colours
  (a level's invaders can lean one way: Nordmarka's acid green and purple in the dark,
  Bjørvika's electric blue and pink among the cranes), so sixteen levels do not look alike.
  It must stay clear of the roles in the shapes the roles use: the yellow paint (stand), the
  cyan (use), the violet (now), his blue, the amber of what he takes, the calm pale blue, and
  the warning red of the outline (bodies still stand off their own outline, with the dark line
  inside it). Where a neon sits near a role (purple near the "now" violet, electric blue near
  his tunic or the "use" cyan), keep it away by hue and by shape, never let it be a figure's
  whole body beside that role, and name it in the test. Neon is for the glamour only: nothing
  natural and nothing he takes or stands on may use it.
  Order 26 was asked to make wasps amber and black; under this order a wasp is an invader like
  the rest: decide whether it keeps amber stripes with neon shades or goes fully neon, by
  looking, and say which.
- **Glam marks, drawn into the maps** (order 23 to 25's per-pixel frames), a few per figure,
  chosen to suit the animal and readable at 390 x 844 at real size: wraparound shades, a
  mullet or a teased crest, a headband, a lightning bolt across the face, leg warmers, a
  studded collar, shoulder pads on anything that stands upright, a keytar or a boom box for a
  thrower (it still throws what it throws). Not every mark on every figure: a rat in shades, a
  gull with a crest, a guard in shoulder pads. The silhouette each enemy has today must stay
  recognisable, and the head he lands on stays where it is.
- **The Angry Boy is not a boy yet.** Lars: "the called boy looks like a teddy? not a boy at
  least". Vigelandsparken's jumper is the park's famous bronze of a furious toddler, and today
  its raised fists read as a bear's round ears. Redraw it from the statue's real pose: a
  chubby naked toddler in bronze, a big round bald head with a scowl (brows, a shouting mouth),
  fists clenched **down at his sides**, one foot lifted mid-stamp, a short neck, a belly; no
  round shapes above the head line. Under the glamour: the same child with a neon mohawk or
  a headband and shades, still unmistakably a small angry boy; his natural self is the green-
  brown bronze. Stamping is his cycle and his wind-up. Box and jump unchanged. Show it at four
  times and in place at 390 x 844 before and after, and check the other human figures (kid,
  slinger, ringer, guards, archer, riveter) for the same fault: a head must read as a head.
- **Three figures that are still just shapes.** Lars: "make kid, sledgers more detailed. Hot
  dog, hich i think must be a hot dog stand, can maybe be given a little more detail to see
  whats inn there. Just kind of shapes now." Redraw each so a person can say what it is at a
  glance at 390 x 844, glamoured and natural:
  - **The kid** (Holmenkollen, Korketrekkeren, Vålerenga): a child in winter clothes: a face
    with eyes and red cheeks, the bobble hat, a scarf, mittens, a puffy jacket with a zip or
    pockets, boots, the snowball visibly in a mitten before it flies.
  - **The sledger** (Korketrekkeren): a rider you can see sitting on a sledge you can see: the
    sledge's runners and slats, legs out front, hands on the rope or the steering, a helmet or
    hat, a scarf streaming back; leaning in its cycle. Pulled off (harmless): standing beside
    an empty sledge.
  - **The hot-dog cart** (Slottet, 17 May): it is a pølsebod on wheels and should say so: a
    striped awning, a counter with sausages in buns in a row and a mustard and a ketchup
    bottle, a steaming pot, a sign with a sausage on it, a wheel and a handle, and the vendor's
    head and cap behind the counter if there is room. The top he can be hurt by or land on
    stays exactly where it is.
  Boxes and timings unchanged. If either needs a pixel or two more outside its box to read
  (drawing only), take them. Show each at four times and in place, before and after.
- **Glamoured fire.** Lars: "the brazier should now also have magenta / lime green fire".
  Akershus's brazier (an enemy) burns magenta with lime green tongues and tips while it is
  under the glamour, flickering in its frames, glowing after dark; with its glamour broken (a
  rune's ring, or however it is beaten) it burns an ordinary orange. The same for any other
  fire or light that hurts (the grill's coals, a torch that is a hazard). Fires and lamps that
  are only scenery stay warm and natural: neon fire means the glamour. Keep the lime away
  from the yellow paint and the magenta off the "now" violet in the palette test.
- **They glow after dark.** Neon is the one thing that should look better at night: after dusk
  and in the dark levels each invader keeps its colour and gets a soft glow of its own hue
  (drawn once and copied, within the perf budget), under the red outline that already keeps
  its light. Check Nordmarka's dark and Gamlebyen especially.
- **The bosses are the headliners.** The troll, the plough and the sea serpent each get a glam
  of their own, as big as they are (a troll with a mullet of moss gone magenta and a spiked
  wristband; a plough done up as a tour bus with a row of stage lights; a serpent with a neon
  crest and shades), every tell of orders 19, 22 and 25 exactly where it is.
- **Harmless things stay natural.** Sheep, the moose, the heron, the parade, a watched statue:
  ordinary colours, pale outline. That contrast is now the whole reading of the game: natural
  is Oslo, neon is the invasion.

## 2. A stomp knocks the glam off

When he stomps an invader, the glam goes and the animal is itself again: the shades fly off, a
burst of glitter (order 19's particles, in the invader's neons), and in the frames the death
takes today (three frames, eight steps: no timing change) it turns to its natural colours with
the calm pale outline and leaves: a rat scurries off, a bird flies up, a guard walks away
shaking his head. Nobody dies in this game any more. The natural version is the same map with
a natural ramp (brown rat, grey pigeon, white gull, red fox): it is harmless and leaving, so the
palette test's distance from backdrops does not bind it, but it must not be mistaken for an
enemy (pale outline, moving away, gone within a second or so, drawing only, no box).
Throwers and things that cannot be stomped: the same when they are beaten by other means.
Bosses: beaten, the glam falls away in their last frames (the troll to plain stone, the plough
to its orange, the serpent to green) as each already ends.
Reduced motion: no flying shades or glitter, a plain change of colour.

## 3. The story, told lightly

- **Why it happened: a silly, current story.** Lars: "Maybe you can somehow make it a sort of
  silly, current story too. thats holds mirror up to society, but in a tongue in cheek way.
  like 'oh no, seems like trump paid loki to terrorize oslo because he didnt win the peace
  prize!' or something". That is the premise, and it fits the game better than it has any
  right to: the Peace Prize is handed out in Oslo's Rådhuset, which is level 3, and Loki is the
  trickster of the viking's own world, so of course a glamour is how he would do the job.
  **The story**: Trump did not get the Peace Prize, took it badly, and paid Loki to make Oslo
  sorry. Loki took the money and did it his own way: he and his Neon Invaders put an 80s
  glamour on the whole city. A viking with a T-bane card is what stands between Oslo and
  eternal hair spray. So the Invaders now have a face: Loki is their front man (seen at most
  as a poster or a silhouette in this order; meeting him is for later).
  How to write it:
  - It is plainly a joke and plainly fiction: tell it in the voice of a tabloid headline or a
    saga gone wrong ("Reports say…", "It is told that…"), never as a claim of fact.
  - The mirror is held up to vanity, sulking, prizes, money and spectacle: to what powerful
    people do in public. Never to anyone's looks, health, family or supporters, no slurs, no
    cruelty, nothing sexual, no violence done to a real person. He is named once or twice in
    the telling and never drawn; he is not a character or a boss in the game.
  - Oslo gets teased as warmly as anyone: the price of a beer, e-scooters left everywhere
    (already an enemy), the queue for the sauna, 17 May earnestness, the committee keeping a
    straight face. A parody slogan on a poster is welcome if it is your own wording.
  - Short. An opening card of three or four lines the first time he arrives on the map (and
    reachable again from the map), one line at Rådhuset where the prize lives, one at each
    boss, and an ending when line 1's ten runes are found and again at the last rune of line 2
    (Loki keeps the money; the glamour lifts; someone will have to explain the invoice).
  - Every line goes in one file of strings so Lars can reword any of it, and in the hand-back
    list. Offer two or three alternatives for the opening card and the ending.
- **The words**: "glamour" is the game's word for the spell, used the same way everywhere (the
  glamour is on a station, a stomp breaks it, a rune lifts it). The rune stone's moment is the
  spell lifting: when he takes a level's rune, a ring of plain daylight colour runs out from the
  stone and any invader still in view loses its glamour (drawing only, after the level is
  already won: no rule changes).
- **The map**: a line under the title on first arrival, and the stations still glammed show a
  small neon sign or a mirror ball over them; a cleared station loses it. When every rune of a
  line is found, that line's stations are plain Oslo again.
- **Banners and cards**: one short line where it fits (the first level's arrival, a boss's
  arrival, the tenth rune, the last rune of line 2). English as the game is now; keep each to
  what fits at 360 wide; nothing that needs explaining.
- **The page's description and the blurb for screen readers** updated to say what the game is
  now.
- **Scenery**: here and there in a level, evidence of the invasion that he cannot touch and
  that sits in the scenery band (ADR 0039, 0044): a neon tube sign on a wall, a poster for a
  made-up band with a made-up name, a mirror ball hung from a crane in Bjørvika, a pink flamingo
  on a lawn. A few per level, never near a jump he must read, off the perf budget's edge.
- **Sound**: a short synth sting of your own making for an invader turning on him, for a stomp
  (a glittering arpeggio downwards), for a boss's arrival and for a line cleared, made with the
  synth the game already has; quiet, and silent when muted. No tune anyone could name.

## 4. So that it is one game

- `roles.ts`, the enemy swatches, the palette test (the neon family named, each apart from
  every role under every tint and in the colour-blind table, with the shape that tells them
  where colour fails), the legend in LEVELS.html, DESIGN's rule for level authors (how to glam
  a new enemy; harmless stays natural), HANDOVER, and an ADR that quotes Lars and records what
  was not chosen (natural colours; the bewitched story) and why the theme is home-made.
- Every enemy in every level looked at in place at 390 x 844 by day and under its own sky,
  before and after; the page of figures (`/tmp/shots-neon/sheets/`, one sheet per figure, both
  its glam and its natural self).
- Perf: no place more than 300 rectangles a frame over order 26's table, none over 15,000.

## Measures that must hold

- `bun test` green in all four packages; `tsc --noEmit` and `bun run build` clean; first script
  under 60 kB.
- Front page 28 of 28 byte-identical.
- Run files as said above.
- A test that every enemy look has a natural ramp and a knocked-off ending, and that no
  harmless mover uses a neon.

## Hand back

1. Per section: done, partly, not done and why. The glam marks chosen per figure, as a table.
2. Pictures in `/tmp/shots-neon/`: the sheets, every level's enemies in place before and after
   at both sizes by day and at night, the bosses, a stomp as a strip of frames, the map with
   glammed and cleared stations, the scenery pieces, the cards.
3. Every line of text added or changed, as a list, so Lars can reword them.
4. Perf, tests, first-script size, front page comparison, run files.
5. What only a person can judge, as a list for Lars (the sounds above all: nobody here can
   hear).
6. Departures, doubts, found and not fixed. Branch and commits. Confirm no preview server or
   headless browser of yours is left running.
